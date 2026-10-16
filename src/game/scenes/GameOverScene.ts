import Phaser from "phaser";
import { publishGameState } from "../utils/debugState";
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
  }
  create(): void {
    publishGameState("gameOver");
  }
}
