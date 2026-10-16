import { expect, type Page } from '@playwright/test';
import { createLevelFromTemplate } from '../../src/editor/data/levelTemplates';
import { getCatalogItem } from '../../src/editor/data/objectCatalog';
import type { LevelData, TerrainRect } from '../../src/game/data/LevelData';

export function customLevelFixture(
  kind: 'route' | 'complete' | 'fall' = 'route'
): LevelData {
  const level = createLevelFromTemplate('emptyIsland', {
    name: `회귀 검증 ${kind}`
  });
  level.id = `e2e-${kind}`;
  level.playerSpawn = { ...level.playerSpawn!, x: 96, y: 640 };
  level.finishGate = {
    ...level.finishGate!,
    x: kind === 'complete' ? 240 : 3000,
    y: 640
  };
  if (kind !== 'fall') {
    const terrain = getCatalogItem('skyGrassBlock')!.createObject(
      480,
      720,
      32
    ) as TerrainRect;
    level.terrain = [
      {
        ...terrain,
        id: 'e2e-ground',
        width: 960,
        height: 64,
        widthTiles: 30,
        heightTiles: 2
      }
    ];
  }
  level.collectibles = [
    {
      ...getCatalogItem('lightSeedShard')!.createObject(700, 600, 32),
      id: 'e2e-seed-1'
    },
    {
      ...getCatalogItem('lightSeedShard')!.createObject(800, 600, 32),
      id: 'e2e-seed-2'
    }
  ] as LevelData['collectibles'];
  return level;
}

export async function seedLevel(page: Page, level: LevelData): Promise<void> {
  await page.addInitScript((value) => {
    const summary = {
      id: value.id,
      name: value.name,
      updatedAt: value.updatedAt,
      widthTiles: value.world.widthTiles,
      heightTiles: value.world.heightTiles
    };
    localStorage.setItem(
      'sky-sprout-runner:custom-levels:index',
      JSON.stringify([summary])
    );
    localStorage.setItem(
      `sky-sprout-runner:custom-levels:${value.id}`,
      JSON.stringify(value)
    );
  }, level);
}

export async function expectPlaying(page: Page): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => window.__SKY_SPROUT_STATE))
    .toBe('playing');
  await expect(page.getByTestId('game-host').locator('canvas')).toHaveCount(1);
}
