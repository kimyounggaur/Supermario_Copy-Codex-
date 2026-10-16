import { expect, test } from '@playwright/test';
import { appUrl } from './appUrl';
import { customLevelFixture, expectPlaying, seedLevel } from './fixtures';

const viewports = [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 360, height: 740 },
  { width: 844, height: 390 },
  { width: 740, height: 360 }
];

test('home actions remain in the viewport across the specified viewport matrix', async ({
  page
}) => {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto(appUrl());
    for (const id of [
      'home-story-button',
      'home-editor-button',
      'home-levels-button'
    ]) {
      const button = page.getByTestId(id);
      await expect(button).toBeVisible();
      await button.scrollIntoViewIfNeeded();
      const box = await button.boundingBox();
      expect(
        box,
        `${id} at ${viewport.width}x${viewport.height}`
      ).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1
      )
    ).toBe(true);
  }
});

test.describe('touch-enabled Chromium', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });

  test('portrait and landscape keep readable HUD and simultaneous touch controls with release/cancel cleanup', async ({
    page,
    context
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await seedLevel(page, customLevelFixture());
    await page.goto(appUrl());
    await page.getByTestId('home-levels-button').tap();
    await page.getByTestId('level-play-e2e-route').tap();
    await expectPlaying(page);
    const client = await context.newCDPSession(page);

    for (const viewport of [
      { width: 390, height: 844 },
      { width: 844, height: 390 }
    ]) {
      await page.setViewportSize(viewport);
      await expect(page.getByTestId('hud-health')).toBeVisible();
      const boxes = [];
      for (const id of [
        'touch-left',
        'touch-right',
        'touch-run',
        'touch-jump',
        'game-pause'
      ]) {
        const box = await page.getByTestId(id).boundingBox();
        expect(
          box,
          `${id} at ${viewport.width}x${viewport.height}`
        ).not.toBeNull();
        expect(box!.width).toBeGreaterThanOrEqual(44);
        expect(box!.height).toBeGreaterThanOrEqual(44);
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.y).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
        expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 1);
        if (id !== 'game-pause') boxes.push(box!);
      }
      expect(boxes[1].x - (boxes[0].x + boxes[0].width)).toBeGreaterThanOrEqual(
        6
      );
      expect(boxes[3].x - (boxes[2].x + boxes[2].width)).toBeGreaterThanOrEqual(
        6
      );
      const touches = [boxes[1], boxes[2], boxes[3]].map((box, index) => ({
        x: box.x + box.width / 2,
        y: box.y + box.height / 2,
        id: index + 1
      }));
      await page.getByTestId('touch-jump').evaluate((button) => {
        button.addEventListener(
          'pointerdown',
          (event) => {
            (button as HTMLElement).dataset.pointerId = String(
              (event as PointerEvent).pointerId
            );
          },
          { once: true }
        );
      });
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: touches
      });
      for (const action of ['right', 'run', 'jump']) {
        await expect(page.getByTestId(`touch-${action}`)).toHaveAttribute(
          'aria-pressed',
          'true'
        );
      }
      await page.waitForTimeout(180);
      // CDP ends all contacts together. Exercise an individual real contact's
      // pointerup handler before cancelling the remaining physical contacts.
      const jumpPointerId = Number(
        await page.getByTestId('touch-jump').getAttribute('data-pointer-id')
      );
      await page.getByTestId('touch-jump').dispatchEvent('pointerup', {
        pointerId: jumpPointerId,
        pointerType: 'touch'
      });
      await expect(page.getByTestId('touch-jump')).toHaveAttribute(
        'aria-pressed',
        'false'
      );
      for (const action of ['right', 'run']) {
        await expect(page.getByTestId(`touch-${action}`)).toHaveAttribute(
          'aria-pressed',
          'true'
        );
      }
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchCancel',
        touchPoints: []
      });
      for (const action of ['right', 'run', 'jump']) {
        await expect(page.getByTestId(`touch-${action}`)).toHaveAttribute(
          'aria-pressed',
          'false'
        );
      }
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: touches.slice(0, 1)
      });
      await page.evaluate(() => window.dispatchEvent(new Event('blur')));
      await expect(page.getByTestId('touch-right')).toHaveAttribute(
        'aria-pressed',
        'false'
      );
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchCancel',
        touchPoints: []
      });
      await page.getByTestId('game-pause').tap();
      await expect
        .poll(() => page.evaluate(() => window.__SKY_SPROUT_STATE))
        .toBe('paused');
      await page.getByTestId('game-resume').tap();
      await expectPlaying(page);
    }
    expect(errors).toEqual([]);
  });

  test('mobile editor supports palette, properties, layers, save, validate and test return', async ({
    page
  }) => {
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 844, height: 390 }
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(appUrl());
      await page.getByTestId('home-editor-button').tap();
      await expect(
        page.getByTestId('editor-canvas-host').locator('canvas')
      ).toBeVisible();
      await page.getByTestId('editor-panel-palette').tap();
      await page.getByTestId('palette-item-skyGrassBlock').tap();
      await page.getByTestId('editor-panel-canvas').tap();
      const canvas = page.getByTestId('editor-canvas-host').locator('canvas');
      const box = await canvas.boundingBox();
      if (!box) throw new Error('Mobile canvas was unavailable.');
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
      for (const panel of ['properties', 'layers']) {
        await page.getByTestId(`editor-panel-${panel}`).tap();
        await expect(
          page.getByTestId(`editor-panel-content-${panel}`)
        ).toBeVisible();
        await page.getByTestId('editor-panel-canvas').tap();
      }
      await page.getByTestId('editor-save').tap();
      await expect(page.getByTestId('editor-save-status')).toContainText(
        '저장 완료'
      );
      await page.getByTestId('editor-validate').tap();
      await expect(
        page.getByTestId('editor-panel-content-validation')
      ).toBeVisible();
      await page.getByTestId('editor-panel-canvas').tap();
      await page.getByTestId('editor-test').tap();
      await expectPlaying(page);
      await page.getByTestId('return-editor').tap();
      await expect(canvas).toBeVisible();
      await expect(page.locator('.playtest-layer')).toHaveCount(0);
    }
  });
});
