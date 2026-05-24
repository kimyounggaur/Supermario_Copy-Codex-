import type { EditorState } from '../schemas/levelDefaults';

interface MiniMapProps {
  state: EditorState;
}

export function MiniMap({ state }: MiniMapProps) {
  const width = state.level.world.widthTiles;
  const height = state.level.world.heightTiles;
  const objects = state.level.terrain.length + state.level.platforms.length + state.level.enemies.length;

  return (
    <div className="mini-map" aria-label="Mini map">
      <span>{width} x {height}</span>
      <strong>{objects}</strong>
    </div>
  );
}
