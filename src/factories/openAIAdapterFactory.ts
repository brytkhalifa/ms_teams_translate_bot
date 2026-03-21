import OpenAI from 'openai';
import { OpenAIAdapter } from '../adapters/openai/OpenAIAdapter';
import { OpenAIEchoAdapter } from '../adapters/openai/OpenAIEchoAdapter';
import { OpenAIHttpAdapter } from '../adapters/openai/OpenAIHttpAdapter';

export function createOpenAIAdapter(): OpenAIAdapter {
  if ([false, 'false', '0', 'no', 'n'].includes((process.env.OpenAI_MODE || 'false').toLowerCase()) ) {
    return new OpenAIEchoAdapter();
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required.');
  }

  return new OpenAIHttpAdapter(
    new OpenAI({ apiKey }),
    process.env.OPENAI_MODEL || 'gpt-4o-mini',
  );
}
