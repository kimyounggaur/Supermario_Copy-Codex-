/** Shared DOM URLs and Phaser keys for the supplied, versioned art pack. */
export function artUrl(relativePath: string): string {
  return `${import.meta.env.BASE_URL}art/sky-sprout-v1/${relativePath}`;
}

export const ART_TEXTURES = {
  sprout: 'art-sprout',
  meadow: 'art-meadow',
  cloud: 'art-cloud',
  meadowTile: 'art-meadow-tile',
  rune: 'art-rune',
  seed: 'art-seed',
  orb: 'art-orb',
  growth: 'art-growth',
  bug: 'art-bug',
  thorn: 'art-thorn',
  checkpoint: 'art-checkpoint',
  sky: 'art-sky',
  islands: 'art-islands',
  collectFx: 'art-fx-collect',
  landFx: 'art-fx-land',
  windFx: 'art-fx-wind',
  hurtFx: 'art-fx-hurt'
} as const;

/** Individual Sprout PNGs remain available to DOM screens, without a second Phaser load. */
export const GAME_ART_IMAGES = [
  [ART_TEXTURES.meadow, 'raster/platform-meadow.png'],
  [ART_TEXTURES.cloud, 'raster/platform-cloud.png'],
  [ART_TEXTURES.meadowTile, 'raster/tile-meadow.png'],
  [ART_TEXTURES.rune, 'raster/tile-rune.png'],
  [ART_TEXTURES.seed, 'raster/light-seed.png'],
  [ART_TEXTURES.orb, 'raster/breeze-orb.png'],
  [ART_TEXTURES.growth, 'raster/growth-bud.png'],
  [ART_TEXTURES.bug, 'raster/drift-bug.png'],
  [ART_TEXTURES.thorn, 'raster/thorn-pod.png'],
  [ART_TEXTURES.checkpoint, 'raster/checkpoint-lantern.png'],
  [ART_TEXTURES.sky, 'raster/background-sky.png'],
  [ART_TEXTURES.islands, 'raster/background-islands.png']
] as const;

export const GAME_ART_EFFECTS = [
  [ART_TEXTURES.collectFx, 'svg/fx-collect.svg'],
  [ART_TEXTURES.landFx, 'svg/fx-land.svg'],
  [ART_TEXTURES.windFx, 'svg/fx-wind.svg'],
  [ART_TEXTURES.hurtFx, 'svg/fx-hurt.svg']
] as const;
