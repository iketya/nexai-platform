"use client";

import { useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function AgentChat({ agentId, agentName }: {
  agentId: string;
  agentName: string;
}) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: `こんにちは。${agentName}です。何を手伝いましょうか？` },
  ]);
  const [loading, setLoading] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, messages: next.slice(-12) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "回答に失敗しました。");
      setMessages([...next, { role: "assistant", content: data.output }]);
    } catch (error) {
      setMessages([...next, {
        role: "assistant",
        content: `エラー：${error instanceof Error ? error.message : "通信失敗"}`,
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900 p-5">
      <div className="min-h-96 space-y-4">
        {messages.map((message, index) => (
          <div key={index}
            className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 ${
              message.role === "user" ? "ml-auto bg-indigo-500" : "bg-slate-800"
            }`}>
            {message.content}
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-3">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          maxLength={4000} placeholder={`${agentName}に相談する`}
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950 px-4 py-3" />
        <button onClick={() => void send()} disabled={loading}
          className="rounded-xl bg-indigo-500 px-5 font-bold disabled:opacity-60">
          {loading ? "回答中…" : "送信"}
        </button>
      </div>
    </section>
  );
}
