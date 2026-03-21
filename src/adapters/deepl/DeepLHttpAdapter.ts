import { SourceLanguageCode, TargetLanguageCode, Translator } from 'deepl-node';
import { DeepLAdapter, DeepLTranslateRequest, DeepLTranslateResponse } from './DeepLAdapter';

export class DeepLHttpAdapter implements DeepLAdapter {
  private readonly translator: Translator;

  constructor(
    private readonly apiKey: string,
    private readonly apiUrl: string = process.env.DEEPL_API_URL || 'https://api-free.deepl.com',
  ) {
    this.translator = new Translator(this.apiKey);
  }

  async translate(request: DeepLTranslateRequest): Promise<DeepLTranslateResponse> {
    const result = await this.translator.translateText(
      request.text,
      (request.sourceLanguage as SourceLanguageCode | null) || null,
      request.targetLanguage as TargetLanguageCode,
    );

    return {
      responseText: (result.text || '').trim(),
      detectedSourceLanguage: result.detectedSourceLang,
    };
  }
}
