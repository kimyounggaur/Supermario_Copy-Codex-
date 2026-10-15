import { expect, test } from '@playwright/test';
import { createLevelFromTemplate } from '../../src/editor/data/levelTemplates';
import { getCatalogItem } from '../../src/editor/data/objectCatalog';
import type { TerrainRect } from '../../src/game/data/LevelData';
import { appUrl } from './appUrl';

test('a real gate collision shows the result and preserves the saved clear record', async ({ page }, testInfo) => {
  const level = createLevelFromTemplate('emptyIsland', { name: 'Visual QA Island', widthTiles: 60 });
  level.playerSpawn = { ...level.playerSpawn!, x: 120, y: 548 };
  level.finishGate = { ...level.finishGate!, x: 340, y: 580 };
  level.terrain = [{ ...getCatalogItem('skyGrassBlock')!.createObject(480, 660, 32),
    width: 960, height: 96, widthTiles: 30, heightTiles: 3 } as TerrainRect];
  await page.goto(appUrl());
  await page.getByRole('button', { name: 'My Levels', exact: true }).click();
  await page.locator('input[type=file]').setInputFiles({ name: 'visual-qa-island.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(level)) });
  await page.getByRole('button', { name: 'Play Visual QA Island', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeEnabled();
  await page.getByTestId('game-host').focus();
  await page.keyboard.down('ArrowRight');
  await expect.poll(() => page.evaluate(() => window.__SKY_SPROUT_STATE), { timeout: 12000 }).toBe('levelComplete');
  await page.keyboard.up('ArrowRight');
  await expect(page.getByRole('heading', { name: '바람의 문에 도착했어요!' })).toBeVisible();
  const record = await page.evaluate(() => {
    const index = JSON.parse(localStorage.getItem('sky-sprout-runner:custom-levels:index') ?? '[]');
    return JSON.parse(localStorage.getItem(`sky-sprout-runner:custom-levels:${index[0].id}:record`) ?? '{}');
  });
  expect(record.bestScore).toBeGreaterThanOrEqual(1000);
  expect(record.bestTimeSeconds).toBeGreaterThanOrEqual(0);
  await page.screenshot({ path: testInfo.outputPath('complete-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: testInfo.outputPath('complete-mobile.png') });
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: 'My Levels', exact: true }).click();
  await expect(page.locator('.level-card')).toContainText(`Best score ${record.bestScore}`);
});

test('falling uses all lives and opens a readable game-over panel', async ({ page }, testInfo) => {
  const level = createLevelFromTemplate('emptyIsland', { name: 'Fall QA Island', widthTiles: 60 });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(appUrl());
  await page.getByRole('button', { name: 'My Levels', exact: true }).click();
  await page.locator('input[type=file]').setInputFiles({ name: 'fall-qa-island.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(level)) });
  await page.getByRole('button', { name: 'Play Fall QA Island', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__SKY_SPROUT_STATE), { timeout: 16000 }).toBe('gameOver');
  await expect(page.getByRole('heading', { name: '다시, 가볍게 도약!' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Restart', exact: true })).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath('game-over-mobile.png') });
  await page.setViewportSize({ width: 844, height: 390 });
  await page.screenshot({ path: testInfo.outputPath('game-over-landscape.png') });
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Play Story', exact: true })).toBeVisible();
});
