import Phaser from 'phaser';
import { DEPTHS } from '../config/constants';
import type { Point } from '../types';
import { getArcadeBody } from '../utils/assertions';

export class MovingPlatform extends Phaser.Physics.Arcade.Image {
  private direction = 1;
  private readonly distance: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    private readonly from: Point,
    private readonly to: Point,
    private readonly speed: number
  ) {
    super(scene, x, y, 'moving-platform');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(DEPTHS.terrain + 1);
    this.setDisplaySize(width, height);
    this.setImmovable(true);

    const body = getArcadeBody(this);
    body.setAllowGravity(false);
    body.setSize(width, height);
    body.setOffset(0, 0);

    this.distance = Phaser.Math.Distance.Between(from.x, from.y, to.x, to.y);
  }

  updatePlatform(): void {
    const body = getArcadeBody(this);
    const target = this.direction > 0 ? this.to : this.from;
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const remaining = Math.hypot(dx, dy);

    if (remaining < 4) {
      this.direction *= -1;
      body.setVelocity(0, 0);
      return;
    }

    const vx = (dx / Math.max(remaining, 1)) * this.speed;
    const vy = (dy / Math.max(remaining, 1)) * this.speed;
    body.setVelocity(vx, vy);

    if (this.distance === 0) {
      body.setVelocity(0, 0);
    }
  }
}
