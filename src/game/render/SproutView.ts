import Phaser from 'phaser';
import { ART_TEXTURES } from './artCatalog';

type VisualState =
  | 'idle'
  | 'run'
  | 'jump'
  | 'fall'
  | 'hurt'
  | 'wall'
  | 'crouch';

interface SproutSource extends Phaser.Physics.Arcade.Sprite {
  facing: -1 | 1;
}

/** A feet-anchored view. The original 32×44 Sprite remains the physics owner. */
export class SproutView {
  private readonly image?: Phaser.GameObjects.Image;
  private state: VisualState = 'idle';
  private grounded = false;
  private landingUntil = 0;
  private wasGrounded = false;

  constructor(private readonly source: SproutSource) {
    if (!source.scene.textures.exists(ART_TEXTURES.sprout)) return;
    this.image = source.scene.add
      .image(source.x, source.y, ART_TEXTURES.sprout, 0)
      .setName('Sprout:art')
      .setOrigin(0.5, 244 / 256)
      .setDepth(source.depth + 0.1);
    source.scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.sync, this);
    source.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    source.once(Phaser.GameObjects.Events.DESTROY, this.destroy, this);
    this.sync();
  }

  update(state: VisualState, onGround: boolean): void {
    this.state = state;
    this.grounded = onGround;
  }

  reset(): void {
    this.wasGrounded = false;
    this.landingUntil = 0;
    this.sync();
  }

  private sync(): void {
    const image = this.image;
    if (!image || !this.source.active) {
      image?.setVisible(false);
      return;
    }
    const body = this.source.body;
    if (!(body instanceof Phaser.Physics.Arcade.Body)) return;
    const time = this.source.scene.time.now;
    if (this.grounded && !this.wasGrounded) this.landingUntil = time + 140;
    this.wasGrounded = this.grounded;

    // Missing pack poses retain the established readable procedural silhouettes.
    const useFallback = this.state === 'wall' || this.state === 'crouch';
    this.source.setVisible(useFallback);
    image
      .setVisible(!useFallback)
      .setAlpha(this.source.alpha)
      .setFlipX(this.source.facing < 0);
    if (useFallback) return;

    let frame = 0;
    if (this.state === 'jump') frame = 3;
    else if (this.state === 'fall') frame = 4;
    else if (this.state === 'hurt' && !this.grounded)
      frame = body.velocity.y < -20 ? 3 : 4;
    else if (this.state === 'run') frame = 1 + (Math.floor(time / 140) % 2);
    else if (this.grounded && time < this.landingUntil) frame = 5;

    // All six delivered frame bounds end at y=244; keep that shared foot anchor.
    image.setFrame(frame).setOrigin(0.5, 244 / 256);
    image.setPosition(body.center.x, body.bottom);
    // Scaling once here reflects growth; the physical sprite's scale is untouched.
    image.setDisplaySize(
      58 * Math.abs(this.source.scaleX),
      58 * Math.abs(this.source.scaleY)
    );
    image.setTint(this.state === 'hurt' ? 0xc5f4c6 : 0xffffff);
  }

  private destroy(): void {
    this.source.scene?.events.off(
      Phaser.Scenes.Events.POST_UPDATE,
      this.sync,
      this
    );
    this.source.scene?.events.off(
      Phaser.Scenes.Events.SHUTDOWN,
      this.destroy,
      this
    );
    this.source.off(Phaser.GameObjects.Events.DESTROY, this.destroy, this);
    this.image?.destroy();
  }
}
