import { Modal } from "../../ui/components/Modal";
import type { LevelData } from "../../game/data/LevelData";
import type { LevelTemplateId } from "../data/levelTemplates";
interface LevelSettingsDialogProps {
  level: LevelData;
  open: boolean;
  onClose: () => void;
  onChange: (level: LevelData) => void;
  onTemplate: (templateId: LevelTemplateId) => void;
}
export function LevelSettingsDialog({
  level,
  open,
  onClose,
  onChange,
  onTemplate,
}: LevelSettingsDialogProps) {
  if (!open) return null;
  return (
    <Modal title="섬 설정" onClose={onClose} className="editor-settings-dialog">
      <form
        className="editor-settings-form"
        onSubmit={(event) => event.preventDefault()}
      >
        <label>
          섬 이름
          <input
            data-testid="level-name"
            value={level.name}
            maxLength={120}
            onChange={(event) =>
              onChange({ ...level, name: event.target.value })
            }
          />
        </label>
        <label>
          설명
          <textarea
            value={level.description}
            maxLength={1200}
            onChange={(event) =>
              onChange({ ...level, description: event.target.value })
            }
          />
        </label>
        <div className="editor-settings-dimensions">
          <label>
            가로 (칸)
            <input
              type="number"
              min={20}
              max={300}
              value={level.world.widthTiles}
              onChange={(event) =>
                onChange({
                  ...level,
                  world: {
                    ...level.world,
                    widthTiles: Math.min(
                      300,
                      Math.max(20, Number(event.target.value)),
                    ),
                  },
                })
              }
            />
          </label>
          <label>
            세로 (칸)
            <input
              type="number"
              min={12}
              max={80}
              value={level.world.heightTiles}
              onChange={(event) =>
                onChange({
                  ...level,
                  world: {
                    ...level.world,
                    heightTiles: Math.min(
                      80,
                      Math.max(12, Number(event.target.value)),
                    ),
                  },
                })
              }
            />
          </label>
        </div>
        <label>
          테마
          <select
            value={level.world.theme}
            onChange={(event) =>
              onChange({
                ...level,
                world: {
                  ...level.world,
                  theme: event.target.value as LevelData["world"]["theme"],
                },
              })
            }
          >
            <option value="windIsland">바람의 섬</option>
            <option value="cloudDawn">구름 새벽</option>
            <option value="starCavern">별빛 동굴</option>
          </select>
        </label>
        <label>
          템플릿으로 새 구성 시작
          <select
            aria-label="템플릿"
            data-testid="editor-template"
            defaultValue=""
            onChange={(event) => {
              if (event.target.value) {
                onTemplate(event.target.value as LevelTemplateId);
                event.target.value = "";
              }
            }}
          >
            <option value="">템플릿 선택</option>
            <option value="emptyIsland">빈 섬</option>
            <option value="starterPlains">시작의 초원</option>
            <option value="floatingChallenge">공중 발판 도전</option>
            <option value="enemyPractice">적 피하기 연습</option>
            <option value="speedRunStrip">속도 도전</option>
          </select>
        </label>
        <p className="panel-description">
          템플릿을 선택하면 현재 구성이 바뀌어요. 되돌리기로 이전 작업을 복원할
          수 있어요.
        </p>
        <button
          type="button"
          className="button--primary"
          data-testid="editor-settings-close"
          onClick={onClose}
        >
          설정 마치기
        </button>
      </form>
    </Modal>
  );
}
