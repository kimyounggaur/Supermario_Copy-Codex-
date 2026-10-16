import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent,
} from "react";
import type { LevelData as EditorLevelData } from "../game/data/LevelData";
import type { LevelData as RuntimeLevelData } from "../game/types";
import { GameUiBridge } from "../ui/state/gameUiBridge";
import type { TouchAction } from "../ui/state/touchInputState";
import { getPreferences, subscribePreferences } from "../ui/state/preferences";
import { Modal } from "../ui/components/Modal";
import { ActionButton } from "../ui/components/ActionButton";
import { SettingsDialog } from "../ui/screens/SettingsDialog";

interface GameCanvasProps {
  level?: EditorLevelData | RuntimeLevelData;
  skipMenu?: boolean;
  testPlay?: boolean;
  onReturnToEditor?: () => void;
  onHome?: () => void;
}
const art = (file: string) =>
  `${import.meta.env.BASE_URL}art/sky-sprout-v1/${file}`;
const timeLabel = (seconds: number) =>
  `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
const actions: TouchAction[] = ["left", "right", "run", "jump"];

export function GameCanvas({
  level,
  skipMenu = false,
  testPlay = false,
  onReturnToEditor,
  onHome,
}: GameCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const callbacksRef = useRef({ onHome, onReturnToEditor });
  const [bridge] = useState(() => new GameUiBridge(testPlay));
  const snapshot = useSyncExternalStore(bridge.subscribe, bridge.getSnapshot);
  const preferences = useSyncExternalStore(
    subscribePreferences,
    getPreferences,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [pressed, setPressed] = useState<Set<TouchAction>>(new Set());
  useEffect(() => {
    callbacksRef.current = { onHome, onReturnToEditor };
  }, [onHome, onReturnToEditor]);

  useEffect(() => {
    if (!hostRef.current) return;
    const host = hostRef.current;
    let cancelled = false;
    let observer: ResizeObserver | undefined;
    bridge.patch({
      state: "loading",
      progress: 0,
      missing: [],
      result: null,
      hud: null,
    });
    bridge.onExit = (destination) => {
      if (destination === "editor")
        window.dispatchEvent(new CustomEvent("sky-sprout:return-editor"));
      else callbacksRef.current.onHome?.();
    };
    const handleReturn = () => callbacksRef.current.onReturnToEditor?.();
    const clear = () => {
      bridge.touch.clear();
      setPressed(new Set());
    };
    const visibility = () => {
      clear();
      if (document.hidden && bridge.getSnapshot().state === "playing")
        bridge.request("pause");
    };
    const keydown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.isComposing ||
        /^(INPUT|TEXTAREA|SELECT)$/.test(
          (event.target as HTMLElement)?.tagName,
        ) ||
        (event.target as HTMLElement)?.isContentEditable
      )
        return;
      if (event.code !== "KeyP" && event.code !== "Escape") return;
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog && !dialog.classList.contains("run-pause")) return;
      if (
        bridge.getSnapshot().state === "loading" ||
        bridge.getSnapshot().state === "error"
      )
        return;
      event.preventDefault();
      if (testPlay) bridge.request("return-editor");
      else if (bridge.getSnapshot().state === "paused")
        bridge.request("resume");
      else if (bridge.getSnapshot().state === "playing")
        bridge.request("pause");
    };
    window.addEventListener("sky-sprout:return-editor", handleReturn);
    window.addEventListener("keydown", keydown);
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", visibility);
    window.__SKY_SPROUT_LAUNCH = { level, skipMenu, testPlay };
    void import("../game/GameRoot")
      .then(({ createGame }) => {
        if (cancelled) return;
        const game = createGame(host, bridge);
        gameRef.current = game;
        observer = new ResizeObserver(() => {
          if (!cancelled && host.clientWidth && host.clientHeight)
            game.scale.resize(host.clientWidth, host.clientHeight);
        });
        observer.observe(host);
        host.focus({ preventScroll: true });
      })
      .catch(() => {
        if (!cancelled) bridge.patch({ state: "error" });
      });
    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener("sky-sprout:return-editor", handleReturn);
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", visibility);
      bridge.touch.clear();
      bridge.onExit = undefined;
      gameRef.current?.destroy(true);
      gameRef.current = null;
      delete window.__SKY_SPROUT_LAUNCH;
      delete window.__SKY_SPROUT_RUN;
    };
  }, [level, skipMenu, testPlay, bridge, attempt]);

  const request = (
    command: "resume" | "restart" | "home" | "return-editor",
  ) => {
    bridge.touch.clear();
    setPressed(new Set());
    bridge.request(command);
    if (command === "resume" || command === "restart")
      requestAnimationFrame(() => hostRef.current?.focus());
  };
  const press = (
    event: PointerEvent<HTMLButtonElement>,
    action: TouchAction,
  ) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    bridge.touch.setPointer(event.pointerId, action);
    setPressed(new Set(actions.filter((item) => bridge.touch.isHeld(item))));
  };
  const release = (event: PointerEvent<HTMLButtonElement>) => {
    bridge.touch.releasePointer(event.pointerId);
    setPressed(new Set(actions.filter((item) => bridge.touch.isHeld(item))));
  };
  const touchButton = (action: TouchAction, label: string, icon: string) => {
    const keyId = -actions.indexOf(action) - 1;
    return (
      <button
        type="button"
        className={`touch-button touch-button--${action} ${pressed.has(action) ? "is-pressed" : ""}`}
        data-testid={`touch-${action}`}
        aria-label={label}
        aria-pressed={pressed.has(action)}
        key={action}
        onPointerDown={(event) => press(event, action)}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={release}
        onKeyDown={(event) => {
          if ((event.key === " " || event.key === "Enter") && !event.repeat) {
            event.preventDefault();
            bridge.touch.setPointer(keyId, action);
          }
        }}
        onKeyUp={(event) => {
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            bridge.touch.releasePointer(keyId);
          }
        }}
        onBlur={() => bridge.touch.releasePointer(keyId)}
      >
        <img src={art(`svg/${icon}.svg`)} alt="" />
        <span>{label}</span>
      </button>
    );
  };
  const hud = snapshot.hud;
  const result = snapshot.result;
  const exitButton = (
    <ActionButton
      data-testid={testPlay ? "return-editor" : "game-home"}
      onClick={() => request(testPlay ? "return-editor" : "home")}
    >
      {testPlay ? "에디터로 돌아가기" : "홈으로"}
    </ActionButton>
  );

  return (
    <section
      className={`game-session ${testPlay ? "game-session--test" : ""}`}
      aria-label={testPlay ? "레벨 테스트 플레이" : "하늘 정원 모험"}
    >
      <div
        className="game-canvas-host"
        ref={hostRef}
        tabIndex={0}
        data-testid="game-host"
        aria-label="게임 화면. 방향키로 이동하고 Space로 점프하세요."
      />
      {hud ? (
        <div className="hud-overlay" aria-label="플레이 정보">
          <div className="hud-primary">
            <div
              className="stat-pill health-pill"
              data-testid="hud-health"
              aria-label={`체력 ${hud.health} / 3`}
            >
              {[0, 1, 2].map((i) => (
                <img
                  key={i}
                  src={art("svg/health-leaf.svg")}
                  alt=""
                  className={i >= hud.health ? "health-empty" : ""}
                />
              ))}
              <span className="sr-only">체력 {hud.health}</span>
            </div>
            <div
              className="stat-pill"
              data-testid="hud-seeds"
              aria-label={`빛의 씨앗 ${hud.shards} / ${hud.totalShards}`}
            >
              <img src={art("svg/seed-icon.svg")} alt="" />
              <strong>{hud.shards.toString().padStart(2, "0")}</strong>
              <small>/ {hud.totalShards}</small>
            </div>
          </div>
          <div className="hud-secondary">
            <div className="stat-pill hud-details" data-testid="hud-score">
              <small>점수</small>
              <strong>{hud.score.toLocaleString()}</strong>
              <span className="stat-divider" />
              <time>{timeLabel(hud.elapsedSeconds)}</time>
            </div>
            <button
              type="button"
              className="ui-icon-button pause-button"
              data-testid="game-pause"
              aria-label="일시정지"
              onClick={() => {
                bridge.touch.clear();
                setPressed(new Set());
                bridge.request("pause");
              }}
            >
              <img src={art("svg/pause.svg")} alt="" />
            </button>
          </div>
          <div className="hud-status">
            <span>
              ✓{" "}
              {hud.checkpointLabel === "Start"
                ? "출발 지점"
                : hud.checkpointLabel}
            </span>
            {hud.powerActive ? (
              <span className="power-badge">바람 능력 활성</span>
            ) : null}
            {testPlay && snapshot.state === "playing" ? (
              <button
                type="button"
                data-testid="return-editor"
                onClick={() => request("return-editor")}
              >
                ← 에디터로
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      {snapshot.state === "playing" ? (
        <>
          <div className="touch-controls" aria-label="터치 조작">
            <div className="touch-controls__move">
              {touchButton("left", "왼쪽", "arrow-right")}
              {touchButton("right", "오른쪽", "arrow-right")}
            </div>
            <div className="touch-controls__action">
              {touchButton("run", "달리기", "run")}
              {touchButton("jump", "점프", "jump")}
            </div>
          </div>
          {preferences.showHints ? (
            <p className="game-keyboard-hint">
              ← → 이동 <span>·</span> SPACE 점프 <span>·</span> SHIFT 달리기{" "}
              <span>·</span> {testPlay ? "ESC 에디터로" : "ESC 일시정지"}
            </p>
          ) : null}
        </>
      ) : null}
      {snapshot.missing.length > 0 && snapshot.state === "playing" ? (
        <div className="asset-notice" role="status">
          일부 그림 대신 기본 그래픽으로 플레이 중이에요.{" "}
          <button
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
          >
            다시 불러오기
          </button>
        </div>
      ) : null}
      {snapshot.state === "loading" || snapshot.state === "error" ? (
        <div className="game-loading" role="status">
          <img src={art("raster/sprout-idle.png")} alt="" />
          <h2>
            {snapshot.state === "error"
              ? "모험을 열지 못했어요"
              : "바람길을 여는 중"}
          </h2>
          <p>
            {snapshot.state === "error"
              ? "다시 불러오거나 홈으로 돌아갈 수 있어요."
              : "새싹과 하늘섬을 준비하고 있어요."}
          </p>
          <progress max={1} value={snapshot.progress} aria-label="게임 로딩" />
          <div className="button-row">
            <ActionButton onClick={() => setAttempt((value) => value + 1)}>
              다시 불러오기
            </ActionButton>
            <ActionButton
              onClick={() => (testPlay ? onReturnToEditor?.() : onHome?.())}
            >
              {testPlay ? "에디터로" : "홈으로"}
            </ActionButton>
          </div>
        </div>
      ) : null}
      {snapshot.state === "paused" && !settingsOpen ? (
        <Modal
          title="잠깐, 바람을 고르는 중"
          className="run-pause"
          onClose={() => request(testPlay ? "return-editor" : "resume")}
        >
          <p>준비되면 다시 모험을 이어가세요.</p>
          {hud ? (
            <dl className="run-stats">
              <div>
                <dt>점수</dt>
                <dd>{hud.score.toLocaleString()}</dd>
              </div>
              <div>
                <dt>시간</dt>
                <dd>{timeLabel(hud.elapsedSeconds)}</dd>
              </div>
              <div>
                <dt>최고 기록</dt>
                <dd>{hud.highScore.toLocaleString()}</dd>
              </div>
            </dl>
          ) : null}
          <div className="modal-actions">
            <ActionButton
              variant="primary"
              data-testid="game-resume"
              data-autofocus
              onClick={() => request("resume")}
            >
              계속하기
            </ActionButton>
            <ActionButton
              data-testid="game-restart"
              onClick={() => request("restart")}
            >
              처음부터 재시작
            </ActionButton>
            <ActionButton onClick={() => setSettingsOpen(true)}>
              설정
            </ActionButton>
            {exitButton}
          </div>
        </Modal>
      ) : null}
      {snapshot.state === "gameOver" || snapshot.state === "levelComplete" ? (
        <Modal
          title={
            snapshot.state === "levelComplete"
              ? "바람문에 도착했어요!"
              : "다시 바람을 타 볼까요?"
          }
          className="run-result"
          onClose={() => request(testPlay ? "return-editor" : "home")}
        >
          <img
            className="result-sprout"
            src={art(
              `raster/${snapshot.state === "levelComplete" ? "sprout-land" : "sprout-idle"}.png`,
            )}
            alt="Sprout"
          />
          <p>
            {snapshot.state === "levelComplete"
              ? "작은 발걸음이 멋진 모험이 되었어요."
              : "잠시 숨을 고르고, 처음부터 다시 도전해 보세요."}
          </p>
          <dl className="run-stats">
            <div>
              <dt>점수</dt>
              <dd>{(result?.score ?? hud?.score ?? 0).toLocaleString()}</dd>
            </div>
            <div>
              <dt>빛의 씨앗</dt>
              <dd>
                {result?.shards ?? hud?.shards ?? 0} /{" "}
                {result?.totalShards ?? hud?.totalShards ?? 0}
              </dd>
            </div>
            <div>
              <dt>시간</dt>
              <dd>
                {timeLabel(result?.elapsedSeconds ?? hud?.elapsedSeconds ?? 0)}
              </dd>
            </div>
          </dl>
          <p className="ui-caption">
            최고 기록{" "}
            {(result?.bestScore ?? hud?.highScore ?? 0).toLocaleString()}
          </p>
          <div className="modal-actions">
            <ActionButton
              variant="primary"
              data-testid="game-restart"
              data-autofocus
              onClick={() => request("restart")}
            >
              {snapshot.state === "levelComplete" ? "다시 플레이" : "다시 도전"}
            </ActionButton>
            {exitButton}
          </div>
        </Modal>
      ) : null}
      {settingsOpen ? (
        <SettingsDialog onClose={() => setSettingsOpen(false)} />
      ) : null}
    </section>
  );
}
