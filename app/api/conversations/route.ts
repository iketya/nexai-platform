import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  if (!agentId) {
    return NextResponse.json(
      { error: "agentIdが必要です。" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("conversations")
    .select("id, title, created_at, updated_at")
    .eq("agent_id", agentId)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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

  const body = await request.json();
  const agentId = String(body.agentId ?? "");

  if (!agentId) {
    return NextResponse.json(
      { error: "agentIdが必要です。" },
      { status: 400 },
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
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    conversationId: data.id,
  });
}
