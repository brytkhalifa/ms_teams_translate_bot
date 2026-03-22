import type { OpenAIChatMessage } from '../adapters/openai/OpenAIAdapter';

export type ParseChatBodyResult =
  | { ok: true; messages: OpenAIChatMessage[] }
  | { ok: false; message: string };

export function parseChatRequestBody(body: unknown): ParseChatBodyResult {
  if (body === null || typeof body !== 'object') {
    return { ok: false, message: 'Request body must be a JSON object.' };
  }

  const raw = (body as { messages?: unknown }).messages;
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, message: 'Body must include a non-empty "messages" array.' };
  }

  const messages: OpenAIChatMessage[] = [];
  for (let i = 0; i < raw.length; i += 1) {
    const item = raw[i];
    if (item === null || typeof item !== 'object') {
      return { ok: false, message: `messages[${i}] must be an object.` };
    }
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if (role !== 'user' && role !== 'assistant') {
      return {
        ok: false,
        message: `messages[${i}].role must be "user" or "assistant".`,
      };
    }
    if (typeof content !== 'string') {
      return { ok: false, message: `messages[${i}].content must be a string.` };
    }
    const trimmed = content.trim();
    if (!trimmed) {
      return { ok: false, message: `messages[${i}].content must not be empty.` };
    }
    messages.push({ role, content: trimmed });
  }

  const last = messages[messages.length - 1];
  if (last.role !== 'user') {
    return { ok: false, message: 'The last message must have role "user".' };
  }

  return { ok: true, messages };
}
