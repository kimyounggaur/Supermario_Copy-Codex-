import { expect, test } from '@playwright/test';
import { appUrl } from './appUrl';

test('starts a test play run and returns to the editor', async ({ page }) => {
  await page.goto(appUrl());
  await page.getByTestId('home-editor-button').click();

  await page.getByTestId('editor-test').click();
  await expect(page.getByTestId('game-host').locator('canvas')).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.__SKY_SPROUT_STATE))
    .toBe('playing');

  await page.keyboard.press('Escape');
  await expect(page.locator('.playtest-layer')).toBeHidden();
  await expect(
    page.getByRole('region', { name: 'Sky Forge Editor', exact: true })
  ).toBeVisible();
  await expect(page.getByTestId('editor-test')).toBeVisible();
});
