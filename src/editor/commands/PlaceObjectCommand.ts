import type { LevelObject } from "../../game/data/LevelData";
import type { EditorState } from "../schemas/levelDefaults";
import {
  addLevelObject,
  findLevelObject,
  removeLevelObjects,
} from "../utils/levelObjects";
import type { EditorCommand } from "./EditorCommand";

export class PlaceObjectCommand implements EditorCommand {
  readonly id: string;
  readonly label = "Place object";
  private replaced: LevelObject | null = null;

  constructor(private readonly object: LevelObject) {
    this.id = `place-${object.id}`;
  }

  do(state: EditorState): EditorState {
    this.replaced =
      this.object.type === "playerSpawn"
        ? state.level.playerSpawn
        : this.object.type === "windGateFinish"
          ? state.level.finishGate
          : findLevelObject(state.level, this.object.id);
    return {
      ...state,
      level: addLevelObject(
        removeLevelObjects(state.level, [this.object.id]),
        this.object,
      ),
      selectedIds: [this.object.id],
    };
  }

  undo(state: EditorState): EditorState {
    const removed = removeLevelObjects(state.level, [this.object.id]);
    return {
      ...state,
      level: this.replaced ? addLevelObject(removed, this.replaced) : removed,
      selectedIds: this.replaced ? [this.replaced.id] : [],
    };
  }
}
