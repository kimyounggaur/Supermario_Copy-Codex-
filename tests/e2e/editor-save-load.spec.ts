import { expect, test } from '@playwright/test';
import { appUrl } from './appUrl';

test('places an object, saves it, and reopens it from My Levels', async ({
  page
}) => {
  await page.goto(appUrl());
  await page.getByTestId('home-editor-button').click();

  await page.getByTestId('palette-item-skyGrassBlock').click();
  const host = page.getByTestId('editor-canvas-host');
  await expect(host.locator('canvas')).toBeVisible();
  const box = await host.boundingBox();
  expect(box).not.toBeNull();
  if (!box) {
    throw new Error('Editor canvas host was not available.');
  }

  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.getByTestId('editor-save').click();
  await expect(page.getByTestId('editor-save-status')).toContainText(
    '저장 완료'
  );

  const saved = await page.evaluate(() => {
    return JSON.parse(
      localStorage.getItem('sky-sprout-runner:custom-levels:index') ?? '[]'
    )[0] as { id: string; name: string };
  });
  await page.getByTestId('editor-back').click();
  await page.getByTestId('home-levels-button').click();
  await expect(page.getByText(saved.name, { exact: true })).toBeVisible();

  await page.getByTestId(`level-edit-${saved.id}`).click();
  await expect(
    page.getByRole('region', { name: 'Sky Forge Editor', exact: true })
  ).toBeVisible();

  const storedTerrainCount = await page.evaluate(() => {
    const index = JSON.parse(
      localStorage.getItem('sky-sprout-runner:custom-levels:index') ?? '[]'
    );
    const first = JSON.parse(
      localStorage.getItem(`sky-sprout-runner:custom-levels:${index[0].id}`) ??
        '{}'
    );
    return first.terrain.length;
  });
  expect(storedTerrainCount).toBeGreaterThan(0);
});
