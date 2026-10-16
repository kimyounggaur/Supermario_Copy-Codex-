import { describe, expect, test } from 'vitest';
import { TouchInputState } from '../../src/ui/state/touchInputState';

describe('pointer-owned touch input', () => {
  test('three pointers can move, run and jump simultaneously with one jump edge', () => {
    const input = new TouchInputState();
    input.setPointer(1, 'right');
    input.setPointer(2, 'run');
    input.setPointer(3, 'jump');
    expect(input.read()).toMatchObject({
      right: true,
      run: true,
      jumpDown: true,
      jumpPressed: true,
      jumpReleased: false
    });
    expect(input.read()).toMatchObject({ jumpDown: true, jumpPressed: false });
    input.releasePointer(3);
    expect(input.read()).toMatchObject({
      right: true,
      run: true,
      jumpDown: false,
      jumpReleased: true
    });
    expect(input.read().jumpReleased).toBe(false);
  });

  test('releasing one finger does not release another finger on the same action', () => {
    const input = new TouchInputState();
    input.setPointer(10, 'jump');
    input.read();
    input.setPointer(11, 'jump');
    expect(input.read().jumpPressed).toBe(false);
    input.releasePointer(10);
    expect(input.read()).toMatchObject({ jumpDown: true, jumpReleased: false });
    input.releasePointer(11);
    expect(input.read()).toMatchObject({ jumpDown: false, jumpReleased: true });
  });

  test('a short press before the next frame retains both pressed and released edges', () => {
    const input = new TouchInputState();
    input.setPointer(1, 'jump');
    input.releasePointer(1);
    expect(input.read()).toMatchObject({
      jumpDown: false,
      jumpPressed: true,
      jumpReleased: true
    });
    expect(input.read()).toMatchObject({
      jumpPressed: false,
      jumpReleased: false
    });
  });

  test('blur/pause cleanup removes held actions and pending edges', () => {
    const input = new TouchInputState();
    input.setPointer(1, 'left');
    input.setPointer(2, 'jump');
    input.clear();
    expect(input.read()).toEqual({
      left: false,
      right: false,
      run: false,
      jumpDown: false,
      jumpPressed: false,
      jumpReleased: false
    });
    input.releasePointer(2);
    expect(input.read().jumpReleased).toBe(false);
  });
});
