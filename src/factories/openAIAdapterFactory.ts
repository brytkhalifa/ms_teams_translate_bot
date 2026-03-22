import OpenAI from 'openai';
import { OpenAIAdapter } from '../adapters/openai/OpenAIAdapter';
import { OpenAIEchoAdapter } from '../adapters/openai/OpenAIEchoAdapter';
import { OpenAIHttpAdapter } from '../adapters/openai/OpenAIHttpAdapter';
import { isLiveApiEnabled } from '../config/envMode';

export function createOpenAIAdapter(): OpenAIAdapter {
  if (!isLiveApiEnabled(process.env.OPENAI_MODE)) {
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
