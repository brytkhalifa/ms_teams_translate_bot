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
