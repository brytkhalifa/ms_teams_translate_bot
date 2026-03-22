import type { DeepLAdapter } from '../adapters/deepl/DeepLAdapter';
import type { OpenAIAdapter } from '../adapters/openai/OpenAIAdapter';
import type { BotReply } from '../api/types';
import {
  buildDeepLBotHelpMessage,
  parseTargetLanguageMessage,
} from '../mappers/targetLanguageMapper';

const TR_HELP_PATTERN = /^tr\s+help$/i;
const TR_HLEP_PATTERN = /^tr\s+hlep$/i;

export class TeamsBotMessageService {
  constructor(
    private readonly deepLAdapter: DeepLAdapter | null,
    private readonly openAIAdapter: OpenAIAdapter | null,
    private readonly defaultTargetLang: string,
  ) {}

  async handleUserMessage(userText: string): Promise<BotReply> {
    const trimmed = (userText || '').trim();
    if (TR_HELP_PATTERN.test(trimmed) || TR_HLEP_PATTERN.test(trimmed)) {
      return { text: buildDeepLBotHelpMessage() };
    }

    const parsed = parseTargetLanguageMessage(userText, this.defaultTargetLang);

    if (!parsed.hasLanguagePrefix) {
      if (!this.openAIAdapter) {
        return {
          text: 'No language prefix detected and OpenAI is not configured. Set OPENAI_MODE=1, OPENAI_API_KEY, and optionally OPENAI_MODEL.',
        };
      }

      const openAIResponse = await this.openAIAdapter.prompt({
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

    if (!this.deepLAdapter) {
      return {
        text: 'DeepL adapter is not configured. Set DEEPL_MODE=1 and DEEPL_API_KEY.',
      };
    }

    const deepLResponse = await this.deepLAdapter.translate({
      text: parsed.text,
      targetLanguage: parsed.targetLanguage,
    });

    return {
      text: `(${parsed.targetLanguage}) ${deepLResponse.responseText}`,
    };
  }
}
