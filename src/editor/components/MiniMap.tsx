import type { EditorState } from "../schemas/levelDefaults";
import { useEffect, useRef, useState } from "react";
import { getLevelObjects } from "../../game/data/LevelData";

interface MiniMapProps {
  state: EditorState;
  onFocus: (point: { x: number; y: number }) => void;
}

export function MiniMap({ state, onFocus }: MiniMapProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [viewport, setViewport] = useState({ width: 960, height: 540 });
  useEffect(() => {
    const parent = buttonRef.current?.parentElement;
    if (!parent) return;
    const observer = new ResizeObserver(() =>
      setViewport({ width: parent.clientWidth, height: parent.clientHeight }),
    );
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);
  const width = state.level.world.widthTiles * state.level.world.tileSize;
  const height = state.level.world.heightTiles * state.level.world.tileSize;
  const objects = getLevelObjects(state.level).filter(
    (object) => object.visible && state.layers[object.layer].visible,
  );
  const viewWidth = viewport.width / state.camera.zoom;
  const viewHeight = viewport.height / state.camera.zoom;

  return (
    <button
      type="button"
      className="mini-map"
      ref={buttonRef}
      aria-label="미니맵 · 누른 위치로 화면 이동"
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x =
          event.detail === 0
            ? width / 2
            : ((event.clientX - rect.left) / rect.width) * width;
        const y =
          event.detail === 0
            ? height / 2
            : ((event.clientY - rect.top) / rect.height) * height;
        onFocus({ x, y });
      }}
    >
      {objects.map((object) => (
        <span
          className={`mini-map__dot mini-map__dot--${object.layer}`}
          key={object.id}
          style={{
            left: `${(object.x / width) * 100}%`,
            top: `${(object.y / height) * 100}%`,
            width: `${Math.max(2, (object.width / width) * 100)}%`,
          }}
        />
      ))}
      <span
        className="mini-map__viewport"
        style={{
          left: `${(state.camera.x / width) * 100}%`,
          top: `${(state.camera.y / height) * 100}%`,
          width: `${Math.min(100, (viewWidth / width) * 100)}%`,
          height: `${Math.min(100, (viewHeight / height) * 100)}%`,
        }}
      />
      <strong>
        {state.level.world.widthTiles} x {state.level.world.heightTiles}
      </strong>
    </button>
  );
}
