import type { LevelData } from "../../game/data/LevelData";
import { deepClone } from "../utils/deepClone";
import { createId } from "../utils/idFactory";
import {
  importLevelFromJson,
  serializeLevel,
} from "./EditorSerializationSystem";

export const EDITOR_STORAGE_KEYS = {
  index: "sky-sprout-runner:custom-levels:index",
  level: (levelId: string) => `sky-sprout-runner:custom-levels:${levelId}`,
  draft: (levelId: string) => `sky-sprout-runner:editor:draft:${levelId}`,
  record: (levelId: string) =>
    `sky-sprout-runner:custom-levels:${levelId}:record`,
  thumbnail: (levelId: string) =>
    `sky-sprout-runner:custom-levels:${levelId}:thumbnail`,
  lastOpened: "sky-sprout-runner:editor:last-opened",
} as const;

const MAX_STORED_THUMBNAIL_BYTES = 96;

export interface SavedLevelSummary {
  id: string;
  name: string;
  updatedAt: string;
  widthTiles: number;
  heightTiles: number;
  bestTimeSeconds?: number;
  bestScore?: number;
  thumbnail?: string;
}

export interface LevelPlayResult {
  cleared: boolean;
  elapsedSeconds: number;
  score: number;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class EditorPersistenceSystem {
  private readonly storage: StorageLike;

  constructor(storage?: StorageLike) {
    try {
      this.storage = storage ?? window.localStorage;
    } catch {
      this.storage = {
        getItem: () => null,
        setItem: () => {
          throw new Error("이 브라우저에서 저장소에 접근할 수 없어요.");
        },
        removeItem: () => {
          throw new Error("이 브라우저에서 저장소에 접근할 수 없어요.");
        },
      };
    }
  }

  createLevel(level: LevelData): LevelData {
    const next = deepClone(level);
    next.id = createId("custom-level");
    return this.saveLevel(next);
  }

  saveLevel(level: LevelData): LevelData {
    const next = { ...deepClone(level), updatedAt: new Date().toISOString() };
    const summaries = this.listLevels().filter(
      (summary) => summary.id !== next.id,
    );
    summaries.unshift(this.toSummary(next));
    this.writeTransaction([
      [EDITOR_STORAGE_KEYS.level(next.id), serializeLevel(next)],
      [EDITOR_STORAGE_KEYS.index, JSON.stringify(summaries)],
      [EDITOR_STORAGE_KEYS.lastOpened, next.id],
    ]);
    return next;
  }

  loadLevel(levelId: string): LevelData | null {
    const raw = this.safeGetItem(EDITOR_STORAGE_KEYS.level(levelId));
    if (!raw) {
      return null;
    }

    const imported = importLevelFromJson(raw);
    return imported.ok ? imported.level : null;
  }

  listLevels(): SavedLevelSummary[] {
    const raw = this.safeGetItem(EDITOR_STORAGE_KEYS.index);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .filter((item): item is SavedLevelSummary => {
          return (
            typeof item === "object" &&
            item !== null &&
            typeof (item as SavedLevelSummary).id === "string" &&
            typeof (item as SavedLevelSummary).name === "string" &&
            typeof (item as SavedLevelSummary).updatedAt === "string" &&
            Number.isFinite((item as SavedLevelSummary).widthTiles) &&
            Number.isFinite((item as SavedLevelSummary).heightTiles)
          );
        })
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } catch {
      return [];
    }
  }

  duplicateLevel(levelId: string): LevelData | null {
    const level = this.loadLevel(levelId);
    if (!level) {
      return null;
    }

    const copy = deepClone(level);
    copy.id = createId("custom-level-copy");
    copy.name = `${level.name} 사본`;
    copy.createdAt = new Date().toISOString();
    return this.saveLevel(copy);
  }

  deleteLevel(levelId: string): void {
    this.writeTransaction([
      [
        EDITOR_STORAGE_KEYS.index,
        JSON.stringify(
          this.listLevels().filter((summary) => summary.id !== levelId),
        ),
      ],
      [EDITOR_STORAGE_KEYS.level(levelId), null],
      [EDITOR_STORAGE_KEYS.draft(levelId), null],
      [EDITOR_STORAGE_KEYS.record(levelId), null],
      [EDITOR_STORAGE_KEYS.thumbnail(levelId), null],
    ]);
  }

  exportLevel(levelId: string): string | null {
    const level = this.loadLevel(levelId);
    return level ? serializeLevel(level) : null;
  }

  importLevel(
    json: string,
  ): { ok: true; level: LevelData } | { ok: false; error: string } {
    const imported = importLevelFromJson(json);
    if (!imported.ok) {
      return imported;
    }

    const level = deepClone(imported.level);
    level.id = createId("imported-level");
    try {
      return { ok: true, level: this.saveLevel(level) };
    } catch {
      return {
        ok: false,
        error:
          "가져온 레벨을 저장하지 못했어요. 저장 공간을 확인하고 다시 시도하세요.",
      };
    }
  }

  autosaveDraft(level: LevelData): void {
    this.writeTransaction([
      [EDITOR_STORAGE_KEYS.draft(level.id), serializeLevel(level)],
      [EDITOR_STORAGE_KEYS.lastOpened, level.id],
    ]);
  }

  recoverDraft(levelId: string): LevelData | null {
    const raw = this.safeGetItem(EDITOR_STORAGE_KEYS.draft(levelId));
    if (!raw) {
      return null;
    }

    const imported = importLevelFromJson(raw);
    return imported.ok ? imported.level : null;
  }

  clearDraft(levelId: string): void {
    this.storage.removeItem(EDITOR_STORAGE_KEYS.draft(levelId));
  }

  recordPlayResult(levelId: string, result: LevelPlayResult): void {
    if (!result.cleared) {
      return;
    }

    const previous = this.readRecord(levelId);
    const next = {
      bestTimeSeconds:
        previous.bestTimeSeconds === undefined
          ? result.elapsedSeconds
          : Math.min(previous.bestTimeSeconds, result.elapsedSeconds),
      bestScore:
        previous.bestScore === undefined
          ? result.score
          : Math.max(previous.bestScore, result.score),
    };
    this.storage.setItem(
      EDITOR_STORAGE_KEYS.record(levelId),
      JSON.stringify(next),
    );
    this.refreshSummary(levelId);
  }

  saveThumbnail(levelId: string, dataUrl: string): void {
    const thumbnail =
      dataUrl.length > MAX_STORED_THUMBNAIL_BYTES
        ? `thumb://generated/${levelId}`
        : dataUrl;
    this.storage.setItem(EDITOR_STORAGE_KEYS.thumbnail(levelId), thumbnail);
    this.refreshSummary(levelId);
  }

  private refreshSummary(levelId: string): void {
    const level = this.loadLevel(levelId);
    if (!level) {
      return;
    }

    const summaries = this.listLevels().filter(
      (summary) => summary.id !== levelId,
    );
    summaries.unshift(this.toSummary(level));
    this.writeTransaction([
      [EDITOR_STORAGE_KEYS.index, JSON.stringify(summaries)],
    ]);
  }

  private readRecord(levelId: string): {
    bestTimeSeconds?: number;
    bestScore?: number;
  } {
    const raw = this.safeGetItem(EDITOR_STORAGE_KEYS.record(levelId));
    if (!raw) {
      return {};
    }

    try {
      const parsed = JSON.parse(raw) as {
        bestTimeSeconds?: unknown;
        bestScore?: unknown;
      };
      return {
        bestTimeSeconds:
          typeof parsed.bestTimeSeconds === "number" &&
          Number.isFinite(parsed.bestTimeSeconds)
            ? parsed.bestTimeSeconds
            : undefined,
        bestScore:
          typeof parsed.bestScore === "number" &&
          Number.isFinite(parsed.bestScore)
            ? parsed.bestScore
            : undefined,
      };
    } catch {
      return {};
    }
  }

  private toSummary(level: LevelData): SavedLevelSummary {
    return {
      ...toSummary(level),
      ...this.readRecord(level.id),
      thumbnail:
        this.safeGetItem(EDITOR_STORAGE_KEYS.thumbnail(level.id)) ?? undefined,
    };
  }

  private safeGetItem(key: string): string | null {
    try {
      return this.storage.getItem(key);
    } catch {
      return null;
    }
  }

  // localStorage has no transactions: restore each prior value if any required write fails.
  // A failure must reach the UI so it never labels an unsaved draft as saved.
  private writeTransaction(entries: Array<[string, string | null]>): void {
    if (entries.some(([key]) => key === EDITOR_STORAGE_KEYS.index)) {
      const rawIndex = this.storage.getItem(EDITOR_STORAGE_KEYS.index);
      if (rawIndex) {
        let corrupt = false;
        try {
          const parsed = JSON.parse(rawIndex) as unknown;
          corrupt =
            !Array.isArray(parsed) ||
            parsed.length !== this.listLevels().length;
        } catch {
          corrupt = true;
        }
        if (corrupt) {
          // Keep original damaged bytes instead of silently replacing the only copy.
          entries = [
            [
              `sky-sprout-runner:editor:recovery:index:${createId("backup")}`,
              rawIndex,
            ],
            ...entries,
          ];
        }
      }
    }
    const previous = entries.map(
      ([key]) => [key, this.storage.getItem(key)] as const,
    );
    try {
      for (const [key, value] of entries) {
        if (value === null) this.storage.removeItem(key);
        else this.storage.setItem(key, value);
      }
    } catch (error) {
      for (const [key, value] of previous.reverse()) {
        try {
          if (value === null) this.storage.removeItem(key);
          else this.storage.setItem(key, value);
        } catch {
          /* Keep remaining previous values even if the browser blocks rollback. */
        }
      }
      throw error;
    }
  }
}

function toSummary(level: LevelData): SavedLevelSummary {
  return {
    id: level.id,
    name: level.name,
    updatedAt: level.updatedAt,
    widthTiles: level.world.widthTiles,
    heightTiles: level.world.heightTiles,
  };
}
