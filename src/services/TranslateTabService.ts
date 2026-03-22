import type { DeepLAdapter } from '../adapters/deepl/DeepLAdapter';
import type { TranslateApiResult } from '../api/types';

export class TranslateTabService {
  constructor(
    private readonly deepLAdapter: DeepLAdapter | null,
    private readonly defaultTargetLang: string,
  ) {}

  async translateFromQuery(params: {
    text?: string;
    targetLanguage?: string;
  }): Promise<TranslateApiResult> {
    if (!this.deepLAdapter) {
      return {
        ok: false,
        failure: {
          code: 'NO_ADAPTER',
          message: 'DeepL adapter is not configured. Set DEEPL_MODE=1 and DEEPL_API_KEY.',
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
      const deepLResponse = await this.deepLAdapter.translate({ text, targetLanguage });
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
}
