import { useState, type ReactNode } from "react";
import type { LevelObject } from "../../game/data/LevelData";
import type { EditorSaveStatus } from "../EditorRoot";
import type { CatalogCategory } from "../data/objectCatalog";
import type {
  EditorState,
  EditorTool,
  ValidationResult,
} from "../schemas/levelDefaults";
import type {
  Alignment,
  DistributionAxis,
} from "../systems/EditorAdvancedTools";
import { DifficultyEstimatorPanel } from "./DifficultyEstimatorPanel";
import { EditorToolbar } from "./EditorToolbar";
import { LayerPanel } from "./LayerPanel";
import { MiniMap } from "./MiniMap";
import { PalettePanel } from "./PalettePanel";
import { PropertiesPanel } from "./PropertiesPanel";
import { ValidationPanel } from "./ValidationPanel";

type Panel =
  | "canvas"
  | "palette"
  | "properties"
  | "layers"
  | "validation"
  | "overview";
interface EditorShellProps {
  state: EditorState;
  saveStatus: EditorSaveStatus;
  notice: string;
  recovery?: ReactNode;
  activeCategory: CatalogCategory;
  selectedObject: LevelObject | null;
  canUndo: boolean;
  canRedo: boolean;
  canvasRef: (node: HTMLDivElement | null) => void;
  onBack: () => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onTest: () => void;
  onTool: (tool: EditorTool) => void;
  onGrid: () => void;
  onSnap: () => void;
  onValidate: () => void;
  onExport: () => void;
  onSettings: () => void;
  onHelp: () => void;
  onCategoryChange: (category: CatalogCategory) => void;
  onPaletteItem: (itemId: string) => void;
  onPropertyChange: (id: string, changes: Partial<LevelObject>) => void;
  onMultiPropertyChange: (changes: Partial<LevelObject>) => void;
  onAlign: (alignment: Alignment) => void;
  onDistribute: (axis: DistributionAxis) => void;
  onLayerChange: Parameters<typeof LayerPanel>[0]["onChange"];
  onFocusPoint: (point: { x: number; y: number }) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onFocusResult: (result: ValidationResult) => void;
}
const tools: Array<[EditorTool, string, string]> = [
  ["select", "선택", "V"],
  ["brush", "배치", "B"],
  ["erase", "지우기", "E"],
  ["rectangle", "블록", "R"],
  ["pan", "화면 이동", "H"],
  ["path", "경로", "P"],
];
const panels: Array<[Panel, string]> = [
  ["canvas", "캔버스"],
  ["palette", "팔레트"],
  ["properties", "속성"],
  ["layers", "레이어"],
  ["validation", "검증"],
  ["overview", "개요"],
];
export function EditorShell(props: EditorShellProps) {
  const [panel, setPanel] = useState<Panel>("palette");
  const detailPanel =
    panel === "canvas" || panel === "palette" ? "properties" : panel;
  const validate = () => {
    props.onValidate();
    setPanel("validation");
  };
  return (
    <section
      className="editor-root"
      aria-label="Sky Forge Editor"
      data-panel={panel}
    >
      <EditorToolbar
        state={props.state}
        saveStatus={props.saveStatus}
        canUndo={props.canUndo}
        canRedo={props.canRedo}
        onBack={props.onBack}
        onSave={props.onSave}
        onUndo={props.onUndo}
        onRedo={props.onRedo}
        onTest={props.onTest}
        onValidate={validate}
        onExport={props.onExport}
        onSettings={props.onSettings}
        onHelp={props.onHelp}
      />
      <div className="editor-tools" role="toolbar" aria-label="편집 도구">
        <div className="editor-tool-group">
          {tools.map(([tool, label, shortcut]) => (
            <button
              key={tool}
              type="button"
              data-testid={`editor-tool-${tool}`}
              aria-pressed={props.state.activeTool === tool}
              title={`${label} (${shortcut})`}
              onClick={() => props.onTool(tool)}
            >
              {label}
              <kbd>{shortcut}</kbd>
            </button>
          ))}
        </div>
        <div className="editor-tool-group">
          <button
            type="button"
            aria-pressed={props.state.grid.visible}
            onClick={props.onGrid}
          >
            격자
          </button>
          <button
            type="button"
            aria-pressed={props.state.grid.snap}
            onClick={props.onSnap}
          >
            격자 맞춤
          </button>
          <button
            type="button"
            disabled={!props.state.selectedIds.length}
            onClick={props.onDuplicate}
          >
            복제
          </button>
          <button
            type="button"
            disabled={!props.state.selectedIds.length}
            onClick={props.onDelete}
          >
            삭제
          </button>
        </div>
      </div>
      {props.recovery}
      <nav className="editor-panel-nav" aria-label="편집 패널">
        {panels.map(([id, label]) => (
          <button
            key={id}
            type="button"
            data-testid={`editor-panel-${id}`}
            aria-pressed={panel === id}
            onClick={() => setPanel(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="editor-workbench">
        <div className="editor-palette-slot" aria-label="배치할 오브젝트">
          <PalettePanel
            activeCategory={props.activeCategory}
            activeItemId={props.state.activePaletteItemId}
            onCategoryChange={props.onCategoryChange}
            onItemChange={props.onPaletteItem}
          />
        </div>
        <div className="editor-canvas-wrap">
          <div
            className="editor-canvas-host"
            data-testid="editor-canvas-host"
            ref={props.canvasRef}
          />
          <MiniMap state={props.state} onFocus={props.onFocusPoint} />
          <span className="editor-canvas-hint">
            {tools.find(([id]) => id === props.state.activeTool)?.[1]} 도구 ·
            휠로 확대 · 화면 이동 도구로 탐색
          </span>
        </div>
        <div className="editor-inspector-slot">
          <nav className="editor-inspector-tabs" aria-label="상세 패널">
            {panels.slice(2).map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={detailPanel === id}
                onClick={() => setPanel(id)}
              >
                {label}
              </button>
            ))}
          </nav>
          {detailPanel === "properties" && (
            <PropertiesPanel
              state={props.state}
              selectedObject={props.selectedObject}
              onChange={props.onPropertyChange}
              onMultiChange={props.onMultiPropertyChange}
              onAlign={props.onAlign}
              onDistribute={props.onDistribute}
              onDuplicate={props.onDuplicate}
              onDelete={props.onDelete}
            />
          )}
          {detailPanel === "layers" && (
            <LayerPanel
              layers={props.state.layers}
              onChange={props.onLayerChange}
            />
          )}
          {detailPanel === "validation" && (
            <ValidationPanel
              results={props.state.validationResults}
              onFocusResult={props.onFocusResult}
            />
          )}
          {detailPanel === "overview" && (
            <DifficultyEstimatorPanel level={props.state.level} />
          )}
        </div>
      </div>
      <div className="editor-statusbar">
        <span>{Math.round(props.state.camera.zoom * 100)}%</span>
        <span>{props.state.selectedIds.length}개 선택</span>
        <span>
          {
            props.state.validationResults.filter(
              (result) => result.severity !== "info",
            ).length
          }
          개 확인 필요
        </span>
        <span
          className={
            props.saveStatus === "error"
              ? "editor-notice editor-notice--error"
              : "editor-notice"
          }
          role="status"
          aria-live="polite"
        >
          {props.notice}
        </span>
      </div>
    </section>
  );
}
