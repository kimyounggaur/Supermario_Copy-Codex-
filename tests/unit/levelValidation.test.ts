import { describe, expect, it } from 'vitest';
import { level1 } from '../../src/game/data/levels/level1';
import type { LevelData } from '../../src/game/types';
import { validateLevelData } from '../../src/game/systems/levelValidation';

describe('level validation', () => {
  it('accepts the first stage data', () => {
    expect(validateLevelData(level1)).toEqual([]);
  });

  it('requires start, checkpoint, and finish to form a basic route', () => {
    expect(level1.start.x).toBeLessThan(level1.finishGate.x);
    expect(level1.checkpoints.length).toBeGreaterThan(0);
    expect(level1.terrain.length).toBeGreaterThan(0);
  });

  it('includes interactive rune boxes embedded between sky bricks', () => {
    const runeBoxes = level1.terrain.filter((terrain) => terrain.kind === 'runeBox');
    const skyBricks = level1.terrain.filter((terrain) => terrain.kind === 'skyBrick');

    expect(runeBoxes.length).toBeGreaterThanOrEqual(5);
    expect(skyBricks.length).toBeGreaterThan(runeBoxes.length);
    expect(
      runeBoxes.every((runeBox) =>
        skyBricks.some(
          (skyBrick) => skyBrick.y === runeBox.y && Math.abs(skyBrick.x - runeBox.x) === 44
        )
      )
    ).toBe(true);
  });

  it('detects duplicate entity ids', () => {
    const duplicated: LevelData = {
      ...level1,
      collectibles: [
        ...level1.collectibles,
        { ...level1.collectibles[0], x: level1.collectibles[0].x + 12 }
      ]
    };

    expect(validateLevelData(duplicated)).toContain(`Duplicate id: ${level1.collectibles[0].id}`);
  });
});
