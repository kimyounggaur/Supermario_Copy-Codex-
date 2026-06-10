export type Radius = number | [number, number, number, number];

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ColorStop {
  offset: number;
  color: string;
}

export function roundRectPath(
  _ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: Radius
): Path2D {
  const [tl, tr, br, bl] = Array.isArray(radius)
    ? radius
    : [radius, radius, radius, radius];
  const path = new Path2D();
  path.moveTo(x + tl, y);
  path.lineTo(x + w - tr, y);
  path.quadraticCurveTo(x + w, y, x + w, y + tr);
  path.lineTo(x + w, y + h - br);
  path.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
  path.lineTo(x + bl, y + h);
  path.quadraticCurveTo(x, y + h, x, y + h - bl);
  path.lineTo(x, y + tl);
  path.quadraticCurveTo(x, y, x + tl, y);
  path.closePath();
  return path;
}

export function fillLinearGradient(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  stops: ColorStop[],
  angleDeg: number
): void {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const length = Math.hypot(width, height);
  const angle = (angleDeg * Math.PI) / 180;
  const cx = width / 2;
  const cy = height / 2;
  const dx = Math.cos(angle) * length * 0.5;
  const dy = Math.sin(angle) * length * 0.5;
  const gradient = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
  stops.forEach((stop) => gradient.addColorStop(stop.offset, stop.color));
  ctx.save();
  ctx.fillStyle = gradient;
  ctx.fill(path);
  ctx.restore();
}

export function fillRadialGradient(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  stops: ColorStop[]
): void {
  const gradient = ctx.createRadialGradient(cx, cy, innerR, cx, cy, outerR);
  stops.forEach((stop) => gradient.addColorStop(stop.offset, stop.color));
  ctx.save();
  ctx.fillStyle = gradient;
  ctx.fill(path);
  ctx.restore();
}

export function bevel(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  opts: { lightColor: string; darkColor: string; thickness: number }
): void {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = opts.thickness;
  ctx.strokeStyle = opts.lightColor;
  ctx.beginPath();
  ctx.moveTo(rect.x + opts.thickness, rect.y + rect.h - opts.thickness);
  ctx.lineTo(rect.x + opts.thickness, rect.y + opts.thickness);
  ctx.lineTo(rect.x + rect.w - opts.thickness, rect.y + opts.thickness);
  ctx.stroke();

  ctx.strokeStyle = opts.darkColor;
  ctx.beginPath();
  ctx.moveTo(rect.x + rect.w - opts.thickness, rect.y + opts.thickness);
  ctx.lineTo(rect.x + rect.w - opts.thickness, rect.y + rect.h - opts.thickness);
  ctx.lineTo(rect.x + opts.thickness, rect.y + rect.h - opts.thickness);
  ctx.stroke();
  ctx.restore();
}

export function specularBand(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  angleDeg: number,
  color: string,
  alpha: number,
  blur: number
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate((angleDeg * Math.PI) / 180);
  if ('filter' in ctx) {
    ctx.filter = `blur(${blur}px)`;
  }
  const gradient = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  gradient.addColorStop(0, `${color}00`);
  gradient.addColorStop(0.42, `${color}00`);
  gradient.addColorStop(0.5, color);
  gradient.addColorStop(0.58, `${color}00`);
  gradient.addColorStop(1, `${color}00`);
  ctx.fillStyle = gradient;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.restore();
}

export function glossDot(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  alpha = 0.7,
  color = '#FFFFFF'
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, -0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function softShadow(
  ctx: CanvasRenderingContext2D,
  drawFn: () => void,
  opts: { blur: number; offsetX: number; offsetY: number; color: string }
): void {
  ctx.save();
  ctx.shadowBlur = opts.blur;
  ctx.shadowOffsetX = opts.offsetX;
  ctx.shadowOffsetY = opts.offsetY;
  ctx.shadowColor = opts.color;
  drawFn();
  ctx.restore();
}

export function ambientOcclusion(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  depth: number,
  alpha: number
): void {
  const gradient = ctx.createLinearGradient(0, ctx.canvas.height - depth, 0, ctx.canvas.height);
  gradient.addColorStop(0, `rgba(0,0,0,0)`);
  gradient.addColorStop(1, `rgba(0,0,0,${alpha})`);
  ctx.save();
  ctx.clip(path);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, ctx.canvas.height - depth, ctx.canvas.width, depth);
  ctx.restore();
}

export function speckle(
  ctx: CanvasRenderingContext2D,
  area: Rect,
  count: number,
  color: string,
  sizeRange: [number, number],
  seed: number
): void {
  let nextSeed = seed >>> 0;
  const random = () => {
    nextSeed = (nextSeed * 1664525 + 1013904223) >>> 0;
    return nextSeed / 4294967296;
  };

  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < count; i += 1) {
    const r = sizeRange[0] + random() * (sizeRange[1] - sizeRange[0]);
    const x = area.x + random() * area.w;
    const y = area.y + random() * area.h;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.75 + random() * 0.5), random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
