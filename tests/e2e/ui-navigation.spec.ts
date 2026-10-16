import { expect, test } from '@playwright/test';
import { appUrl } from './appUrl';
import { customLevelFixture, expectPlaying, seedLevel } from './fixtures';

test('pause returns to the React home and repeated launches keep one game canvas', async ({
  page
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(appUrl());
  for (let run = 0; run < 5; run += 1) {
    await page.getByTestId('home-story-button').click();
    await expectPlaying(page);
    await page.getByTestId('game-pause').click();
    await expect
      .poll(() => page.evaluate(() => window.__SKY_SPROUT_STATE))
      .toBe('paused');
    await page.getByTestId('game-home').click();
    await expect(page.getByTestId('home-editor-button')).toBeVisible();
    await expect(page.locator('canvas')).toHaveCount(0);
  }
  await page.getByTestId('home-levels-button').click();
  await expect(page.getByRole('heading', { name: '내 레벨' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('custom pause restart preserves its level and actual gate completion records once', async ({
  page
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const level = customLevelFixture('complete');
  await seedLevel(page, level);
  await page.goto(appUrl());
  await page.getByTestId('home-levels-button').click();
  await page.getByTestId(`level-play-${level.id}`).click();
  await expectPlaying(page);
  await expect
    .poll(() => page.evaluate(() => window.__SKY_SPROUT_HUD?.totalShards))
    .toBe(2);
  await page.getByTestId('game-pause').click();
  await page.getByTestId('game-restart').click();
  await expectPlaying(page);
  expect(await page.evaluate(() => window.__SKY_SPROUT_RUN)).toEqual({
    levelId: level.id,
    testPlay: false
  });
  await expect
    .poll(() => page.evaluate(() => window.__SKY_SPROUT_HUD?.totalShards))
    .toBe(2);

  await page.evaluate(() => {
    window.addEventListener('sky-sprout:level-complete', () => {
      document.documentElement.dataset.completionCount = String(
        Number(document.documentElement.dataset.completionCount ?? 0) + 1
      );
    });
  });
  await page.keyboard.down('ArrowRight');
  await expect
    .poll(() => page.evaluate(() => window.__SKY_SPROUT_STATE), {
      timeout: 10_000
    })
    .toBe('levelComplete');
  await page.keyboard.up('ArrowRight');
  expect(await page.locator('html').getAttribute('data-completion-count')).toBe(
    '1'
  );
  const record = await page.evaluate((id) => {
    return JSON.parse(
      localStorage.getItem(`sky-sprout-runner:custom-levels:${id}:record`) ??
        'null'
    ) as { bestScore: number; bestTimeSeconds: number } | null;
  }, level.id);
  expect(record?.bestScore).toBeGreaterThan(0);
  expect(record?.bestTimeSeconds).toBeGreaterThanOrEqual(0);
  await expect(page.getByTestId('game-restart')).toBeVisible();
  await page.screenshot({
    path: 'output/playwright/after-complete-desktop.png',
    fullPage: true,
    animations: 'disabled'
  });
  await page.getByTestId('game-restart').click();
  await expectPlaying(page);
  expect(await page.evaluate(() => window.__SKY_SPROUT_RUN)).toEqual({
    levelId: level.id,
    testPlay: false
  });
  await expect
    .poll(() => page.evaluate(() => window.__SKY_SPROUT_HUD?.totalShards))
    .toBe(2);
  await page.getByTestId('game-pause').click();
  await page.getByTestId('game-home').click();
  await expect(page.getByTestId('home-editor-button')).toBeVisible();
});

test('actual falls reach game over and retry retains the custom level', async ({
  page
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const level = customLevelFixture('fall');
  await seedLevel(page, level);
  await page.goto(appUrl());
  await page.getByTestId('home-levels-button').click();
  await page.getByTestId(`level-play-${level.id}`).click();
  await expectPlaying(page);
  await expect
    .poll(() => page.evaluate(() => window.__SKY_SPROUT_STATE), {
      timeout: 20_000
    })
    .toBe('gameOver');
  await expect(page.getByTestId('game-restart')).toBeVisible();
  await page.screenshot({
    path: 'output/playwright/after-gameover-desktop.png',
    fullPage: true,
    animations: 'disabled'
  });
  await page.getByTestId('game-restart').click();
  await expectPlaying(page);
  await expect
    .poll(() => page.evaluate(() => window.__SKY_SPROUT_HUD?.totalShards))
    .toBe(2);
  await expect
    .poll(() => page.evaluate(() => window.__SKY_SPROUT_HUD?.health))
    .toBe(3);
});

test('pausing freezes the gameplay timer until resumed', async ({ page }) => {
  await seedLevel(page, customLevelFixture());
  await page.goto(appUrl());
  await page.getByTestId('home-levels-button').click();
  await page.getByTestId('level-play-e2e-route').click();
  await expectPlaying(page);
  await page.getByTestId('game-pause').click();
  const pausedTime = await page.evaluate(
    () => window.__SKY_SPROUT_HUD?.elapsedSeconds
  );
  await page.waitForTimeout(2100);
  expect(
    await page.evaluate(() => window.__SKY_SPROUT_HUD?.elapsedSeconds)
  ).toBe(pausedTime);
  await page.getByTestId('game-resume').click();
  await expectPlaying(page);
  await expect
    .poll(() => page.evaluate(() => window.__SKY_SPROUT_HUD?.elapsedSeconds), { intervals: [50] })
    .toBeGreaterThan(pausedTime!);
  const resumedTime = await page.evaluate(
    () => window.__SKY_SPROUT_HUD?.elapsedSeconds
  );
  expect(resumedTime! - pausedTime!).toBeLessThanOrEqual(1);
});
