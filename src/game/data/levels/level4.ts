import type { LevelData } from '../../types';
import { floatingBlockCluster } from './levelUtils';

export const level4: LevelData = {
  id: 'level-4-ancient-citadel',
  name: '고대 신전의 최후 관문',
  world: {
    width: 6800,
    height: 720,
    fallY: 760,
    timeLimitSeconds: 180
  },
  start: { x: 120, y: 548 },

  terrain: [
    // ── Zone 1: 출발 지점 (x: 0–800) ──────────────────────────────
    { id: 'grass-01', kind: 'grass', x: 400, y: 660, width: 800, height: 96 },
    ...floatingBlockCluster('z1-fb', 536, 390, ['skyBrick', 'runeBox', 'runeBox', 'skyBrick']),

    // ── Zone 2: 계단 + 발판 상승 (x: 980–2000) ────────────────────
    // 갭: 800–980 (180px)
    { id: 'stone-01', kind: 'stone', x: 1060, y: 660, width: 160, height: 96 },
    { id: 'step-01', kind: 'stone', x: 1230, y: 575, width: 140, height: 34 },
    { id: 'step-02', kind: 'cloud', x: 1400, y: 485, width: 140, height: 34 },
    { id: 'step-03', kind: 'stone', x: 1570, y: 395, width: 140, height: 34 },
    { id: 'stone-02', kind: 'stone', x: 1860, y: 660, width: 280, height: 96 },
    { id: 'ledge-02', kind: 'stone', x: 1880, y: 395, width: 180, height: 34 },
    ...floatingBlockCluster('z2-fb', 1540, 340, ['skyBrick', 'skyBrick', 'runeBox', 'skyBrick']),

    // ── Zone 3: 멀티레이어 구간 (x: 2000–3200) ────────────────────
    // 갭: 2000–2180 (180px)
    { id: 'stone-03', kind: 'stone', x: 2360, y: 660, width: 360, height: 96 },
    { id: 'mid-03a', kind: 'cloud', x: 2340, y: 510, width: 140, height: 34 },
    { id: 'mid-03b', kind: 'stone', x: 2520, y: 415, width: 140, height: 34 },
    { id: 'top-03', kind: 'cloud', x: 2700, y: 320, width: 140, height: 34 },
    ...floatingBlockCluster('z3-fb', 2568, 350, ['skyBrick', 'runeBox', 'skyBrick', 'runeBox', 'skyBrick']),
    // 이동 발판 1 (대각): from(2720,310) → to(3060,510)
    { id: 'stone-04', kind: 'stone', x: 3210, y: 660, width: 300, height: 96 },
    { id: 'cp-ledge-01', kind: 'stone', x: 3200, y: 510, width: 200, height: 34 },
    ...floatingBlockCluster('cp1-fb', 3112, 400, ['skyBrick', 'runeBox', 'skyBrick']),

    // ── Zone 4: 좁은 수직 통로 (벽 점프 구간, x: 3360–4400) ───────
    // 갭: 3360–3520 (160px)
    // 좁은 수직 통로: 두 개의 세로 벽 사이 가로 60px 공간
    { id: 'wall-left', kind: 'stone', x: 3660, y: 360, width: 40, height: 480 },
    { id: 'wall-right', kind: 'stone', x: 3760, y: 360, width: 40, height: 480 },
    // 위 벽들 사이 공간(x: 3680–3740, 60px)에서 벽 점프로 올라가야 함
    // 통로 위 발판
    { id: 'top-passage', kind: 'stone', x: 3840, y: 510, width: 200, height: 34 },
    // 이동 발판 2 (수평): from(4000,505) → to(4380,505)
    { id: 'stone-05', kind: 'stone', x: 4540, y: 660, width: 300, height: 96 },
    { id: 'ledge-05', kind: 'stone', x: 4540, y: 500, width: 160, height: 34 },
    ...floatingBlockCluster('z4-fb', 4408, 420, ['skyBrick', 'runeBox', 'runeBox', 'skyBrick']),

    // ── Zone 5: 연속 이동 발판 (x: 4690–5800) ────────────────────
    // 갭: 4690–4860 (170px)
    { id: 'stone-06', kind: 'stone', x: 4980, y: 660, width: 240, height: 96 },
    // 이동 발판 3 (수평): from(5120,505) → to(5460,505)
    // 이동 발판 4 (수평 역방향): from(5580,390) → to(5280,390)
    { id: 'stone-07', kind: 'stone', x: 5700, y: 660, width: 280, height: 96 },
    { id: 'upper-07', kind: 'stone', x: 5680, y: 380, width: 200, height: 34 },
    ...floatingBlockCluster('z5-fb', 5548, 325, ['skyBrick', 'runeBox', 'skyBrick']),

    // ── Zone 6: 보스 지대 + 최종 (x: 5840–6800) ──────────────────
    // 갭: 5840–6020 (180px)
    { id: 'grass-boss', kind: 'grass', x: 6320, y: 660, width: 600, height: 96 },
    { id: 'boss-ledge-a', kind: 'stone', x: 6180, y: 510, width: 140, height: 34 },
    { id: 'boss-ledge-b', kind: 'stone', x: 6400, y: 410, width: 140, height: 34 },
    ...floatingBlockCluster('boss-fb', 6240, 345, ['skyBrick', 'runeBox', 'runeBox', 'skyBrick']),
    // 이동 발판 5 (대각): from(6060,500) → to(6300,380)
    { id: 'cp-ledge-02', kind: 'stone', x: 6600, y: 510, width: 220, height: 34 },
    { id: 'grass-end', kind: 'grass', x: 6660, y: 660, width: 280, height: 96 }
  ],

  movingPlatforms: [
    {
      id: 'breeze-diag-01',
      x: 2720,
      y: 310,
      width: 155,
      height: 28,
      from: { x: 2720, y: 310 },
      to: { x: 3060, y: 510 },
      speed: 98
    },
    {
      id: 'breeze-horiz-01',
      x: 4030,
      y: 505,
      width: 155,
      height: 28,
      from: { x: 4030, y: 505 },
      to: { x: 4380, y: 505 },
      speed: 115
    },
    {
      id: 'breeze-horiz-02',
      x: 5160,
      y: 505,
      width: 150,
      height: 28,
      from: { x: 5160, y: 505 },
      to: { x: 5460, y: 505 },
      speed: 120
    },
    {
      id: 'breeze-reverse-01',
      x: 5560,
      y: 390,
      width: 150,
      height: 28,
      from: { x: 5560, y: 390 },
      to: { x: 5300, y: 390 },
      speed: 125
    },
    {
      id: 'breeze-diag-02',
      x: 6090,
      y: 500,
      width: 150,
      height: 28,
      from: { x: 6090, y: 500 },
      to: { x: 6330, y: 375 },
      speed: 108
    }
  ],

  collectibles: [
    { id: 'seed-01', x: 180, y: 585 },
    { id: 'seed-02', x: 420, y: 585 },
    { id: 'seed-03', x: 580, y: 335 },
    { id: 'seed-04', x: 1230, y: 520 },
    { id: 'seed-05', x: 1400, y: 430 },
    { id: 'seed-06', x: 1570, y: 340 },
    { id: 'seed-07', x: 1716, y: 285 },
    { id: 'seed-08', x: 2340, y: 455 },
    { id: 'seed-09', x: 2520, y: 360 },
    { id: 'seed-10', x: 2700, y: 265 },
    { id: 'seed-11', x: 2788, y: 295 },
    { id: 'seed-12', x: 3200, y: 345 },
    { id: 'seed-13', x: 3870, y: 455 },
    { id: 'seed-14', x: 4570, y: 445 },
    { id: 'seed-15', x: 4630, y: 295 },
    { id: 'seed-16', x: 5680, y: 325 },
    { id: 'seed-17', x: 5592, y: 270 },
    { id: 'seed-18', x: 6190, y: 455 },
    { id: 'seed-19', x: 6410, y: 355 },
    { id: 'seed-20', x: 6660, y: 585 }
  ],

  powerUps: [
    { id: 'breeze-orb-01', x: 1760, y: 285, durationMs: 9000 },
    { id: 'breeze-orb-02', x: 5636, y: 270, durationMs: 9000 }
  ],

  enemies: [
    { id: 'drift-bug-01', kind: 'driftBug', x: 320, y: 600, patrolDistance: 200, speed: 68 },
    { id: 'puff-hopper-01', kind: 'puffHopper', x: 600, y: 600, patrolDistance: 160, speed: 54 },
    { id: 'drift-bug-02', kind: 'driftBug', x: 1890, y: 600, patrolDistance: 180, speed: 73 },
    { id: 'wind-wisp-01', kind: 'windWisp', x: 2680, y: 270, patrolDistance: 150, speed: 55 },
    { id: 'puff-hopper-02', kind: 'puffHopper', x: 3220, y: 600, patrolDistance: 140, speed: 56 },
    { id: 'drift-bug-03', kind: 'driftBug', x: 4570, y: 600, patrolDistance: 150, speed: 80 },
    { id: 'wind-wisp-02', kind: 'windWisp', x: 4630, y: 365, patrolDistance: 160, speed: 60 },
    { id: 'puff-hopper-03', kind: 'puffHopper', x: 5010, y: 600, patrolDistance: 130, speed: 58 },
    { id: 'drift-bug-04', kind: 'driftBug', x: 6280, y: 600, patrolDistance: 200, speed: 82 },
    { id: 'wind-wisp-03', kind: 'windWisp', x: 6430, y: 355, patrolDistance: 170, speed: 63 }
  ],

  hazards: [
    { id: 'thorn-01', kind: 'thornCrystal', x: 3360, y: 620, width: 80, height: 46 },
    { id: 'thorn-02', kind: 'thornCrystal', x: 4860, y: 620, width: 80, height: 46 },
    { id: 'thorn-03', kind: 'thornCrystal', x: 5840, y: 620, width: 80, height: 46 },
    { id: 'thorn-04', kind: 'thornCrystal', x: 6080, y: 620, width: 80, height: 46 },
    { id: 'thorn-05', kind: 'thornCrystal', x: 6520, y: 620, width: 80, height: 46 },
    { id: 'thorn-06', kind: 'thornCrystal', x: 6720, y: 620, width: 80, height: 46 }
  ],

  checkpoints: [
    { id: 'lantern-01', label: 'Ancient Hall', x: 3200, y: 590 },
    { id: 'lantern-02', label: 'Citadel Pinnacle', x: 6600, y: 470 }
  ],

  finishGate: { id: 'citadel-gate-01', x: 6720, y: 570 }
};
