import { describe, expect, it } from "vitest";
import { createEditorState } from "../../src/editor/schemas/levelDefaults";
import { EditorCommandStack } from "../../src/editor/systems/EditorCommandStack";
import { PlaceObjectCommand } from "../../src/editor/commands/PlaceObjectCommand";
import { DeleteObjectCommand } from "../../src/editor/commands/DeleteObjectCommand";
import { MoveObjectCommand } from "../../src/editor/commands/MoveObjectCommand";
import { UpdateObjectCommand } from "../../src/editor/commands/UpdateObjectCommand";
import { BulkPaintCommand } from "../../src/editor/commands/BulkPaintCommand";
import { DuplicateObjectCommand } from "../../src/editor/commands/DuplicateObjectCommand";
import type { LevelObject } from "../../src/game/data/LevelData";

const shard: LevelObject = {
  id: "seed-1",
  type: "lightSeedShard",
  layer: "items",
  x: 96,
  y: 128,
  width: 32,
  height: 32,
  locked: false,
  visible: true,
  notes: "",
  scoreValue: 100,
  respawnOnDeath: false,
};

describe("editor command stack", () => {
  it("places objects and supports undo and redo", () => {
    const stack = new EditorCommandStack();
    const state = createEditorState();

    const placed = stack.execute(state, new PlaceObjectCommand(shard));
    expect(placed.level.collectibles).toHaveLength(1);
    expect(stack.canUndo()).toBe(true);

    const undone = stack.undo(placed);
    expect(undone.level.collectibles).toHaveLength(0);
    expect(stack.canRedo()).toBe(true);

    const redone = stack.redo(undone);
    expect(redone.level.collectibles).toHaveLength(1);
  });

  it("deletes, moves, and updates selected objects", () => {
    const stack = new EditorCommandStack();
    let state = createEditorState();
    state = stack.execute(state, new PlaceObjectCommand(shard));
    state = stack.execute(
      state,
      new MoveObjectCommand(["seed-1"], { x: 32, y: -32 }),
    );
    expect(state.level.collectibles[0]).toMatchObject({ x: 128, y: 96 });

    state = stack.execute(
      state,
      new UpdateObjectCommand("seed-1", { notes: "hidden route" }),
    );
    expect(state.level.collectibles[0].notes).toBe("hidden route");

    state = stack.execute(state, new DeleteObjectCommand(["seed-1"]));
    expect(state.level.collectibles).toHaveLength(0);

    state = stack.undo(state);
    expect(state.level.collectibles[0].notes).toBe("hidden route");
  });

  it("clears redo when a new command is executed after undo", () => {
    const stack = new EditorCommandStack();
    let state = createEditorState();
    state = stack.execute(state, new PlaceObjectCommand(shard));
    state = stack.undo(state);
    expect(stack.canRedo()).toBe(true);

    state = stack.execute(
      state,
      new PlaceObjectCommand({ ...shard, id: "seed-2", x: 160 }),
    );
    expect(stack.canRedo()).toBe(false);
    expect(state.level.collectibles.map((item) => item.id)).toEqual(["seed-2"]);
  });

  it("groups brush placement into one bulk paint command", () => {
    const stack = new EditorCommandStack();
    const state = createEditorState();
    const next = stack.execute(
      state,
      new BulkPaintCommand([
        { ...shard, id: "seed-1", x: 64 },
        { ...shard, id: "seed-2", x: 96 },
      ]),
    );

    expect(next.level.collectibles).toHaveLength(2);
    expect(stack.undo(next).level.collectibles).toHaveLength(0);
  });

  it("restores the original unique spawn and finish when replacement or duplication is undone", () => {
    for (const field of ["playerSpawn", "finishGate"] as const) {
      const stack = new EditorCommandStack();
      const state = createEditorState();
      const original = state.level[field]!;
      const placed = stack.execute(
        state,
        new PlaceObjectCommand({
          ...original,
          id: `new-${original.id}`,
          x: 256,
        }),
      );
      expect(placed.level[field]?.x).toBe(256);
      const undone = stack.undo(placed);
      expect(undone.level[field]).toEqual(original);
      expect(stack.redo(undone).level[field]?.x).toBe(256);

      const duplicateStack = new EditorCommandStack();
      const copied = duplicateStack.execute(
        state,
        new DuplicateObjectCommand([original.id]),
      );
      expect(copied.level[field]?.id).not.toBe(original.id);
      expect(duplicateStack.undo(copied).level[field]).toEqual(original);
    }
  });
});
