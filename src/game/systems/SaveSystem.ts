import { SAVE_KEYS } from "../config/constants";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

export class SaveSystem {
  private readonly storage: StorageLike;

  constructor(storage?: StorageLike) {
    this.storage = storage ?? this.getDefaultStorage();
  }

  getBestScore(): number {
    let rawValue: string | null = null;
    try {
      rawValue = this.storage.getItem(SAVE_KEYS.bestScore);
    } catch {
      return 0;
    }
    const parsed = rawValue === null ? 0 : Number.parseInt(rawValue, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  setBestScore(score: number): void {
    try {
      this.storage.setItem(
        SAVE_KEYS.bestScore,
        String(Math.max(0, Math.floor(score))),
      );
    } catch {
      if (typeof window !== "undefined")
        window.dispatchEvent(new CustomEvent("sky-sprout:save-error"));
    }
  }

  private getDefaultStorage(): StorageLike {
    try {
      if (typeof window !== "undefined" && window.localStorage)
        return window.localStorage;
    } catch {
      /* Session-only score is still playable. */
    }

    return new MemoryStorage();
  }
}
