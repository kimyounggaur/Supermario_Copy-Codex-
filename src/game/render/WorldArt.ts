import Phaser from 'phaser';
import { DEPTHS } from '../config/constants';
import type { LevelData } from '../types';
import { ART_TEXTURES } from './artCatalog';
import { prefersReducedMotion } from '../../ui/state/preferences';

/** Single finite cover/crop images: the source backgrounds are not seamless. */
export function drawWorldArt(scene: Phaser.Scene, level: LevelData): boolean {
  if (!scene.textures.exists(ART_TEXTURES.sky)) return false;

  const sky = scene.add
    .image(0, 0, ART_TEXTURES.sky)
    .setScrollFactor(0)
    .setDepth(DEPTHS.background)
    .setName('sky-art');
  const islands = scene.textures.exists(ART_TEXTURES.islands)
    ? scene.add
        .image(0, 0, ART_TEXTURES.islands)
        .setScrollFactor(0)
        .setDepth(DEPTHS.background + 1)
        .setAlpha(0.28)
        .setName('islands-art')
    : undefined;

  const layout = (): void => {
    const camera = scene.cameras.main;
    const width = camera.width / camera.zoom;
    const height = camera.height / camera.zoom;
    const progress = prefersReducedMotion()
      ? 0.5
      : Phaser.Math.Clamp(
          camera.scrollX / Math.max(1, level.world.width - width),
          0,
          1
        );
    const place = (
      image: Phaser.GameObjects.Image,
      overscan: number,
      scrollFactor: number
    ): void => {
      const imageWidth = Math.max(width * overscan, height * 1.5);
      const imageHeight = imageWidth / 1.5;
      const availableTravel = Math.max(0, imageWidth - width);
      const travel = Math.min(
        availableTravel,
        level.world.width * scrollFactor
      );
      image.setDisplaySize(imageWidth, imageHeight);
      // Camera zoom is applied about its pixel-space origin even for scrollFactor=0.
      image.setPosition(
        camera.width * camera.originX + (0.5 - progress) * travel,
        camera.height * camera.originY
      );
    };
    place(sky, 1.12, 0.06);
    if (islands) place(islands, 1.42, 0.22);
  };
  const destroy = (): void => {
    scene.events.off(Phaser.Scenes.Events.POST_UPDATE, layout);
    sky.destroy();
    islands?.destroy();
  };
  scene.events.on(Phaser.Scenes.Events.POST_UPDATE, layout);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, destroy);
  layout();
  return true;
}
