import Phaser from "phaser";
import { publishGameState } from "../utils/debugState";
export class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super("LevelCompleteScene");
  }
  create(): void {
    publishGameState("levelComplete");
  }
}
