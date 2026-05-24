import type { LevelData } from '../../game/data/LevelData';
import { deepClone } from '../utils/deepClone';
import { createId } from '../utils/idFactory';
import { importLevelFromJson, serializeLevel } from './EditorSerializationSystem';

export const EDITOR_STORAGE_KEYS = {
  index: 'sky-sprout-runner:custom-levels:index',
  level: (levelId: string) => `sky-sprout-runner:custom-levels:${levelId}`,
  draft: (levelId: string) => `sky-sprout-runner:editor:draft:${levelId}`,
  lastOpened: 'sky-sprout-runner:editor:last-opened'
} as const;

export interface SavedLevelSummary {
  id: string;
  name: string;
  updatedAt: string;
  widthTiles: number;
  heightTiles: number;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class EditorPersistenceSystem {
  constructor(private readonly storage: StorageLike = window.localStorage) {}

  createLevel(level: LevelData): LevelData {
    const next = deepClone(level);
    next.id = createId('custom-level');
    return this.saveLevel(next);
  }

  saveLevel(level: LevelData): LevelData {
    const next = { ...deepClone(level), updatedAt: new Date().toISOString() };
    this.storage.setItem(EDITOR_STORAGE_KEYS.level(next.id), serializeLevel(next));
    const summaries = this.listLevels().filter((summary) => summary.id !== next.id);
    summaries.unshift(toSummary(next));
    this.storage.setItem(EDITOR_STORAGE_KEYS.index, JSON.stringify(summaries));
    this.storage.setItem(EDITOR_STORAGE_KEYS.lastOpened, next.id);
    return next;
  }

  loadLevel(levelId: string): LevelData | null {
    const raw = this.storage.getItem(EDITOR_STORAGE_KEYS.level(levelId));
    if (!raw) {
      return null;
    }

    const imported = importLevelFromJson(raw);
    return imported.ok ? imported.level : null;
  }

  listLevels(): SavedLevelSummary[] {
    const raw = this.storage.getItem(EDITOR_STORAGE_KEYS.index);
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
            typeof item === 'object' &&
            item !== null &&
            typeof (item as SavedLevelSummary).id === 'string' &&
            typeof (item as SavedLevelSummary).name === 'string'
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
    copy.id = createId('custom-level-copy');
    copy.name = `${level.name} Copy`;
    copy.createdAt = new Date().toISOString();
    return this.saveLevel(copy);
  }

  deleteLevel(levelId: string): void {
    this.storage.removeItem(EDITOR_STORAGE_KEYS.level(levelId));
    this.storage.removeItem(EDITOR_STORAGE_KEYS.draft(levelId));
    this.storage.setItem(
      EDITOR_STORAGE_KEYS.index,
      JSON.stringify(this.listLevels().filter((summary) => summary.id !== levelId))
    );
  }

  exportLevel(levelId: string): string | null {
    const level = this.loadLevel(levelId);
    return level ? serializeLevel(level) : null;
  }

  importLevel(json: string): { ok: true; level: LevelData } | { ok: false; error: string } {
    const imported = importLevelFromJson(json);
    if (!imported.ok) {
      return imported;
    }

    const level = deepClone(imported.level);
    level.id = createId('imported-level');
    return { ok: true, level: this.saveLevel(level) };
  }

  autosaveDraft(level: LevelData): void {
    this.storage.setItem(EDITOR_STORAGE_KEYS.draft(level.id), serializeLevel(level));
  }

  recoverDraft(levelId: string): LevelData | null {
    const raw = this.storage.getItem(EDITOR_STORAGE_KEYS.draft(levelId));
    if (!raw) {
      return null;
    }

    const imported = importLevelFromJson(raw);
    return imported.ok ? imported.level : null;
  }
}

function toSummary(level: LevelData): SavedLevelSummary {
  return {
    id: level.id,
    name: level.name,
    updatedAt: level.updatedAt,
    widthTiles: level.world.widthTiles,
    heightTiles: level.world.heightTiles
  };
}
