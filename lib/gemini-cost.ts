// Paid-tier standard text rates (USD per million tokens). Recheck when changing models.
const MODEL_RATES: Record<string, { input: number; output: number }> = {
  "gemini-2.5-flash-lite": { input: 0.1, output: 0.4 },
  "gemini-3.1-flash-lite": { input: 0.25, output: 1.5 },
  "gemini-2.5-flash": { input: 0.3, output: 2.5 },
};

export const MAX_CHAT_INPUT_TOKENS = 5000;

export type GeminiUsage = {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  thoughtsTokenCount?: number;
};

function tokenCount(value: unknown): number | null {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : null;
}

export function measuredChatCost(model: string, usage: GeminiUsage) {
  const inputTokens = tokenCount(usage.promptTokenCount);
  const candidateTokens = tokenCount(usage.candidatesTokenCount);
  const thoughtTokens = tokenCount(usage.thoughtsTokenCount) ?? 0;
  const rates = MODEL_RATES[model];

  if (inputTokens === null || candidateTokens === null || !rates) return null;
  const outputTokens = candidateTokens + thoughtTokens;
  if (!Number.isSafeInteger(outputTokens)) return null;

  // Conservative estimate: charge cached prompt tokens at the full input rate.
  // This is an estimate, not the provider's invoice or the actual payable amount.
  const estimatedCostUsdMicros = Math.ceil(
    inputTokens * rates.input + outputTokens * rates.output,
  );
  return { inputTokens, outputTokens, estimatedCostUsdMicros };
}
