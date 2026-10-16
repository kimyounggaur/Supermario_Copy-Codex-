import { describe, expect, test, vi } from 'vitest';
import { GameUiBridge } from '../../src/ui/state/gameUiBridge';
import type { HudPayload } from '../../src/game/types';

const hud: HudPayload = {
  health: 3,
  shards: 0,
  totalShards: 2,
  score: 0,
  elapsedSeconds: 0,
  checkpointLabel: 'Start',
  powerActive: false,
  highScore: 0
};

describe('game UI session bridge', () => {
  test('late subscribers can read the current launch context and HUD snapshot', () => {
    const bridge = new GameUiBridge(true);
    bridge.patch({ state: 'playing', levelId: 'custom-42' });
    bridge.updateHud(hud);
    expect(bridge.getSnapshot()).toMatchObject({
      state: 'playing',
      levelId: 'custom-42',
      testPlay: true,
      hud
    });
    const listener = vi.fn();
    const stop = bridge.subscribe(listener);
    bridge.patch({ state: 'paused' });
    expect(listener).toHaveBeenCalledOnce();
    expect(bridge.getSnapshot()).toMatchObject({
      levelId: 'custom-42',
      testPlay: true
    });
    stop();
    bridge.patch({ state: 'playing' });
    expect(listener).toHaveBeenCalledOnce();
  });

  test('retiring an old scene handler cannot unbind its replacement', () => {
    const bridge = new GameUiBridge();
    const oldHandler = vi.fn();
    const nextHandler = vi.fn();
    const retire = bridge.bindCommands(oldHandler);
    bridge.bindCommands(nextHandler);
    retire();
    bridge.request('restart');
    expect(oldHandler).not.toHaveBeenCalled();
    expect(nextHandler).toHaveBeenCalledExactlyOnceWith('restart');
  });

  test('unmount clears controls, commands and listeners without affecting another run', () => {
    const first = new GameUiBridge();
    const second = new GameUiBridge(true);
    const handler = vi.fn();
    const listener = vi.fn();
    first.bindCommands(handler);
    first.subscribe(listener);
    first.touch.setPointer(1, 'right');
    second.patch({ state: 'playing', levelId: 'test-7' });
    first.dispose();
    first.request('home');
    first.patch({ state: 'paused' });
    expect(handler).not.toHaveBeenCalled();
    expect(listener).not.toHaveBeenCalled();
    expect(first.touch.isHeld('right')).toBe(false);
    expect(second.getSnapshot()).toMatchObject({
      state: 'playing',
      levelId: 'test-7',
      testPlay: true
    });
  });

  test('unchanged frame data does not trigger duplicate UI notifications', () => {
    const bridge = new GameUiBridge();
    const listener = vi.fn();
    bridge.subscribe(listener);
    bridge.updateHud(hud);
    bridge.updateHud({ ...hud });
    expect(listener).toHaveBeenCalledOnce();
    bridge.updateHud({ ...hud, health: 2 });
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
