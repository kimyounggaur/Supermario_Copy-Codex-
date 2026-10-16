import { useState } from "react";
import { ActionButton } from "../components/ActionButton";
import { Modal } from "../components/Modal";
import { SettingsDialog } from "./SettingsDialog";

const art = (file: string) =>
  `${import.meta.env.BASE_URL}art/sky-sprout-v1/${file}`;
export function HomeScreen({
  onStory,
  onEditor,
  onLevels,
}: {
  onStory: () => void;
  onEditor: () => void;
  onLevels: () => void;
}) {
  const [panel, setPanel] = useState<
    "controls" | "credits" | "settings" | null
  >(null);
  return (
    <section className="home-screen" aria-label="메인 메뉴">
      <div
        className="home-sky"
        aria-hidden="true"
        style={{
          backgroundImage: `linear-gradient(90deg,#f9fbedf5 5%,#edf9ed90 48%,#bceef04a),url("${art("raster/background-sky.png")}")`,
        }}
      />
      <header className="home-header">
        <span className="brand-leaf">✦</span>
        <span>
          SKY SPROUT<small>바람이 자라는 섬</small>
        </span>
        <button
          type="button"
          className="ui-icon-button"
          aria-label="설정"
          onClick={() => setPanel("settings")}
        >
          <img src={art("svg/sound.svg")} alt="" />
        </button>
      </header>
      <div className="home-content">
        <div className="home-copy">
          <span className="eyebrow">작은 새싹, 큰 모험</span>
          <h1>
            Sky Sprout
            <br />
            <span>Runner</span>
          </h1>
          <p className="home-description">
            햇빛을 따라, 구름 너머로.
            <br />
            빛의 씨앗을 모아 바람문에 도착하세요.
          </p>
          <div className="home-actions">
            <ActionButton
              variant="primary"
              data-testid="home-story-button"
              onClick={onStory}
            >
              <span>모험 시작</span>
              <span aria-hidden="true">→</span>
            </ActionButton>
            <div className="home-actions__secondary">
              <ActionButton data-testid="home-editor-button" onClick={onEditor}>
                레벨 만들기
              </ActionButton>
              <ActionButton data-testid="home-levels-button" onClick={onLevels}>
                내 레벨
              </ActionButton>
            </div>
          </div>
          <div className="home-caption">
            <img src={art("svg/seed-icon.svg")} alt="" />
            <span>씨앗을 모으고, 나만의 섬도 만들어 보세요.</span>
          </div>
        </div>
        <div className="home-garden" aria-hidden="true">
          <div className="home-orbit" />
          <img
            className="home-garden__island"
            src={art("raster/platform-meadow.png")}
            alt=""
          />
          <img
            className="home-garden__hero"
            src={art("raster/sprout-idle.png")}
            alt=""
          />
          <img
            className="home-garden__seed home-garden__seed--one"
            src={art("raster/light-seed.png")}
            alt=""
          />
          <img
            className="home-garden__seed home-garden__seed--two"
            src={art("raster/light-seed.png")}
            alt=""
          />
          <span className="garden-tag">01 · 하늘 정원으로 떠나요</span>
        </div>
      </div>
      <footer className="home-footer">
        <span>한 걸음의 용기에서 시작되는 이야기</span>
        <nav aria-label="도움말">
          <button type="button" onClick={() => setPanel("controls")}>
            조작 안내
          </button>
          <button type="button" onClick={() => setPanel("credits")}>
            크레딧
          </button>
        </nav>
      </footer>
      {panel === "settings" ? (
        <SettingsDialog onClose={() => setPanel(null)} />
      ) : null}
      {panel === "controls" ? (
        <Modal title="조작 안내" onClose={() => setPanel(null)}>
          <div className="controls-guide">
            <p>
              <kbd>←</kbd> <kbd>→</kbd> 또는 <kbd>A</kbd> <kbd>D</kbd>
              <span>이동</span>
            </p>
            <p>
              <kbd>Space</kbd> / <kbd>W</kbd> / <kbd>↑</kbd>
              <span>점프 · 공중에서 한 번 더</span>
            </p>
            <p>
              <kbd>Shift</kbd>
              <span>달리기</span>
            </p>
            <p>
              <kbd>↓</kbd>
              <span>웅크리기</span>
            </p>
            <p>
              <kbd>P</kbd> / <kbd>Esc</kbd>
              <span>일시정지</span>
            </p>
            <p>
              <kbd>R</kbd>
              <span>체크포인트로 돌아가기</span>
            </p>
          </div>
          <p>
            벽을 향해 이동하며 떨어지면 천천히 미끄러져요. 그때 점프하면 벽을
            차고 올라갈 수 있어요.
          </p>
          <p className="ui-caption">
            모바일에서는 아래의 이동·달리기·점프 버튼을 함께 누르세요. 테스트
            플레이의 P / Esc는 에디터로 돌아갑니다.
          </p>
        </Modal>
      ) : null}
      {panel === "credits" ? (
        <Modal title="크레딧" onClose={() => setPanel(null)}>
          <p>
            Sky Sprout Runner는 작은 새싹과 구름섬의 오리지널 플랫폼 게임입니다.
          </p>
          <p>React · TypeScript · Phaser와 Sky Forge Editor로 만들었습니다.</p>
          <p className="ui-caption">
            Sky-Sprout 아트 팩과 기존 생성 그래픽·WebAudio 효과음을 사용합니다.
          </p>
        </Modal>
      ) : null}
    </section>
  );
}
