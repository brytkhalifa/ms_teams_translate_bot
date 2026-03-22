import { afterEach, describe, expect, it, vi } from 'vitest';
import { getChatLimits } from '../src/config/chatLimits';

describe('getChatLimits', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses defaults when env unset', () => {
    vi.stubEnv('LLM_MAX_CONVERSATION_LENGTH', '');
    vi.stubEnv('LLM_MAX_TOTAL_CHARS', '');
    const limits = getChatLimits();
    expect(limits.maxMessages).toBe(50);
    expect(limits.maxTotalChars).toBe(24_000);
  });

  it('parses positive integers from env', () => {
    vi.stubEnv('LLM_MAX_CONVERSATION_LENGTH', '10');
    vi.stubEnv('LLM_MAX_TOTAL_CHARS', '100');
    expect(getChatLimits()).toEqual({ maxMessages: 10, maxTotalChars: 100 });
  });

  it('falls back for invalid env values', () => {
    vi.stubEnv('LLM_MAX_CONVERSATION_LENGTH', '-1');
    vi.stubEnv('LLM_MAX_TOTAL_CHARS', 'abc');
    const limits = getChatLimits();
    expect(limits.maxMessages).toBe(50);
    expect(limits.maxTotalChars).toBe(24_000);
  });
});
