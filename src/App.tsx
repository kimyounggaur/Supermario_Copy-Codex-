import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { GameCanvas } from "./components/GameCanvas";
import { EditorRoot } from "./editor/EditorRoot";
import { LevelListPanel } from "./editor/components/LevelListPanel";
import { createLevelFromTemplate } from "./editor/data/levelTemplates";
import { EditorPersistenceSystem } from "./editor/systems/EditorPersistenceSystem";
import { safeLevelFileName } from "./editor/systems/EditorSerializationSystem";
import type { LevelData } from "./game/data/LevelData";
import { HomeScreen } from "./ui/screens/HomeScreen";
import {
  getPreferences,
  prefersReducedMotion,
  subscribePreferences,
} from "./ui/state/preferences";

type AppMode = "menu" | "story" | "editor" | "levels";

export default function App() {
  const persistence = useMemo(() => new EditorPersistenceSystem(), []);
  const [mode, setMode] = useState<AppMode>("menu");
  const [currentLevel, setCurrentLevel] = useState<LevelData>();
  const [playtestLevel, setPlaytestLevel] = useState<LevelData | null>(null);
  const [levelsVersion, setLevelsVersion] = useState(0);
  const [error, setError] = useState("");
  const preferences = useSyncExternalStore(
    subscribePreferences,
    getPreferences,
  );
  const savedLevels = useMemo(
    () => persistence.listLevels(),
    [persistence, levelsVersion],
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      document.documentElement.dataset.reducedMotion = String(
        prefersReducedMotion(),
      );
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [preferences]);

  useEffect(() => {
    const saveError = () =>
      setError(
        "최고 기록을 브라우저에 저장하지 못했어요. 플레이는 계속할 수 있어요.",
      );
    const handleComplete = (event: Event) => {
      const detail = (
        event as CustomEvent<{
          levelId?: string;
          score?: number;
          elapsedSeconds?: number;
        }>
      ).detail;
      if (
        !detail?.levelId ||
        typeof detail.score !== "number" ||
        typeof detail.elapsedSeconds !== "number"
      )
        return;
      try {
        persistence.recordPlayResult(detail.levelId, {
          cleared: true,
          elapsedSeconds: detail.elapsedSeconds,
          score: detail.score,
        });
        setLevelsVersion((version) => version + 1);
      } catch {
        setError("플레이 기록을 저장하지 못했어요.");
      }
    };
    window.addEventListener("sky-sprout:level-complete", handleComplete);
    window.addEventListener("sky-sprout:save-error", saveError);
    return () => {
      window.removeEventListener("sky-sprout:level-complete", handleComplete);
      window.removeEventListener("sky-sprout:save-error", saveError);
    };
  }, [persistence]);

  const home = () => {
    setPlaytestLevel(null);
    setError("");
    setMode("menu");
    setLevelsVersion((value) => value + 1);
  };
  const create = () => {
    setCurrentLevel(createLevelFromTemplate("emptyIsland"));
    setError("");
    setMode("editor");
  };
  const guarded = (action: () => void) => {
    try {
      action();
      setError("");
      setLevelsVersion((value) => value + 1);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "작업을 완료하지 못했어요. 다시 시도해 주세요.",
      );
    }
  };
  const exportSavedLevel = (levelId: string) =>
    guarded(() => {
      const json = persistence.exportLevel(levelId);
      const level = persistence.loadLevel(levelId);
      if (!json || !level) throw new Error("레벨을 내보낼 수 없어요.");
      const url = URL.createObjectURL(
        new Blob([json], { type: "application/json" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = safeLevelFileName(level.name);
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });

  return (
    <main className="app-shell" aria-label="Sky Sprout Runner">
      {mode === "menu" ? (
        <HomeScreen
          onStory={() => {
            setCurrentLevel(undefined);
            setMode("story");
          }}
          onEditor={create}
          onLevels={() => {
            setLevelsVersion((value) => value + 1);
            setMode("levels");
          }}
        />
      ) : null}
      {mode === "story" ? (
        <GameCanvas skipMenu level={currentLevel} onHome={home} />
      ) : null}
      {mode === "editor" ? (
        <div
          className="editor-session"
          inert={Boolean(playtestLevel)}
          aria-hidden={playtestLevel ? true : undefined}
        >
          <EditorRoot
            initialLevel={currentLevel}
            active={!playtestLevel}
            onBack={home}
            onTestPlay={(level) => setPlaytestLevel(structuredClone(level))}
            onStateChange={(editorState) => setCurrentLevel(editorState.level)}
          />
        </div>
      ) : null}
      {playtestLevel ? (
        <div className="playtest-layer">
          <GameCanvas
            skipMenu
            testPlay
            level={playtestLevel}
            onReturnToEditor={() => setPlaytestLevel(null)}
          />
        </div>
      ) : null}
      {mode === "levels" ? (
        <LevelListPanel
          levels={savedLevels}
          onBack={home}
          onCreate={create}
          error={error}
          onEdit={(id) =>
            guarded(() => {
              const level = persistence.loadLevel(id);
              if (!level)
                throw new Error(
                  "레벨을 열 수 없어요. JSON 파일을 확인해 주세요.",
                );
              setCurrentLevel(level);
              setMode("editor");
            })
          }
          onPlay={(id) =>
            guarded(() => {
              const level = persistence.loadLevel(id);
              if (!level) throw new Error("레벨을 열 수 없어요.");
              setCurrentLevel(structuredClone(level));
              setMode("story");
            })
          }
          onDuplicate={(id) =>
            guarded(() => {
              persistence.duplicateLevel(id);
            })
          }
          onExport={exportSavedLevel}
          onDelete={(id) => guarded(() => persistence.deleteLevel(id))}
          onImport={(file) => {
            void file
              .text()
              .then((json) => {
                const imported = persistence.importLevel(json);
                if (!imported.ok) {
                  setError(imported.error ?? "레벨 파일을 열 수 없어요.");
                  return;
                }
                setError("");
                setLevelsVersion((value) => value + 1);
              })
              .catch(() =>
                setError("레벨 파일을 읽을 수 없어요. 파일을 다시 선택하세요."),
              );
          }}
        />
      ) : null}
      {error && mode !== "levels" ? (
        <div className="global-toast" role="status">
          {error}
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="알림 닫기"
          >
            ×
          </button>
        </div>
      ) : null}
    </main>
  );
}
