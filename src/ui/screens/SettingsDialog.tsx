import { useState, useSyncExternalStore } from "react";
import { Modal } from "../components/Modal";
import {
  getPreferences,
  subscribePreferences,
  updatePreferences,
  type UiPreferences,
} from "../state/preferences";

export function SettingsDialog({ onClose }: { onClose: () => void }) {
  const preferences = useSyncExternalStore(
    subscribePreferences,
    getPreferences,
  );
  const [saveFailed, setSaveFailed] = useState(false);
  const change = (changes: Partial<UiPreferences>) =>
    setSaveFailed(!updatePreferences(changes));
  return (
    <Modal
      title="설정"
      onClose={onClose}
      description="나에게 편안한 바람으로 조절하세요."
    >
      <div className="settings-options">
        <label>
          <span>
            <strong>효과음</strong>
            <small>점프·수집·버튼 소리</small>
          </span>
          <input
            type="checkbox"
            checked={preferences.sound}
            onChange={(event) => change({ sound: event.target.checked })}
          />
        </label>
        <label>
          <span>
            <strong>움직임 줄이기</strong>
            <small>시스템 설정은 항상 존중해요</small>
          </span>
          <input
            type="checkbox"
            checked={preferences.motion === "reduced"}
            onChange={(event) =>
              change({ motion: event.target.checked ? "reduced" : "system" })
            }
          />
        </label>
        <label>
          <span>
            <strong>조작 안내</strong>
            <small>플레이 중 키보드 힌트 표시</small>
          </span>
          <input
            type="checkbox"
            checked={preferences.showHints}
            onChange={(event) => change({ showHints: event.target.checked })}
          />
        </label>
      </div>
      {saveFailed ? (
        <p role="status" className="ui-error">
          설정은 이번 실행에 적용했어요. 브라우저 저장 공간에 보관하지 못했어요.
        </p>
      ) : (
        <p className="ui-caption">변경한 설정은 자동으로 저장돼요.</p>
      )}
    </Modal>
  );
}
