import type { LevelData } from "../../game/data/LevelData";
import { getCatalogItem } from "../data/objectCatalog";

export type MigrationResult =
  | { ok: true; level: LevelData }
  | { ok: false; error: string };

export function migrateLevelData(input: unknown): MigrationResult {
  if (!input || typeof input !== "object") {
    return {
      ok: false,
      error: "The selected file does not contain level data.",
    };
  }

  const version = (input as { schemaVersion?: unknown }).schemaVersion;
  if (version !== 1) {
    return {
      ok: false,
      error: `Sky Forge Editor cannot open schema version ${String(version)}.`,
    };
  }

  const raw = input as Partial<LevelData>;
  const groups = [
    "terrain",
    "platforms",
    "collectibles",
    "powerUps",
    "enemies",
    "hazards",
    "checkpoints",
    "decorations",
  ] as const;
  for (const group of groups) {
    const value = raw[group];
    if (
      value !== undefined &&
      (!Array.isArray(value) || !value.every(isSafeObject))
    ) {
      return {
        ok: false,
        error:
          "레벨 파일의 오브젝트 형식이 올바르지 않아요. 원본 JSON을 확인하세요.",
      };
    }
  }
  if (
    (raw.playerSpawn != null && !isSafeObject(raw.playerSpawn)) ||
    (raw.finishGate != null && !isSafeObject(raw.finishGate)) ||
    raw.platforms?.some(
      (platform) =>
        !Array.isArray(platform.waypoints) ||
        !platform.waypoints.every(
          (point) =>
            point && Number.isFinite(point.x) && Number.isFinite(point.y),
        ),
    )
  ) {
    return {
      ok: false,
      error: "레벨 파일의 시작점·도착점 또는 이동 경로를 읽을 수 없어요.",
    };
  }
  const level: LevelData = {
    schemaVersion: 1,
    id: asString(raw.id, `imported-${Date.now().toString(36)}`),
    name: asString(raw.name, "Imported Sky Forge Level"),
    description: asString(raw.description, ""),
    author: raw.author,
    createdAt: asString(raw.createdAt, new Date().toISOString()),
    updatedAt: asString(raw.updatedAt, new Date().toISOString()),
    world: {
      widthTiles: numberInRange(raw.world?.widthTiles, 20, 300, 120),
      heightTiles: numberInRange(raw.world?.heightTiles, 12, 80, 24),
      tileSize: numberInRange(raw.world?.tileSize, 16, 64, 32),
      theme:
        raw.world?.theme === "cloudDawn" || raw.world?.theme === "starCavern"
          ? raw.world.theme
          : "windIsland",
      backgroundVariant: asString(raw.world?.backgroundVariant, "clear-breeze"),
    },
    playerSpawn: raw.playerSpawn ?? null,
    terrain: Array.isArray(raw.terrain) ? raw.terrain : [],
    platforms: Array.isArray(raw.platforms) ? raw.platforms : [],
    collectibles: Array.isArray(raw.collectibles) ? raw.collectibles : [],
    powerUps: Array.isArray(raw.powerUps) ? raw.powerUps : [],
    enemies: Array.isArray(raw.enemies) ? raw.enemies : [],
    hazards: Array.isArray(raw.hazards) ? raw.hazards : [],
    checkpoints: Array.isArray(raw.checkpoints) ? raw.checkpoints : [],
    finishGate: raw.finishGate ?? null,
    decorations: Array.isArray(raw.decorations) ? raw.decorations : [],
    metadata: {
      difficulty:
        raw.metadata?.difficulty === "easy" ||
        raw.metadata?.difficulty === "hard" ||
        raw.metadata?.difficulty === "experimental"
          ? raw.metadata.difficulty
          : "normal",
      tags: Array.isArray(raw.metadata?.tags)
        ? raw.metadata.tags.filter((tag) => typeof tag === "string")
        : [],
      estimatedTimeSeconds:
        typeof raw.metadata?.estimatedTimeSeconds === "number"
          ? raw.metadata.estimatedTimeSeconds
          : undefined,
    },
  };

  return { ok: true, level };
}

function isSafeObject(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const object = value as Record<string, unknown>;
  const item =
    typeof object.type === "string" ? getCatalogItem(object.type) : null;
  return (
    typeof object.id === "string" &&
    typeof object.type === "string" &&
    item !== null &&
    item.category === object.layer &&
    (object.type !== "movingBreezePlatform" ||
      (Array.isArray(object.waypoints) &&
        object.waypoints.every((point: unknown) => {
          if (!point || typeof point !== "object") return false;
          const waypoint = point as Record<string, unknown>;
          return Number.isFinite(waypoint.x) && Number.isFinite(waypoint.y);
        }))) &&
    ["x", "y", "width", "height"].every(
      (key) => typeof object[key] === "number" && Number.isFinite(object[key]),
    )
  );
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : fallback;
}

function numberInRange(
  value: unknown,
  min: number,
  max: number,
  fallback: number,
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
}
