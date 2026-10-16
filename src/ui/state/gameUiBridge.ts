import type {
  GameStateName,
  HudPayload,
  LevelCompletePayload,
} from "../../game/types";
import { TouchInputState } from "./touchInputState";

export type UiCommand =
  | "pause"
  | "resume"
  | "restart"
  | "home"
  | "return-editor";
export interface GameUiSnapshot {
  state: GameStateName | "loading" | "error";
  hud: HudPayload | null;
  result: LevelCompletePayload | null;
  progress: number;
  missing: string[];
  levelId: string;
  testPlay: boolean;
}

/** One bridge per mounted game. No cross-session game state singleton. */
export class GameUiBridge {
  readonly touch = new TouchInputState();
  private snapshot: GameUiSnapshot;
  private listeners = new Set<() => void>();
  private commandHandler?: (command: UiCommand) => void;
  onExit?: (destination: "home" | "editor") => void;

  constructor(testPlay = false) {
    this.snapshot = {
      state: "loading",
      hud: null,
      result: null,
      progress: 0,
      missing: [],
      levelId: "",
      testPlay,
    };
  }
  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  patch(values: Partial<GameUiSnapshot>): void {
    if (
      Object.entries(values).every(
        ([key, value]) => this.snapshot[key as keyof GameUiSnapshot] === value,
      )
    )
      return;
    this.snapshot = { ...this.snapshot, ...values };
    this.listeners.forEach((listener) => listener());
  }
  updateHud(hud: HudPayload): void {
    const previous = this.snapshot.hud;
    if (
      previous &&
      Object.keys(hud).every(
        (key) =>
          previous[key as keyof HudPayload] === hud[key as keyof HudPayload],
      )
    )
      return;
    this.patch({ hud });
  }
  bindCommands(handler: (command: UiCommand) => void): () => void {
    this.commandHandler = handler;
    return () => {
      if (this.commandHandler === handler) this.commandHandler = undefined;
    };
  }
  request(command: UiCommand): void {
    this.commandHandler?.(command);
  }
  dispose(): void {
    this.touch.clear();
    this.commandHandler = undefined;
    this.onExit = undefined;
    this.listeners.clear();
  }
}

export function getGameBridge(game: {
  registry: { get: (key: string) => unknown };
}): GameUiBridge | undefined {
  return game.registry.get("uiBridge") as GameUiBridge | undefined;
}
