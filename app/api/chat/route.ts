import { createClient } from "@/lib/supabase/server";
import { dailyMessageLimit } from "@/lib/billing";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      agentId?: string;
      conversationId?: string;
      message?: string;
    };
    const agentId = String(body.agentId ?? "");
    const conversationId = String(body.conversationId ?? "");
    const message = String(body.message ?? "").trim();

    if (!agentId || !conversationId || message.length < 1 || message.length > 4000) {
      return Response.json({ error: "入力内容を確認してください。" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "チャットを利用するにはログインが必要です。" }, { status: 401 });
    }

    const { data: conversation } = await supabase
      .from("conversations")
      .select("id, title, agent_id")
      .eq("id", conversationId)
      .eq("agent_id", agentId)
      .maybeSingle();

    if (!conversation) {
      return Response.json({ error: "会話が見つかりません。" }, { status: 404 });
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status, stripe_price_id")
      .eq("user_id", user.id)
      .maybeSingle();
    const limit = dailyMessageLimit(subscription);

    const japanOffset = 9 * 60 * 60 * 1000;
    const todayInJapan = new Date(Date.now() + japanOffset);
    todayInJapan.setUTCHours(0, 0, 0, 0);
    const todayUtc = new Date(todayInJapan.getTime() - japanOffset);
    const { count, error: countError } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("role", "user")
      .gte("created_at", todayUtc.toISOString());

    if (countError) {
      console.error("Usage count error:", countError);
      return Response.json({ error: "利用状況を確認できませんでした。" }, { status: 500 });
    }

    if ((count ?? 0) >= limit) {
      return Response.json(
        { error: `本日の利用上限（${limit}回）に達しました。料金プランをご確認いただくか、明日もう一度お試しください。` },
        { status: 429 },
      );
    }

    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("name, system_prompt, tone")
      .eq("id", agentId)
      .maybeSingle();

    if (agentError || !agent) {
      console.error("Agent fetch error:", agentError);
      return Response.json({ error: "AIを読み込めませんでした。" }, { status: 404 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not configured");
      return Response.json({ error: "AIサービスを利用できません。" }, { status: 503 });
    }

    const { error: insertError } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: message,
    });

    if (insertError) {
      console.error("User message insert error:", insertError);
      return Response.json({ error: "メッセージを保存できませんでした。" }, { status: 500 });
    }

    const conversationUpdates: { updated_at: string; title?: string } = {
      updated_at: new Date().toISOString(),
    };
    if (conversation.title === "新しい会話") {
      conversationUpdates.title = message.replace(/\s+/g, " ").slice(0, 40);
    }
    await supabase.from("conversations").update(conversationUpdates).eq("id", conversationId);

    const { data: recentMessages, error: historyError } = await supabase
      .from("messages")
      .select("role, content, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(12);

    if (historyError) {
      console.error("History fetch error:", historyError);
      return Response.json({ error: "会話履歴を読み込めませんでした。" }, { status: 500 });
    }

    const contents = (recentMessages ?? [])
      .reverse()
      .filter((item) => item.role === "user" || item.role === "assistant")
      .map((item) => ({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: String(item.content).slice(0, 4000) }],
      }));

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: [
                `あなたは「${agent.name}」です。`,
                "【役割・ルール】",
                agent.system_prompt,
                "【話し方】",
                agent.tone,
                "ユーザーの質問に対して上記の役割を守り、日本語で回答してください。",
                "Markdownを使用して読みやすく回答してください。",
                "不確かな内容は断定せず、その旨を明示してください。",
              ].join("\n\n"),
            }],
          },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          ],
          store: false,
        }),
      },
    );

    if (!geminiResponse.ok || !geminiResponse.body) {
      console.error("Gemini API error:", geminiResponse.status, await geminiResponse.text());
      if (geminiResponse.status === 429) {
        return Response.json({ error: "AIが混み合っています。少し待ってから再度お試しください。" }, { status: 429 });
      }
      return Response.json({ error: "AIの回答生成に失敗しました。" }, { status: 502 });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = geminiResponse.body!.getReader();
        let buffer = "";
        let fullOutput = "";

        const processLine = (line: string) => {
          if (!line.startsWith("data: ")) return;
          const jsonText = line.slice(6).trim();
          if (!jsonText || jsonText === "[DONE]") return;
          try {
            const data = JSON.parse(jsonText);
            const text = data?.candidates?.[0]?.content?.parts
              ?.map((part: { text?: string }) => part.text ?? "")
              .join("") ?? "";
            if (text) {
              fullOutput += text;
              controller.enqueue(encoder.encode(text));
            }
          } catch {
            // A partial event remains buffered until the next chunk.
          }
        };

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            lines.forEach(processLine);
          }
          if (buffer.trim()) processLine(buffer);

          if (fullOutput.trim()) {
            const { error: assistantError } = await supabase.from("messages").insert({
              conversation_id: conversationId,
              role: "assistant",
              content: fullOutput,
            });
            if (assistantError) console.error("Assistant message insert error:", assistantError);
            await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
          }

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json({ error: "サーバー内部エラーが発生しました。" }, { status: 500 });
  }
}
