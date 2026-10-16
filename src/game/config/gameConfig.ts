import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "./constants";
import { physicsConfig } from "./physicsConfig";
import { BootScene } from "../scenes/BootScene";
import { GameOverScene } from "../scenes/GameOverScene";
import { HudScene } from "../scenes/HudScene";
import { LevelCompleteScene } from "../scenes/LevelCompleteScene";
import { LevelScene } from "../scenes/LevelScene";
import { MenuScene } from "../scenes/MenuScene";
import { PauseScene } from "../scenes/PauseScene";
import { PreloadScene } from "../scenes/PreloadScene";
import type { GameUiBridge } from "../../ui/state/gameUiBridge";

export function createGameConfig(
  parent: HTMLElement,
  bridge?: GameUiBridge,
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.CANVAS,
    parent,
    backgroundColor: "#76cdf5",
    width: parent.clientWidth || GAME_WIDTH,
    height: parent.clientHeight || GAME_HEIGHT,
    pixelArt: false,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: parent.clientWidth || GAME_WIDTH,
      height: parent.clientHeight || GAME_HEIGHT,
    },
    callbacks: {
      preBoot: (game) => {
        if (!bridge) return;
        game.registry.set("uiBridge", bridge);
        game.events.on("art:progress", (progress: number) =>
          bridge.patch({ progress }),
        );
        game.events.on("art:ready", ({ missing }: { missing: string[] }) =>
          bridge.patch({ progress: 1, missing }),
        );
      },
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: physicsConfig.gravityY, x: 0 },
        debug: physicsConfig.debug,
      },
    },
    scene: [
      BootScene,
      PreloadScene,
      MenuScene,
      LevelScene,
      HudScene,
      PauseScene,
      GameOverScene,
      LevelCompleteScene,
    ],
  };
}
