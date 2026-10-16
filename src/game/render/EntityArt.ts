import Phaser from 'phaser';
import { prefersReducedMotion } from '../../ui/state/preferences';

type ArtSource = Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;

interface ArtOptions {
  width: number;
  height?: number;
  originY?: number;
  offsetY?: number;
  bodyFeet?: boolean;
  bodyTop?: boolean;
  fitBodyWidth?: boolean;
  visibleWidthRatio?: number;
  followRotation?: boolean;
  supported?: () => boolean;
  decorate?: (image: Phaser.GameObjects.Image) => void;
}

/**
 * Displays supplied art over an unchanged collision object. No texture, scale,
 * origin or body properties on the physical object are replaced by this helper.
 */
export function attachEntityArt(
  source: ArtSource,
  key: string,
  options: ArtOptions
): void {
  const scene = source.scene;
  if (!scene.textures.exists(key)) return;

  const image = scene.add
    .image(source.x, source.y, key)
    .setName(`${source.name || key}:art`)
    .setOrigin(0.5, options.originY ?? 0.5)
    .setDisplaySize(options.width, options.height ?? options.width)
    .setDepth(source.depth + 0.1);
  const initialScaleX = source.scaleX;
  const initialScaleY = source.scaleY;
  const baseWidth = image.displayWidth;
  const baseHeight = image.displayHeight;

  const sync = (): void => {
    const supported = options.supported?.() ?? true;
    source.setVisible(source.active && !supported);
    image.setVisible(source.active && supported);
    if (!source.active || !supported) return;

    const body = source.body;
    const hasBody =
      body instanceof Phaser.Physics.Arcade.Body ||
      body instanceof Phaser.Physics.Arcade.StaticBody;
    const bodyAnchored = hasBody && (options.bodyFeet || options.bodyTop);
    image.setPosition(
      bodyAnchored ? body.left + body.width / 2 : source.x,
      (hasBody && options.bodyTop
        ? body.top
        : hasBody && options.bodyFeet
          ? body.bottom
          : source.y) + (options.offsetY ?? 0)
    );
    if (hasBody && options.fitBodyWidth) {
      // Arcade body.width already includes the physical object's scale.
      const width = body.width / (options.visibleWidthRatio ?? 1);
      image.setDisplaySize(width, (width * baseHeight) / baseWidth);
    } else {
      image.setDisplaySize(
        baseWidth * Math.abs(source.scaleX / initialScaleX),
        baseHeight * Math.abs(source.scaleY / initialScaleY)
      );
    }
    image.setFlip(source.flipX, source.flipY);
    image.setAlpha(source.alpha);
    if (options.followRotation)
      image.setRotation(prefersReducedMotion() ? 0 : source.rotation);
    options.decorate?.(image);
  };
  const destroy = (): void => {
    scene.events.off(Phaser.Scenes.Events.POST_UPDATE, sync);
    scene.events.off(Phaser.Scenes.Events.SHUTDOWN, destroy);
    source.off(Phaser.GameObjects.Events.DESTROY, destroy);
    image.destroy();
  };

  scene.events.on(Phaser.Scenes.Events.POST_UPDATE, sync);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, destroy);
  source.once(Phaser.GameObjects.Events.DESTROY, destroy);
  sync();
}

/** Fill an existing thorn danger region with undistorted pods, rather than a tiny center icon. */
export function attachHazardArt(source: ArtSource, key: string): void {
  const scene = source.scene;
  if (!scene.textures.exists(key)) return;
  const images: Phaser.GameObjects.Image[] = [];
  const sync = (): void => {
    const body = source.body;
    if (!(body instanceof Phaser.Physics.Arcade.Body)) return;
    source.setVisible(false);
    // Supplied thorn alpha bounds: (22,12)..(234,244) inside a 256px frame.
    const visibleRatio = 212 / 232;
    const count = Math.max(
      1,
      Math.ceil(body.width / Math.max(1, body.height * visibleRatio))
    );
    const size = Math.min(
      (body.height * 256) / 232,
      ((body.width / count) * 256) / 212
    );
    while (images.length < count) {
      images.push(
        scene.add
          .image(0, 0, key)
          .setOrigin(0.5, 244 / 256)
          .setDepth(source.depth + 0.1)
          .setName('thorn:art')
      );
    }
    images.forEach((image, index) => {
      image.setVisible(source.active && index < count);
      if (index >= count) return;
      image
        .setPosition(
          body.left + ((index + 0.5) * body.width) / count,
          body.bottom
        )
        .setDisplaySize(size, size)
        .setAlpha(source.alpha);
    });
  };
  const destroy = (): void => {
    scene.events.off(Phaser.Scenes.Events.POST_UPDATE, sync);
    scene.events.off(Phaser.Scenes.Events.SHUTDOWN, destroy);
    source.off(Phaser.GameObjects.Events.DESTROY, destroy);
    images.forEach((image) => image.destroy());
  };
  scene.events.on(Phaser.Scenes.Events.POST_UPDATE, sync);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, destroy);
  source.once(Phaser.GameObjects.Events.DESTROY, destroy);
  sync();
}
