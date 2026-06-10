import type Phaser from 'phaser';
import { PALETTE, THEMES, mergePalette, type ThemeId } from './palette';
import { TextureFactory } from './TextureFactory';
import { createTextureDefinitions } from './textureDefinitions';

export function registerProceduralTextures(scene: Phaser.Scene, theme: ThemeId = 'overworld'): TextureFactory {
  const palette = mergePalette(PALETTE, THEMES[theme].palette);
  const factory = new TextureFactory({ palette });
  factory.bakeDefinitions(createTextureDefinitions());

  for (const baked of factory.getAll()) {
    addCanvasTexture(scene, baked.id, baked.variants.retina2x ?? baked.canvas);
    for (const [variant, canvas] of Object.entries(baked.variants)) {
      if (canvas) {
        addCanvasTexture(scene, `${baked.id}:${variant}`, canvas);
      }
    }
  }

  return factory;
}

function addCanvasTexture(scene: Phaser.Scene, key: string, canvas: HTMLCanvasElement): void {
  if (scene.textures.exists(key)) {
    return;
  }
  scene.textures.addCanvas(key, canvas);
}
