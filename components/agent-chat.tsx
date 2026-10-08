"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

type HistoryStatus = "loading" | "available" | "signed-out" | "error";

function initialMessages(agentName: string): Message[] {
  return [
    {
      role: "assistant",
      content: `こんにちは。**${agentName}**です。\n\n何を手伝いましょうか？`,
    },
  ];
}

function getStarterPrompts(agentSlug: string): string[] {
  if (agentSlug === "agent-d1961b3a") {
    return [
      "取引先へのお礼メールを、丁寧で短めに作りたいです。必要な情報を聞いてください。",
      "サービスの特徴を伝える提案文を作りたいです。構成から相談させてください。",
      "書いた文章を読みやすく直したいです。改善点も教えてください。",
    ];
  }
  if (agentSlug === "ai-f885de5c") {
    return [
      "自分に合う副業を考えたいです。強みと使える時間から質問してください。",
      "副業アイデアを小さく試す7日間の計画を作りたいです。",
      "考えている副業案のリスクと、最初の検証方法を整理してください。",
    ];
  }
  return [
    "まず何から相談できますか？具体例を3つ教えてください。",
    "このテーマを初心者にも分かるように説明してください。",
  ];
}

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return typeof data?.error === "string" ? data.error : fallback;
  } catch {
    return fallback;
  }
}

export default function AgentChat({
  agentId,
  agentName,
  agentSlug,
}: {
  agentId: string;
  agentName: string;
  agentSlug: string;
}) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(() =>
    initialMessages(agentName),
  );
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [historyStatus, setHistoryStatus] =
    useState<HistoryStatus>("loading");
  const [historyMessage, setHistoryMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const starterPrompts = getStarterPrompts(agentSlug);
  const signupHref = `/login?mode=signup&next=${encodeURIComponent(`/agents/${agentSlug}`)}`;

  const loadConversations = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/conversations?agentId=${encodeURIComponent(agentId)}`,
        { cache: "no-store" },
      );

      if (response.status === 401) {
        setHistoryStatus("signed-out");
        setConversations([]);
        return;
      }

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "会話履歴を取得できませんでした。"),
        );
      }

      const data = await response.json();
      setConversations(Array.isArray(data.conversations) ? data.conversations : []);
      setHistoryStatus("available");
      setHistoryMessage("");
    } catch (error) {
      setHistoryStatus("error");
      setHistoryMessage(
        error instanceof Error ? error.message : "会話履歴を取得できませんでした。",
      );
    }
  }, [agentId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadConversations();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadConversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function startNewConversation() {
    if (loading || loadingConversation) return;
    setConversationId(null);
    setMessages(initialMessages(agentName));
    setInput("");
    setHistoryMessage("");
    setCopiedIndex(null);
  }

  async function copyAnswer(content: string, index: number) {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
    } catch {
      setHistoryMessage("コピーできませんでした。文章を選択してコピーしてください。");
    }
  }

  async function openConversation(id: string) {
    if (loading || loadingConversation || id === conversationId) return;

    setLoadingConversation(true);
    setHistoryMessage("");

    try {
      const response = await fetch(`/api/conversations/${id}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "メッセージを取得できませんでした。"),
        );
      }

      const data = await response.json();
      const loadedMessages = Array.isArray(data.messages)
        ? data.messages.filter(
            (message: Message) =>
              (message.role === "user" || message.role === "assistant") &&
              typeof message.content === "string",
          )
        : [];

      setConversationId(id);
      setMessages(
        loadedMessages.length > 0 ? loadedMessages : initialMessages(agentName),
      );
      setInput("");
    } catch (error) {
      setHistoryMessage(
        error instanceof Error ? error.message : "メッセージを取得できませんでした。",
      );
    } finally {
      setLoadingConversation(false);
    }
  }

  async function deleteConversation(id: string) {
    if (loading || loadingConversation) return;
    if (!window.confirm("この会話を削除しますか？")) return;

    setLoadingConversation(true);
    setHistoryMessage("");

    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response, "会話を削除できませんでした。"),
        );
      }

      setConversations((current) =>
        current.filter((conversation) => conversation.id !== id),
      );

      if (conversationId === id) {
        setConversationId(null);
        setMessages(initialMessages(agentName));
      }
    } catch (error) {
      setHistoryMessage(
        error instanceof Error ? error.message : "会話を削除できませんでした。",
      );
    } finally {
      setLoadingConversation(false);
    }
  }

  async function ensureConversation() {
    if (conversationId) return conversationId;
    if (historyStatus === "signed-out") {
      throw new Error("チャットを利用するにはログインが必要です。");
    }

    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId }),
    });

    if (response.status === 401) {
      setHistoryStatus("signed-out");
      throw new Error("チャットを利用するにはログインが必要です。");
    }

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(response, "会話を作成できませんでした。"),
      );
    }

    const data = await response.json();
    const id = String(data.conversationId ?? "");

    if (!id) throw new Error("会話IDを取得できませんでした。");

    setConversationId(id);
    return id;
  }

  async function send() {
    const text = input.trim();
    if (!text || loading || loadingConversation) return;
    if (historyStatus === "signed-out") {
      setHistoryMessage("チャットを利用するにはログインしてください。");
      return;
    }

    const userMessage: Message = { role: "user", content: text };
    const nextMessages = [...messages, userMessage];
    let assistantText = "";

    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);
    setHistoryMessage("");

    try {
      const activeConversationId = await ensureConversation();

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          conversationId: activeConversationId,
          message: text,
        }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "回答に失敗しました。"));
      }

      if (!response.body) {
        throw new Error("レスポンスを取得できませんでした。");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        assistantText += decoder.decode(value, { stream: true });
        setMessages([
          ...nextMessages,
          { role: "assistant", content: assistantText },
        ]);
      }

      assistantText += decoder.decode();
      if (!assistantText.trim()) assistantText = "回答を取得できませんでした。";

      setMessages([
        ...nextMessages,
        { role: "assistant", content: assistantText },
      ]);

      await loadConversations();
    } catch (error) {
      const errorText =
        error instanceof Error ? error.message : "通信に失敗しました。";

      if (assistantText.trim()) {
        setMessages([
          ...nextMessages,
          { role: "assistant", content: assistantText },
        ]);
        setHistoryMessage(`回答は表示されましたが、保存に失敗しました: ${errorText}`);
      } else {
        setMessages([
          ...nextMessages,
          { role: "assistant", content: `⚠️ ${errorText}` },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="h-fit overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
        <div className="border-b border-white/10 p-4">
          <div className="font-bold text-white">過去のチャット</div>
          <button
            type="button"
            onClick={startNewConversation}
            disabled={loading || loadingConversation}
            className="mt-3 w-full rounded-xl bg-indigo-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-indigo-400 disabled:opacity-40"
          >
            ＋ 新しい会話
          </button>
        </div>

        <div className="max-h-72 space-y-1 overflow-y-auto p-2 xl:max-h-[560px]">
          {historyStatus === "loading" && (
            <p className="px-3 py-4 text-sm text-slate-400">読み込み中...</p>
          )}

          {historyStatus === "signed-out" && (
            <div className="px-3 py-4 text-sm leading-6 text-slate-400">
              <p>チャットと履歴保存にはログインが必要です。</p>
              <Link href={signupHref} className="mt-3 inline-block font-bold text-cyan-300 hover:text-cyan-200">無料登録して試す →</Link>
            </div>
          )}

          {historyStatus === "error" && (
            <button
              type="button"
              onClick={() => void loadConversations()}
              className="w-full rounded-xl px-3 py-4 text-left text-sm text-rose-300 hover:bg-white/5"
            >
              履歴を取得できませんでした。再試行
            </button>
          )}

          {historyStatus === "available" && conversations.length === 0 && (
            <p className="px-3 py-4 text-sm text-slate-400">まだ会話はありません。</p>
          )}

          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`group flex items-center gap-1 rounded-xl pr-1 transition ${
                conversation.id === conversationId
                  ? "bg-indigo-500/20"
                  : "hover:bg-white/5"
              }`}
            >
              <button
                type="button"
                onClick={() => void openConversation(conversation.id)}
                className="min-w-0 flex-1 px-3 py-2 text-left"
              >
                <span className="block truncate text-sm text-slate-100">
                  {conversation.title}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {new Intl.DateTimeFormat("ja-JP", {
                    month: "numeric",
                    day: "numeric",
                  }).format(new Date(conversation.updated_at))}
                </span>
              </button>
              <button
                type="button"
                aria-label={`「${conversation.title}」を削除`}
                onClick={() => void deleteConversation(conversation.id)}
                className="rounded-lg px-2 py-1 text-slate-500 opacity-100 transition hover:bg-rose-500/20 hover:text-rose-300 xl:opacity-0 xl:group-hover:opacity-100 xl:focus:opacity-100"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </aside>

      <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
        <div className="border-b border-white/10 px-5 py-4">
          <div className="font-bold text-white">{agentName}</div>
          <div className="mt-1 text-sm text-slate-400">
            {conversationId ? "保存済みの会話" : "新しい会話"}
          </div>
          {historyMessage && (
            <p className="mt-2 text-xs text-rose-300">{historyMessage}</p>
          )}
        </div>

        <div className="h-[550px] overflow-y-auto p-5">
          <div className="space-y-5">
            {historyStatus === "signed-out" && (
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-5">
                <p className="font-bold text-cyan-200">無料登録で、このAIに相談できます</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">クレジットカードは不要です。登録後、このAIに相談できます。</p>
                <Link href={signupHref} className="mt-4 inline-block rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-200">無料登録して相談する</Link>
              </div>
            )}
            {!loadingConversation && messages.length === 1 && (
              <div className="grid gap-2 pt-2">
                <p className="text-xs font-bold tracking-wide text-slate-400">こんな相談から始められます</p>
                {starterPrompts.map((prompt) => historyStatus === "signed-out" ? (
                  <p key={prompt} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm leading-6 text-slate-300">{prompt}</p>
                ) : (
                  <button key={prompt} type="button" onClick={() => { setInput(prompt); inputRef.current?.focus(); }} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm leading-6 text-slate-300 hover:border-cyan-300/30 hover:text-white">{prompt} →</button>
                ))}
              </div>
            )}
            {loadingConversation ? (
              <p className="text-center text-sm text-slate-400">会話を読み込み中...</p>
            ) : (
              messages.map((message, index) => {
                const isUser = message.role === "user";

                return (
                  <div
                    key={index}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        isUser
                          ? "bg-indigo-500 text-white"
                          : "bg-slate-800 text-slate-100"
                      }`}
                    >
                      {isUser ? (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      ) : (
                        <div className="prose prose-invert prose-sm max-w-none prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:bg-slate-950 prose-code:text-cyan-300">
                          {message.content ? (
                            <>
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message.content}
                              </ReactMarkdown>
                              {index > 0 && (
                                <button type="button" onClick={() => void copyAnswer(message.content, index)} className="mt-3 rounded-lg border border-white/10 px-3 py-1 text-xs font-bold text-cyan-200 hover:bg-white/5" aria-label="AIの回答をコピー">
                                  {copiedIndex === index ? "コピーしました" : "回答をコピー"}
                                </button>
                              )}
                            </>
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
              })
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send();
                }
              }}
              maxLength={4000}
              rows={1}
              placeholder={`${agentName}に相談する`}
              disabled={loadingConversation || historyStatus === "signed-out"}
              className="min-h-12 max-h-40 min-w-0 flex-1 resize-none rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-indigo-500 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={loading || loadingConversation || historyStatus === "signed-out" || !input.trim()}
              className="h-12 rounded-xl bg-indigo-500 px-6 font-bold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "生成中..." : "送信"}
            </button>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Enterで送信 / Shift + Enterで改行
          </div>
        </div>
      </section>
    </div>
  );
}
