import type { LevelObject, PlatformData } from "../../game/data/LevelData";
import { getCatalogItem } from "../data/objectCatalog";
import type { EditorState } from "../schemas/levelDefaults";
import type {
  Alignment,
  DistributionAxis,
} from "../systems/EditorAdvancedTools";

interface PropertiesPanelProps {
  state: EditorState;
  selectedObject: LevelObject | null;
  onChange: (id: string, changes: Partial<LevelObject>) => void;
  onMultiChange: (changes: Partial<LevelObject>) => void;
  onAlign: (alignment: Alignment) => void;
  onDistribute: (axis: DistributionAxis) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function PropertiesPanel({
  state,
  selectedObject,
  onChange,
  onMultiChange,
  onAlign,
  onDistribute,
  onDuplicate,
  onDelete,
}: PropertiesPanelProps) {
  const selectedPlatform =
    selectedObject && selectedObject.type === "movingBreezePlatform"
      ? (selectedObject as PlatformData)
      : null;

  return (
    <aside
      className="properties-panel"
      data-testid="editor-panel-content-properties"
      role="region"
      aria-label="속성 패널"
    >
      <h2>선택한 오브젝트</h2>
      {!selectedObject ? (
        <div className="empty-panel">
          <span>{state.selectedIds.length}개 선택</span>
          {!state.selectedIds.length && (
            <p>
              선택 도구(V)로 캔버스의 오브젝트를 누르면 위치와 크기를 바꿀 수
              있어요.
            </p>
          )}
          {state.selectedIds.length > 1 ? (
            <div className="multi-inspector">
              <label className="property-check">
                <input
                  type="checkbox"
                  onChange={(event) =>
                    onMultiChange({ visible: event.target.checked })
                  }
                />
                모두 표시
              </label>
              <label className="property-check">
                <input
                  type="checkbox"
                  onChange={(event) =>
                    onMultiChange({ locked: event.target.checked })
                  }
                />
                모두 잠금
              </label>
              <div className="property-actions property-actions--grid">
                <button type="button" onClick={() => onAlign("left")}>
                  왼쪽
                </button>
                <button type="button" onClick={() => onAlign("right")}>
                  오른쪽
                </button>
                <button type="button" onClick={() => onAlign("top")}>
                  위쪽
                </button>
                <button type="button" onClick={() => onAlign("bottom")}>
                  아래쪽
                </button>
                <button
                  type="button"
                  disabled={state.selectedIds.length < 3}
                  onClick={() => onDistribute("horizontal")}
                >
                  가로 간격
                </button>
                <button
                  type="button"
                  disabled={state.selectedIds.length < 3}
                  onClick={() => onDistribute("vertical")}
                >
                  세로 간격
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <form
          className="property-form"
          onSubmit={(event) => event.preventDefault()}
        >
          <label>
            ID
            <input value={selectedObject.id} readOnly />
          </label>
          <label>
            종류
            <input
              value={
                getCatalogItem(selectedObject.type)?.label ??
                selectedObject.type
              }
              readOnly
            />
          </label>
          <label>
            X
            <input
              type="number"
              value={Math.round(selectedObject.x)}
              onChange={(event) =>
                onChange(selectedObject.id, { x: Number(event.target.value) })
              }
            />
          </label>
          <label>
            Y
            <input
              type="number"
              value={Math.round(selectedObject.y)}
              onChange={(event) =>
                onChange(selectedObject.id, { y: Number(event.target.value) })
              }
            />
          </label>
          <label>
            너비
            <input
              type="number"
              min={1}
              value={Math.round(selectedObject.width)}
              onChange={(event) =>
                onChange(selectedObject.id, {
                  width: Math.max(1, Number(event.target.value)),
                })
              }
            />
          </label>
          <label>
            높이
            <input
              type="number"
              min={1}
              value={Math.round(selectedObject.height)}
              onChange={(event) =>
                onChange(selectedObject.id, {
                  height: Math.max(1, Number(event.target.value)),
                })
              }
            />
          </label>
          {"speed" in selectedObject ? (
            <label>
              속도
              <input
                type="number"
                value={selectedObject.speed}
                onChange={(event) =>
                  onChange(selectedObject.id, {
                    speed: Number(event.target.value),
                  })
                }
              />
            </label>
          ) : null}
          {selectedPlatform ? (
            <div className="path-editor">
              <h3>이동 경로</h3>
              <label>
                반복 방식
                <select
                  aria-label="경로 반복 방식"
                  value={selectedPlatform.mode}
                  onChange={(event) =>
                    onChange(selectedPlatform.id, {
                      mode: event.target.value as PlatformData["mode"],
                    })
                  }
                >
                  <option value="pingPong">왕복</option>
                  <option value="loop">순환</option>
                </select>
              </label>
              {selectedPlatform.waypoints.map((waypoint, index) => (
                <div
                  className="waypoint-row"
                  key={`${selectedPlatform.id}-${index}`}
                >
                  <span>#{index + 1}</span>
                  <input
                    aria-label={`경유점 ${index + 1} X`}
                    type="number"
                    value={Math.round(waypoint.x)}
                    onChange={(event) => {
                      const waypoints = selectedPlatform.waypoints.map(
                        (current, currentIndex) =>
                          currentIndex === index
                            ? { ...current, x: Number(event.target.value) }
                            : current,
                      );
                      onChange(selectedPlatform.id, {
                        waypoints,
                      } as Partial<LevelObject>);
                    }}
                  />
                  <input
                    aria-label={`경유점 ${index + 1} Y`}
                    type="number"
                    value={Math.round(waypoint.y)}
                    onChange={(event) => {
                      const waypoints = selectedPlatform.waypoints.map(
                        (current, currentIndex) =>
                          currentIndex === index
                            ? { ...current, y: Number(event.target.value) }
                            : current,
                      );
                      onChange(selectedPlatform.id, {
                        waypoints,
                      } as Partial<LevelObject>);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onChange(selectedPlatform.id, {
                        waypoints: selectedPlatform.waypoints.filter(
                          (_, currentIndex) => currentIndex !== index,
                        ),
                      } as Partial<LevelObject>)
                    }
                    disabled={selectedPlatform.waypoints.length <= 2}
                  >
                    제거
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const last = selectedPlatform.waypoints.at(-1) ?? {
                    x: selectedPlatform.x,
                    y: selectedPlatform.y,
                  };
                  onChange(selectedPlatform.id, {
                    waypoints: [
                      ...selectedPlatform.waypoints,
                      { x: last.x + state.grid.tileSize * 3, y: last.y },
                    ],
                  } as Partial<LevelObject>);
                }}
              >
                경유점 추가
              </button>
            </div>
          ) : null}
          {"patrolDistance" in selectedObject ? (
            <label>
              순찰 거리
              <input
                type="number"
                value={selectedObject.patrolDistance}
                onChange={(event) =>
                  onChange(selectedObject.id, {
                    patrolDistance: Number(event.target.value),
                  })
                }
              />
            </label>
          ) : null}
          <label className="property-check">
            <input
              type="checkbox"
              checked={selectedObject.visible}
              onChange={(event) =>
                onChange(selectedObject.id, { visible: event.target.checked })
              }
            />
            표시
          </label>
          <label className="property-check">
            <input
              type="checkbox"
              checked={selectedObject.locked}
              onChange={(event) =>
                onChange(selectedObject.id, { locked: event.target.checked })
              }
            />
            잠금
          </label>
          <label>
            메모
            <textarea
              aria-label="메모"
              value={selectedObject.notes}
              onChange={(event) =>
                onChange(selectedObject.id, { notes: event.target.value })
              }
            />
          </label>
          <div className="property-actions">
            <button type="button" onClick={onDuplicate}>
              복제
            </button>
            <button type="button" onClick={onDelete}>
              삭제
            </button>
          </div>
        </form>
      )}
    </aside>
  );
}
