export interface OpenAIPromptRequest {
  text: string;
  tone?: string;
  targetLanguage?: string;
}

export interface OpenAIPromptResponse {
  responseText: string;
}

export type OpenAIChatRole = 'user' | 'assistant' | 'system';

export interface OpenAIChatMessage {
  role: OpenAIChatRole;
  content: string;
}

export interface OpenAIAdapter {
  prompt(request: OpenAIPromptRequest): Promise<OpenAIPromptResponse>;
  chat(messages: OpenAIChatMessage[]): Promise<OpenAIPromptResponse>;
}
