import type { LevelObject } from '../../game/data/LevelData';
import type { CatalogCategory } from '../data/objectCatalog';
import type { EditorState, ValidationResult } from '../schemas/levelDefaults';
import { EditorToolbar } from './EditorToolbar';
import { MiniMap } from './MiniMap';
import { MobileEditorControls } from './MobileEditorControls';
import { PalettePanel } from './PalettePanel';
import { PropertiesPanel } from './PropertiesPanel';
import { ValidationPanel } from './ValidationPanel';

interface EditorShellProps {
  state: EditorState;
  saveStatus: 'Saved' | 'Unsaved' | 'Autosaved';
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
  onValidate: () => void;
  onExport: () => void;
  onSettings: () => void;
  onHelp: () => void;
  onCategoryChange: (category: CatalogCategory) => void;
  onPaletteItem: (itemId: string) => void;
  onPropertyChange: (id: string, changes: Partial<LevelObject>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onFocusResult: (result: ValidationResult) => void;
}

export function EditorShell(props: EditorShellProps) {
  return (
    <section className="editor-root">
      <header className="editor-title">
        <h1>Sky Forge Editor</h1>
      </header>
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
        onValidate={props.onValidate}
        onExport={props.onExport}
        onSettings={props.onSettings}
        onHelp={props.onHelp}
      />
      <div className="editor-workbench">
        <PalettePanel
          activeCategory={props.activeCategory}
          activeItemId={props.state.activePaletteItemId}
          onCategoryChange={props.onCategoryChange}
          onItemChange={props.onPaletteItem}
        />
        <div className="editor-canvas-wrap">
          <div className="editor-canvas-host" data-testid="editor-canvas-host" ref={props.canvasRef} />
          <MiniMap state={props.state} />
        </div>
        <PropertiesPanel
          state={props.state}
          selectedObject={props.selectedObject}
          onChange={props.onPropertyChange}
          onDuplicate={props.onDuplicate}
          onDelete={props.onDelete}
        />
      </div>
      <div className="editor-statusbar">
        <span>
          {Math.round(props.state.camera.zoom * 100)}% zoom
        </span>
        <span>{props.state.selectedIds.length} selected</span>
        <span>{props.state.activeTool}</span>
        <span>{props.state.validationResults.filter((result) => result.severity !== 'info').length} warnings</span>
      </div>
      <ValidationPanel results={props.state.validationResults} onFocusResult={props.onFocusResult} />
      <MobileEditorControls
        onCopy={props.onDuplicate}
        onDelete={props.onDelete}
        onSave={props.onSave}
        onTest={props.onTest}
      />
    </section>
  );
}
