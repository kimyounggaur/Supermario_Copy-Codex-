import { useEffect, useMemo, useState } from 'react';
import { ControlsHelp } from './components/ControlsHelp';
import { GameCanvas } from './components/GameCanvas';
import { LandingPanel } from './components/LandingPanel';
import { TextureGallery } from './components/TextureGallery';
import { EditorRoot } from './editor/EditorRoot';
import { LevelListPanel } from './editor/components/LevelListPanel';
import { createLevelFromTemplate } from './editor/data/levelTemplates';
import { EditorPersistenceSystem } from './editor/systems/EditorPersistenceSystem';
import { safeLevelFileName } from './editor/systems/EditorSerializationSystem';
import type { LevelData } from './game/data/LevelData';
import { ART_BASE } from './render/ArtAssets';

type AppMode = 'menu' | 'story' | 'editor' | 'levels';
type MenuPanel = 'controls' | 'credits' | null;

export default function App() {
  const isTextureGallery = window.location.pathname === '/debug/texture-gallery';
  const persistence = useMemo(() => new EditorPersistenceSystem(), []);
  const [mode, setMode] = useState<AppMode>('menu');
  const [currentLevel, setCurrentLevel] = useState<LevelData | undefined>();
  const [playtestLevel, setPlaytestLevel] = useState<LevelData | null>(null);
  const [levelsVersion, setLevelsVersion] = useState(0);
  const [menuPanel, setMenuPanel] = useState<MenuPanel>(null);
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
      {isTextureGallery ? <TextureGallery /> : null}
      {!isTextureGallery ? (
        <>
      <LandingPanel />
      {mode === 'menu' ? (
        <section className="main-menu" aria-label="Main menu">
          <div className="menu-world" aria-hidden="true">
            <img className="menu-world__island" src={`${ART_BASE}raster/platform-meadow.webp`} alt="" />
            <img className="menu-world__sprout" src={`${ART_BASE}raster/sprout-jump.webp`} alt="" />
            <img className="menu-world__seed menu-world__seed--one" src={`${ART_BASE}raster/light-seed.webp`} alt="" />
            <img className="menu-world__seed menu-world__seed--two" src={`${ART_BASE}raster/light-seed.webp`} alt="" />
            <img className="menu-world__seed menu-world__seed--three" src={`${ART_BASE}raster/light-seed.webp`} alt="" />
          </div>
          <div className="menu-copy">
          <p className="menu-eyebrow">A LITTLE SPROUT. A SKY FULL OF WONDER.</p>
          <h1>Sky Sprout<span>Runner</span></h1>
          <p className="menu-subtitle">작은 새싹의 커다란 하늘섬 모험.<br />빛의 씨앗을 모으고, 바람을 타고 도약해요.</p>
          <div className="main-menu__actions">
            <button
              type="button"
              className="sprout-primary" aria-label="Play Story"
              onClick={() => {
                setCurrentLevel(undefined);
                setMode('story');
              }}
            >
              모험 시작하기 <span>→</span>
            </button>
            <button
              type="button"
              aria-label="Create Level"
              onClick={() => {
                setCurrentLevel(createLevelFromTemplate('emptyIsland'));
                setMode('editor');
              }}
            >
              나만의 섬 만들기
            </button>
            <button
              type="button"
              aria-label="My Levels"
              onClick={() => {
                setLevelsVersion((version) => version + 1);
                setMode('levels');
              }}
            >
              내 하늘섬
            </button>
            <button type="button" aria-label="Controls" onClick={() => setMenuPanel('controls')}>
              조작 방법
            </button>
            <button type="button" aria-label="Credits" onClick={() => setMenuPanel('credits')}>
              게임 소개
            </button>
          </div>
          <p className="menu-footnote">키보드와 터치로 가볍게 플레이</p>
          </div>
          {menuPanel ? (
            <div
              className="menu-modal"
              role="dialog"
              aria-modal="true"
              aria-label={menuPanel === 'controls' ? 'Controls' : 'Credits'}
            >
              <div className="menu-modal__body">
                {menuPanel === 'controls' ? (
                  <>
                    <h2>조작 방법</h2>
                    <p>← → 또는 A · D로 이동하고, Space · W · ↑로 점프해요. 공중에서 한 번 더 점프할 수 있어요.</p>
                    <p>Shift를 누르면 달리기, ↓는 웅크리기. P · Esc로 일시정지하고 R로 체크포인트에서 다시 시작해요.</p>
                    <p>모바일에서는 아래 버튼을 길게 누르세요. 이동과 점프를 함께 누를 수 있어요.</p>
                  </>
                ) : (
                  <>
                    <h2>Sky Sprout Runner</h2>
                    <p>새싹과 함께 빛의 씨앗을 찾아 떠나는 오리지널 하늘섬 플랫폼 게임입니다.</p>
                    <p>React · Phaser · Sky Forge 에디터로 만들었습니다. 새 일러스트와 UI 에셋은 이 게임을 위해 제작했습니다.</p>
                  </>
                )}
                <button type="button" onClick={() => setMenuPanel(null)}>
                  닫기
                </button>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {mode === 'story' ? <GameCanvas skipMenu level={currentLevel} onExit={() => setMode('menu')} /> : null}

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
        </>
      ) : null}
    </main>
  );
}
