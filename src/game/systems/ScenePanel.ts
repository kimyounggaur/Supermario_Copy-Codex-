import type Phaser from 'phaser';

export type PanelAction = 'resume' | 'restart' | 'menu' | 'next';
export interface ScenePanelData {
  kind: 'pause' | 'gameOver' | 'complete';
  score?: number; bestScore?: number; shards?: number; totalShards?: number; elapsedSeconds?: number;
  nextLabel?: string;
}

export function openScenePanel(scene: Phaser.Scene, data: ScenePanelData, actions: Partial<Record<PanelAction, () => void>>): boolean {
  if (!window.__SKY_SPROUT_DOM_UI) return false;
  window.dispatchEvent(new CustomEvent('sky-sprout:panel', { detail: data }));
  const command = (event: Event) => {
    const action = (event as CustomEvent<PanelAction>).detail;
    actions[action]?.();
  };
  window.addEventListener('sky-sprout:panel-action', command);
  scene.events.once('shutdown', () => window.removeEventListener('sky-sprout:panel-action', command));
  return true;
}
