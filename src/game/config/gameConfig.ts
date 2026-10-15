import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './constants';
import { physicsConfig } from './physicsConfig';
import { BootScene } from '../scenes/BootScene';
import { GameOverScene } from '../scenes/GameOverScene';
import { HudScene } from '../scenes/HudScene';
import { LevelCompleteScene } from '../scenes/LevelCompleteScene';
import { LevelScene } from '../scenes/LevelScene';
import { MenuScene } from '../scenes/MenuScene';
import { PauseScene } from '../scenes/PauseScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { gameViewport } from './viewport';

export function createGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  const size = window.__SKY_SPROUT_DOM_UI ? gameViewport(parent.clientWidth, parent.clientHeight) : { width: GAME_WIDTH, height: GAME_HEIGHT };
  return {
    type: Phaser.CANVAS,
    parent,
    backgroundColor: '#76cdf5',
    width: size.width,
    height: size.height,
    pixelArt: false,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: size.width,
      height: size.height
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: physicsConfig.gravityY, x: 0 },
        debug: physicsConfig.debug
      }
    },
    scene: [
      BootScene,
      PreloadScene,
      MenuScene,
      LevelScene,
      HudScene,
      PauseScene,
      GameOverScene,
      LevelCompleteScene
    ]
  };
}
