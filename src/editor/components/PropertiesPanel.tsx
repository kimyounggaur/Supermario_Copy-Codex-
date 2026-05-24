import type { LevelObject } from '../../game/data/LevelData';
import type { EditorState } from '../schemas/levelDefaults';

interface PropertiesPanelProps {
  state: EditorState;
  selectedObject: LevelObject | null;
  onChange: (id: string, changes: Partial<LevelObject>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function PropertiesPanel({
  state,
  selectedObject,
  onChange,
  onDuplicate,
  onDelete
}: PropertiesPanelProps) {
  return (
    <aside className="properties-panel" role="region" aria-label="Properties panel">
      <h2>Properties</h2>
      {!selectedObject ? (
        <div className="empty-panel">
          <span>{state.selectedIds.length} selected</span>
        </div>
      ) : (
        <form className="property-form" onSubmit={(event) => event.preventDefault()}>
          <label>
            ID
            <input value={selectedObject.id} readOnly />
          </label>
          <label>
            Type
            <input value={selectedObject.type} readOnly />
          </label>
          <label>
            X
            <input
              type="number"
              value={Math.round(selectedObject.x)}
              onChange={(event) => onChange(selectedObject.id, { x: Number(event.target.value) })}
            />
          </label>
          <label>
            Y
            <input
              type="number"
              value={Math.round(selectedObject.y)}
              onChange={(event) => onChange(selectedObject.id, { y: Number(event.target.value) })}
            />
          </label>
          <label>
            Width
            <input
              type="number"
              min={1}
              value={Math.round(selectedObject.width)}
              onChange={(event) => onChange(selectedObject.id, { width: Number(event.target.value) })}
            />
          </label>
          <label>
            Height
            <input
              type="number"
              min={1}
              value={Math.round(selectedObject.height)}
              onChange={(event) => onChange(selectedObject.id, { height: Number(event.target.value) })}
            />
          </label>
          {'speed' in selectedObject ? (
            <label>
              Speed
              <input
                type="number"
                value={selectedObject.speed}
                onChange={(event) => onChange(selectedObject.id, { speed: Number(event.target.value) })}
              />
            </label>
          ) : null}
          {'patrolDistance' in selectedObject ? (
            <label>
              Patrol
              <input
                type="number"
                value={selectedObject.patrolDistance}
                onChange={(event) =>
                  onChange(selectedObject.id, { patrolDistance: Number(event.target.value) })
                }
              />
            </label>
          ) : null}
          <label className="property-check">
            <input
              type="checkbox"
              checked={selectedObject.visible}
              onChange={(event) => onChange(selectedObject.id, { visible: event.target.checked })}
            />
            Visible
          </label>
          <label className="property-check">
            <input
              type="checkbox"
              checked={selectedObject.locked}
              onChange={(event) => onChange(selectedObject.id, { locked: event.target.checked })}
            />
            Locked
          </label>
          <label>
            Notes
            <textarea
              value={selectedObject.notes}
              onChange={(event) => onChange(selectedObject.id, { notes: event.target.value })}
            />
          </label>
          <div className="property-actions">
            <button type="button" onClick={onDuplicate}>
              Copy
            </button>
            <button type="button" onClick={onDelete}>
              Delete
            </button>
          </div>
        </form>
      )}
    </aside>
  );
}
