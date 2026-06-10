import {
  ambientOcclusion,
  bevel,
  fillLinearGradient,
  fillRadialGradient,
  glossDot,
  roundRectPath,
  softShadow,
  speckle,
  specularBand
} from './PaintKit';
import type { Palette } from './palette';
import type { TextureDrawFn, TextureVariant } from './TextureFactory';

export interface TextureDefinition {
  id: string;
  baseSize: number;
  superSample: number;
  variants: TextureVariant[];
  draw: TextureDrawFn;
}

const DEFAULT_VARIANTS: TextureVariant[] = ['tile16', 'icon32', 'retina2x'];

export function createTextureDefinitions(): TextureDefinition[] {
  return [
    texture('sprout-idle', (ctx, size, palette) => drawSprout(ctx, size, palette, 0, false, false)),
    texture('sprout-run', (ctx, size, palette) => drawSprout(ctx, size, palette, 4, false, false)),
    texture('sprout-jump', (ctx, size, palette) => drawSprout(ctx, size, palette, -2, false, false)),
    texture('sprout-fall', (ctx, size, palette) => drawSprout(ctx, size, palette, 3, false, false)),
    texture('sprout-hurt', (ctx, size, palette) => drawSprout(ctx, size, palette, 0, true, false)),
    texture('sprout-wall', (ctx, size, palette) => drawSprout(ctx, size, palette, -5, false, false)),
    texture('sprout-crouch', (ctx, size, palette) => drawSprout(ctx, size, palette, 0, false, true)),
    texture('terrain-grass', drawGrassBlock),
    texture('terrain-stone', drawStoneBlock),
    texture('terrain-cloud', drawCloudBlock),
    texture('terrain-sky-brick', drawSkyBrick),
    texture('terrain-rune-box', drawRuneBox),
    texture('terrain-rune-box-used', drawUsedRuneBox),
    texture('moving-platform', drawMovingPlatform),
    texture('light-seed-shard', drawLightSeed),
    texture('big-light-seed', drawBigLightSeed),
    texture('breeze-orb', drawBreezeOrb),
    texture('growth-bud', drawGrowthBud),
    texture('drift-bug', drawDriftBug),
    texture('puff-hopper', drawPuffHopper),
    texture('wind-wisp', drawWindWisp),
    texture('thorn-crystal', drawThornCrystal),
    texture('gust-vent', drawGustVent),
    texture('void-zone', drawVoidZone),
    texture('glow-lantern', (ctx, size, palette) => drawLantern(ctx, size, palette, false)),
    texture('glow-lantern-active', (ctx, size, palette) => drawLantern(ctx, size, palette, true)),
    texture('wind-gate', drawWindGate),
    texture('player-spawn', drawPlayerSpawn),
    texture('cloud-tuft', drawCloudTuft),
    texture('tiny-sprout', drawTinySprout),
    texture('wind-ribbon', drawWindRibbon),
    texture('distant-star', drawDistantStar),
    texture('floating-pebble', drawFloatingPebble),
    texture('dust-particle', drawDustParticle),
    texture('spark-particle', drawSparkParticle),
    texture('leaf-particle', drawLeafParticle)
  ];
}

export function textureKeyForObjectType(type: string): string {
  switch (type) {
    case 'skyGrassBlock':
      return 'terrain-grass';
    case 'stoneRootBlock':
      return 'terrain-stone';
    case 'softCloudBlock':
    case 'oneWayCloudPlatform':
      return 'terrain-cloud';
    case 'staticFloatingPlatform':
    case 'movingBreezePlatform':
    case 'fallingCloudPlatform':
      return 'moving-platform';
    case 'lightSeedShard':
      return 'light-seed-shard';
    case 'bigLightSeed':
      return 'big-light-seed';
    case 'breezeOrb':
      return 'breeze-orb';
    case 'driftBug':
      return 'drift-bug';
    case 'puffHopper':
      return 'puff-hopper';
    case 'windWisp':
      return 'wind-wisp';
    case 'thornCrystal':
      return 'thorn-crystal';
    case 'gustVent':
      return 'gust-vent';
    case 'voidZone':
      return 'void-zone';
    case 'playerSpawn':
      return 'player-spawn';
    case 'glowLanternCheckpoint':
      return 'glow-lantern';
    case 'windGateFinish':
      return 'wind-gate';
    case 'cloudTuft':
      return 'cloud-tuft';
    case 'tinySprout':
      return 'tiny-sprout';
    case 'windRibbon':
      return 'wind-ribbon';
    case 'distantStar':
      return 'distant-star';
    case 'floatingPebble':
      return 'floating-pebble';
    default:
      return 'terrain-grass';
  }
}

function texture(id: string, draw: TextureDrawFn): TextureDefinition {
  return { id, draw, baseSize: 32, superSample: 4, variants: DEFAULT_VARIANTS };
}

function u(size: number, value: number): number {
  return (value / 64) * size;
}

function fillEllipse(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: string,
  alpha = 1,
  rotation = 0
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, rotation, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function strokeEllipse(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: string,
  lineWidth: number,
  alpha = 1
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function fillPath(ctx: CanvasRenderingContext2D, path: Path2D, color: string, alpha = 1): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fill(path);
  ctx.restore();
}

function drawSprout(
  ctx: CanvasRenderingContext2D,
  size: number,
  palette: Palette,
  lean: number,
  hurt: boolean,
  crouch: boolean
): void {
  const leanPx = u(size, lean);
  const bodyY = crouch ? 34 : 28;
  const bodyRy = crouch ? 14 : 20;
  const shadowY = crouch ? 56 : 59;
  fillEllipse(ctx, u(size, 32), u(size, shadowY), u(size, 17), u(size, 4), '#000000', 0.18);
  const body = new Path2D();
  body.ellipse(u(size, 32) + leanPx, u(size, bodyY), u(size, 16), u(size, bodyRy), 0, 0, Math.PI * 2);
  fillRadialGradient(ctx, body, u(size, 25) + leanPx, u(size, 18), 0, u(size, 27), [
    { offset: 0, color: palette.ground.grassLight },
    { offset: 0.58, color: '#4FC36E' },
    { offset: 1, color: '#1D6B3A' }
  ]);

  ctx.save();
  ctx.strokeStyle = '#2D9656';
  ctx.lineWidth = u(size, 4);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(u(size, 32) + leanPx, u(size, crouch ? 25 : 17));
  ctx.lineTo(u(size, 32) + leanPx, u(size, crouch ? 12 : 5));
  ctx.stroke();
  ctx.restore();

  fillEllipse(ctx, u(size, 23) + leanPx, u(size, crouch ? 17 : 10), u(size, 12), u(size, 6), '#65D37E', 1, -0.55);
  fillEllipse(ctx, u(size, 42) + leanPx, u(size, crouch ? 16 : 9), u(size, 13), u(size, 6), '#45B963', 1, 0.45);
  drawEyes(ctx, size, u(size, 25) + leanPx, u(size, crouch ? 33 : 28), u(size, 39) + leanPx, u(size, crouch ? 33 : 28), '#123B2B', 0.42);

  ctx.save();
  ctx.strokeStyle = '#123B2B';
  ctx.lineWidth = u(size, 2.2);
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (hurt) {
    ctx.moveTo(u(size, 25) + leanPx, u(size, 42));
    ctx.lineTo(u(size, 39) + leanPx, u(size, 42));
  } else {
    ctx.moveTo(u(size, 26) + leanPx, u(size, crouch ? 43 : 39));
    ctx.quadraticCurveTo(u(size, 32) + leanPx, u(size, crouch ? 47 : 43), u(size, 39) + leanPx, u(size, crouch ? 39 : 38));
  }
  ctx.stroke();
  ctx.restore();

  fillPath(ctx, roundRectPath(ctx, u(size, 18) + leanPx, u(size, crouch ? 52 : 49), u(size, 10), u(size, crouch ? 6 : 9), u(size, 3)), '#2F8F4F');
  fillPath(ctx, roundRectPath(ctx, u(size, 36) + leanPx, u(size, crouch ? 52 : 49), u(size, 10), u(size, crouch ? 6 : 9), u(size, 3)), '#2F8F4F');
}

function drawGrassBlock(ctx: CanvasRenderingContext2D, size: number, palette: Palette): void {
  const ground = palette.ground;
  const body = roundRectPath(ctx, u(size, 4), u(size, 12), u(size, 56), u(size, 48), u(size, 6));
  fillLinearGradient(
    ctx,
    body,
    [
      { offset: 0, color: ground.light },
      { offset: 0.52, color: ground.base },
      { offset: 1, color: ground.dark }
    ],
    90
  );
  speckle(ctx, { x: u(size, 8), y: u(size, 18), w: u(size, 48), h: u(size, 36) }, 18, ground.speckDark, [u(size, 0.7), u(size, 1.8)], 2241);
  speckle(ctx, { x: u(size, 8), y: u(size, 18), w: u(size, 48), h: u(size, 36) }, 8, ground.speckLight, [u(size, 0.6), u(size, 1.4)], 8812);

  const lip = roundRectPath(ctx, u(size, 1), u(size, 2), u(size, 62), u(size, 18), [
    u(size, 7),
    u(size, 7),
    u(size, 3),
    u(size, 3)
  ]);
  fillLinearGradient(
    ctx,
    lip,
    [
      { offset: 0, color: ground.grassLight },
      { offset: 0.65, color: ground.grass },
      { offset: 1, color: ground.grassDark }
    ],
    90
  );
  bevel(ctx, { x: u(size, 2), y: u(size, 3), w: u(size, 60), h: u(size, 17) }, {
    lightColor: '#FFFFFF88',
    darkColor: '#1B5E2044',
    thickness: u(size, 1.5)
  });
  specularBand(ctx, u(size, 5), u(size, 0), u(size, 42), u(size, 18), -8, '#FFFFFF', 0.18, u(size, 1.4));
}

function drawStoneBlock(ctx: CanvasRenderingContext2D, size: number, palette: Palette): void {
  const path = roundRectPath(ctx, u(size, 4), u(size, 4), u(size, 56), u(size, 56), u(size, 7));
  fillLinearGradient(
    ctx,
    path,
    [
      { offset: 0, color: '#D3E2E7' },
      { offset: 0.42, color: '#A7B8BD' },
      { offset: 1, color: '#718389' }
    ],
    135
  );
  bevel(ctx, { x: u(size, 5), y: u(size, 5), w: u(size, 54), h: u(size, 54) }, {
    lightColor: '#F6FFFFAA',
    darkColor: '#52646FAA',
    thickness: u(size, 3)
  });
  speckle(ctx, { x: u(size, 10), y: u(size, 10), w: u(size, 44), h: u(size, 44) }, 22, '#6D7D8255', [u(size, 0.5), u(size, 1.5)], 921);
  specularBand(ctx, u(size, 6), u(size, 5), u(size, 38), u(size, 14), -8, palette.cloud.light, 0.24, u(size, 1.2));
}

function drawCloudBlock(ctx: CanvasRenderingContext2D, size: number, palette: Palette): void {
  softShadow(ctx, () => {
    fillEllipse(ctx, u(size, 21), u(size, 35), u(size, 18), u(size, 15), palette.cloud.shade, 0.5);
    fillEllipse(ctx, u(size, 40), u(size, 33), u(size, 20), u(size, 16), palette.cloud.shade, 0.5);
  }, { blur: u(size, 3), offsetX: 0, offsetY: u(size, 2), color: '#7DBED455' });
  fillEllipse(ctx, u(size, 19), u(size, 35), u(size, 19), u(size, 15), palette.cloud.base);
  fillEllipse(ctx, u(size, 33), u(size, 27), u(size, 20), u(size, 17), palette.cloud.light);
  fillEllipse(ctx, u(size, 47), u(size, 36), u(size, 15), u(size, 13), palette.cloud.base);
  ctx.save();
  ctx.fillStyle = palette.cloud.base;
  ctx.fillRect(u(size, 15), u(size, 32), u(size, 36), u(size, 15));
  ctx.restore();
  strokeEllipse(ctx, u(size, 32), u(size, 33), u(size, 28), u(size, 16), palette.cloud.edge, u(size, 1.4), 0.42);
}

function drawSkyBrick(ctx: CanvasRenderingContext2D, size: number, palette: Palette): void {
  ctx.save();
  ctx.fillStyle = palette.brick.mortar;
  ctx.fillRect(u(size, 3), u(size, 3), u(size, 58), u(size, 58));
  ctx.restore();
  const rows = [
    [
      [u(size, -12), u(size, 5), u(size, 38), u(size, 16)],
      [u(size, 29), u(size, 5), u(size, 38), u(size, 16)]
    ],
    [
      [u(size, 4), u(size, 24), u(size, 30), u(size, 16)],
      [u(size, 37), u(size, 24), u(size, 30), u(size, 16)]
    ],
    [
      [u(size, -12), u(size, 43), u(size, 38), u(size, 16)],
      [u(size, 29), u(size, 43), u(size, 38), u(size, 16)]
    ]
  ];

  rows.flat().forEach(([x, y, w, h]) => {
    const brick = roundRectPath(ctx, x, y, w, h, u(size, 2.5));
    fillLinearGradient(
      ctx,
      brick,
      [
        { offset: 0, color: palette.brick.light },
        { offset: 0.6, color: palette.brick.base },
        { offset: 1, color: palette.brick.dark }
      ],
      90
    );
    bevel(ctx, { x, y, w, h }, {
      lightColor: '#FFE0C0AA',
      darkColor: '#5D2C1688',
      thickness: u(size, 1.5)
    });
  });
}

function drawRuneBox(ctx: CanvasRenderingContext2D, size: number, palette: Palette): void {
  const block = palette.block;
  const path = roundRectPath(ctx, u(size, 2), u(size, 2), u(size, 60), u(size, 60), u(size, 7));
  fillLinearGradient(
    ctx,
    path,
    [
      { offset: 0, color: block.light },
      { offset: 0.55, color: block.base },
      { offset: 1, color: block.dark }
    ],
    135
  );
  bevel(ctx, { x: u(size, 3), y: u(size, 3), w: u(size, 58), h: u(size, 58) }, {
    lightColor: block.lighter,
    darkColor: block.darker,
    thickness: u(size, 3)
  });

  const rivets = [
    [10, 10],
    [54, 10],
    [10, 54],
    [54, 54]
  ];
  rivets.forEach(([x, y]) => {
    fillEllipse(ctx, u(size, x), u(size, y), u(size, 4.8), u(size, 4.8), '#FFCC55', 0.45);
    fillEllipse(ctx, u(size, x), u(size, y), u(size, 3.8), u(size, 3.8), block.rivet, 1);
    glossDot(ctx, u(size, x - 1.2), u(size, y - 1.4), u(size, 1.2), u(size, 0.9), 0.55, '#FFE082');
  });

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = u(size, 7);
  ctx.strokeStyle = '#9E9E9E';
  ctx.beginPath();
  ctx.moveTo(u(size, 22), u(size, 22));
  ctx.quadraticCurveTo(u(size, 32), u(size, 10), u(size, 42), u(size, 22));
  ctx.quadraticCurveTo(u(size, 47), u(size, 31), u(size, 34), u(size, 35));
  ctx.lineTo(u(size, 32), u(size, 40));
  ctx.stroke();
  ctx.fillStyle = '#9E9E9E';
  ctx.beginPath();
  ctx.arc(u(size, 35), u(size, 51), u(size, 4.5), 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(u(size, -2.5), u(size, -2.5));
  ctx.strokeStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(u(size, 22), u(size, 22));
  ctx.quadraticCurveTo(u(size, 32), u(size, 10), u(size, 42), u(size, 22));
  ctx.quadraticCurveTo(u(size, 47), u(size, 31), u(size, 34), u(size, 35));
  ctx.lineTo(u(size, 32), u(size, 40));
  ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(u(size, 35), u(size, 51), u(size, 4.5), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  specularBand(ctx, u(size, 4), u(size, 5), u(size, 52), u(size, 38), 45, '#FFFFFF', 0.18, u(size, 2));
}

function drawUsedRuneBox(ctx: CanvasRenderingContext2D, size: number): void {
  const path = roundRectPath(ctx, u(size, 2), u(size, 2), u(size, 60), u(size, 60), u(size, 7));
  fillLinearGradient(
    ctx,
    path,
    [
      { offset: 0, color: '#C49066' },
      { offset: 0.58, color: '#A9744F' },
      { offset: 1, color: '#6E4226' }
    ],
    135
  );
  bevel(ctx, { x: u(size, 3), y: u(size, 3), w: u(size, 58), h: u(size, 58) }, {
    lightColor: '#D9A77A',
    darkColor: '#5A321E',
    thickness: u(size, 3)
  });
  fillEllipse(ctx, u(size, 10), u(size, 10), u(size, 3.8), u(size, 3.8), '#4A2E00');
  fillEllipse(ctx, u(size, 54), u(size, 10), u(size, 3.8), u(size, 3.8), '#4A2E00');
  fillEllipse(ctx, u(size, 10), u(size, 54), u(size, 3.8), u(size, 3.8), '#4A2E00');
  fillEllipse(ctx, u(size, 54), u(size, 54), u(size, 3.8), u(size, 3.8), '#4A2E00');
}

function drawMovingPlatform(ctx: CanvasRenderingContext2D, size: number, palette: Palette): void {
  const path = roundRectPath(ctx, u(size, 4), u(size, 15), u(size, 56), u(size, 28), u(size, 10));
  fillLinearGradient(
    ctx,
    path,
    [
      { offset: 0, color: palette.cloud.light },
      { offset: 0.55, color: '#D9F7FF' },
      { offset: 1, color: '#8ECBD7' }
    ],
    90
  );
  fillPath(ctx, roundRectPath(ctx, u(size, 11), u(size, 33), u(size, 42), u(size, 6), u(size, 3)), '#7BBBD1');
  bevel(ctx, { x: u(size, 6), y: u(size, 17), w: u(size, 52), h: u(size, 23) }, {
    lightColor: '#FFFFFFDD',
    darkColor: '#5BA8C088',
    thickness: u(size, 2)
  });
}

function drawLightSeed(ctx: CanvasRenderingContext2D, size: number, palette: Palette): void {
  softShadow(ctx, () => fillEllipse(ctx, u(size, 34), u(size, 34), u(size, 16), u(size, 18), '#000000', 0.12), {
    blur: u(size, 4),
    offsetX: 0,
    offsetY: u(size, 2),
    color: '#00000044'
  });
  const seed = new Path2D();
  seed.moveTo(u(size, 34), u(size, 8));
  seed.bezierCurveTo(u(size, 56), u(size, 20), u(size, 50), u(size, 54), u(size, 28), u(size, 58));
  seed.bezierCurveTo(u(size, 11), u(size, 45), u(size, 12), u(size, 18), u(size, 34), u(size, 8));
  seed.closePath();
  fillRadialGradient(
    ctx,
    seed,
    u(size, 24),
    u(size, 20),
    0,
    u(size, 35),
    [
      { offset: 0, color: palette.coin.light },
      { offset: 0.5, color: palette.coin.base },
      { offset: 1, color: palette.coin.dark }
    ]
  );
  bevel(ctx, { x: u(size, 15), y: u(size, 10), w: u(size, 36), h: u(size, 47) }, {
    lightColor: '#FFF4BFAA',
    darkColor: '#A76A0088',
    thickness: u(size, 1.8)
  });
  glossDot(ctx, u(size, 24), u(size, 19), u(size, 7), u(size, 3), 0.58);
}

function drawBigLightSeed(ctx: CanvasRenderingContext2D, size: number, palette: Palette): void {
  drawLightSeed(ctx, size, palette);
  specularBand(ctx, u(size, 8), u(size, 8), u(size, 48), u(size, 48), -20, '#FFFFFF', 0.28, u(size, 1.8));
  strokeEllipse(ctx, u(size, 32), u(size, 32), u(size, 24), u(size, 24), '#FFF2B0', u(size, 2), 0.85);
}

function drawBreezeOrb(ctx: CanvasRenderingContext2D, size: number): void {
  const orb = new Path2D();
  orb.arc(u(size, 32), u(size, 32), u(size, 23), 0, Math.PI * 2);
  fillRadialGradient(
    ctx,
    orb,
    u(size, 23),
    u(size, 18),
    0,
    u(size, 28),
    [
      { offset: 0, color: '#E9FFFF' },
      { offset: 0.5, color: '#68DFE0' },
      { offset: 1, color: '#2F9BB2' }
    ]
  );
  strokeEllipse(ctx, u(size, 32), u(size, 32), u(size, 23), u(size, 23), '#FFFFFF', u(size, 2), 0.9);
  ctx.save();
  ctx.strokeStyle = '#FFFFFFDD';
  ctx.lineWidth = u(size, 3);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(u(size, 17), u(size, 35));
  ctx.bezierCurveTo(u(size, 24), u(size, 22), u(size, 36), u(size, 23), u(size, 47), u(size, 29));
  ctx.stroke();
  ctx.restore();
}

function drawGrowthBud(ctx: CanvasRenderingContext2D, size: number, palette: Palette): void {
  drawMushroomLike(ctx, size, palette, '#62C975', '#B9F3A7', '#2B8C55');
}

function drawDriftBug(ctx: CanvasRenderingContext2D, size: number, palette: Palette): void {
  const body = new Path2D();
  body.ellipse(u(size, 32), u(size, 34), u(size, 25), u(size, 18), 0, 0, Math.PI * 2);
  fillRadialGradient(
    ctx,
    body,
    u(size, 24),
    u(size, 24),
    0,
    u(size, 34),
    [
      { offset: 0, color: '#C0D675' },
      { offset: 0.55, color: '#9DAD58' },
      { offset: 1, color: '#6C7C42' }
    ]
  );
  fillEllipse(ctx, u(size, 32), u(size, 43), u(size, 18), u(size, 8), palette.creature.belly, 0.48);
  drawEyes(ctx, size, u(size, 24), u(size, 32), u(size, 40), u(size, 32), palette.creature.eye, 0.78);
  ctx.save();
  ctx.strokeStyle = '#40502D';
  ctx.lineWidth = u(size, 3);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(u(size, 18), u(size, 46));
  ctx.lineTo(u(size, 10), u(size, 57));
  ctx.moveTo(u(size, 46), u(size, 46));
  ctx.lineTo(u(size, 54), u(size, 57));
  ctx.stroke();
  ctx.restore();
  glossDot(ctx, u(size, 22), u(size, 23), u(size, 9), u(size, 3), 0.28);
}

function drawPuffHopper(ctx: CanvasRenderingContext2D, size: number, palette: Palette): void {
  drawCloudBlock(ctx, size, palette);
  drawEyes(ctx, size, u(size, 24), u(size, 33), u(size, 40), u(size, 33), '#43636D', 0.75);
  ctx.save();
  ctx.strokeStyle = '#8ECBD7';
  ctx.lineWidth = u(size, 2.5);
  ctx.beginPath();
  ctx.arc(u(size, 32), u(size, 39), u(size, 8), 0.1, Math.PI - 0.1);
  ctx.stroke();
  ctx.restore();
}

function drawWindWisp(ctx: CanvasRenderingContext2D, size: number): void {
  fillEllipse(ctx, u(size, 32), u(size, 32), u(size, 25), u(size, 25), '#BFF6FF', 0.36);
  ctx.save();
  ctx.strokeStyle = '#85D8EF';
  ctx.lineWidth = u(size, 6);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(u(size, 11), u(size, 37));
  ctx.bezierCurveTo(u(size, 17), u(size, 17), u(size, 36), u(size, 21), u(size, 48), u(size, 31));
  ctx.bezierCurveTo(u(size, 58), u(size, 42), u(size, 38), u(size, 56), u(size, 22), u(size, 45));
  ctx.stroke();
  ctx.restore();
  drawEyes(ctx, size, u(size, 27), u(size, 31), u(size, 41), u(size, 32), '#2B7687', 0.58);
}

function drawThornCrystal(ctx: CanvasRenderingContext2D, size: number): void {
  const left = new Path2D();
  left.moveTo(u(size, 9), u(size, 58));
  left.lineTo(u(size, 25), u(size, 6));
  left.lineTo(u(size, 39), u(size, 58));
  left.closePath();
  fillLinearGradient(ctx, left, [
    { offset: 0, color: '#E7C8FF' },
    { offset: 0.45, color: '#B579D5' },
    { offset: 1, color: '#62347C' }
  ], 125);
  const right = new Path2D();
  right.moveTo(u(size, 32), u(size, 58));
  right.lineTo(u(size, 47), u(size, 13));
  right.lineTo(u(size, 60), u(size, 58));
  right.closePath();
  fillLinearGradient(ctx, right, [
    { offset: 0, color: '#F0D5FF' },
    { offset: 0.5, color: '#B579D5' },
    { offset: 1, color: '#8B4FB1' }
  ], 135);
  specularBand(ctx, u(size, 19), u(size, 8), u(size, 16), u(size, 45), -10, '#FFFFFF', 0.3, u(size, 1));
}

function drawGustVent(ctx: CanvasRenderingContext2D, size: number): void {
  const base = roundRectPath(ctx, u(size, 9), u(size, 43), u(size, 46), u(size, 14), u(size, 6));
  fillLinearGradient(ctx, base, [
    { offset: 0, color: '#E9FFFF' },
    { offset: 1, color: '#79E1F0' }
  ], 90);
  ctx.save();
  ctx.strokeStyle = '#2F9BB2';
  ctx.lineWidth = u(size, 4);
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i += 1) {
    const x = u(size, 22 + i * 10);
    ctx.beginPath();
    ctx.moveTo(x, u(size, 38));
    ctx.bezierCurveTo(x - u(size, 8), u(size, 26), x + u(size, 9), u(size, 19), x, u(size, 8));
    ctx.stroke();
  }
  ctx.restore();
}

function drawVoidZone(ctx: CanvasRenderingContext2D, size: number): void {
  const path = roundRectPath(ctx, u(size, 5), u(size, 12), u(size, 54), u(size, 40), u(size, 9));
  fillRadialGradient(ctx, path, u(size, 32), u(size, 31), 0, u(size, 33), [
    { offset: 0, color: '#6B58A8' },
    { offset: 0.55, color: '#38485E' },
    { offset: 1, color: '#151A2B' }
  ]);
  specularBand(ctx, u(size, 8), u(size, 15), u(size, 48), u(size, 16), 10, '#B9F6FF', 0.2, u(size, 2));
}

function drawLantern(ctx: CanvasRenderingContext2D, size: number, palette: Palette, active: boolean): void {
  if (active) {
    fillEllipse(ctx, u(size, 32), u(size, 32), u(size, 30), u(size, 30), '#FFED9C', 0.25);
  }
  ctx.save();
  ctx.strokeStyle = '#51483A';
  ctx.lineWidth = u(size, 4);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(u(size, 32), u(size, 4));
  ctx.lineTo(u(size, 32), u(size, 14));
  ctx.stroke();
  ctx.restore();
  const body = roundRectPath(ctx, u(size, 18), u(size, 14), u(size, 28), u(size, 38), u(size, 7));
  fillLinearGradient(ctx, body, [
    { offset: 0, color: '#74695B' },
    { offset: 1, color: '#3E362F' }
  ], 90);
  fillPath(ctx, roundRectPath(ctx, u(size, 23), u(size, 20), u(size, 18), u(size, 24), u(size, 6)), active ? palette.coin.light : '#B6C1B2');
  specularBand(ctx, u(size, 22), u(size, 20), u(size, 18), u(size, 24), 0, '#FFFFFF', active ? 0.38 : 0.18, u(size, 1.5));
  fillPath(ctx, roundRectPath(ctx, u(size, 27), u(size, 50), u(size, 10), u(size, 10), u(size, 2)), '#51483A');
}

function drawWindGate(ctx: CanvasRenderingContext2D, size: number): void {
  ctx.save();
  ctx.strokeStyle = '#70D4E8';
  ctx.lineWidth = u(size, 7);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.roundRect?.(u(size, 11), u(size, 5), u(size, 42), u(size, 54), u(size, 20));
  if (!ctx.roundRect) {
    ctx.stroke(roundRectPath(ctx, u(size, 11), u(size, 5), u(size, 42), u(size, 54), u(size, 20)));
  } else {
    ctx.stroke();
  }
  ctx.strokeStyle = '#FFFFFFDD';
  ctx.lineWidth = u(size, 3);
  ctx.stroke(roundRectPath(ctx, u(size, 17), u(size, 11), u(size, 30), u(size, 42), u(size, 14)));
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = '#5BA8C0';
  ctx.lineWidth = u(size, 3);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(u(size, 22), u(size, 39));
  ctx.bezierCurveTo(u(size, 29), u(size, 30), u(size, 40), u(size, 31), u(size, 46), u(size, 38));
  ctx.stroke();
  ctx.restore();
}

function drawPlayerSpawn(ctx: CanvasRenderingContext2D, size: number, palette: Palette): void {
  drawMushroomLike(ctx, size, palette, '#4FC36E', '#9BE86B', '#1D6B3A');
}

function drawMushroomLike(
  ctx: CanvasRenderingContext2D,
  size: number,
  palette: Palette,
  capBase: string,
  capLight: string,
  capDark: string
): void {
  fillEllipse(ctx, u(size, 32), u(size, 58), u(size, 20), u(size, 5), '#000000', 0.18);
  const stem = roundRectPath(ctx, u(size, 18), u(size, 32), u(size, 28), u(size, 25), [
    u(size, 5),
    u(size, 5),
    u(size, 12),
    u(size, 12)
  ]);
  fillLinearGradient(ctx, stem, [
    { offset: 0, color: palette.mushroom.stem },
    { offset: 1, color: palette.mushroom.stemShade }
  ], 90);

  const cap = new Path2D();
  cap.moveTo(u(size, 6), u(size, 35));
  cap.bezierCurveTo(u(size, 13), u(size, 9), u(size, 50), u(size, 0), u(size, 58), u(size, 35));
  cap.bezierCurveTo(u(size, 48), u(size, 43), u(size, 18), u(size, 43), u(size, 6), u(size, 35));
  cap.closePath();
  fillRadialGradient(ctx, cap, u(size, 24), u(size, 15), 0, u(size, 36), [
    { offset: 0, color: capLight },
    { offset: 0.48, color: capBase },
    { offset: 1, color: capDark }
  ]);
  fillEllipse(ctx, u(size, 29), u(size, 17), u(size, 12), u(size, 10), '#FFFFFF', 0.92);
  fillEllipse(ctx, u(size, 11), u(size, 25), u(size, 8), u(size, 8), '#FFFFFF', 0.88);
  fillEllipse(ctx, u(size, 53), u(size, 25), u(size, 8), u(size, 8), '#FFFFFF', 0.88);
  ambientOcclusion(ctx, stem, u(size, 18), 0.22);
  drawEyes(ctx, size, u(size, 25), u(size, 45), u(size, 39), u(size, 45), palette.mushroom.eye, 1);
}

function drawEyes(
  ctx: CanvasRenderingContext2D,
  size: number,
  leftX: number,
  leftY: number,
  rightX: number,
  rightY: number,
  color: string,
  scale = 1
): void {
  const rx = u(size, 3.5) * scale;
  const ry = u(size, 8) * scale;
  fillEllipse(ctx, leftX, leftY, rx, ry, color);
  fillEllipse(ctx, rightX, rightY, rx, ry, color);
  glossDot(ctx, leftX - rx * 0.2, leftY - ry * 0.45, rx * 0.45, ry * 0.32, 0.85);
  glossDot(ctx, rightX - rx * 0.2, rightY - ry * 0.45, rx * 0.45, ry * 0.32, 0.85);
}

function drawCloudTuft(ctx: CanvasRenderingContext2D, size: number, palette: Palette): void {
  drawCloudBlock(ctx, size, palette);
}

function drawTinySprout(ctx: CanvasRenderingContext2D, size: number, palette: Palette): void {
  ctx.save();
  ctx.strokeStyle = palette.ground.grassDark;
  ctx.lineWidth = u(size, 5);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(u(size, 32), u(size, 55));
  ctx.lineTo(u(size, 32), u(size, 25));
  ctx.stroke();
  ctx.restore();
  fillEllipse(ctx, u(size, 24), u(size, 25), u(size, 14), u(size, 8), palette.ground.grass, 1, -0.5);
  fillEllipse(ctx, u(size, 41), u(size, 24), u(size, 15), u(size, 8), palette.ground.grassLight, 1, 0.45);
}

function drawWindRibbon(ctx: CanvasRenderingContext2D, size: number): void {
  ctx.save();
  ctx.strokeStyle = '#85D8EF';
  ctx.lineWidth = u(size, 6);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(u(size, 8), u(size, 38));
  ctx.bezierCurveTo(u(size, 22), u(size, 14), u(size, 41), u(size, 54), u(size, 56), u(size, 29));
  ctx.stroke();
  ctx.strokeStyle = '#FFFFFFAA';
  ctx.lineWidth = u(size, 2);
  ctx.stroke();
  ctx.restore();
}

function drawDistantStar(ctx: CanvasRenderingContext2D, size: number, palette: Palette): void {
  drawRoundedStar(ctx, size, palette.coin.light, palette.coin.dark);
}

function drawFloatingPebble(ctx: CanvasRenderingContext2D, size: number): void {
  const path = roundRectPath(ctx, u(size, 13), u(size, 22), u(size, 38), u(size, 24), u(size, 10));
  fillLinearGradient(ctx, path, [
    { offset: 0, color: '#C9D3D7' },
    { offset: 1, color: '#718389' }
  ], 120);
  specularBand(ctx, u(size, 14), u(size, 22), u(size, 25), u(size, 10), 0, '#FFFFFF', 0.24, u(size, 1.2));
}

function drawDustParticle(ctx: CanvasRenderingContext2D, size: number): void {
  fillEllipse(ctx, u(size, 32), u(size, 32), u(size, 20), u(size, 15), '#DED3A2', 0.8);
}

function drawSparkParticle(ctx: CanvasRenderingContext2D, size: number, palette: Palette): void {
  drawRoundedStar(ctx, size, palette.coin.light, palette.coin.dark);
}

function drawLeafParticle(ctx: CanvasRenderingContext2D, size: number, palette: Palette): void {
  fillEllipse(ctx, u(size, 32), u(size, 32), u(size, 18), u(size, 9), palette.ground.grass, 1, -0.6);
}

function drawRoundedStar(
  ctx: CanvasRenderingContext2D,
  size: number,
  fill: string,
  rim: string
): void {
  const path = new Path2D();
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? u(size, 25) : u(size, 12);
    const x = u(size, 32) + Math.cos(angle) * radius;
    const y = u(size, 32) + Math.sin(angle) * radius;
    if (i === 0) {
      path.moveTo(x, y);
    } else {
      path.lineTo(x, y);
    }
  }
  path.closePath();
  fillPath(ctx, path, fill);
  ctx.save();
  ctx.strokeStyle = rim;
  ctx.lineJoin = 'round';
  ctx.lineWidth = u(size, 3);
  ctx.stroke(path);
  ctx.restore();
  drawEyes(ctx, size, u(size, 27), u(size, 32), u(size, 38), u(size, 32), '#2E1A0A', 0.5);
}
