/** Keep mobile controls in CSS pixels while the world camera adapts independently. */
export function gameViewport(width: number, height: number): { width: number; height: number } {
  const worldHeight = height < 400 ? 400 : 540;
  return { width: Math.round(Math.max(360, Math.min(1440, worldHeight * width / Math.max(height, 1)))), height: worldHeight };
}
