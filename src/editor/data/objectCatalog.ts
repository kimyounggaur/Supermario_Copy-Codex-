import type {
  CheckpointData,
  CollectibleData,
  DecorationData,
  EnemyData,
  FinishGateData,
  HazardData,
  LevelObject,
  PlatformData,
  PlayerSpawnData,
  PowerUpData,
  TerrainRect,
} from "../../game/data/LevelData";
import { createId } from "../utils/idFactory";

export type CatalogCategory =
  | "terrain"
  | "platforms"
  | "items"
  | "enemies"
  | "hazards"
  | "utilities"
  | "decorations";

export interface CatalogItem {
  id: string;
  label: string;
  category: CatalogCategory;
  description: string;
  createObject: (x: number, y: number, tileSize: number) => LevelObject;
}

function common(
  idPrefix: string,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  return {
    id: createId(idPrefix),
    x,
    y,
    width,
    height,
    locked: false,
    visible: true,
    notes: "",
  };
}

function terrain(
  type: TerrainRect["type"],
  label: string,
  variant: string,
  collision: TerrainRect["collision"],
): CatalogItem {
  return {
    id: type,
    label,
    category: "terrain",
    description: "격자에 맞춰 섬의 길을 만드는 지형입니다.",
    createObject: (x, y, tileSize) => ({
      ...common(type, x, y, tileSize, tileSize),
      type,
      layer: "terrain",
      variant,
      widthTiles: 1,
      heightTiles: 1,
      collision,
    }),
  };
}

export const objectCatalog: CatalogItem[] = [
  terrain("skyGrassBlock", "하늘 잔디 블록", "mossy-edge", "solid"),
  terrain("softCloudBlock", "포근한 구름 블록", "bright-cloud", "solid"),
  terrain("stoneRootBlock", "뿌리 돌 블록", "root-stone", "solid"),
  terrain("oneWayCloudPlatform", "한 방향 구름 발판", "thin-cloud", "oneWay"),
  {
    id: "staticFloatingPlatform",
    label: "고정 구름 발판",
    category: "platforms",
    description: "공중에 고정된 발판입니다.",
    createObject: (x, y, tileSize): PlatformData => ({
      ...common("static-platform", x, y, tileSize * 4, tileSize * 0.75),
      type: "staticFloatingPlatform",
      layer: "platforms",
      waypoints: [],
      speed: 0,
      mode: "pingPong",
      startDelay: 0,
      carryPlayer: true,
    }),
  },
  {
    id: "movingBreezePlatform",
    label: "바람 이동 발판",
    category: "platforms",
    description: "지정한 경로를 따라 움직입니다.",
    createObject: (x, y, tileSize): PlatformData => ({
      ...common("moving-platform", x, y, tileSize * 4, tileSize * 0.75),
      type: "movingBreezePlatform",
      layer: "platforms",
      waypoints: [
        { x, y },
        { x: x + tileSize * 5, y },
      ],
      speed: 90,
      mode: "pingPong",
      startDelay: 0,
      carryPlayer: true,
    }),
  },
  {
    id: "fallingCloudPlatform",
    label: "낙하 구름 발판",
    category: "platforms",
    description: "현재 플레이에서는 고정 발판으로 동작합니다.",
    createObject: (x, y, tileSize): PlatformData => ({
      ...common("falling-cloud", x, y, tileSize * 3, tileSize * 0.75),
      type: "fallingCloudPlatform",
      layer: "platforms",
      waypoints: [],
      speed: 0,
      mode: "pingPong",
      startDelay: 250,
      carryPlayer: true,
    }),
  },
  {
    id: "lightSeedShard",
    label: "빛의 씨앗",
    category: "items",
    description: "탐험하며 수집하는 작은 씨앗입니다.",
    createObject: (x, y, tileSize): CollectibleData => ({
      ...common("light-seed", x, y, tileSize, tileSize),
      type: "lightSeedShard",
      layer: "items",
      scoreValue: 100,
      respawnOnDeath: false,
    }),
  },
  {
    id: "bigLightSeed",
    label: "큰 빛의 씨앗",
    category: "items",
    description:
      "큰 씨앗입니다. 현재 플레이에서는 일반 씨앗과 같은 점수를 줍니다.",
    createObject: (x, y, tileSize): CollectibleData => ({
      ...common("big-light-seed", x, y, tileSize * 1.25, tileSize * 1.25),
      type: "bigLightSeed",
      layer: "items",
      scoreValue: 500,
      respawnOnDeath: false,
    }),
  },
  {
    id: "breezeOrb",
    label: "바람 구슬",
    category: "items",
    description: "일시적으로 바람의 힘을 얻습니다.",
    createObject: (x, y, tileSize): PowerUpData => ({
      ...common("breeze-orb", x, y, tileSize, tileSize),
      type: "breezeOrb",
      layer: "items",
      durationMs: 9000,
      effectType: "airControl",
      strength: 1.2,
    }),
  },
  {
    id: "driftBug",
    label: "떠도는 잎벌레",
    category: "enemies",
    description: "좌우로 돌아다니는 잎벌레입니다.",
    createObject: (x, y, tileSize): EnemyData => ({
      ...common("drift-bug", x, y, tileSize, tileSize),
      type: "driftBug",
      layer: "enemies",
      speed: 65,
      patrolDistance: 160,
      direction: 1,
      jumpInterval: 0,
      jumpPower: 0,
      amplitude: 0,
      frequency: 0,
    }),
  },
  {
    id: "puffHopper",
    label: "통통 구름벌레",
    category: "enemies",
    description: "주기적으로 뛰어오르는 적입니다.",
    createObject: (x, y, tileSize): EnemyData => ({
      ...common("puff-hopper", x, y, tileSize, tileSize),
      type: "puffHopper",
      layer: "enemies",
      speed: 44,
      patrolDistance: 120,
      direction: 1,
      jumpInterval: 1600,
      jumpPower: 260,
      amplitude: 0,
      frequency: 0,
    }),
  },
  {
    id: "windWisp",
    label: "바람 정령",
    category: "enemies",
    description: "공중을 움직이는 바람 정령입니다.",
    createObject: (x, y, tileSize): EnemyData => ({
      ...common("wind-wisp", x, y, tileSize, tileSize),
      type: "windWisp",
      layer: "enemies",
      speed: 45,
      patrolDistance: 120,
      direction: 1,
      jumpInterval: 0,
      jumpPower: 0,
      amplitude: 32,
      frequency: 1.2,
    }),
  },
  {
    id: "thornCrystal",
    label: "가시 열매",
    category: "hazards",
    description: "닿으면 피해를 입는 가시입니다.",
    createObject: (x, y, tileSize): HazardData => ({
      ...common("thorn-crystal", x, y, tileSize, tileSize),
      type: "thornCrystal",
      layer: "hazards",
      damage: 1,
      knockbackX: 180,
      knockbackY: -160,
      respawnPlayer: true,
    }),
  },
  {
    id: "gustVent",
    label: "상승 바람 지점",
    category: "hazards",
    description: "현재 플레이에서는 가시 위험으로 처리됩니다.",
    createObject: (x, y, tileSize): HazardData => ({
      ...common("gust-vent", x, y, tileSize, tileSize),
      type: "gustVent",
      layer: "hazards",
      damage: 0,
      knockbackX: 0,
      knockbackY: -320,
      respawnPlayer: false,
    }),
  },
  {
    id: "voidZone",
    label: "낙하 위험 구역",
    category: "hazards",
    description: "현재 플레이에서는 가시 위험으로 처리됩니다.",
    createObject: (x, y, tileSize): HazardData => ({
      ...common("void-zone", x, y, tileSize * 3, tileSize),
      type: "voidZone",
      layer: "hazards",
      damage: 3,
      knockbackX: 0,
      knockbackY: 0,
      respawnPlayer: true,
    }),
  },
  {
    id: "playerSpawn",
    label: "시작점",
    category: "utilities",
    description: "섬에 하나만 놓을 수 있는 출발점입니다.",
    createObject: (x, y, tileSize): PlayerSpawnData => ({
      ...common("player-spawn", x, y, tileSize, tileSize * 1.4),
      type: "playerSpawn",
      layer: "utilities",
    }),
  },
  {
    id: "glowLanternCheckpoint",
    label: "빛 등불 체크포인트",
    category: "utilities",
    description: "다시 시작할 위치를 기록합니다.",
    createObject: (x, y, tileSize): CheckpointData => ({
      ...common("checkpoint", x, y, tileSize, tileSize * 1.5),
      type: "glowLanternCheckpoint",
      layer: "utilities",
      order: 1,
      activeRadius: 48,
    }),
  },
  {
    id: "windGateFinish",
    label: "바람문 도착점",
    category: "utilities",
    description: "섬에 하나만 놓을 수 있는 도착점입니다.",
    createObject: (x, y, tileSize): FinishGateData => ({
      ...common("wind-gate", x, y, tileSize * 1.5, tileSize * 2.5),
      type: "windGateFinish",
      layer: "utilities",
      requiredShardCount: 0,
      showCompletionBanner: true,
    }),
  },
  ...(
    [
      "cloudTuft",
      "tinySprout",
      "windRibbon",
      "distantStar",
      "floatingPebble",
    ] as const
  ).map(
    (type): CatalogItem => ({
      id: type,
      label:
        type === "cloudTuft"
          ? "구름 장식"
          : type === "tinySprout"
            ? "작은 새싹"
            : type === "windRibbon"
              ? "바람 리본"
              : type === "distantStar"
                ? "먼 별"
                : "떠 있는 조약돌",
      category: "decorations",
      description: "충돌하지 않는 장식입니다.",
      createObject: (x, y, tileSize): DecorationData => ({
        ...common(type, x, y, tileSize, tileSize),
        type,
        layer: "decorations",
      }),
    }),
  ),
];

export function getCatalogItem(id: string): CatalogItem | null {
  return objectCatalog.find((item) => item.id === id) ?? null;
}

export const catalogCategories: CatalogCategory[] = [
  "terrain",
  "platforms",
  "items",
  "enemies",
  "hazards",
  "utilities",
  "decorations",
];
