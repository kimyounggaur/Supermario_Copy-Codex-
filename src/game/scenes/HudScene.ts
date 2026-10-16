import Phaser from "phaser";
import { EVENTS } from "../config/constants";
import type { HudPayload } from "../types";
import { publishHudState } from "../utils/debugState";
import { getGameBridge } from "../../ui/state/gameUiBridge";

export class HudScene extends Phaser.Scene {
  constructor() {
    super("HudScene");
  }
  create(): void {
    this.game.events.on(EVENTS.hudUpdate, this.updateHud, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () =>
      this.game.events.off(EVENTS.hudUpdate, this.updateHud, this),
    );
  }
  private updateHud(payload: HudPayload): void {
    publishHudState(payload);
    getGameBridge(this.game)?.updateHud(payload);
  }
}
