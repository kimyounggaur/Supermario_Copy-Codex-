import { describe, expect, it } from 'vitest';
import { easeInBack, easeInOutSine, easeOutBack, easeOutQuad } from '../../src/render/Easing';
import { PALETTE, THEMES, mergePalette } from '../../src/render/palette';
import { TextureFactory } from '../../src/render/TextureFactory';
import { createTextureDefinitions, textureKeyForObjectType } from '../../src/render/textureDefinitions';

function createFakeCanvasFactory() {
  const contexts: unknown[] = [];

  return {
    contexts,
    createCanvas: (width: number, height: number) => {
      const ctx = {
        canvas: { width, height },
        save: () => undefined,
        restore: () => undefined,
        scale: () => undefined,
        clearRect: () => undefined,
        drawImage: () => undefined,
        imageSmoothingEnabled: false,
        imageSmoothingQuality: 'low'
      };
      contexts.push(ctx);
      return {
        width,
        height,
        getContext: () => ctx
      } as unknown as HTMLCanvasElement;
    }
  };
}

describe('rendering art kit', () => {
  it('exposes easing curves used by pop and bounce feedback', () => {
    expect(easeOutQuad(0)).toBe(0);
    expect(easeOutQuad(0.5)).toBeCloseTo(0.75, 5);
    expect(easeOutQuad(1)).toBe(1);
    expect(easeInOutSine(0.5)).toBeCloseTo(0.5, 5);
    expect(easeOutBack(0.72, 2.2)).toBeGreaterThan(1);
    expect(easeInBack(0.28, 1.7)).toBeLessThan(0);
  });

  it('keeps object colors in semantic palette tokens and theme overrides', () => {
    expect(PALETTE.block.base).toBe('#F9A825');
    expect(PALETTE.pipe.specular).toBe('#C8F5B8');
    expect(PALETTE.creature.eye).toBe('#2E1A0A');

    const underground = mergePalette(PALETTE, THEMES.underground.palette);
    expect(underground.block.base).toBe('#3E7EC0');
    expect(underground.block.base).not.toBe(PALETTE.block.base);
    expect(underground.mushroom.eye).toBe(PALETTE.mushroom.eye);
  });

  it('bakes high-resolution variants without running draw functions per frame', () => {
    const fake = createFakeCanvasFactory();
    const factory = new TextureFactory({ createCanvas: fake.createCanvas, dpr: 1 });
    let drawCalls = 0;

    factory.bake(
      'terrain-rune-box',
      (_ctx, size) => {
        drawCalls += 1;
        expect(size).toBe(64);
      },
      { baseSize: 16, superSample: 4, variants: ['tile16', 'icon32', 'retina2x'] }
    );

    const baked = factory.getBaked('terrain-rune-box');
    expect(drawCalls).toBe(1);
    expect(baked.variants.tile16!.width).toBe(16);
    expect(baked.variants.icon32!.width).toBe(32);
    expect(baked.variants.retina2x!.width).toBe(32);
    expect(factory.get('terrain-rune-box', 'icon32')).toBe(baked.variants.icon32);
  });

  it('defines a texture for every shipped gameplay/editor object family', () => {
    const ids = createTextureDefinitions().map((definition) => definition.id);

    expect(ids).toEqual(
      expect.arrayContaining([
        'terrain-grass',
        'terrain-stone',
        'terrain-cloud',
        'terrain-sky-brick',
        'terrain-rune-box',
        'terrain-rune-box-used',
        'moving-platform',
        'light-seed-shard',
        'big-light-seed',
        'breeze-orb',
        'growth-bud',
        'drift-bug',
        'puff-hopper',
        'wind-wisp',
        'thorn-crystal',
        'gust-vent',
        'glow-lantern',
        'glow-lantern-active',
        'wind-gate',
        'player-spawn'
      ])
    );
  });

  it('maps editor catalog object types to the same textures used by gameplay', () => {
    expect(textureKeyForObjectType('skyGrassBlock')).toBe('terrain-grass');
    expect(textureKeyForObjectType('stoneRootBlock')).toBe('terrain-stone');
    expect(textureKeyForObjectType('softCloudBlock')).toBe('terrain-cloud');
    expect(textureKeyForObjectType('lightSeedShard')).toBe('light-seed-shard');
    expect(textureKeyForObjectType('bigLightSeed')).toBe('big-light-seed');
    expect(textureKeyForObjectType('driftBug')).toBe('drift-bug');
    expect(textureKeyForObjectType('windGateFinish')).toBe('wind-gate');
  });
});
