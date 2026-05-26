import type { LevelData } from '../../types';
import { floatingBlockCluster } from './levelUtils';

export const level3: LevelData = {
  id: 'level-3-starlight-cave',
  name: '별빛 폭풍 전장',
  world: {
    width: 6400,
    height: 720,
    fallY: 760,
    timeLimitSeconds: 200
  },
  start: { x: 120, y: 548 },

  terrain: [
    // ── Zone 1: 출발 + RuneBox 체인 (x: 0–900) ───────────────────
    { id: 'grass-01', kind: 'grass', x: 450, y: 660, width: 900, height: 96 },
    ...floatingBlockCluster('rune-chain-01', 560, 390, ['skyBrick', 'runeBox', 'runeBox', 'runeBox', 'skyBrick']),

    // ── Zone 2: 계단 점프 (x: 1080–1960) ─────────────────────────
    // 갭: 900–1080 (180px)
    { id: 'stone-01', kind: 'stone', x: 1160, y: 660, width: 160, height: 96 },
    { id: 'step-01', kind: 'cloud', x: 1310, y: 570, width: 140, height: 34 },
    { id: 'step-02', kind: 'stone', x: 1480, y: 490, width: 140, height: 34 },
    { id: 'step-03', kind: 'cloud', x: 1660, y: 400, width: 140, height: 34 },
    { id: 'stone-02', kind: 'stone', x: 1900, y: 660, width: 220, height: 96 },
    ...floatingBlockCluster('zone2-fb', 1628, 345, ['skyBrick', 'skyBrick', 'runeBox']),

    // ── Zone 3: 이동 발판 이중 통과 (x: 2120–3100) ────────────────
    // 갭: 2010–2200 (190px)
    { id: 'stone-03', kind: 'stone', x: 2280, y: 660, width: 160, height: 96 },
    // 이동 발판 1 (대각): from(2400,500) → to(2780,380) [아래 참고]
    // 이동 발판 2 (수평): from(2850,380) → to(3100,380)
    { id: 'stone-04', kind: 'stone', x: 3260, y: 660, width: 320, height: 96 },
    { id: 'cp-ledge', kind: 'stone', x: 3240, y: 505, width: 200, height: 34 },
    ...floatingBlockCluster('cp-fb', 3152, 400, ['skyBrick', 'runeBox', 'skyBrick']),

    // ── Zone 4: WindWisp 삼중 구간 (x: 3420–4520) ─────────────────
    // 갭: 3420–3580 (160px)
    { id: 'stone-05', kind: 'stone', x: 3780, y: 660, width: 400, height: 96 },
    { id: 'ledge-z4', kind: 'stone', x: 3810, y: 510, width: 180, height: 34 },
    ...floatingBlockCluster('z4-top-fb', 3698, 380, ['skyBrick', 'runeBox', 'runeBox', 'skyBrick']),
    // 갭: 3980–4160 (180px)
    { id: 'stone-06', kind: 'stone', x: 4340, y: 660, width: 360, height: 96 },

    // ── Zone 5: RuneBox 체인 + 이동 발판 (x: 4520–5500) ──────────
    // 갭: 4520–4700 (180px)
    { id: 'stone-07', kind: 'stone', x: 4820, y: 660, width: 240, height: 96 },
    ...floatingBlockCluster('rune-chain-02', 4698, 395, ['skyBrick', 'runeBox', 'runeBox', 'runeBox', 'skyBrick']),
    // 이동 발판 3 (수평): from(4980,505) → to(5350,505)
    { id: 'stone-08', kind: 'stone', x: 5500, y: 660, width: 300, height: 96 },
    { id: 'upper-02', kind: 'stone', x: 5500, y: 375, width: 200, height: 34 },
    ...floatingBlockCluster('upper-fb', 5368, 320, ['skyBrick', 'runeBox', 'skyBrick']),

    // ── Zone 6: 이동 발판 → 최종 (x: 5700–6400) ──────────────────
    // 이동 발판 4 (대각): from(5650,370) → to(5920,500) [아래 참고]
    { id: 'step-down-01', kind: 'cloud', x: 6000, y: 505, width: 140, height: 34 },
    { id: 'step-down-02', kind: 'cloud', x: 6160, y: 590, width: 140, height: 34 },
    { id: 'grass-end', kind: 'grass', x: 6330, y: 660, width: 340, height: 96 },
    ...floatingBlockCluster('end-fb', 6220, 360, ['skyBrick', 'runeBox', 'skyBrick'])
  ],

  movingPlatforms: [
    {
      id: 'breeze-diag-01',
      x: 2400,
      y: 500,
      width: 160,
      height: 28,
      from: { x: 2400, y: 500 },
      to: { x: 2780, y: 380 },
      speed: 95
    },
    {
      id: 'breeze-horiz-01',
      x: 2860,
      y: 380,
      width: 160,
      height: 28,
      from: { x: 2860, y: 380 },
      to: { x: 3160, y: 380 },
      speed: 100
    },
    {
      id: 'breeze-horiz-02',
      x: 5020,
      y: 505,
      width: 155,
      height: 28,
      from: { x: 5020, y: 505 },
      to: { x: 5380, y: 505 },
      speed: 115
    },
    {
      id: 'breeze-diag-02',
      x: 5680,
      y: 370,
      width: 150,
      height: 28,
      from: { x: 5680, y: 370 },
      to: { x: 5950, y: 500 },
      speed: 105
    }
  ],

  collectibles: [
    { id: 'seed-01', x: 200, y: 585 },
    { id: 'seed-02', x: 480, y: 585 },
    { id: 'seed-03', x: 672, y: 335 },
    { id: 'seed-04', x: 1310, y: 515 },
    { id: 'seed-05', x: 1480, y: 435 },
    { id: 'seed-06', x: 1660, y: 345 },
    { id: 'seed-07', x: 1760, y: 290 },
    { id: 'seed-08', x: 2280, y: 605 },
    { id: 'seed-09', x: 3240, y: 450 },
    { id: 'seed-10', x: 3300, y: 345 },
    { id: 'seed-11', x: 3775, y: 385 },
    { id: 'seed-12', x: 3900, y: 605 },
    { id: 'seed-13', x: 4360, y: 605 },
    { id: 'seed-14', x: 4786, y: 340 },
    { id: 'seed-15', x: 4962, y: 340 },
    { id: 'seed-16', x: 5500, y: 320 },
    { id: 'seed-17', x: 6240, y: 605 },
    { id: 'seed-18', x: 6340, y: 585 }
  ],

  powerUps: [
    { id: 'breeze-orb-01', x: 1804, y: 290, durationMs: 8000 },
    { id: 'breeze-orb-02', x: 5412, y: 265, durationMs: 8000 }
  ],

  enemies: [
    { id: 'drift-bug-01', kind: 'driftBug', x: 380, y: 600, patrolDistance: 180, speed: 68 },
    { id: 'puff-hopper-01', kind: 'puffHopper', x: 1900, y: 600, patrolDistance: 150, speed: 52 },
    { id: 'wind-wisp-01', kind: 'windWisp', x: 3750, y: 420, patrolDistance: 140, speed: 52 },
    { id: 'wind-wisp-02', kind: 'windWisp', x: 3870, y: 310, patrolDistance: 120, speed: 58 },
    { id: 'drift-bug-02', kind: 'driftBug', x: 4370, y: 600, patrolDistance: 160, speed: 78 },
    { id: 'puff-hopper-02', kind: 'puffHopper', x: 4850, y: 600, patrolDistance: 130, speed: 55 },
    { id: 'wind-wisp-03', kind: 'windWisp', x: 5480, y: 330, patrolDistance: 150, speed: 60 },
    { id: 'drift-bug-03', kind: 'driftBug', x: 6270, y: 600, patrolDistance: 140, speed: 80 }
  ],

  hazards: [
    { id: 'thorn-01', kind: 'thornCrystal', x: 3580, y: 620, width: 80, height: 46 },
    { id: 'thorn-02', kind: 'thornCrystal', x: 3960, y: 620, width: 80, height: 46 },
    { id: 'thorn-03', kind: 'thornCrystal', x: 4180, y: 620, width: 80, height: 46 },
    { id: 'thorn-04', kind: 'thornCrystal', x: 4700, y: 620, width: 80, height: 46 },
    { id: 'thorn-05', kind: 'thornCrystal', x: 6180, y: 620, width: 80, height: 46 }
  ],

  checkpoints: [
    { id: 'lantern-01', label: 'Star Pillar', x: 3240, y: 590 },
    { id: 'lantern-02', label: 'Rune Gateway', x: 5500, y: 335 }
  ],

  finishGate: { id: 'star-gate-01', x: 6300, y: 570 }
};
