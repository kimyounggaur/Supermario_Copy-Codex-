import { expect, test } from '@playwright/test';
import { appUrl } from './appUrl';

test('mobile controls collect seeds, pause, restart, and return to the menu without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(appUrl());
  await page.getByRole('button', { name: 'Play Story', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__SKY_SPROUT_HUD?.health)).toBe(3);
  await expect(page.getByRole('button', { name: 'Move right' })).toBeEnabled();
  const box = await page.getByRole('button', { name: 'Move right' }).boundingBox();
  if (!box) throw new Error('Move control missing');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect.poll(() => page.evaluate(() => window.__SKY_SPROUT_HUD?.shards), { timeout: 8000 }).toBeGreaterThan(0);
  // Pointer capture must release even after moving outside the control.
  await page.mouse.move(200, 200); await page.mouse.up();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Resume', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__SKY_SPROUT_HUD?.shards)).toBe(0);
  await expect.poll(() => page.evaluate(() => window.__SKY_SPROUT_STATE)).toBe('playing');
  await expect(page.locator('canvas')).toHaveCount(1);
  const layout = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth,
    controls: [...document.querySelectorAll('.sprout-control')].map(e => ({ width: e.getBoundingClientRect().width, height: e.getBoundingClientRect().height })),
    assetsLoaded: [...document.querySelectorAll<HTMLImageElement>('.sprout-hud img')].every(i => i.complete && i.naturalWidth > 0)
  }));
  expect(layout.overflow).toBe(false); expect(layout.assetsLoaded).toBe(true);
  expect(layout.controls.every(c => c.width >= 44 && c.height >= 44)).toBe(true);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Play Story', exact: true })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('keyboard pause survives orientation changes and repeated game mounting', async ({ page }) => {
  await page.goto(appUrl());
  for (let run = 0; run < 2; run++) {
    await page.getByRole('button', { name: 'Play Story', exact: true }).click();
    await expect.poll(() => page.evaluate(() => window.__SKY_SPROUT_STATE)).toBe('playing');
    await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeEnabled();
    await page.setViewportSize({ width: 844, height: 390 });
    await page.getByTestId('game-host').focus();
    await page.keyboard.press('p', { delay: 80 });
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape', { delay: 80 });
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await expect(page.locator('canvas')).toHaveCount(0);
  }
});
