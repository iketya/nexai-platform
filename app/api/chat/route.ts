import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Message = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      agentId?: string;
      messages?: Message[];
    };

    if (!body.agentId || !Array.isArray(body.messages)) {
      return NextResponse.json({ error: "不正なリクエストです。" }, { status: 400 });
    }

    const messages = body.messages.filter((m) =>
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string"
    ).slice(-12);

    const latest = messages.at(-1);
    if (!latest || latest.role !== "user" || latest.content.length > 4000) {
      return NextResponse.json({ error: "入力は1〜4000文字です。" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: agent } = await supabase
      .from("agents")
      .select("name, system_prompt, tone")
      .eq("id", body.agentId)
      .maybeSingle();

    if (!agent) {
      return NextResponse.json({ error: "AIが見つかりません。" }, { status: 404 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY未設定です。" }, { status: 500 });
    }

    const contents = messages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: `あなたは「${agent.name}」です。\n役割:\n${agent.system_prompt}\n話し方:${agent.tone}\n日本語で回答してください。`,
            }],
          },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: result?.error?.message || "Gemini APIエラー" },
        { status: response.status },
      );
    }

    const output = result?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("")
      .trim() || "回答を取得できませんでした。";

    return NextResponse.json({ output });
  } catch {
    return NextResponse.json({ error: "サーバー内部エラー" }, { status: 500 });
  }
}
