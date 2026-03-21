export interface DeepLTranslateRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

export interface DeepLTranslateResponse {
  responseText: string;
  detectedSourceLanguage?: string;
}

export interface DeepLAdapter {
  translate(request: DeepLTranslateRequest): Promise<DeepLTranslateResponse>;
}
