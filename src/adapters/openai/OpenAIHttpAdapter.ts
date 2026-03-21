import OpenAI from 'openai';
import {
  OpenAIAdapter,
  OpenAIChatMessage,
  OpenAIPromptRequest,
  OpenAIPromptResponse,
} from './OpenAIAdapter';

const CHAT_SYSTEM_PROMPT =
  'You are a helpful assistant in Microsoft Teams. Answer clearly and concisely.';

export class OpenAIHttpAdapter implements OpenAIAdapter {
  constructor(
    private readonly client: OpenAI,
    private readonly model: string = process.env.OPENAI_MODEL || 'gpt-4o-mini',
  ) {}

  async prompt(request: OpenAIPromptRequest): Promise<OpenAIPromptResponse> {
    const response = await this.client.responses.create({
      model: this.model,
      input: [
        {
          role: 'system',
          content:
            'Rewrite the user text for Microsoft Teams. Preserve meaning and facts. Improve clarity and match requested tone and language.',
        },
        {
          role: 'user',
          content: `Tone: ${request.tone || 'friendly'}\nTarget language: ${request.targetLanguage || 'same as input'}\n\nText:\n${request.text}`,
        },
      ],
    });

    return {
      responseText: (response.output_text || '').trim(),
    };
  }

  async chat(messages: OpenAIChatMessage[]): Promise<OpenAIPromptResponse> {
    const apiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: CHAT_SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: apiMessages,
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? '';
    return { responseText: text };
  }
}
