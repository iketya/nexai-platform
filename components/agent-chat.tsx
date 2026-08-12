"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AgentChat({
  agentId,
  agentName,
}: {
  agentId: string;
  agentName: string;
}) {
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `こんにちは。**${agentName}**です。\n\n何を手伝いましょうか？`,
    },
  ]);

  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function send() {
    const text = input.trim();

    if (!text || loading) return;

    const userMessage: Message = {
      role: "user",
      content: text,
    };

    const nextMessages = [...messages, userMessage];

    setMessages([
      ...nextMessages,
      {
        role: "assistant",
        content: "",
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          agentId,
          messages: nextMessages.slice(-12),
        }),
      });

      if (!response.ok) {
        let message = "回答に失敗しました。";

        try {
          const data = await response.json();

          if (data?.error) {
            message = data.error;
          }
        } catch {
          // JSONでなければそのまま
        }

        throw new Error(message);
      }

      if (!response.body) {
        throw new Error("レスポンスを取得できませんでした。");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        assistantText += decoder.decode(value, {
          stream: true,
        });

        setMessages([
          ...nextMessages,
          {
            role: "assistant",
            content: assistantText,
          },
        ]);
      }

      if (!assistantText.trim()) {
        setMessages([
          ...nextMessages,
          {
            role: "assistant",
            content: "回答を取得できませんでした。",
          },
        ]);
      }
    } catch (error) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: `⚠️ ${
            error instanceof Error
              ? error.message
              : "通信に失敗しました。"
          }`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">

      {/* Header */}

      <div className="border-b border-white/10 px-5 py-4">
        <div className="font-bold text-white">
          {agentName}
        </div>

        <div className="mt-1 text-sm text-slate-400">
          AIと会話
        </div>
      </div>

      {/* Messages */}

      <div className="h-[550px] overflow-y-auto p-5">

        <div className="space-y-5">

          {messages.map((message, index) => {

            const isUser = message.role === "user";

            return (
              <div
                key={index}
                className={`flex ${
                  isUser
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    isUser
                      ? "bg-indigo-500 text-white"
                      : "bg-slate-800 text-slate-100"
                  }`}
                >

                  {isUser ? (
                    <div className="whitespace-pre-wrap">
                      {message.content}
                    </div>
                  ) : (
                    <div
                      className="
                        prose
                        prose-invert
                        prose-sm
                        max-w-none
                        prose-pre:overflow-x-auto
                        prose-pre:rounded-xl
                        prose-pre:bg-slate-950
                        prose-code:text-cyan-300
                      "
                    >
                      {message.content ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <span className="animate-pulse text-slate-400">
                          考えています...
                        </span>
                      )}
                    </div>
                  )}

                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />

        </div>
      </div>

      {/* Input */}

      <div className="border-t border-white/10 p-4">

        <div className="flex items-end gap-3">

          <textarea
            value={input}

            onChange={(e) =>
              setInput(e.target.value)
            }

            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey
              ) {
                e.preventDefault();
                void send();
              }
            }}

            maxLength={4000}

            rows={1}

            placeholder={`${agentName}に相談する`}

            className="
              min-h-12
              max-h-40
              min-w-0
              flex-1
              resize-none
              rounded-xl
              border
              border-white/10
              bg-slate-950
              px-4
              py-3
              text-white
              outline-none
              placeholder:text-slate-500
              focus:border-indigo-500
            "
          />

          <button
            onClick={() => void send()}

            disabled={
              loading ||
              !input.trim()
            }

            className="
              h-12
              rounded-xl
              bg-indigo-500
              px-6
              font-bold
              text-white
              transition
              hover:bg-indigo-400
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            {loading ? "生成中..." : "送信"}
          </button>

        </div>

        <div className="mt-2 text-xs text-slate-500">
          Enterで送信 / Shift + Enterで改行
        </div>

      </div>

    </section>
  );
}