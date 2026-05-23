import { PLAYER } from '../config/constants';
import type { PlayerInput } from '../types';
import { approach, clamp } from '../utils/math';

export interface PlayerPhysicsState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
  lastGroundedAt: number;
  jumpBufferedUntil: number;
  health: number;
  invulnerableUntil: number;
}

export function createPlayerPhysicsState(): PlayerPhysicsState {
  return {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    onGround: true,
    lastGroundedAt: 0,
    jumpBufferedUntil: Number.NEGATIVE_INFINITY,
    health: PLAYER.maxHealth,
    invulnerableUntil: 0
  };
}

export function stepPlayerPhysics(
  state: PlayerPhysicsState,
  input: PlayerInput,
  deltaMs: number,
  nowMs: number
): PlayerPhysicsState {
  const next = { ...state };
  const dt = deltaMs / 1000;

  if (next.onGround) {
    next.lastGroundedAt = nowMs;
  }

  if (input.jumpPressed) {
    next.jumpBufferedUntil = nowMs + PLAYER.jumpBufferMs;
  }

  const axis = Number(input.right) - Number(input.left);
  const maxSpeed = input.run ? PLAYER.runSpeed : PLAYER.walkSpeed;

  if (axis !== 0) {
    const acceleration = (next.onGround ? PLAYER.acceleration : PLAYER.airAcceleration) * dt;
    next.vx = approach(next.vx, axis * maxSpeed, acceleration);
  } else {
    const drag = (next.onGround ? PLAYER.groundDrag : PLAYER.airDrag) * dt;
    next.vx = approach(next.vx, 0, drag);
  }

  next.vx = clamp(next.vx, -maxSpeed, maxSpeed);

  const hasBufferedJump = nowMs <= next.jumpBufferedUntil;
  const canJump = next.onGround || nowMs - next.lastGroundedAt <= PLAYER.coyoteMs;

  if (hasBufferedJump && canJump) {
    next.vy = PLAYER.jumpVelocity;
    next.onGround = false;
    next.jumpBufferedUntil = Number.NEGATIVE_INFINITY;
    next.lastGroundedAt = Number.NEGATIVE_INFINITY;
  } else if (!next.onGround) {
    next.vy = Math.min(next.vy + 1050 * dt, PLAYER.maxFallSpeed);
  }

  if (input.jumpReleased && next.vy < PLAYER.shortJumpVelocity) {
    next.vy = PLAYER.shortJumpVelocity;
  }

  next.x += next.vx * dt;
  next.y += next.vy * dt;

  return next;
}

export function applyPlayerHit(
  state: PlayerPhysicsState,
  nowMs: number,
  direction: -1 | 1
): PlayerPhysicsState {
  if (nowMs < state.invulnerableUntil) {
    return { ...state };
  }

  return {
    ...state,
    health: Math.max(0, state.health - 1),
    invulnerableUntil: nowMs + PLAYER.invulnerableMs,
    vx: direction * PLAYER.hurtKnockbackX,
    vy: PLAYER.hurtKnockbackY,
    onGround: false
  };
}
