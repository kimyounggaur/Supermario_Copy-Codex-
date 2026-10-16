import type { EditorState } from "../schemas/levelDefaults";
import type { EditorSaveStatus } from "../EditorRoot";
interface EditorToolbarProps {
  state: EditorState;
  saveStatus: EditorSaveStatus;
  canUndo: boolean;
  canRedo: boolean;
  onBack: () => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onTest: () => void;
  onValidate: () => void;
  onExport: () => void;
  onSettings: () => void;
  onHelp: () => void;
}
const statusLabels: Record<EditorSaveStatus, string> = {
  saved: "저장 완료",
  unsaved: "미저장",
  saving: "저장 중…",
  draft: "임시 보관됨 · 저장 필요",
  error: "저장 실패 · 내보내기 권장",
};
export function EditorToolbar(props: EditorToolbarProps) {
  return (
    <header className="editor-toolbar">
      <button
        type="button"
        data-testid="editor-back"
        aria-label="홈으로"
        onClick={props.onBack}
      >
        ← 홈
      </button>
      <div className="editor-toolbar__title">
        <span>Sky Forge Editor</span>
        <h1 title={props.state.level.name}>{props.state.level.name}</h1>
        <span
          className={`save-status save-status--${props.saveStatus}`}
          data-testid="editor-save-status"
          role="status"
          aria-live="polite"
        >
          {statusLabels[props.saveStatus]}
        </span>
      </div>
      <div
        className="editor-toolbar__history"
        role="group"
        aria-label="편집 기록"
      >
        <button
          type="button"
          data-testid="editor-undo"
          aria-label="되돌리기"
          title="되돌리기 (Ctrl Z)"
          disabled={!props.canUndo}
          onClick={props.onUndo}
        >
          ↶
        </button>
        <button
          type="button"
          data-testid="editor-redo"
          aria-label="다시 실행"
          title="다시 실행 (Ctrl Shift Z)"
          disabled={!props.canRedo}
          onClick={props.onRedo}
        >
          ↷
        </button>
      </div>
      <div className="editor-toolbar__actions">
        <button
          type="button"
          data-testid="editor-save"
          onClick={props.onSave}
          disabled={props.saveStatus === "saving"}
        >
          저장
        </button>
        <button
          type="button"
          data-testid="editor-test"
          className="button--primary"
          onClick={props.onTest}
        >
          ▶ 테스트 플레이
        </button>
      </div>
      <div className="editor-toolbar__secondary">
        <button
          type="button"
          data-testid="editor-validate"
          onClick={props.onValidate}
        >
          검증
        </button>
        <button
          type="button"
          data-testid="editor-export"
          onClick={props.onExport}
        >
          JSON 내보내기
        </button>
        <button
          type="button"
          data-testid="editor-settings"
          onClick={props.onSettings}
        >
          섬 설정
        </button>
        <button type="button" data-testid="editor-help" onClick={props.onHelp}>
          도움말
        </button>
      </div>
    </header>
  );
}
