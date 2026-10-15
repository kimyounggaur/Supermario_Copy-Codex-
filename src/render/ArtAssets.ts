import type Phaser from 'phaser';

export const ART_BASE = `${import.meta.env.BASE_URL}art/sky-sprout-v1/`;
export const ART_IMAGES = [
  'sprout-idle', 'sprout-run-a', 'sprout-run-b', 'sprout-jump', 'sprout-fall', 'sprout-land',
  'platform-meadow', 'platform-cloud', 'tile-meadow', 'tile-rune', 'light-seed', 'drift-bug',
  'thorn-pod', 'breeze-orb', 'growth-bud', 'checkpoint-lantern', 'background-sky', 'background-islands'
] as const;

export function preloadArt(scene: Phaser.Scene): void {
  for (const name of ART_IMAGES) scene.load.image(`art-${name}`, `${ART_BASE}raster/${name}.webp`);
  for (const name of ['fx-collect', 'fx-land']) scene.load.svg(`art-${name}`, `${ART_BASE}svg/${name}.svg`);
}
