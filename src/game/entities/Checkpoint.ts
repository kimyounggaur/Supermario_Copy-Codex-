import Phaser from 'phaser';
import { DEPTHS } from '../config/constants';
import { getArcadeBody } from '../utils/assertions';
import { attachEntityArt } from '../render/EntityArt';
import { ART_TEXTURES } from '../render/artCatalog';

export class Checkpoint extends Phaser.Physics.Arcade.Image {
  private activated = false;
  private readonly status: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    readonly id: string,
    readonly label: string
  ) {
    super(scene, x, y, 'glow-lantern');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(DEPTHS.pickups);
    this.setName(id);

    const body = getArcadeBody(this);
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setSize(36, 54);
    this.status = scene.add
      .text(x, y - 60, '기록 지점', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        color: '#174b50',
        backgroundColor: '#fffef5',
        padding: { x: 6, y: 3 }
      })
      .setOrigin(0.5)
      .setDepth(DEPTHS.pickups + 1);
    attachEntityArt(this, ART_TEXTURES.checkpoint, {
      width: 76,
      originY: 0.9,
      bodyFeet: true,
      decorate: (image) => {
        image.setTint(this.activated ? 0xffffff : 0xc2d6cc);
        this.status.setPosition(image.x, image.y - 76);
      }
    });
  }

  activate(): boolean {
    if (this.activated) {
      return false;
    }

    this.activated = true;
    this.status.setText('✓ 기록한 지점');
    this.setTexture('glow-lantern-active');
    return true;
  }
}
