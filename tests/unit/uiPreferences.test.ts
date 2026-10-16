import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  DEFAULT_PREFERENCES,
  getPreferences,
  prefersReducedMotion,
  PREFERENCES_KEY,
  readPreferences,
  subscribePreferences,
  updatePreferences
} from '../../src/ui/state/preferences';

function memoryStorage(raw: string | null = null) {
  let value = raw;
  return {
    getItem: vi.fn(() => value),
    setItem: vi.fn((_key: string, next: string) => {
      value = next;
    })
  };
}

beforeEach(() => {
  updatePreferences(DEFAULT_PREFERENCES, memoryStorage());
});
afterEach(() => vi.unstubAllGlobals());

describe('UI preferences storage', () => {
  test('corrupt, missing and wrongly typed data return safe defaults without deleting original data', () => {
    for (const raw of [
      null,
      '{broken',
      '42',
      '[]',
      '{"sound":"false","motion":"spin","showHints":0}'
    ]) {
      const storage = memoryStorage(raw);
      expect(readPreferences(storage)).toEqual(DEFAULT_PREFERENCES);
      expect(storage.setItem).not.toHaveBeenCalled();
    }
  });

  test('persists only the dedicated preference key and preserves valid values', () => {
    const storage = memoryStorage();
    expect(
      updatePreferences(
        { sound: false, motion: 'reduced', showHints: false },
        storage
      )
    ).toBe(true);
    expect(storage.setItem).toHaveBeenCalledWith(
      PREFERENCES_KEY,
      JSON.stringify({ sound: false, motion: 'reduced', showHints: false })
    );
    expect(readPreferences(storage)).toEqual({
      sound: false,
      motion: 'reduced',
      showHints: false
    });
  });

  test('blocked reads and writes keep the interface usable and report persistence failure', () => {
    const blocked = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('quota');
      }
    };
    expect(readPreferences(blocked)).toEqual(DEFAULT_PREFERENCES);
    expect(updatePreferences({ sound: false }, blocked)).toBe(false);
    expect(getPreferences().sound).toBe(false);
  });

  test('listeners receive current-session changes and can unsubscribe', () => {
    const listener = vi.fn();
    const stop = subscribePreferences(listener);
    updatePreferences({ showHints: false }, memoryStorage());
    expect(listener).toHaveBeenCalledOnce();
    stop();
    updatePreferences({ showHints: true }, memoryStorage());
    expect(listener).toHaveBeenCalledOnce();
  });

  test('OS reduced motion remains respected and app preference can reduce it further', () => {
    vi.stubGlobal('window', { matchMedia: () => ({ matches: true }) });
    expect(prefersReducedMotion()).toBe(true);
    vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });
    expect(prefersReducedMotion()).toBe(false);
    updatePreferences({ motion: 'reduced' }, memoryStorage());
    expect(prefersReducedMotion()).toBe(true);
  });
});
