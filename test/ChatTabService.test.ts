import { describe, expect, it, vi } from 'vitest';
import type { OpenAIAdapter } from '../src/adapters/openai/OpenAIAdapter';
import { ChatTabService } from '../src/services/ChatTabService';

const limits = { maxMessages: 5, maxTotalChars: 1000 };

describe('ChatTabService', () => {
  it('returns NO_ADAPTER when OpenAI null', async () => {
    const svc = new ChatTabService(null, limits);
    const r = await svc.chatFromBody({ messages: [{ role: 'user', content: 'hi' }] });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.failure.code).toBe('NO_ADAPTER');
    }
  });

  it('returns INVALID_BODY for bad payload', async () => {
    const openAI: OpenAIAdapter = { prompt: vi.fn(), chat: vi.fn() };
    const svc = new ChatTabService(openAI, limits);
    const r = await svc.chatFromBody({});
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.failure.code).toBe('INVALID_BODY');
    }
  });

  it('returns PAYLOAD_TOO_LARGE when over message count', async () => {
    const openAI: OpenAIAdapter = { prompt: vi.fn(), chat: vi.fn() };
    const svc = new ChatTabService(openAI, { maxMessages: 2, maxTotalChars: 10_000 });
    const messages = [
      { role: 'user' as const, content: 'a' },
      { role: 'assistant' as const, content: 'b' },
      { role: 'user' as const, content: 'c' },
    ];
    const r = await svc.chatFromBody({ messages });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.failure.code).toBe('PAYLOAD_TOO_LARGE');
    }
  });

  it('returns PAYLOAD_TOO_LARGE when over char budget', async () => {
    const openAI: OpenAIAdapter = { prompt: vi.fn(), chat: vi.fn() };
    const svc = new ChatTabService(openAI, { maxMessages: 10, maxTotalChars: 5 });
    const r = await svc.chatFromBody({
      messages: [{ role: 'user', content: '123456' }],
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.failure.code).toBe('PAYLOAD_TOO_LARGE');
    }
  });

  it('calls chat and returns reply', async () => {
    const chat = vi.fn().mockResolvedValue({ responseText: 'ok' });
    const openAI: OpenAIAdapter = { prompt: vi.fn(), chat };
    const svc = new ChatTabService(openAI, limits);
    const body = {
      messages: [
        { role: 'user' as const, content: 'hi' },
        { role: 'assistant' as const, content: 'yo' },
        { role: 'user' as const, content: 'again' },
      ],
    };
    const r = await svc.chatFromBody(body);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.reply).toBe('ok');
    }
    expect(chat).toHaveBeenCalledWith(body.messages);
  });

  it('returns CHAT_FAILED when chat throws', async () => {
    const openAI: OpenAIAdapter = {
      prompt: vi.fn(),
      chat: vi.fn().mockRejectedValue(new Error('api down')),
    };
    const svc = new ChatTabService(openAI, limits);
    const r = await svc.chatFromBody({ messages: [{ role: 'user', content: 'x' }] });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.failure.code).toBe('CHAT_FAILED');
    }
  });
});
