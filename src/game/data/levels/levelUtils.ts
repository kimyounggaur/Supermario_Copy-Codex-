import type { TerrainDef } from '../../types';

export type FloatingBlockKind = Extract<TerrainDef['kind'], 'skyBrick' | 'runeBox'>;

export const FBS = 44;

export function floatingBlockCluster(
  id: string,
  startX: number,
  y: number,
  pattern: FloatingBlockKind[]
): TerrainDef[] {
  return pattern.map((kind, index) => ({
    id: `${id}-${index + 1}`,
    kind,
    x: startX + index * FBS,
    y,
    width: FBS,
    height: FBS
  }));
}
