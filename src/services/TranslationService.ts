import { OpenAIChatMessage } from '../adapters/openai/OpenAIAdapter';
import { parseTargetLanguageMessage } from '../mappers/targetLanguageMapper';
import { AppContainer } from '../container/buildContainer';

const MAX_CHAT_MESSAGES = parseInt(process.env.LLM_MAX_CONVERSATION_LENGTH || '50', 10);
const MAX_CHAT_TOTAL_CHARS = parseInt(process.env.LLM_MAX_TOTAL_CHARS || '24000', 10);

export type TranslateApiSuccess = {
  targetLanguage: string;
  translatedText: string;
  detectedSourceLanguage?: string;
};

export type TranslateApiFailure =
  | { code: 'NO_ADAPTER'; message: string }
  | { code: 'EMPTY_TEXT'; message: string }
  | { code: 'TRANSLATE_FAILED'; message: string };

export type TranslateApiResult =
  | { ok: true; data: TranslateApiSuccess }
  | { ok: false; failure: TranslateApiFailure };

export type ChatApiSuccess = {
  reply: string;
};

export type ChatApiFailure =
  | { code: 'NO_ADAPTER'; message: string }
  | { code: 'INVALID_BODY'; message: string }
  | { code: 'PAYLOAD_TOO_LARGE'; message: string }
  | { code: 'CHAT_FAILED'; message: string };

export type ChatApiResult =
  | { ok: true; data: ChatApiSuccess }
  | { ok: false; failure: ChatApiFailure };

/** Text for the bot to send back after the user messages the bot in chat. */
export type BotReply = {
  text: string;
};

export class TranslationService {
  constructor(private readonly container: AppContainer) {}

  private get defaultTargetLang(): string {
    return process.env.DEEPL_TARGET_LANG || 'EN-US';
  }

  async translateFromQuery(params: {
    text?: string;
    targetLanguage?: string;
  }): Promise<TranslateApiResult> {
    const deepLAdapter = this.container.get('deepLAdapter');
    if (!deepLAdapter) {
      return {
        ok: false,
        failure: {
          code: 'NO_ADAPTER',
          message: 'DeepL adapter is not configured. Set DEEPL_API_KEY.',
        },
      };
    }

    const text = `${params.text || ''}`.trim();
    const targetLanguage = `${params.targetLanguage || this.defaultTargetLang}`;

    if (!text) {
      return {
        ok: false,
        failure: { code: 'EMPTY_TEXT', message: 'Missing text query parameter.' },
      };
    }

    try {
      const deepLResponse = await deepLAdapter.translate({ text, targetLanguage });
      return {
        ok: true,
        data: {
          targetLanguage,
          translatedText: deepLResponse.responseText,
          detectedSourceLanguage: deepLResponse.detectedSourceLanguage,
        },
      };
    } catch (error) {
      return {
        ok: false,
        failure: {
          code: 'TRANSLATE_FAILED',
          message: `Translation failed: ${String(error)}`,
        },
      };
    }
  }

  /**
   * Multi-turn ChatGPT tab API: `messages` must be user/assistant only, end with user.
   */
  async chatFromBody(body: unknown): Promise<ChatApiResult> {
    const openAIAdapter = this.container.get('openAIAdapter');
    if (!openAIAdapter) {
      return {
        ok: false,
        failure: {
          code: 'NO_ADAPTER',
          message: 'OpenAI is not configured. Set OPENAI_API_KEY and optionally OPENAI_MODEL.' + process.env.OPENAI_MODE,
        },
      };
    }

    const parsed = this.parseChatMessages(body);
    if (!parsed.ok) {
      return { ok: false, failure: { code: 'INVALID_BODY', message: parsed.message } };
    }

    const messages = parsed.messages;
    if (messages.length > MAX_CHAT_MESSAGES) {
      return {
        ok: false,
        failure: {
          code: 'PAYLOAD_TOO_LARGE',
          message: `Too many messages (max ${MAX_CHAT_MESSAGES}).`,
        },
      };
    }

    const totalChars = messages.reduce((n, m) => n + m.content.length, 0);
    if (totalChars > MAX_CHAT_TOTAL_CHARS) {
      return {
        ok: false,
        failure: {
          code: 'PAYLOAD_TOO_LARGE',
          message: `Conversation too long (max ${MAX_CHAT_TOTAL_CHARS} characters).`,
        },
      };
    }

    try {
      const openAIResponse = await openAIAdapter.chat(messages);
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

  private parseChatMessages(
    body: unknown,
  ): { ok: true; messages: OpenAIChatMessage[] } | { ok: false; message: string } {
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

  /** Handle a message the user sent to the bot (Teams chat). */
  async handleUserMessage(userText: string): Promise<BotReply> {
    const deepLAdapter = this.container.get('deepLAdapter');
    const openAIAdapter = this.container.get('openAIAdapter');

    const parsed = parseTargetLanguageMessage(userText, this.defaultTargetLang);

    if (!parsed.hasLanguagePrefix) {
      if (!openAIAdapter) {
        return {
          text: 'No language prefix detected and OpenAI is not configured. Set OPENAI_API_KEY and optionally OPENAI_MODEL.',
        };
      }

      const openAIResponse = await openAIAdapter.prompt({
        text: userText,
      });
      return {
        text: openAIResponse.responseText || 'No response from OpenAI.',
      };
    }

    if (!parsed.text) {
      return {
        text: 'Start your message with a language prefix, e.g. "en Wie heisst du" or "english Wie heisst du".',
      };
    }

    if (!deepLAdapter) {
      return {
        text: 'DeepL adapter is not configured. Set DEEPL_API_KEY.',
      };
    }

    const deepLResponse = await deepLAdapter.translate({
      text: parsed.text,
      targetLanguage: parsed.targetLanguage,
    });

    return {
      text: `(${parsed.targetLanguage}) ${deepLResponse.responseText}`,
    };
  }
}
