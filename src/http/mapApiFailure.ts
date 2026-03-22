import type { ChatApiFailure, TranslateApiFailure } from '../api/types';

export function translateFailureToStatus(code: TranslateApiFailure['code']): number {
  if (code === 'EMPTY_TEXT') {
    return 400;
  }
  return 500;
}

export function chatFailureToStatus(code: ChatApiFailure['code']): number {
  switch (code) {
    case 'INVALID_BODY':
      return 400;
    case 'PAYLOAD_TOO_LARGE':
      return 413;
    case 'NO_ADAPTER':
      return 501;
    default:
      return 500;
  }
}
