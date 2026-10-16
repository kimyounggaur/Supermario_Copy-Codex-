import Phaser from 'phaser';
import { DEPTHS } from '../config/constants';
import { getArcadeBody } from '../utils/assertions';
import { attachEntityArt } from '../render/EntityArt';
import { ART_TEXTURES } from '../render/artCatalog';
import { trackDecorativeTween } from '../render/reducedMotion';

export class Collectible extends Phaser.Physics.Arcade.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    readonly id: string
  ) {
    super(scene, x, y, 'light-seed-shard');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(DEPTHS.pickups);
    this.setName(id);

    const body = getArcadeBody(this);
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setSize(18, 18);
    attachEntityArt(this, ART_TEXTURES.seed, { width: 44 });

    const bob = scene.tweens.add({
      targets: this,
      y: y - 8,
      duration: 950,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    trackDecorativeTween(scene, bob);
  }

  collect(): void {
    this.disableBody(true, true);
  }
}
