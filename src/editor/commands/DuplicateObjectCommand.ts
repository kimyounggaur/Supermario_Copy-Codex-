import type { LevelObject } from "../../game/data/LevelData";
import type { EditorState } from "../schemas/levelDefaults";
import {
  addLevelObject,
  cloneObjects,
  removeLevelObjects,
} from "../utils/levelObjects";
import { createId } from "../utils/idFactory";
import type { EditorCommand } from "./EditorCommand";

export class DuplicateObjectCommand implements EditorCommand {
  readonly id: string;
  readonly label = "Duplicate object";
  private duplicates: LevelObject[] = [];
  private replacedSingletons: LevelObject[] = [];

  constructor(
    private readonly ids: string[],
    private readonly offset = { x: 32, y: 0 },
  ) {
    this.id = `duplicate-${ids.join("-")}`;
  }

  do(state: EditorState): EditorState {
    if (this.duplicates.length === 0) {
      this.duplicates = cloneObjects(state.level, this.ids).map((object) => ({
        ...object,
        id: createId(object.type),
        x: object.x + this.offset.x,
        y: object.y + this.offset.y,
      }));
    }
    this.replacedSingletons = [
      ...(this.duplicates.some((object) => object.type === "playerSpawn") &&
      state.level.playerSpawn
        ? [state.level.playerSpawn]
        : []),
      ...(this.duplicates.some((object) => object.type === "windGateFinish") &&
      state.level.finishGate
        ? [state.level.finishGate]
        : []),
    ];

    return {
      ...state,
      level: this.duplicates.reduce(
        (level, object) => addLevelObject(level, object),
        state.level,
      ),
      selectedIds: this.duplicates.map((object) => object.id),
    };
  }

  undo(state: EditorState): EditorState {
    const removed = removeLevelObjects(
      state.level,
      this.duplicates.map((object) => object.id),
    );
    return {
      ...state,
      level: this.replacedSingletons.reduce(
        (level, object) => addLevelObject(level, object),
        removed,
      ),
      selectedIds: this.ids,
    };
  }
}
