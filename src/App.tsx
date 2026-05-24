import { useEffect, useMemo, useState } from 'react';
import { ControlsHelp } from './components/ControlsHelp';
import { GameCanvas } from './components/GameCanvas';
import { LandingPanel } from './components/LandingPanel';
import { EditorRoot } from './editor/EditorRoot';
import { LevelListPanel } from './editor/components/LevelListPanel';
import { createLevelFromTemplate } from './editor/data/levelTemplates';
import { EditorPersistenceSystem } from './editor/systems/EditorPersistenceSystem';
import { safeLevelFileName } from './editor/systems/EditorSerializationSystem';
import type { LevelData } from './game/data/LevelData';

type AppMode = 'menu' | 'story' | 'editor' | 'levels';

export default function App() {
  const persistence = useMemo(() => new EditorPersistenceSystem(), []);
  const [mode, setMode] = useState<AppMode>('menu');
  const [currentLevel, setCurrentLevel] = useState<LevelData | undefined>();
  const [playtestLevel, setPlaytestLevel] = useState<LevelData | null>(null);
  const [levelsVersion, setLevelsVersion] = useState(0);
  const savedLevels = useMemo(() => persistence.listLevels(), [persistence, levelsVersion]);

  useEffect(() => {
    const handleComplete = (event: Event) => {
      const detail = (event as CustomEvent<{ levelId?: string; score?: number; elapsedSeconds?: number }>).detail;
      if (!detail?.levelId || typeof detail.score !== 'number' || typeof detail.elapsedSeconds !== 'number') {
        return;
      }

      persistence.recordPlayResult(detail.levelId, {
        cleared: true,
        elapsedSeconds: detail.elapsedSeconds,
        score: detail.score
      });
      setLevelsVersion((version) => version + 1);
    };

    window.addEventListener('sky-sprout:level-complete', handleComplete);
    return () => window.removeEventListener('sky-sprout:level-complete', handleComplete);
  }, [persistence]);

  const exportSavedLevel = (levelId: string) => {
    const json = persistence.exportLevel(levelId);
    const level = persistence.loadLevel(levelId);
    if (!json || !level) {
      return;
    }

    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = safeLevelFileName(level.name);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <main className="app-shell" aria-label="Sky Sprout Runner game">
      <LandingPanel />
      {mode === 'menu' ? (
        <section className="main-menu" aria-label="Main menu">
          <h1>Sky Sprout Runner</h1>
          <div className="main-menu__actions">
            <button
              type="button"
              onClick={() => {
                setCurrentLevel(undefined);
                setMode('story');
              }}
            >
              Play Story
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentLevel(createLevelFromTemplate('emptyIsland'));
                setMode('editor');
              }}
            >
              Create Level
            </button>
            <button
              type="button"
              onClick={() => {
                setLevelsVersion((version) => version + 1);
                setMode('levels');
              }}
            >
              My Levels
            </button>
            <button type="button">Controls</button>
            <button type="button">Credits</button>
          </div>
        </section>
      ) : null}

      {mode === 'story' ? <GameCanvas skipMenu level={currentLevel} /> : null}

      {mode === 'editor' ? (
        <EditorRoot
          initialLevel={currentLevel}
          onBack={() => {
            setLevelsVersion((version) => version + 1);
            setMode('menu');
          }}
          onTestPlay={(level) => {
            setCurrentLevel(level);
            setPlaytestLevel(level);
          }}
          onStateChange={(editorState) => setCurrentLevel(editorState.level)}
        />
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

      {mode === 'levels' ? (
        <LevelListPanel
          levels={savedLevels}
          onBack={() => setMode('menu')}
          onEdit={(levelId) => {
            const level = persistence.loadLevel(levelId);
            if (level) {
              setCurrentLevel(level);
              setMode('editor');
            }
          }}
          onPlay={(levelId) => {
            const level = persistence.loadLevel(levelId);
            if (level) {
              setCurrentLevel(level);
              setMode('story');
            }
          }}
          onDuplicate={(levelId) => {
            persistence.duplicateLevel(levelId);
            setLevelsVersion((version) => version + 1);
          }}
          onExport={exportSavedLevel}
          onDelete={(levelId) => {
            persistence.deleteLevel(levelId);
            setLevelsVersion((version) => version + 1);
          }}
          onImport={(file) => {
            void file.text().then((json) => {
              persistence.importLevel(json);
              setLevelsVersion((version) => version + 1);
            });
          }}
        />
      ) : null}

      {mode === 'menu' ? <ControlsHelp /> : null}
    </main>
  );
}
