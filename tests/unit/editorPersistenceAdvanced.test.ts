import { describe, expect, test } from "vitest";
import { createLevelFromTemplate } from "../../src/editor/data/levelTemplates";
import {
  EDITOR_STORAGE_KEYS,
  EditorPersistenceSystem,
  type StorageLike,
} from "../../src/editor/systems/EditorPersistenceSystem";

class MemoryStorage implements StorageLike {
  private values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

describe("advanced editor persistence", () => {
  test("stores compact summaries with records and generated thumbnails", () => {
    const storage = new MemoryStorage();
    const persistence = new EditorPersistenceSystem(storage);
    const saved = persistence.saveLevel(
      createLevelFromTemplate("starterPlains"),
    );

    persistence.recordPlayResult(saved.id, {
      cleared: true,
      elapsedSeconds: 42,
      score: 1200,
    });
    persistence.saveThumbnail(
      saved.id,
      "data:image/png;base64," + "a".repeat(120),
    );

    const summary = persistence.listLevels()[0];
    expect(summary.bestTimeSeconds).toBe(42);
    expect(summary.bestScore).toBe(1200);
    expect(summary.thumbnail).toContain("thumb://generated/");
  });

  test("survives corrupt reads but reports failed writes instead of a false save", () => {
    const storage = new MemoryStorage();
    storage.setItem(EDITOR_STORAGE_KEYS.index, "{bad-json");
    const persistence = new EditorPersistenceSystem(storage);

    expect(persistence.listLevels()).toEqual([]);
    storage.setItem = () => {
      throw new DOMException("quota", "QuotaExceededError");
    };

    expect(() =>
      persistence.saveLevel(createLevelFromTemplate("emptyIsland")),
    ).toThrow();
    expect(persistence.listLevels()).toEqual([]);
    expect(
      persistence.importLevel(
        JSON.stringify(createLevelFromTemplate("emptyIsland")),
      ).ok,
    ).toBe(false);
  });

  test("rolls back level bytes when the required index write fails", () => {
    const storage = new MemoryStorage();
    const persistence = new EditorPersistenceSystem(storage);
    const saved = persistence.saveLevel(
      createLevelFromTemplate("starterPlains"),
    );
    const before = storage.getItem(EDITOR_STORAGE_KEYS.level(saved.id));
    const set = storage.setItem.bind(storage);
    storage.setItem = (key, value) => {
      if (key === EDITOR_STORAGE_KEYS.index) throw new Error("index quota");
      set(key, value);
    };
    expect(() =>
      persistence.saveLevel({ ...saved, name: "must not become saved" }),
    ).toThrow("index quota");
    expect(storage.getItem(EDITOR_STORAGE_KEYS.level(saved.id))).toBe(before);
    expect(persistence.loadLevel(saved.id)?.name).toBe(saved.name);
  });

  test("keeps draft identity and timestamp for recovery without changing saved content", () => {
    const storage = new MemoryStorage();
    const persistence = new EditorPersistenceSystem(storage);
    const saved = persistence.saveLevel(createLevelFromTemplate("emptyIsland"));
    const draft = {
      ...saved,
      name: "복구할 작업",
      updatedAt: "2030-01-01T00:00:00.000Z",
    };
    persistence.autosaveDraft(draft);
    expect(persistence.recoverDraft(saved.id)).toMatchObject(draft);
    expect(persistence.loadLevel(saved.id)?.name).toBe(saved.name);
    expect(storage.getItem(EDITOR_STORAGE_KEYS.lastOpened)).toBe(saved.id);
    persistence.clearDraft(saved.id);
    expect(persistence.recoverDraft(saved.id)).toBeNull();
  });

  test("handles blocked reads and rejects malformed imported objects", () => {
    const storage = new MemoryStorage();
    const persistence = new EditorPersistenceSystem(storage);
    const level = createLevelFromTemplate("emptyIsland");
    expect(
      persistence.importLevel(JSON.stringify({ ...level, terrain: [null] })).ok,
    ).toBe(false);
    expect(
      persistence.importLevel(
        JSON.stringify({
          ...level,
          platforms: [
            {
              ...level.playerSpawn,
              type: "movingBreezePlatform",
              waypoints: [null],
            },
          ],
        }),
      ).ok,
    ).toBe(false);
    storage.getItem = () => {
      throw new Error("blocked");
    };
    expect(persistence.listLevels()).toEqual([]);
    expect(persistence.loadLevel("missing")).toBeNull();
    expect(persistence.recoverDraft("missing")).toBeNull();
  });

  test("preserves damaged index bytes before a new save repairs the list", () => {
    const storage = new MemoryStorage();
    const written: Array<[string, string]> = [];
    const set = storage.setItem.bind(storage);
    storage.setItem = (key, value) => {
      written.push([key, value]);
      set(key, value);
    };
    storage.setItem(EDITOR_STORAGE_KEYS.index, "{damaged original");
    const persistence = new EditorPersistenceSystem(storage);
    const saved = persistence.saveLevel(createLevelFromTemplate("emptyIsland"));
    const backup = written.find(([key]) =>
      key.startsWith("sky-sprout-runner:editor:recovery:index:"),
    );
    expect(backup?.[1]).toBe("{damaged original");
    expect(persistence.listLevels()[0].id).toBe(saved.id);
  });
});
