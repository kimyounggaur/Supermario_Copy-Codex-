import type { EditorState } from "./schemas/levelDefaults";

export interface EditorBusEvents {
  "input:enabled": boolean;
  "state:changed": EditorState;
  place: { x: number; y: number };
  select: { ids: string[]; additive: boolean };
  move: { ids: string[]; delta: { x: number; y: number } };
  delete: { ids: string[] };
  "path:addWaypoint": { x: number; y: number };
  cursor: { x: number; y: number };
  camera: { x: number; y: number; zoom: number };
  focus: { x: number; y: number };
  thumbnail: { dataUrl: string };
}

export class EditorEventBus {
  inputEnabled = true;
  stateSnapshot?: EditorState;
  private readonly target = new EventTarget();

  on<K extends keyof EditorBusEvents>(
    type: K,
    listener: (payload: EditorBusEvents[K]) => void,
  ): () => void {
    const handler = (event: Event) =>
      listener((event as CustomEvent<EditorBusEvents[K]>).detail);
    this.target.addEventListener(type, handler);
    return () => this.target.removeEventListener(type, handler);
  }

  emit<K extends keyof EditorBusEvents>(
    type: K,
    payload: EditorBusEvents[K],
  ): void {
    if (type === "input:enabled") this.inputEnabled = payload as boolean;
    if (type === "state:changed") this.stateSnapshot = payload as EditorState;
    this.target.dispatchEvent(new CustomEvent(type, { detail: payload }));
  }
}
