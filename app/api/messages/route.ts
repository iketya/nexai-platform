import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  const conversationId = String(
    body.conversationId ?? ""
  );

  const role = String(body.role ?? "");

  const content = String(body.content ?? "").trim();

  if (
    !conversationId ||
    !["user", "assistant"].includes(role) ||
    !content
  ) {
    return NextResponse.json(
      { error: "不正なデータです。" },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      role,
      content,
    });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }

  const updates: { updated_at: string; title?: string } = {
    updated_at: new Date().toISOString(),
  };

  if (role === "user") {
    const { data: conversation } = await supabase
      .from("conversations")
      .select("title")
      .eq("id", conversationId)
      .maybeSingle();

    if (conversation?.title === "新しい会話") {
      updates.title = content.replace(/\s+/g, " ").slice(0, 40);
    }
  }

  const { error: updateError } = await supabase
    .from("conversations")
    .update(updates)
    .eq("id", conversationId);

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
