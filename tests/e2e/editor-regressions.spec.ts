import { expect, test } from '@playwright/test';
import { appUrl } from './appUrl';
import { customLevelFixture, expectPlaying, seedLevel } from './fixtures';

test('autosaved drafts survive reload and recover without pretending to be a saved level', async ({
  page
}) => {
  page.on('dialog', (dialog) => dialog.accept());
  await page.goto(appUrl());
  await page.getByTestId('home-editor-button').click();
  await page.getByTestId('editor-settings').click();
  await page.getByTestId('level-name').fill('새로고침 후에도 남는 초안');
  await page.keyboard.press('Escape');
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const key = Object.keys(localStorage).find((value) =>
            value.startsWith('sky-sprout-runner:editor:draft:')
          );
          return key
            ? (JSON.parse(localStorage.getItem(key) ?? '{}').name as string)
            : null;
        }),
      { timeout: 6_000 }
    )
    .toBe('새로고침 후에도 남는 초안');
  await expect(page.getByTestId('editor-save-status')).not.toContainText(
    '저장 완료'
  );
  expect(
    await page.evaluate(() =>
      localStorage.getItem('sky-sprout-runner:custom-levels:index')
    )
  ).toBeNull();
  await page.reload();
  await page.getByTestId('home-editor-button').click();
  await page.getByTestId('editor-recover-draft').click();
  await page.getByTestId('editor-settings').click();
  await expect(page.getByTestId('level-name')).toHaveValue(
    '새로고침 후에도 남는 초안'
  );
  await page.keyboard.press('Escape');
  await page.getByTestId('editor-save').click();
  await expect(page.getByTestId('editor-save-status')).toContainText(
    '저장 완료'
  );
});

test('My Levels handles malformed imports, valid JSON, duplication and explicit deletion', async ({
  page
}) => {
  await page.goto(appUrl());
  await page.getByTestId('home-levels-button').click();
  await expect(
    page.getByText('아직 만든 섬이 없어요.', { exact: true })
  ).toBeVisible();
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: 'broken.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{bad-json')
  });
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.locator('.level-card')).toHaveCount(0);
  const level = customLevelFixture();
  await fileInput.setInputFiles({
    name: 'valid.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(level))
  });
  await expect(page.locator('.level-card')).toHaveCount(1);
  await expect(page.getByRole('alert')).toHaveCount(0);
  const id = await page.evaluate(
    () =>
      JSON.parse(
        localStorage.getItem('sky-sprout-runner:custom-levels:index') ?? '[]'
      )[0].id as string
  );
  await page.getByTestId(`level-duplicate-${id}`).click();
  await expect(page.locator('.level-card')).toHaveCount(2);
  await page.getByTestId(`level-delete-${id}`).click();
  await page.getByRole('button', { name: '취소', exact: true }).click();
  await expect(page.locator('.level-card')).toHaveCount(2);
  await page.getByTestId(`level-delete-${id}`).click();
  await page.getByTestId('level-confirm-delete').click();
  await expect(page.locator('.level-card')).toHaveCount(1);
  expect(
    await page.evaluate(
      (key) => localStorage.getItem(`sky-sprout-runner:custom-levels:${key}`),
      id
    )
  ).toBeNull();
});

test('settings typing, Backspace and IME never launch test play or steal browser text undo', async ({
  page
}) => {
  await page.goto(appUrl());
  await page.getByTestId('home-editor-button').click();
  await page.getByTestId('editor-settings').click();
  const name = page.getByTestId('level-name');
  await name.fill('안전한 이름');
  await name.press('End');
  await name.press('t');
  await name.press('Backspace');
  await name.press('Control+z');
  await name.dispatchEvent('keydown', {
    key: 't',
    code: 'KeyT',
    isComposing: true,
    keyCode: 229
  });
  await expect(page.locator('.playtest-layer')).toHaveCount(0);
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(name).toBeFocused();
  await name.fill('저장한 테스트 이름');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByTestId('editor-save').click();
  await expect(page.getByTestId('editor-save-status')).toContainText(
    '저장 완료'
  );
  const savedName = await page.evaluate(() => {
    const first = JSON.parse(
      localStorage.getItem('sky-sprout-runner:custom-levels:index') ?? '[]'
    )[0];
    return first.name as string;
  });
  expect(savedName).toBe('저장한 테스트 이름');
});

test('failed storage writes keep the draft dirty and allow exporting it', async ({
  page
}) => {
  await page.addInitScript(() => {
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key.startsWith('sky-sprout-runner:custom-levels:')) {
        throw new DOMException('E2E quota limit', 'QuotaExceededError');
      }
      return setItem.call(this, key, value);
    };
  });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(appUrl());
  await page.getByTestId('home-editor-button').click();
  await page.getByTestId('editor-settings').click();
  await page.getByTestId('level-name').fill('내보내기로 지킬 초안');
  await page.keyboard.press('Escape');
  await page.getByTestId('editor-save').click();
  await expect(page.getByTestId('editor-save-status')).toContainText('실패');
  await expect(page.getByTestId('editor-save-status')).not.toContainText(
    '저장 완료'
  );
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('editor-export').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.json$/);
  expect(
    await page.evaluate(() =>
      localStorage.getItem('sky-sprout-runner:custom-levels:index')
    )
  ).toBeNull();
  expect(errors).toEqual([]);
});

test('test-play restart and return preserve unsaved objects, current tool, zoom and undo history', async ({
  page
}) => {
  const level = customLevelFixture();
  await seedLevel(page, level);
  await page.goto(appUrl());
  await page.getByTestId('home-levels-button').click();
  await page.getByTestId(`level-edit-${level.id}`).click();
  const canvas = page.getByTestId('editor-canvas-host').locator('canvas');
  await expect(canvas).toBeVisible();
  await page.getByTestId('palette-item-skyGrassBlock').click();
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Editor canvas was unavailable.');
  await page.mouse.click(box.x + box.width * 0.4, box.y + box.height * 0.4);
  await expect(page.getByTestId('editor-undo')).toBeEnabled();
  await page.getByTestId('editor-tool-select').click();
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await page.mouse.wheel(0, -100);
  const statusBefore = (
    await page.locator('.editor-statusbar > span').allTextContents()
  ).slice(0, 3);
  await page.getByTestId('editor-test').click();
  await expectPlaying(page);
  await page.getByTestId('game-pause').click();
  await page.getByTestId('game-restart').click();
  await expectPlaying(page);
  expect(await page.evaluate(() => window.__SKY_SPROUT_RUN)).toEqual({
    levelId: level.id,
    testPlay: true
  });
  await page.getByTestId('return-editor').click();
  await expect(page.locator('.playtest-layer')).toHaveCount(0);
  await expect(canvas).toBeVisible();
  expect(
    (await page.locator('.editor-statusbar > span').allTextContents()).slice(
      0,
      3
    )
  ).toEqual(statusBefore);
  await expect(page.getByTestId('editor-tool-select')).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  await expect(page.getByTestId('editor-undo')).toBeEnabled();
  await page.getByTestId('editor-undo').click();
  await expect(page.getByTestId('editor-redo')).toBeEnabled();
  await page.getByTestId('editor-redo').click();
  await page.getByTestId('editor-save').click();
  await expect(page.getByTestId('editor-save-status')).toContainText(
    '저장 완료'
  );
  const terrainCount = await page.evaluate((id) => {
    return JSON.parse(
      localStorage.getItem(`sky-sprout-runner:custom-levels:${id}`) ?? '{}'
    ).terrain.length as number;
  }, level.id);
  expect(terrainCount).toBe(level.terrain.length + 1);
});
