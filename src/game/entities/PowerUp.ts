import Phaser from 'phaser';
import { DEPTHS } from '../config/constants';
import { getArcadeBody } from '../utils/assertions';
import { attachEntityArt } from '../render/EntityArt';
import { ART_TEXTURES } from '../render/artCatalog';
import { trackDecorativeTween } from '../render/reducedMotion';

export class PowerUp extends Phaser.Physics.Arcade.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    readonly id: string,
    readonly durationMs: number
  ) {
    super(scene, x, y, 'breeze-orb');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(DEPTHS.pickups);
    this.setName(id);

    const body = getArcadeBody(this);
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setCircle(13, 3, 3);
    attachEntityArt(this, ART_TEXTURES.orb, {
      width: 44,
      followRotation: true
    });

    const spin = scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 2600,
      repeat: -1
    });
    trackDecorativeTween(scene, spin);
  }

  collect(): void {
    this.disableBody(true, true);
  }
}
