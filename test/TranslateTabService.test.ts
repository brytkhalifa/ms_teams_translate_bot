import { describe, expect, it, vi } from 'vitest';
import type { DeepLAdapter } from '../src/adapters/deepl/DeepLAdapter';
import { TranslateTabService } from '../src/services/TranslateTabService';

describe('TranslateTabService', () => {
  it('returns NO_ADAPTER when DeepL null', async () => {
    const svc = new TranslateTabService(null, 'EN-US');
    const r = await svc.translateFromQuery({ text: 'hi' });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.failure.code).toBe('NO_ADAPTER');
    }
  });

  it('returns EMPTY_TEXT for missing text', async () => {
    const deepL: DeepLAdapter = { translate: vi.fn() };
    const svc = new TranslateTabService(deepL, 'DE');
    const r = await svc.translateFromQuery({ text: '  ' });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.failure.code).toBe('EMPTY_TEXT');
    }
  });

  it('uses default target language', async () => {
    const translate = vi.fn().mockResolvedValue({ responseText: 'X' });
    const svc = new TranslateTabService({ translate }, 'FR');
    const r = await svc.translateFromQuery({ text: 'a' });
    expect(r.ok).toBe(true);
    expect(translate).toHaveBeenCalledWith({ text: 'a', targetLanguage: 'FR' });
  });

  it('returns TRANSLATE_FAILED on adapter error', async () => {
    const deepL: DeepLAdapter = {
      translate: vi.fn().mockRejectedValue(new Error('boom')),
    };
    const svc = new TranslateTabService(deepL, 'EN-US');
    const r = await svc.translateFromQuery({ text: 'a', targetLanguage: 'DE' });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.failure.code).toBe('TRANSLATE_FAILED');
      expect(r.failure.message).toContain('boom');
    }
  });
});
