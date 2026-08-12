import { createClient } from "@/lib/supabase/server";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      agentId?: string;
      messages?: Message[];
    };

    if (!body.agentId || !Array.isArray(body.messages)) {
      return Response.json(
        { error: "不正なリクエストです。" },
        { status: 400 }
      );
    }

    const messages = body.messages
      .filter(
        (m) =>
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string"
      )
      .slice(-12);

    const latest = messages.at(-1);

    if (
      !latest ||
      latest.role !== "user" ||
      latest.content.length < 1 ||
      latest.content.length > 4000
    ) {
      return Response.json(
        { error: "入力は1〜4000文字です。" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("name, system_prompt, tone")
      .eq("id", body.agentId)
      .maybeSingle();

    if (agentError) {
      console.error("Agent fetch error:", agentError);

      return Response.json(
        { error: "AI情報の取得に失敗しました。" },
        { status: 500 }
      );
    }

    if (!agent) {
      return Response.json(
        { error: "AIが見つかりません。" },
        { status: 404 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "GEMINI_API_KEY未設定です。" },
        { status: 500 }
      );
    }

    const contents = messages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: [
                  `あなたは「${agent.name}」です。`,
                  "",
                  "【役割・ルール】",
                  agent.system_prompt,
                  "",
                  "【話し方】",
                  agent.tone,
                  "",
                  "ユーザーの質問に対して、上記の役割を守って回答してください。",
                  "Markdownを使用して読みやすく回答してください。",
                  "コードを示す場合はMarkdownのコードブロックを使用してください。",
                ].join("\n"),
              },
            ],
          },

          contents,

          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();

      console.error("Gemini API error:", errorText);

      return Response.json(
        { error: "Gemini APIでエラーが発生しました。" },
        { status: geminiResponse.status }
      );
    }

    if (!geminiResponse.body) {
      return Response.json(
        { error: "Geminiから応答を取得できませんでした。" },
        { status: 500 }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = geminiResponse.body!.getReader();

        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;

              const jsonText = line.slice(6).trim();

              if (!jsonText || jsonText === "[DONE]") continue;

              try {
                const data = JSON.parse(jsonText);

                const text =
                  data?.candidates?.[0]?.content?.parts
                    ?.map((part: { text?: string }) => part.text ?? "")
                    .join("") ?? "";

                if (text) {
                  controller.enqueue(encoder.encode(text));
                }
              } catch {
                // JSONが途中の場合などは無視
              }
            }
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
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);

    return Response.json(
      { error: "サーバー内部エラー" },
      { status: 500 }
    );
  }
}