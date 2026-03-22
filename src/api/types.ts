export type TranslateApiSuccess = {
  targetLanguage: string;
  translatedText: string;
  detectedSourceLanguage?: string;
};

export type TranslateApiFailure =
  | { code: 'NO_ADAPTER'; message: string }
  | { code: 'EMPTY_TEXT'; message: string }
  | { code: 'TRANSLATE_FAILED'; message: string };

export type TranslateApiResult =
  | { ok: true; data: TranslateApiSuccess }
  | { ok: false; failure: TranslateApiFailure };

export type ChatApiSuccess = {
  reply: string;
};

export type ChatApiFailure =
  | { code: 'NO_ADAPTER'; message: string }
  | { code: 'INVALID_BODY'; message: string }
  | { code: 'PAYLOAD_TOO_LARGE'; message: string }
  | { code: 'CHAT_FAILED'; message: string };

export type ChatApiResult =
  | { ok: true; data: ChatApiSuccess }
  | { ok: false; failure: ChatApiFailure };

/** Text for the bot to send back after the user messages the bot in chat. */
export type BotReply = {
  text: string;
};
