import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type Phaser from "phaser";
import type {
  EditorLayer,
  LevelData,
  LevelObject,
  PlatformData,
} from "../game/data/LevelData";
import { getLevelObjects } from "../game/data/LevelData";
import { GAME_HEIGHT, GAME_WIDTH } from "../game/config/constants";
import { Modal } from "../ui/components/Modal";
import { DeleteObjectCommand } from "./commands/DeleteObjectCommand";
import { DuplicateObjectCommand } from "./commands/DuplicateObjectCommand";
import { ApplyLevelCommand } from "./commands/ApplyLevelCommand";
import type { EditorCommand } from "./commands/EditorCommand";
import { MoveObjectCommand } from "./commands/MoveObjectCommand";
import { PlaceObjectCommand } from "./commands/PlaceObjectCommand";
import { UpdateObjectCommand } from "./commands/UpdateObjectCommand";
import { EditorEventBus } from "./EditorEventBus";
import { EditorShell } from "./components/EditorShell";
import { LevelSettingsDialog } from "./components/LevelSettingsDialog";
import { ShortcutHelpDialog } from "./components/ShortcutHelpDialog";
import type { CatalogCategory } from "./data/objectCatalog";
import { getCatalogItem } from "./data/objectCatalog";
import { createLevelFromTemplate } from "./data/levelTemplates";
import type {
  EditorState,
  EditorTool,
  ValidationResult,
} from "./schemas/levelDefaults";
import { createEditorState, markDirty } from "./schemas/levelDefaults";
import {
  addWaypoint,
  alignObjects,
  distributeObjects,
  updateLayerState,
  updateManyObjects,
  type Alignment,
  type DistributionAxis,
} from "./systems/EditorAdvancedTools";
import { EditorCommandStack } from "./systems/EditorCommandStack";
import {
  EDITOR_STORAGE_KEYS,
  EditorPersistenceSystem,
} from "./systems/EditorPersistenceSystem";
import {
  safeLevelFileName,
  serializeLevel,
} from "./systems/EditorSerializationSystem";
import { validateEditorLevel } from "./systems/EditorValidationSystem";
import { findLevelObject } from "./utils/levelObjects";
import { shouldIgnoreEditorKey } from "./utils/editorInputGuard";

export type EditorSaveStatus =
  | "saved"
  | "unsaved"
  | "saving"
  | "draft"
  | "error";
interface EditorRootProps {
  initialLevel?: LevelData;
  active?: boolean;
  onBack: () => void;
  onTestPlay: (level: LevelData) => void;
  onStateChange?: (state: EditorState) => void;
}

export function EditorRoot({
  initialLevel,
  active = true,
  onBack,
  onTestPlay,
  onStateChange,
}: EditorRootProps) {
  const persistence = useMemo(() => new EditorPersistenceSystem(), []);
  const [state, setState] = useState(() =>
    createEditorState(initialLevel ?? createLevelFromTemplate("emptyIsland")),
  );
  const [saveStatus, setSaveStatus] = useState<EditorSaveStatus>(() =>
    persistence.loadLevel(state.level.id) ? "saved" : "unsaved",
  );
  const [activeCategory, setActiveCategory] =
    useState<CatalogCategory>("terrain");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState<LevelData | null>(() => {
    let lastId: string | null = null;
    try {
      lastId = localStorage.getItem(EDITOR_STORAGE_KEYS.lastOpened);
    } catch {
      /* Storage can be disabled. */
    }
    const candidate =
      persistence.recoverDraft(state.level.id) ??
      (lastId ? persistence.recoverDraft(lastId) : null);
    return candidate &&
      (candidate.id !== state.level.id ||
        (candidate.updatedAt >= state.level.updatedAt &&
          serializeLevel(candidate) !== serializeLevel(state.level)))
      ? candidate
      : null;
  });
  const busRef = useRef(new EditorEventBus());
  const stackRef = useRef(new EditorCommandStack());
  const stateRef = useRef(state);
  const activeRef = useRef(active);
  const gameRef = useRef<Phaser.Game | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const callbacksRef = useRef({ onStateChange, onTestPlay });
  const firstDraftAt = useRef<number | null>(null);
  activeRef.current = active;
  callbacksRef.current = { onStateChange, onTestPlay };

  // Commands mutate history. Run them once outside React's replayable state updaters.
  const commit = useCallback(
    (updater: (previous: EditorState) => EditorState) => {
      const next = updater(stateRef.current);
      stateRef.current = next;
      setState(next);
    },
    [],
  );
  const execute = useCallback(
    (command: EditorCommand) => {
      if (!activeRef.current) return;
      commit((previous) => ({
        ...stackRef.current.execute(previous, command),
        validationResults: [],
      }));
      setSaveStatus("unsaved");
    },
    [commit],
  );
  const undo = useCallback(() => {
    if (!activeRef.current || !stackRef.current.canUndo()) return;
    commit((previous) => ({
      ...stackRef.current.undo(previous),
      validationResults: [],
    }));
    setSaveStatus("unsaved");
  }, [commit]);
  const redo = useCallback(() => {
    if (!activeRef.current || !stackRef.current.canRedo()) return;
    commit((previous) => ({
      ...stackRef.current.redo(previous),
      validationResults: [],
    }));
    setSaveStatus("unsaved");
  }, [commit]);
  const saveLevel = useCallback(() => {
    if (!activeRef.current) return;
    setSaveStatus("saving");
    try {
      const saved = persistence.saveLevel(stateRef.current.level);
      commit((previous) => ({ ...previous, level: saved, dirty: false }));
      firstDraftAt.current = null;
      setSaveStatus("saved");
      setNotice("저장했어요. 내 레벨에서 다시 열 수 있어요.");
      try {
        persistence.clearDraft(saved.id);
      } catch {
        /* A stale draft is harmless; timestamps prevent recovery. */
      }
    } catch {
      commit((previous) => ({ ...previous, dirty: true }));
      setSaveStatus("error");
      setNotice("저장하지 못했어요. JSON으로 내보내 작업을 보관하세요.");
    }
  }, [commit, persistence]);
  const setTool = useCallback(
    (tool: EditorTool) =>
      commit((previous) => ({ ...previous, activeTool: tool })),
    [commit],
  );
  const duplicateSelection = useCallback(() => {
    const current = stateRef.current;
    if (current.selectedIds.length)
      execute(
        new DuplicateObjectCommand(current.selectedIds, {
          x: current.grid.tileSize,
          y: 0,
        }),
      );
  }, [execute]);
  const deleteSelection = useCallback(() => {
    const ids = stateRef.current.selectedIds;
    if (ids.length) execute(new DeleteObjectCommand(ids));
  }, [execute]);
  const testPlay = useCallback(() => {
    if (activeRef.current)
      callbacksRef.current.onTestPlay(structuredClone(stateRef.current.level));
  }, []);

  useEffect(() => {
    if (!hostRef.current || gameRef.current) return;
    let cancelled = false;
    let observer: ResizeObserver | undefined;
    const host = hostRef.current;
    void import("./scenes/EditorScene")
      .then(({ createEditorGame }) => {
        if (cancelled || gameRef.current) return;
        gameRef.current = createEditorGame(
          host,
          busRef.current,
          stateRef.current,
          { width: GAME_WIDTH, height: GAME_HEIGHT },
        );
        busRef.current.emit("input:enabled", activeRef.current);
        const resize = () => {
          const game = gameRef.current;
          if (game?.isBooted && host.clientWidth > 0 && host.clientHeight > 0) {
            game.scale.resize(host.clientWidth, host.clientHeight);
          }
        };
        observer = new ResizeObserver(resize);
        observer.observe(host);
        gameRef.current.events.once("ready", resize);
        resize();
      })
      .catch(() =>
        setNotice(
          "편집 화면을 불러오지 못했어요. 새로고침 후 다시 시도하세요.",
        ),
      );
    return () => {
      cancelled = true;
      observer?.disconnect();
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    const bus = busRef.current;
    const off = [
      bus.on("place", ({ x, y }) => {
        if (!activeRef.current) return;
        const current = stateRef.current;
        const item = getCatalogItem(
          current.activePaletteItemId ?? "skyGrassBlock",
        );
        if (
          !item ||
          current.layers[item.category].locked ||
          !current.layers[item.category].visible
        )
          return;
        const object = item.createObject(x, y, current.grid.tileSize);
        if (
          getLevelObjects(current.level).some(
            (existing) =>
              existing.type === object.type &&
              existing.layer === object.layer &&
              Math.abs(existing.x - object.x) < 1 &&
              Math.abs(existing.y - object.y) < 1,
          ) &&
          object.type !== "playerSpawn" &&
          object.type !== "windGateFinish"
        )
          return;
        execute(new PlaceObjectCommand(object));
      }),
      bus.on("select", ({ ids }) => {
        if (activeRef.current)
          commit((previous) => ({ ...previous, selectedIds: ids }));
      }),
      bus.on("move", ({ ids, delta }) =>
        execute(new MoveObjectCommand(ids, delta)),
      ),
      bus.on("delete", ({ ids }) => execute(new DeleteObjectCommand(ids))),
      bus.on("path:addWaypoint", ({ x, y }) => {
        const current = stateRef.current;
        const object =
          current.selectedIds.length === 1
            ? findLevelObject(current.level, current.selectedIds[0])
            : null;
        if (!object || object.type !== "movingBreezePlatform") return;
        const next = addWaypoint(object as PlatformData, { x, y });
        execute(
          new UpdateObjectCommand(object.id, {
            waypoints: next.waypoints,
          } as Partial<LevelObject>),
        );
      }),
      bus.on("camera", (camera) => {
        if (activeRef.current) commit((previous) => ({ ...previous, camera }));
      }),
    ];
    return () => off.forEach((unsubscribe) => unsubscribe());
  }, [commit, execute]);
  useEffect(() => {
    busRef.current.emit("state:changed", state);
    callbacksRef.current.onStateChange?.(state);
  }, [state]);
  useEffect(() => {
    busRef.current.emit(
      "input:enabled",
      active && !settingsOpen && !helpOpen && !leaveOpen,
    );
  }, [active, settingsOpen, helpOpen, leaveOpen]);

  useEffect(() => {
    if (!state.dirty || !active) {
      if (!state.dirty) firstDraftAt.current = null;
      return;
    }
    firstDraftAt.current ??= Date.now();
    const delay = Math.max(
      0,
      Math.min(2000, 10000 - (Date.now() - firstDraftAt.current)),
    );
    const timer = window.setTimeout(() => {
      try {
        persistence.autosaveDraft(stateRef.current.level);
        setSaveStatus((previous) =>
          previous === "error" ? previous : "draft",
        );
      } catch {
        setSaveStatus("error");
        setNotice("임시 보관에 실패했어요. JSON으로 내보내 작업을 보관하세요.");
      }
      firstDraftAt.current = null;
    }, delay);
    return () => window.clearTimeout(timer);
  }, [active, persistence, state.dirty, state.level]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        !active ||
        shouldIgnoreEditorKey(event, settingsOpen || helpOpen || leaveOpen)
      )
        return;
      const meta = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      if (meta && key === "s") {
        event.preventDefault();
        saveLevel();
      } else if (meta && key === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if (meta && key === "y") {
        event.preventDefault();
        redo();
      } else if (meta && key === "d") {
        event.preventDefault();
        duplicateSelection();
      } else if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelection();
      } else if (!meta && !event.altKey) {
        const tools: Record<string, EditorTool> = {
          v: "select",
          b: "brush",
          e: "erase",
          r: "rectangle",
          h: "pan",
          p: "path",
        };
        if (tools[key]) setTool(tools[key]);
        else if (key === "t") testPlay();
        else if (key === "g")
          commit((previous) => ({
            ...previous,
            grid: { ...previous.grid, visible: !previous.grid.visible },
          }));
        else if (key === "s")
          commit((previous) => ({
            ...previous,
            grid: { ...previous.grid, snap: !previous.grid.snap },
          }));
      }
    };
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (stateRef.current.dirty) event.preventDefault();
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [
    active,
    commit,
    deleteSelection,
    duplicateSelection,
    helpOpen,
    leaveOpen,
    redo,
    saveLevel,
    setTool,
    settingsOpen,
    testPlay,
    undo,
  ]);

  const updateLevel = (level: LevelData) => {
    execute(new ApplyLevelCommand("섬 설정 변경", level, []));
  };
  const updateLayers = (
    layerId: EditorLayer,
    changes: Partial<{ visible: boolean; locked: boolean; active: boolean }>,
  ) => {
    commit((previous) => ({
      ...previous,
      layers: updateLayerState(previous.layers, layerId, changes),
      selectedIds:
        changes.visible === false || changes.locked === true
          ? previous.selectedIds.filter(
              (id) => findLevelObject(previous.level, id)?.layer !== layerId,
            )
          : previous.selectedIds,
    }));
  };
  const exportLevel = () => {
    const link = document.createElement("a");
    const url = URL.createObjectURL(
      new Blob([serializeLevel(stateRef.current.level)], {
        type: "application/json",
      }),
    );
    link.href = url;
    link.download = safeLevelFileName(stateRef.current.level.name);
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("현재 작업을 JSON 파일로 내보냈어요.");
  };
  const applySelection = (label: string, level: LevelData) =>
    execute(new ApplyLevelCommand(label, level, state.selectedIds));
  const selectedObject =
    state.selectedIds.length === 1
      ? findLevelObject(state.level, state.selectedIds[0])
      : null;
  return (
    <div className="editor-session" inert={!active} aria-hidden={!active}>
      <EditorShell
        state={state}
        saveStatus={saveStatus}
        notice={notice}
        activeCategory={activeCategory}
        selectedObject={selectedObject}
        canUndo={stackRef.current.canUndo()}
        canRedo={stackRef.current.canRedo()}
        canvasRef={(node) => {
          hostRef.current = node;
        }}
        onBack={() => {
          if (stateRef.current.dirty) setLeaveOpen(true);
          else onBack();
        }}
        onSave={saveLevel}
        onUndo={undo}
        onRedo={redo}
        onTest={testPlay}
        onTool={setTool}
        onGrid={() =>
          commit((previous) => ({
            ...previous,
            grid: { ...previous.grid, visible: !previous.grid.visible },
          }))
        }
        onSnap={() =>
          commit((previous) => ({
            ...previous,
            grid: { ...previous.grid, snap: !previous.grid.snap },
          }))
        }
        onValidate={() =>
          commit((previous) => ({
            ...previous,
            validationResults: validateEditorLevel(previous.level),
          }))
        }
        onExport={exportLevel}
        onSettings={() => setSettingsOpen(true)}
        onHelp={() => setHelpOpen(true)}
        onCategoryChange={(category) => {
          setActiveCategory(category);
          updateLayers(category, { active: true });
        }}
        onLayerChange={updateLayers}
        onFocusPoint={(point) => busRef.current.emit("focus", point)}
        onPaletteItem={(itemId) => {
          const item = getCatalogItem(itemId);
          commit((previous) => ({
            ...previous,
            activePaletteItemId: itemId,
            activeTool: "brush",
            layers: item
              ? updateLayerState(previous.layers, item.category, {
                  active: true,
                })
              : previous.layers,
          }));
        }}
        onPropertyChange={(id, changes) =>
          execute(new UpdateObjectCommand(id, changes))
        }
        onMultiPropertyChange={(changes) => {
          if (state.selectedIds.length > 1)
            applySelection(
              "선택 항목 수정",
              updateManyObjects(state.level, state.selectedIds, changes),
            );
        }}
        onAlign={(alignment: Alignment) =>
          applySelection(
            "선택 항목 정렬",
            alignObjects(state.level, state.selectedIds, alignment),
          )
        }
        onDistribute={(axis: DistributionAxis) =>
          applySelection(
            "선택 항목 간격 맞추기",
            distributeObjects(state.level, state.selectedIds, axis),
          )
        }
        onDuplicate={duplicateSelection}
        onDelete={deleteSelection}
        onFocusResult={(result: ValidationResult) => {
          const object = result.objectId
            ? findLevelObject(state.level, result.objectId)
            : null;
          if (object) {
            commit((previous) => ({ ...previous, selectedIds: [object.id] }));
            busRef.current.emit("focus", { x: object.x, y: object.y });
          }
        }}
        recovery={
          draft ? (
            <div className="editor-recovery" role="status">
              <span>임시 보관한 ‘{draft.name}’ 작업이 있어요.</span>
              <button
                type="button"
                data-testid="editor-recover-draft"
                onClick={() => {
                  commit(() => markDirty(createEditorState(draft)));
                  stackRef.current.clear();
                  setDraft(null);
                  setSaveStatus("unsaved");
                }}
              >
                작업 복구
              </button>
              <button type="button" onClick={() => setDraft(null)}>
                나중에
              </button>
            </div>
          ) : null
        }
      />
      {active && (
        <LevelSettingsDialog
          level={state.level}
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          onChange={updateLevel}
          onTemplate={(id) => updateLevel(createLevelFromTemplate(id))}
        />
      )}
      {active && (
        <ShortcutHelpDialog
          open={helpOpen}
          onClose={() => setHelpOpen(false)}
        />
      )}
      {active && leaveOpen && (
        <Modal title="작업을 나갈까요?" onClose={() => setLeaveOpen(false)}>
          <p>
            아직 저장하지 않은 변경이 있어요. 저장하거나 JSON으로 보관한 뒤 나갈
            수 있어요.
          </p>
          <div className="dialog-actions">
            <button type="button" onClick={() => setLeaveOpen(false)}>
              계속 편집
            </button>
            <button
              type="button"
              onClick={() => {
                exportLevel();
              }}
            >
              JSON 내보내기
            </button>
            <button type="button" className="button--danger" onClick={onBack}>
              저장 없이 나가기
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
