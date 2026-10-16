import { useState } from "react";
import { artUrl } from "../../game/render/artCatalog";
import { Modal } from "../../ui/components/Modal";
import type { SavedLevelSummary } from "../systems/EditorPersistenceSystem";
import { ImportExportDialog } from "./ImportExportDialog";
interface LevelListPanelProps {
  levels: SavedLevelSummary[];
  onBack: () => void;
  onCreate?: () => void;
  error?: string;
  onEdit: (levelId: string) => void;
  onPlay: (levelId: string) => void;
  onDuplicate: (levelId: string) => void;
  onExport: (levelId: string) => void;
  onDelete: (levelId: string) => void;
  onImport: (file: File) => void;
}
function LevelThumbnail({ thumbnail }: { thumbnail?: string }) {
  const [failed, setFailed] = useState(false);
  const safe =
    thumbnail &&
    /^data:image\/(png|webp|jpeg);base64,/.test(thumbnail) &&
    thumbnail.length < 65536;
  return (
    <div className="level-card__thumb" aria-hidden="true">
      <img
        src={safe && !failed ? thumbnail : artUrl("raster/sprout-idle.png")}
        alt=""
        loading="lazy"
        className={safe && !failed ? "" : "level-card__mascot"}
        onError={(event) => {
          if (safe && !failed) setFailed(true);
          else event.currentTarget.hidden = true;
        }}
      />
    </div>
  );
}
export function LevelListPanel(props: LevelListPanelProps) {
  const [deleting, setDeleting] = useState<SavedLevelSummary | null>(null);
  return (
    <section className="level-list-screen" aria-label="내 레벨">
      <header className="level-list-header">
        <button type="button" data-testid="levels-back" onClick={props.onBack}>
          ← 홈
        </button>
        <div>
          <span className="eyebrow">나만의 하늘 정원</span>
          <h1>내 레벨</h1>
          <p>만든 섬을 다시 플레이하고 다듬어 보세요.</p>
        </div>
        <div className="level-list-header__actions">
          {props.onCreate && (
            <button
              type="button"
              className="button--primary"
              data-testid="levels-create"
              onClick={props.onCreate}
            >
              + 새 섬 만들기
            </button>
          )}
          <ImportExportDialog onImport={props.onImport} />
        </div>
      </header>
      {props.error && (
        <div className="level-list-error" role="alert">
          {props.error}
        </div>
      )}
      {!props.levels.length ? (
        <div className="level-list-empty">
          <img
            src={artUrl("raster/sprout-idle.png")}
            alt=""
            width="160"
            height="160"
          />
          <h2>아직 만든 섬이 없어요.</h2>
          <p>
            첫 번째 섬을 만들어 볼까요? JSON 파일이 있다면 가져올 수도 있어요.
          </p>
          {props.onCreate && (
            <button
              type="button"
              className="button--primary"
              onClick={props.onCreate}
            >
              첫 번째 섬 만들기
            </button>
          )}
        </div>
      ) : (
        <div className="level-list">
          {props.levels.map((level) => (
            <article
              key={level.id}
              className="level-card"
              data-testid={`level-card-${level.id}`}
            >
              <LevelThumbnail thumbnail={level.thumbnail} />
              <h2 title={level.name}>{level.name}</h2>
              <p>
                {level.widthTiles} × {level.heightTiles}칸 ·{" "}
                {formatDate(level.updatedAt)}
              </p>
              <dl className="level-card-records">
                <div>
                  <dt>최고 점수</dt>
                  <dd>
                    {level.bestScore === undefined
                      ? "아직 기록 없음"
                      : level.bestScore.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt>가장 빠른 시간</dt>
                  <dd>
                    {level.bestTimeSeconds === undefined
                      ? "아직 기록 없음"
                      : `${Math.round(level.bestTimeSeconds)}초`}
                  </dd>
                </div>
              </dl>
              <div className="level-card-actions">
                <button
                  type="button"
                  className="button--primary"
                  data-testid={`level-play-${level.id}`}
                  aria-label={`${level.name} 플레이`}
                  onClick={() => props.onPlay(level.id)}
                >
                  ▶ 플레이
                </button>
                <button
                  type="button"
                  data-testid={`level-edit-${level.id}`}
                  aria-label={`${level.name} 편집`}
                  onClick={() => props.onEdit(level.id)}
                >
                  편집
                </button>
                <button
                  type="button"
                  data-testid={`level-duplicate-${level.id}`}
                  aria-label={`${level.name} 복제`}
                  onClick={() => props.onDuplicate(level.id)}
                >
                  복제
                </button>
                <button
                  type="button"
                  data-testid={`level-export-${level.id}`}
                  aria-label={`${level.name} JSON 내보내기`}
                  onClick={() => props.onExport(level.id)}
                >
                  JSON 내보내기
                </button>
                <button
                  type="button"
                  data-testid={`level-delete-${level.id}`}
                  aria-label={`${level.name} 삭제`}
                  onClick={() => setDeleting(level)}
                >
                  삭제
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      {deleting && (
        <Modal title="이 섬을 삭제할까요?" onClose={() => setDeleting(null)}>
          <p>
            ‘{deleting.name}’과 저장된 기록이 이 브라우저에서 삭제돼요. 먼저
            JSON으로 보관할 수 있어요.
          </p>
          <div className="dialog-actions">
            <button type="button" onClick={() => setDeleting(null)}>
              취소
            </button>
            <button type="button" onClick={() => props.onExport(deleting.id)}>
              JSON 내보내기
            </button>
            <button
              type="button"
              className="button--danger"
              data-testid="level-confirm-delete"
              onClick={() => {
                props.onDelete(deleting.id);
                setDeleting(null);
              }}
            >
              삭제하기
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? "수정 날짜 확인 불가"
    : new Intl.DateTimeFormat("ko-KR", {
        month: "long",
        day: "numeric",
      }).format(date);
}
