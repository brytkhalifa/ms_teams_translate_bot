/** Values that opt in to calling live APIs (case-insensitive). If unset or anything else, use echo adapters. */
const LIVE_API_ENABLED = new Set(['1', 'true', 'yes', 'on', 'y']);

export function isLiveApiEnabled(envValue: string | undefined): boolean {
  if (envValue === undefined || envValue === '') {
    return false;
  }
  return LIVE_API_ENABLED.has(envValue.trim().toLowerCase());
}
