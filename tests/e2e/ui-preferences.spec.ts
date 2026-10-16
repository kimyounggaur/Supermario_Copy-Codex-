import { expect, test } from '@playwright/test';
import { appUrl } from './appUrl';

const preferenceKey = 'sky-sprout-runner:ui-preferences:v1';

test('static server serves PNG with its real MIME type and returns a real asset 404', async ({
  request
}) => {
  const image = await request.get('/art/sky-sprout-v1/raster/sprout-idle.png');
  expect(image.ok()).toBe(true);
  expect(image.headers()['content-type']).toContain('image/png');
  expect(Array.from((await image.body()).subarray(0, 8))).toEqual([
    137, 80, 78, 71, 13, 10, 26, 10
  ]);
  const missing = await request.get('/art/sky-sprout-v1/not-a-real-image.png');
  expect(missing.status()).toBe(404);
  expect(await missing.text()).not.toContain('<!doctype html>');
});

test('settings persist, trap keyboard focus and restore focus after Escape', async ({
  page
}) => {
  await page.goto(appUrl());
  const settingsButton = page.getByRole('button', {
    name: '설정',
    exact: true
  });
  await settingsButton.click();
  const dialog = page.getByRole('dialog', { name: '설정', exact: true });
  await expect(dialog).toBeVisible();
  await expect(
    page.getByRole('button', { name: '닫기', exact: true })
  ).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(
    dialog.getByRole('checkbox', { name: /조작 안내/ })
  ).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(
    dialog.getByRole('button', { name: '닫기', exact: true })
  ).toBeFocused();
  await dialog.getByRole('checkbox', { name: /효과음/ }).uncheck();
  await dialog.getByRole('checkbox', { name: /움직임 줄이기/ }).check();
  await expect(page.locator('html')).toHaveAttribute(
    'data-reduced-motion',
    'true'
  );
  await dialog.getByRole('checkbox', { name: /조작 안내/ }).uncheck();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(settingsButton).toBeFocused();
  await page.reload();
  await settingsButton.click();
  await expect(
    dialog.getByRole('checkbox', { name: /효과음/ })
  ).not.toBeChecked();
  await expect(
    dialog.getByRole('checkbox', { name: /움직임 줄이기/ })
  ).toBeChecked();
  await expect(
    dialog.getByRole('checkbox', { name: /조작 안내/ })
  ).not.toBeChecked();
});

test('corrupt preferences do not prevent navigation and leave the corrupt original untouched', async ({
  page
}) => {
  await page.addInitScript(
    (key) => localStorage.setItem(key, '{bad-json'),
    preferenceKey
  );
  await page.goto(appUrl());
  await page.getByRole('button', { name: '설정', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: /효과음/ })).toBeChecked();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), preferenceKey)
  ).toBe('{bad-json');
  await page.keyboard.press('Escape');
  await page.getByTestId('home-editor-button').click();
  await expect(
    page.getByRole('region', { name: 'Sky Forge Editor', exact: true })
  ).toBeVisible();
});

test('missing runtime artwork falls back without an infinite loading screen', async ({
  page
}) => {
  await page.route('**/art/sky-sprout-v1/raster/sprout-idle.png', (route) =>
    route.abort()
  );
  await page.goto(appUrl());
  await page.getByTestId('home-story-button').click();
  await expect
    .poll(() => page.evaluate(() => window.__SKY_SPROUT_STATE), {
      timeout: 15_000
    })
    .toBe('playing');
  await expect(page.getByTestId('hud-health')).toBeVisible();
  await page.getByTestId('game-pause').click();
  await expect(page.getByTestId('game-resume')).toBeVisible();
});
