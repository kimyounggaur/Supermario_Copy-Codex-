import type { EditorLayer } from "../../game/data/LevelData";
import type { LayerStateMap } from "../systems/EditorAdvancedTools";
import { editorLayerOrder } from "../systems/EditorAdvancedTools";
interface LayerPanelProps {
  layers: LayerStateMap;
  onChange: (
    layerId: EditorLayer,
    changes: Partial<{ visible: boolean; locked: boolean; active: boolean }>,
  ) => void;
}
export function LayerPanel({ layers, onChange }: LayerPanelProps) {
  return (
    <section
      className="layer-panel"
      data-testid="editor-panel-content-layers"
      aria-label="레이어 패널"
    >
      <h2>레이어</h2>
      <p className="panel-description">
        숨기거나 잠근 레이어는 캔버스에서 편집되지 않아요.
      </p>
      <div className="layer-list">
        {editorLayerOrder.map((layerId) => {
          const layer = layers[layerId];
          return (
            <div
              className={
                layer.active ? "layer-row layer-row--active" : "layer-row"
              }
              key={layerId}
            >
              <button
                type="button"
                className="icon-button"
                aria-label={`${layer.label} ${layer.visible ? "숨기기" : "표시하기"}`}
                aria-pressed={layer.visible}
                onClick={() => onChange(layerId, { visible: !layer.visible })}
              >
                {layer.visible ? "◉" : "○"}
              </button>
              <button
                type="button"
                className="layer-name"
                aria-label={`${layer.label} 레이어 선택`}
                aria-pressed={layer.active}
                onClick={() => onChange(layerId, { active: true })}
              >
                {layer.label}
              </button>
              <button
                type="button"
                className="icon-button"
                aria-label={`${layer.label} ${layer.locked ? "잠금 해제" : "잠그기"}`}
                aria-pressed={layer.locked}
                onClick={() => onChange(layerId, { locked: !layer.locked })}
              >
                {layer.locked ? "잠금" : "해제"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
