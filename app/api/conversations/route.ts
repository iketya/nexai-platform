import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "ログインが必要です。" },
      { status: 401 },
    );
  }

  const agentId = new URL(request.url).searchParams.get("agentId")?.trim();

  if (!agentId || !UUID_PATTERN.test(agentId)) {
    return NextResponse.json(
      { error: "agentIdが必要です。" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("conversations")
    .select("id, title, created_at, updated_at")
    .eq("agent_id", agentId)
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Conversation list error:", error);
    return NextResponse.json({ error: "会話履歴を取得できませんでした。" }, { status: 500 });
  }

  return NextResponse.json({ conversations: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "ログインが必要です。" },
      { status: 401 },
    );
  }

  let body: { agentId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです。" }, { status: 400 });
  }
  const agentId = String(body.agentId ?? "");

  if (!UUID_PATTERN.test(agentId)) {
    return NextResponse.json(
      { error: "agentIdが必要です。" },
      { status: 400 },
    );
  }

  const { data: agent } = await supabase
    .from("agents")
    .select("id")
    .eq("id", agentId)
    .maybeSingle();

  if (!agent) {
    return NextResponse.json({ error: "AIが見つかりません。" }, { status: 404 });
  }

  const { count, error: countError } = await supabase
    .from("conversations")
    .select("id", { count: "exact", head: true });
  if (countError) {
    console.error("Conversation count error:", countError);
    return NextResponse.json({ error: "利用状況を確認できませんでした。" }, { status: 500 });
  }
  if ((count ?? 0) >= 500) {
    return NextResponse.json(
      { error: "保存できる会話数の上限に達しました。不要な会話を削除してください。" },
      { status: 429 },
    );
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: user.id,
      agent_id: agentId,
      title: "新しい会話",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Conversation create error:", error);
    return NextResponse.json(
      { error: "会話を作成できませんでした。" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    conversationId: data.id,
  });
}
