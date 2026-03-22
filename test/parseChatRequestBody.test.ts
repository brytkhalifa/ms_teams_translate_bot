import { describe, expect, it } from 'vitest';
import { parseChatRequestBody } from '../src/validation/parseChatRequestBody';

describe('parseChatRequestBody', () => {
  it('rejects non-objects and empty messages', () => {
    expect(parseChatRequestBody(null).ok).toBe(false);
    expect(parseChatRequestBody('x').ok).toBe(false);
    expect(parseChatRequestBody({}).ok).toBe(false);
    expect(parseChatRequestBody({ messages: [] }).ok).toBe(false);
  });

  it('accepts valid single user message', () => {
    const r = parseChatRequestBody({ messages: [{ role: 'user', content: 'Hi' }] });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.messages).toEqual([{ role: 'user', content: 'Hi' }]);
    }
  });

  it('trims content and requires last message user', () => {
    const r = parseChatRequestBody({
      messages: [
        { role: 'user', content: ' a ' },
        { role: 'assistant', content: 'b' },
        { role: 'user', content: 'c' },
      ],
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.messages[0].content).toBe('a');
    }

    const bad = parseChatRequestBody({
      messages: [{ role: 'assistant', content: 'only assistant' }],
    });
    expect(bad.ok).toBe(false);
  });

  it('rejects invalid roles and empty content', () => {
    expect(parseChatRequestBody({ messages: [{ role: 'system', content: 'x' }] }).ok).toBe(false);
    expect(parseChatRequestBody({ messages: [{ role: 'user', content: '   ' }] }).ok).toBe(false);
  });
});
