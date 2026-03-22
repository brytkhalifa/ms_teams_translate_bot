import { describe, expect, it } from 'vitest';
import { isLiveApiEnabled } from '../src/config/envMode';

describe('isLiveApiEnabled', () => {
  it('returns false for undefined and empty string', () => {
    expect(isLiveApiEnabled(undefined)).toBe(false);
    expect(isLiveApiEnabled('')).toBe(false);
  });

  it('returns true for opt-in values (case-insensitive)', () => {
    expect(isLiveApiEnabled('1')).toBe(true);
    expect(isLiveApiEnabled('TRUE')).toBe(true);
    expect(isLiveApiEnabled('yes')).toBe(true);
    expect(isLiveApiEnabled('On')).toBe(true);
    expect(isLiveApiEnabled('Y')).toBe(true);
    expect(isLiveApiEnabled('  true  ')).toBe(true);
  });

  it('returns false for other strings', () => {
    expect(isLiveApiEnabled('false')).toBe(false);
    expect(isLiveApiEnabled('0')).toBe(false);
    expect(isLiveApiEnabled('no')).toBe(false);
    expect(isLiveApiEnabled('http')).toBe(false);
  });
});
