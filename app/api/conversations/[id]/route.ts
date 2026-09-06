import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/conversations/[id]">,
) {
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: "不正な会話IDです。" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (conversationError) {
    console.error("Conversation fetch error:", conversationError);
    return NextResponse.json({ error: "会話を取得できませんでした。" }, { status: 500 });
  }
  if (!conversation) {
    return NextResponse.json({ error: "会話が見つかりません。" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) {
    console.error("Message list error:", error);
    return NextResponse.json({ error: "メッセージを取得できませんでした。" }, { status: 500 });
  }

  return NextResponse.json({ messages: data });
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext<"/api/conversations/[id]">,
) {
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: "不正な会話IDです。" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Conversation delete error:", error);
    return NextResponse.json({ error: "会話を削除できませんでした。" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "会話が見つかりません。" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
