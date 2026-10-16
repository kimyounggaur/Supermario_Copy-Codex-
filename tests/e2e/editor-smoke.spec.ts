import { expect, test } from '@playwright/test';
import { appUrl } from './appUrl';

test.use({ viewport: { width: 1440, height: 900 } });

test('opens Sky Forge Editor and shows core panels', async ({ page }) => {
  await page.goto(appUrl());

  await page.getByTestId('home-editor-button').click();

  await expect(
    page.getByRole('region', { name: 'Sky Forge Editor', exact: true })
  ).toBeVisible();
  await expect(page.getByRole('toolbar', { name: '편집 도구' })).toBeVisible();
  await expect(page.getByTestId('editor-panel-content-palette')).toBeVisible();
  await expect(
    page.getByTestId('editor-panel-content-properties')
  ).toBeVisible();
  const detailTabs = page.getByRole('navigation', { name: '상세 패널' });
  await detailTabs.getByRole('button', { name: '레이어', exact: true }).click();
  await expect(page.getByTestId('editor-panel-content-layers')).toBeVisible();
  await detailTabs.getByRole('button', { name: '개요', exact: true }).click();
  await expect(page.getByTestId('editor-panel-content-overview')).toBeVisible();
  await expect(page.getByTestId('editor-canvas-host')).toBeVisible();
  await expect(
    page.getByTestId('editor-canvas-host').locator('canvas')
  ).toBeVisible();

  await page.getByTestId('editor-validate').click();
  await expect(
    page.getByTestId('editor-panel-content-validation')
  ).toBeVisible();
  await expect(
    page.getByTestId('editor-panel-content-validation')
  ).toContainText('참고');
});
