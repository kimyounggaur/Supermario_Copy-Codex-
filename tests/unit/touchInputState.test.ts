import { describe, expect, it } from 'vitest';
import { TouchInputState } from '../../src/game/systems/TouchInputState';
import { gameViewport } from '../../src/game/config/viewport';

describe('touch control edges and cancellation', () => {
  it('keeps simultaneous move/run/jump input and consumes each jump edge once', () => {
    const input = new TouchInputState();
    input.set('right', true); input.set('run', true); input.set('jump', true); input.set('jump', true);
    expect([input.right, input.run, input.jump]).toEqual([true, true, true]);
    expect(input.consume('jumpPressed')).toBe(true);
    expect(input.consume('jumpPressed')).toBe(false);
    input.set('jump', false);
    expect(input.consume('jumpReleased')).toBe(true);
    expect(input.consume('jumpReleased')).toBe(false);
    expect(input.right).toBe(true);
  });
  it('clears held controls and queued actions on pause, cancellation or focus loss', () => {
    const input = new TouchInputState();
    input.set('left', true); input.set('jump', true); input.set('pause', true);
    input.reset();
    expect([input.left, input.right, input.jump, input.run]).toEqual([false, false, false, false]);
    expect(input.consume('jumpPressed')).toBe(false);
    expect(input.consume('jumpReleased')).toBe(false);
    expect(input.consume('pausePressed')).toBe(false);
    input.set('jump', true);
    expect(input.consume('jumpPressed')).toBe(true);
  });
});

describe('responsive world viewport', () => {
  it('keeps a useful portrait camera and finite bounds while a host is being mounted', () => {
    expect(gameViewport(390, 692)).toEqual({width:360, height:540});
    expect(gameViewport(0, 0)).toEqual({width:360, height:400});
    expect(gameViewport(844, 270)).toEqual({width:1250, height:400});
  });
});
