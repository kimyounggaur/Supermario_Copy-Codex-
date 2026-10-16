import Phaser from "phaser";
import { createGameConfig } from "./config/gameConfig";
import type { GameUiBridge } from "../ui/state/gameUiBridge";

export function createGame(
  parent: HTMLElement,
  bridge?: GameUiBridge,
): Phaser.Game {
  return new Phaser.Game(createGameConfig(parent, bridge));
}
