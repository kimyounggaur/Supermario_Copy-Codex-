import { expect, test } from '@playwright/test';
import { appUrl } from './appUrl';

test('loads, starts, shows HUD data, and pauses from the touch button', async ({
  page
}) => {
  const consoleErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  await page.goto(appUrl());

  await expect(page.getByTestId('home-story-button')).toBeVisible();
  await page.getByTestId('home-story-button').click();

  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.__SKY_SPROUT_STATE))
    .toBe('playing');

  await expect
    .poll(() => page.evaluate(() => window.__SKY_SPROUT_HUD?.health))
    .toBe(3);
  await expect(page.getByTestId('hud-health')).toBeVisible();

  await page.getByTestId('game-pause').click();
  await expect
    .poll(() => page.evaluate(() => window.__SKY_SPROUT_STATE))
    .toBe('paused');

  await page.getByTestId('game-resume').click();
  await expect
    .poll(() => page.evaluate(() => window.__SKY_SPROUT_STATE))
    .toBe('playing');

  expect(consoleErrors).toEqual([]);
});
