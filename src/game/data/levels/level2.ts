import type { LevelData } from '../../types';
import { floatingBlockCluster } from './levelUtils';

export const level2: LevelData = {
  id: 'level-2-cloud-trial',
  name: '구름 섬의 시련',
  world: {
    width: 5800,
    height: 720,
    fallY: 760,
    timeLimitSeconds: 220
  },
  start: { x: 120, y: 548 },

  terrain: [
    // ── Zone 1: 출발 지점 (x: 0–880) ──────────────────────────────
    { id: 'grass-01', kind: 'grass', x: 440, y: 660, width: 880, height: 96 },
    ...floatingBlockCluster('start-fb', 620, 390, ['skyBrick', 'runeBox', 'skyBrick']),

    // ── Zone 2: 첫 번째 도약 (x: 1060–1820) ───────────────────────
    // 갭: 880–1060 (180px)
    { id: 'step-01', kind: 'cloud', x: 960, y: 575, width: 200, height: 34 },
    { id: 'stone-01', kind: 'stone', x: 1160, y: 660, width: 200, height: 96 },
    { id: 'ledge-01', kind: 'stone', x: 1310, y: 510, width: 220, height: 34 },
    { id: 'stone-02', kind: 'stone', x: 1630, y: 660, width: 420, height: 96 },
    ...floatingBlockCluster('zone2-fb', 1490, 350, ['skyBrick', 'skyBrick', 'runeBox', 'skyBrick']),

    // ── Zone 3: 이동 발판 도착 섬 (x: 2660–3040) ──────────────────
    // 갭: 1820–2040 (220px)
    { id: 'stone-03', kind: 'stone', x: 2120, y: 660, width: 160, height: 96 },
    // 이동 발판 1이 2220–2660 사이를 연결 (아래 movingPlatforms 참고)
    { id: 'grass-02', kind: 'grass', x: 2850, y: 660, width: 380, height: 96 },
    { id: 'cp-ledge', kind: 'stone', x: 2880, y: 510, width: 220, height: 34 },
    ...floatingBlockCluster('cp-fb', 2816, 390, ['skyBrick', 'runeBox', 'skyBrick']),

    // ── Zone 4: 적 집결 구역 (x: 3220–4460) ──────────────────────
    // 갭: 3040–3220 (180px)
    { id: 'stone-04', kind: 'stone', x: 3460, y: 660, width: 480, height: 96 },
    ...floatingBlockCluster('zone4-fb', 3350, 440, ['skyBrick', 'runeBox', 'skyBrick', 'runeBox', 'skyBrick']),
    // 갭: 3700–3880 이 존재하나, stone-04가 3220–3700을 커버
    // 이동 발판 2가 3720–4100 사이를 연결 (아래 movingPlatforms 참고)
    { id: 'stone-05', kind: 'stone', x: 4280, y: 660, width: 360, height: 96 },

    // ── Zone 5: 계단 상승 (x: 4640–5230) ─────────────────────────
    // 갭: 4460–4640 (180px)
    { id: 'step-02', kind: 'cloud', x: 4740, y: 565, width: 200, height: 34 },
    { id: 'step-03', kind: 'cloud', x: 4960, y: 465, width: 200, height: 34 },
    { id: 'upper-01', kind: 'stone', x: 5170, y: 375, width: 200, height: 34 },
    ...floatingBlockCluster('upper-fb', 5060, 320, ['skyBrick', 'runeBox', 'skyBrick']),

    // ── Zone 6: 하강 + 최종 구간 (x: 5300–5800) ──────────────────
    { id: 'step-down', kind: 'cloud', x: 5350, y: 470, width: 180, height: 34 },
    { id: 'grass-end', kind: 'grass', x: 5610, y: 660, width: 440, height: 96 },
    ...floatingBlockCluster('end-fb', 5480, 370, ['skyBrick', 'skyBrick', 'runeBox'])
  ],

  movingPlatforms: [
    {
      id: 'breeze-01',
      x: 2270,
      y: 510,
      width: 170,
      height: 28,
      from: { x: 2270, y: 510 },
      to: { x: 2650, y: 510 },
      speed: 90
    },
    {
      id: 'breeze-02',
      x: 3760,
      y: 505,
      width: 160,
      height: 28,
      from: { x: 3760, y: 505 },
      to: { x: 4120, y: 505 },
      speed: 110
    }
  ],

  collectibles: [
    { id: 'seed-01', x: 220, y: 585 },
    { id: 'seed-02', x: 500, y: 585 },
    { id: 'seed-03', x: 960, y: 520 },
    { id: 'seed-04', x: 1310, y: 455 },
    { id: 'seed-05', x: 1620, y: 455 },
    { id: 'seed-06', x: 1710, y: 295 },
    { id: 'seed-07', x: 2120, y: 605 },
    { id: 'seed-08', x: 2840, y: 455 },
    { id: 'seed-09', x: 2900, y: 335 },
    { id: 'seed-10', x: 3415, y: 385 },
    { id: 'seed-11', x: 3590, y: 385 },
    { id: 'seed-12', x: 4310, y: 605 },
    { id: 'seed-13', x: 4770, y: 510 },
    { id: 'seed-14', x: 4980, y: 410 },
    { id: 'seed-15', x: 5190, y: 320 },
    { id: 'seed-16', x: 5620, y: 585 }
  ],

  powerUps: [
    { id: 'breeze-orb-01', x: 1750, y: 295, durationMs: 8000 },
    { id: 'breeze-orb-02', x: 5104, y: 265, durationMs: 8000 }
  ],

  enemies: [
    { id: 'drift-bug-01', kind: 'driftBug', x: 360, y: 600, patrolDistance: 180, speed: 65 },
    { id: 'puff-hopper-01', kind: 'puffHopper', x: 1650, y: 600, patrolDistance: 140, speed: 50 },
    { id: 'drift-bug-02', kind: 'driftBug', x: 2880, y: 600, patrolDistance: 160, speed: 70 },
    { id: 'drift-bug-03', kind: 'driftBug', x: 3430, y: 600, patrolDistance: 180, speed: 75 },
    { id: 'wind-wisp-01', kind: 'windWisp', x: 3620, y: 440, patrolDistance: 130, speed: 50 },
    { id: 'drift-bug-04', kind: 'driftBug', x: 4310, y: 600, patrolDistance: 150, speed: 78 }
  ],

  hazards: [
    { id: 'thorn-01', kind: 'thornCrystal', x: 3260, y: 620, width: 80, height: 46 },
    { id: 'thorn-02', kind: 'thornCrystal', x: 3660, y: 620, width: 80, height: 46 },
    { id: 'thorn-03', kind: 'thornCrystal', x: 4150, y: 620, width: 80, height: 46 },
    { id: 'thorn-04', kind: 'thornCrystal', x: 5450, y: 620, width: 80, height: 46 }
  ],

  checkpoints: [
    { id: 'lantern-01', label: 'Cloud Beacon', x: 2850, y: 590 },
    { id: 'lantern-02', label: 'Storm Lookout', x: 5170, y: 335 }
  ],

  finishGate: { id: 'storm-gate-01', x: 5700, y: 570 }
};
