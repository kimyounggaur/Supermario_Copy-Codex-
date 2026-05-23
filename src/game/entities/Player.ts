import Phaser from 'phaser';
import { DEPTHS, PLAYER } from '../config/constants';
import type { PlayerInput, Point } from '../types';
import { approach } from '../utils/math';
import { getArcadeBody } from '../utils/assertions';

type PlayerVisualState = 'idle' | 'run' | 'jump' | 'fall' | 'hurt';

export class Player extends Phaser.Physics.Arcade.Sprite {
  health: number = PLAYER.maxHealth;
  facing: -1 | 1 = 1;
  private respawnPoint: Point;
  private checkpointLabel = 'Start';
  private lastGroundedAt = Number.NEGATIVE_INFINITY;
  private jumpBufferedUntil = Number.NEGATIVE_INFINITY;
  private invulnerableUntil = 0;
  private breezeUntil = 0;
  private visualState: PlayerVisualState = 'idle';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'sprout-idle');
    this.respawnPoint = { x, y };

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setName('Sprout');
    this.setDepth(DEPTHS.player);
    this.setOrigin(0.5, 0.5);
    this.setCollideWorldBounds(false);

    const body = getArcadeBody(this);
    body.setSize(22, 34);
    body.setOffset(5, 8);
    body.setMaxVelocity(PLAYER.runSpeed + 80, PLAYER.maxFallSpeed);
  }

  updateFromInput(input: PlayerInput, time: number, delta: number): void {
    const body = getArcadeBody(this);
    const dt = delta / 1000;
    const onGround = body.blocked.down || body.touching.down;

    if (onGround) {
      this.lastGroundedAt = time;
    }

    if (input.jumpPressed) {
      this.jumpBufferedUntil = time + PLAYER.jumpBufferMs;
    }

    this.applyHorizontalMovement(input, dt, onGround, body);
    this.applyJumping(input, time, onGround, body);

    body.setGravityY(body.velocity.y > 20 ? PLAYER.extraFallGravity : 0);
    body.velocity.y = Math.min(body.velocity.y, PLAYER.maxFallSpeed);

    this.updateVisualState(time, body, onGround);
  }

  bounce(): void {
    getArcadeBody(this).setVelocityY(PLAYER.bounceVelocity);
    this.lastGroundedAt = Number.NEGATIVE_INFINITY;
  }

  takeHit(time: number, knockbackDirection: -1 | 1): boolean {
    if (this.isInvulnerable(time)) {
      return false;
    }

    this.health = Math.max(0, this.health - 1);
    this.invulnerableUntil = time + PLAYER.invulnerableMs;
    this.setTexture('sprout-hurt');
    getArcadeBody(this).setVelocity(
      knockbackDirection * PLAYER.hurtKnockbackX,
      PLAYER.hurtKnockbackY
    );

    return true;
  }

  loseLifeForFall(time: number): boolean {
    if (!this.isInvulnerable(time)) {
      this.health = Math.max(0, this.health - 1);
      this.invulnerableUntil = time + PLAYER.invulnerableMs;
    }

    return this.health > 0;
  }

  respawn(): void {
    this.setPosition(this.respawnPoint.x, this.respawnPoint.y);
    const body = getArcadeBody(this);
    body.reset(this.respawnPoint.x, this.respawnPoint.y);
    body.setVelocity(0, 0);
    body.setGravityY(0);
  }

  setCheckpoint(point: Point, label: string): void {
    this.respawnPoint = { ...point };
    this.checkpointLabel = label;
  }

  getCheckpointLabel(): string {
    return this.checkpointLabel;
  }

  applyBreeze(durationMs: number, time: number): void {
    this.breezeUntil = Math.max(this.breezeUntil, time + durationMs);
  }

  hasBreeze(time: number): boolean {
    return time < this.breezeUntil;
  }

  isInvulnerable(time: number): boolean {
    return time < this.invulnerableUntil;
  }

  resetForNewRun(): void {
    this.health = PLAYER.maxHealth;
    this.invulnerableUntil = 0;
    this.breezeUntil = 0;
  }

  private applyHorizontalMovement(
    input: PlayerInput,
    dt: number,
    onGround: boolean,
    body: Phaser.Physics.Arcade.Body
  ): void {
    const axis = Number(input.right) - Number(input.left);
    const speedBase = input.run ? PLAYER.runSpeed : PLAYER.walkSpeed;
    const maxSpeed = this.hasBreeze(this.scene.time.now)
      ? speedBase * PLAYER.breezeAirControlMultiplier
      : speedBase;

    if (axis !== 0) {
      this.facing = axis < 0 ? -1 : 1;
      const acceleration =
        (!onGround && this.hasBreeze(this.scene.time.now)
          ? PLAYER.airAcceleration * PLAYER.breezeAirControlMultiplier
          : onGround
            ? PLAYER.acceleration
            : PLAYER.airAcceleration) * dt;
      body.velocity.x = approach(body.velocity.x, axis * maxSpeed, acceleration);
    } else {
      const drag = (onGround ? PLAYER.groundDrag : PLAYER.airDrag) * dt;
      body.velocity.x = approach(body.velocity.x, 0, drag);
    }

    body.velocity.x = Phaser.Math.Clamp(body.velocity.x, -maxSpeed, maxSpeed);
    this.setFlipX(this.facing < 0);
  }

  private applyJumping(
    input: PlayerInput,
    time: number,
    onGround: boolean,
    body: Phaser.Physics.Arcade.Body
  ): void {
    const canUseCoyote = time - this.lastGroundedAt <= PLAYER.coyoteMs;
    const hasBufferedJump = time <= this.jumpBufferedUntil;

    if (hasBufferedJump && (onGround || canUseCoyote)) {
      const jumpVelocity = this.hasBreeze(time) ? PLAYER.poweredJumpVelocity : PLAYER.jumpVelocity;
      body.setVelocityY(jumpVelocity);
      this.jumpBufferedUntil = Number.NEGATIVE_INFINITY;
      this.lastGroundedAt = Number.NEGATIVE_INFINITY;
      this.scene.events.emit('player:jump', this.x, this.y);
    }

    if (input.jumpReleased && body.velocity.y < PLAYER.shortJumpVelocity) {
      body.setVelocityY(PLAYER.shortJumpVelocity);
    }
  }

  private updateVisualState(
    time: number,
    body: Phaser.Physics.Arcade.Body,
    onGround: boolean
  ): void {
    const nextState: PlayerVisualState = this.isInvulnerable(time)
      ? 'hurt'
      : !onGround && body.velocity.y < -20
        ? 'jump'
        : !onGround && body.velocity.y > 30
          ? 'fall'
          : Math.abs(body.velocity.x) > 20
            ? 'run'
            : 'idle';

    if (nextState !== this.visualState) {
      this.visualState = nextState;
      this.setTexture(`sprout-${nextState}`);
    }

    this.setAlpha(this.isInvulnerable(time) && Math.floor(time / 90) % 2 === 0 ? 0.55 : 1);
  }
}
