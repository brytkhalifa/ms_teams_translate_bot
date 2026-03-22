import { describe, expect, it } from 'vitest';
import { chatFailureToStatus, translateFailureToStatus } from '../src/http/mapApiFailure';

describe('translateFailureToStatus', () => {
  it('maps EMPTY_TEXT to 400', () => {
    expect(translateFailureToStatus('EMPTY_TEXT')).toBe(400);
  });

  it('maps other codes to 500', () => {
    expect(translateFailureToStatus('NO_ADAPTER')).toBe(500);
    expect(translateFailureToStatus('TRANSLATE_FAILED')).toBe(500);
  });
});

describe('chatFailureToStatus', () => {
  it('maps known codes', () => {
    expect(chatFailureToStatus('INVALID_BODY')).toBe(400);
    expect(chatFailureToStatus('PAYLOAD_TOO_LARGE')).toBe(413);
    expect(chatFailureToStatus('NO_ADAPTER')).toBe(501);
    expect(chatFailureToStatus('CHAT_FAILED')).toBe(500);
  });
});
