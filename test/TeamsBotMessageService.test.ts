import { describe, expect, it, vi } from 'vitest';
import type { DeepLAdapter } from '../src/adapters/deepl/DeepLAdapter';
import type { OpenAIAdapter } from '../src/adapters/openai/OpenAIAdapter';
import { TeamsBotMessageService } from '../src/services/TeamsBotMessageService';

function createService(deps: {
  deepL?: DeepLAdapter | null;
  openAI?: OpenAIAdapter | null;
  defaultLang?: string;
}) {
  return new TeamsBotMessageService(
    deps.deepL ?? null,
    deps.openAI ?? null,
    deps.defaultLang ?? 'EN-US',
  );
}

describe('TeamsBotMessageService', () => {
  it('returns DeepL help for tr help and tr hlep', async () => {
    const svc = createService({});
    const help = await svc.handleUserMessage('tr help');
    expect(help.text).toContain('Prefixes');
    expect(await svc.handleUserMessage('TR HELP')).toEqual(help);
    expect((await svc.handleUserMessage('tr hlep')).text).toContain('Prefixes');
  });

  it('returns config message when no prefix and no OpenAI', async () => {
    const svc = createService({ openAI: null });
    const r = await svc.handleUserMessage('hello');
    expect(r.text).toContain('OpenAI is not configured');
  });

  it('calls OpenAI prompt when no prefix and adapter present', async () => {
    const prompt = vi.fn().mockResolvedValue({ responseText: 'rewritten' });
    const openAI: OpenAIAdapter = {
      prompt,
      chat: vi.fn(),
    };
    const svc = createService({ openAI });
    const r = await svc.handleUserMessage('fix this');
    expect(prompt).toHaveBeenCalledWith({ text: 'fix this' });
    expect(r.text).toBe('rewritten');
  });

  it('returns hint when prefix only with no text', async () => {
    const deepL: DeepLAdapter = { translate: vi.fn() };
    const svc = createService({ deepL });
    const r = await svc.handleUserMessage('en');
    expect(r.text).toContain('language prefix');
    expect(deepL.translate).not.toHaveBeenCalled();
  });

  it('returns message when DeepL missing but translation requested', async () => {
    const svc = createService({ deepL: null, openAI: { prompt: vi.fn(), chat: vi.fn() } });
    const r = await svc.handleUserMessage('en hello');
    expect(r.text).toContain('DeepL adapter is not configured');
  });

  it('translates when DeepL present', async () => {
    const translate = vi.fn().mockResolvedValue({
      responseText: 'Hallo',
      detectedSourceLanguage: 'EN',
    });
    const deepL: DeepLAdapter = { translate };
    const svc = createService({ deepL });
    const r = await svc.handleUserMessage('en Hallo');
    expect(translate).toHaveBeenCalledWith({
      text: 'Hallo',
      targetLanguage: 'EN-US',
    });
    expect(r.text).toBe('(EN-US) Hallo');
  });
});
