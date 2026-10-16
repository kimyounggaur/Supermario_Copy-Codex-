import { Modal } from "../../ui/components/Modal";
interface ShortcutHelpDialogProps {
  open: boolean;
  onClose: () => void;
}
export function ShortcutHelpDialog({ open, onClose }: ShortcutHelpDialogProps) {
  if (!open) return null;
  return (
    <Modal title="Sky Forge Editor 조작 안내" onClose={onClose}>
      <p>
        팔레트에서 고른 뒤 캔버스를 누르면 배치돼요. 선택 도구로 오브젝트를
        누르고 속성을 바꿔 보세요.
      </p>
      <dl className="editor-shortcuts">
        {[
          ["V", "선택 · Shift 누른 채 여러 개 선택"],
          ["B / R", "배치 / 블록 배치"],
          ["E", "지우기"],
          ["H / 마우스 오른쪽", "화면 이동"],
          ["P", "선택한 이동 발판에 경유점 추가"],
          ["T", "테스트 플레이"],
          ["Ctrl / ⌘ S", "저장"],
          ["Ctrl / ⌘ Z", "되돌리기"],
          ["Ctrl / ⌘ Shift Z", "다시 실행"],
          ["Ctrl / ⌘ D", "선택 복제"],
          ["Delete", "선택 삭제"],
          ["G / S", "격자 표시 / 격자 맞춤"],
        ].map(([key, label]) => (
          <div key={key}>
            <dt>
              <kbd>{key}</kbd>
            </dt>
            <dd>{label}</dd>
          </div>
        ))}
      </dl>
      <p className="panel-description">
        이름·숫자·메모를 입력할 때에는 편집 단축키가 실행되지 않아요.
        모바일에서는 상단 도구와 패널 버튼을 이용하세요.
      </p>
      <button type="button" onClick={onClose}>
        확인
      </button>
    </Modal>
  );
}
