import { useEffect, useRef } from 'react';
import type { LevelData as EditorLevelData } from '../game/data/LevelData';
import type { LevelData as RuntimeLevelData } from '../game/types';
import { GameOverlay } from './GameOverlay';
import { gameViewport } from '../game/config/viewport';

interface GameCanvasProps {
  level?: EditorLevelData | RuntimeLevelData;
  skipMenu?: boolean;
  testPlay?: boolean;
  onReturnToEditor?: () => void;
  onExit?: () => void;
}

export function GameCanvas({ level, skipMenu = false, testPlay = false, onReturnToEditor, onExit }: GameCanvasProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!hostRef.current || gameRef.current) {
      return;
    }

    let cancelled = false;
    const host = hostRef.current;
    window.__SKY_SPROUT_LAUNCH = { level, skipMenu, testPlay };
    window.__SKY_SPROUT_DOM_UI = true;
    const resize = () => {
      if (!gameRef.current?.isBooted) return;
      const size = gameViewport(host.clientWidth, host.clientHeight);
      gameRef.current.scale.setGameSize(size.width, size.height);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    const handleReturn = () => onReturnToEditor?.();
    const handleTestPlayKeyDown = (event: KeyboardEvent) => {
      if (!testPlay) {
        return;
      }

      if (event.key === 'Escape' || event.key.toLowerCase() === 'p') {
        event.preventDefault();
        handleReturn();
      }
    };
    window.addEventListener('sky-sprout:return-editor', handleReturn);
    window.addEventListener('keydown', handleTestPlayKeyDown);

    void import('../game/GameRoot').then(({ createGame }) => {
      if (cancelled || gameRef.current) {
        return;
      }

      gameRef.current = createGame(host);
    });

    return () => {
      cancelled = true;
      observer.disconnect();
      window.removeEventListener('sky-sprout:return-editor', handleReturn);
      window.removeEventListener('keydown', handleTestPlayKeyDown);
      delete window.__SKY_SPROUT_LAUNCH;
      delete window.__SKY_SPROUT_DOM_UI;
      delete window.__SKY_SPROUT_STATE;
      delete window.__SKY_SPROUT_HUD;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [level, onReturnToEditor, skipMenu, testPlay]);

  return <section className="game-frame" aria-label="Sky Sprout adventure">
    <GameOverlay testPlay={testPlay} onExit={() => testPlay ? onReturnToEditor?.() : onExit?.()} />
    <div className="game-canvas-host" ref={hostRef} data-testid="game-host" tabIndex={0} aria-label="Game world" />
  </section>;
}
