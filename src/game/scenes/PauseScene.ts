import Phaser from "phaser";
import { publishGameState } from "../utils/debugState";
export class PauseScene extends Phaser.Scene {
  constructor() {
    super("PauseScene");
  }
  create(): void {
    publishGameState("paused");
  }
}
