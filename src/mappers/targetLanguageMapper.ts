export interface ParsedTargetLanguageMessage {
  targetLanguage: string;
  text: string;
  hasLanguagePrefix: boolean;
}

const LANGUAGE_PREFIX_TO_TARGET: Record<string, string> = {
  // English
  en: 'EN-US',
  english: 'EN-US',
  // German
  de: 'DE',
  german: 'DE',
  deutsch: 'DE',
  // Spanish
  es: 'ES',
  spanish: 'ES',
  espanol: 'ES',
  // French
  fr: 'FR',
  french: 'FR',
  francais: 'FR',
  // Italian
  it: 'IT',
  italian: 'IT',
  italiano: 'IT',
  // Dutch
  nl: 'NL',
  dutch: 'NL',
  nederlands: 'NL',
  // Portuguese
  pt: 'PT-PT',
  portuguese: 'PT-PT',
  // Brazilian Portuguese
  'pt-br': 'PT-BR',
  brazilian: 'PT-BR',
  'brazilian-portuguese': 'PT-BR',
  // Polish
  pl: 'PL',
  polish: 'PL',
  // Japanese
  ja: 'JA',
  japanese: 'JA',
  // Chinese (simplified)
  zh: 'ZH-HANS',
  chinese: 'ZH-HANS',
};

export function parseTargetLanguageMessage(
  message: string,
  fallbackTargetLanguage = 'EN-US',
): ParsedTargetLanguageMessage {
  const trimmed = (message || '').trim();
  if (!trimmed) {
    return {
      targetLanguage: fallbackTargetLanguage,
      text: '',
      hasLanguagePrefix: false,
    };
  }

  const [rawPrefix, ...rest] = trimmed.split(/\s+/);
  const prefix = rawPrefix.toLowerCase();
  const mappedTargetLanguage = LANGUAGE_PREFIX_TO_TARGET[prefix];

  if (!mappedTargetLanguage) {
    return {
      targetLanguage: fallbackTargetLanguage,
      text: trimmed,
      hasLanguagePrefix: false,
    };
  }

  return {
    targetLanguage: mappedTargetLanguage,
    text: rest.join(' ').trim(),
    hasLanguagePrefix: true,
  };
}

/** Multi-line help for the Teams bot: DeepL prefixes derived from the same map as parsing. */
export function buildDeepLBotHelpMessage(): string {
  const byTarget = new Map<string, string[]>();
  for (const [prefix, target] of Object.entries(LANGUAGE_PREFIX_TO_TARGET)) {
    const list = byTarget.get(target) ?? [];
    list.push(prefix);
    byTarget.set(target, list);
  }

  for (const list of byTarget.values()) {
    list.sort((a, b) => a.localeCompare(b));
  }

  const lines = [...byTarget.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([target, prefixes]) => `${target}: ${prefixes.join(', ')}`);

  return [
    'DeepL (bot): start with a language prefix, then the text to translate.',
    'Example: en Hello world  or  deutsch Wie geht es dir',
    '',
    'Messages without a prefix go to OpenAI for rewrite/help (when OPENAI is configured).',
    '',
    'Send tr help anytime to show this list.',
    '',
    'Prefixes (alias → DeepL target code):',
    ...lines,
  ].join('\n');
}
