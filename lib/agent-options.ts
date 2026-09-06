export const AGENT_CATEGORIES = [
  "学習",
  "就活",
  "開発",
  "仕事",
  "暮らし",
  "その他",
] as const;

export const AGENT_TONES = [
  "やさしく丁寧",
  "短く簡潔",
  "明るくフレンドリー",
  "専門家のように論理的",
] as const;

type AgentInput = {
  name: string;
  description: string;
  icon: string;
  category: string;
  tone: string;
  systemPrompt: string;
  isPublic: boolean;
};

export function parseAgentForm(formData: FormData):
  | { success: true; data: AgentInput }
  | { success: false; error: string } {
  const data: AgentInput = {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    icon: String(formData.get("icon") ?? "🤖").trim() || "🤖",
    category: String(formData.get("category") ?? "その他"),
    tone: String(formData.get("tone") ?? "やさしく丁寧"),
    systemPrompt: String(formData.get("systemPrompt") ?? "").trim(),
    isPublic: formData.get("isPublic") === "on",
  };

  if (data.name.length < 1 || data.name.length > 60) {
    return { success: false, error: "AI名は1〜60文字で入力してください。" };
  }
  if (data.description.length > 300) {
    return { success: false, error: "説明は300文字以内で入力してください。" };
  }
  if (data.icon.length > 16) {
    return { success: false, error: "アイコンは絵文字1個を目安に入力してください。" };
  }
  if (!AGENT_CATEGORIES.includes(data.category as (typeof AGENT_CATEGORIES)[number])) {
    return { success: false, error: "カテゴリを選び直してください。" };
  }
  if (!AGENT_TONES.includes(data.tone as (typeof AGENT_TONES)[number])) {
    return { success: false, error: "話し方を選び直してください。" };
  }
  if (data.systemPrompt.length < 10 || data.systemPrompt.length > 5000) {
    return { success: false, error: "役割・ルールは10〜5000文字で入力してください。" };
  }

  return { success: true, data };
}
