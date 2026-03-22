import { describe, expect, it } from 'vitest';
import {
  buildDeepLBotHelpMessage,
  parseTargetLanguageMessage,
} from '../src/mappers/targetLanguageMapper';

describe('parseTargetLanguageMessage', () => {
  it('returns no prefix for empty and unknown prefix', () => {
    expect(parseTargetLanguageMessage('')).toMatchObject({
      hasLanguagePrefix: false,
      text: '',
    });
    expect(parseTargetLanguageMessage('hello world')).toMatchObject({
      hasLanguagePrefix: false,
      text: 'hello world',
    });
  });

  it('parses known prefix and text', () => {
    expect(parseTargetLanguageMessage('en Hello')).toMatchObject({
      hasLanguagePrefix: true,
      targetLanguage: 'EN-US',
      text: 'Hello',
    });
    expect(parseTargetLanguageMessage('de')).toMatchObject({
      hasLanguagePrefix: true,
      targetLanguage: 'DE',
      text: '',
    });
  });

  it('uses fallback target when no prefix', () => {
    expect(parseTargetLanguageMessage('x', 'FR')).toMatchObject({
      targetLanguage: 'FR',
      hasLanguagePrefix: false,
    });
  });
});

describe('buildDeepLBotHelpMessage', () => {
  it('includes intro and grouped prefixes', () => {
    const msg = buildDeepLBotHelpMessage();
    expect(msg).toContain('DeepL (bot):');
    expect(msg).toContain('tr help');
    expect(msg).toContain('EN-US:');
    expect(msg).toContain('en');
    expect(msg).toContain('english');
    expect(msg).toContain('DE:');
    expect(msg).toContain('de');
  });
});
