import {
  OpenAIAdapter,
  OpenAIChatMessage,
  OpenAIPromptRequest,
  OpenAIPromptResponse,
} from './OpenAIAdapter';

export class OpenAIEchoAdapter implements OpenAIAdapter {
  async prompt(request: OpenAIPromptRequest): Promise<OpenAIPromptResponse> {
    return {
      responseText: request.text,
    };
  }

  async chat(messages: OpenAIChatMessage[]): Promise<OpenAIPromptResponse> {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    const snippet = lastUser?.content?.slice(0, 200) ?? '';
    return {
      responseText: `[echo] ${snippet}`,
    };
  }
}
