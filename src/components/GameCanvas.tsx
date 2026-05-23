import { useEffect, useRef } from 'react';

export function GameCanvas() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!hostRef.current || gameRef.current) {
      return;
    }

    let cancelled = false;
    const host = hostRef.current;

    void import('../game/GameRoot').then(({ createGame }) => {
      if (cancelled || gameRef.current) {
        return;
      }

      gameRef.current = createGame(host);
    });

    return () => {
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div className="game-canvas-host" ref={hostRef} data-testid="game-host" />;
}
