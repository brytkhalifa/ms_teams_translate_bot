import type { OpenAIAdapter } from '../adapters/openai/OpenAIAdapter';
import type { ChatApiResult } from '../api/types';
import type { ChatLimits } from '../config/chatLimits';
import { parseChatRequestBody } from '../validation/parseChatRequestBody';

export class ChatTabService {
  constructor(
    private readonly openAIAdapter: OpenAIAdapter | null,
    private readonly limits: ChatLimits,
  ) {}

  async chatFromBody(body: unknown): Promise<ChatApiResult> {
    if (!this.openAIAdapter) {
      return {
        ok: false,
        failure: {
          code: 'NO_ADAPTER',
          message:
            'OpenAI is not configured. Set OPENAI_MODE=1, OPENAI_API_KEY, and optionally OPENAI_MODEL.',
        },
      };
    }

    const parsed = parseChatRequestBody(body);
    if (!parsed.ok) {
      return { ok: false, failure: { code: 'INVALID_BODY', message: parsed.message } };
    }

    const messages = parsed.messages;
    if (messages.length > this.limits.maxMessages) {
      return {
        ok: false,
        failure: {
          code: 'PAYLOAD_TOO_LARGE',
          message: `Too many messages (max ${this.limits.maxMessages}).`,
        },
      };
    }

    const totalChars = messages.reduce((n, m) => n + m.content.length, 0);
    if (totalChars > this.limits.maxTotalChars) {
      return {
        ok: false,
        failure: {
          code: 'PAYLOAD_TOO_LARGE',
          message: `Conversation too long (max ${this.limits.maxTotalChars} characters).`,
        },
      };
    }

    try {
      const openAIResponse = await this.openAIAdapter.chat(messages);
      const reply = openAIResponse.responseText || 'No response from OpenAI.';
      return { ok: true, data: { reply } };
    } catch (error) {
      return {
        ok: false,
        failure: {
          code: 'CHAT_FAILED',
          message: `Chat failed: ${String(error)}`,
        },
      };
    }
  }
}
