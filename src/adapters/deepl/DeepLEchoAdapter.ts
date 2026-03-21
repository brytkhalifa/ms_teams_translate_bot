import { DeepLAdapter, DeepLTranslateRequest, DeepLTranslateResponse } from './DeepLAdapter';

export class DeepLEchoAdapter implements DeepLAdapter {
  async translate(request: DeepLTranslateRequest): Promise<DeepLTranslateResponse> {
    return {
      responseText: request.text,
    };
  }
}
