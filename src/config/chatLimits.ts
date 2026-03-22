export interface ChatLimits {
  maxMessages: number;
  maxTotalChars: number;
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  const n = parseInt(raw ?? '', 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function getChatLimits(): ChatLimits {
  return {
    maxMessages: parsePositiveInt(process.env.LLM_MAX_CONVERSATION_LENGTH, 50),
    maxTotalChars: parsePositiveInt(process.env.LLM_MAX_TOTAL_CHARS, 24_000),
  };
}
