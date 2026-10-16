import Phaser from "phaser";
import type { PlayerInput } from "../types";
import { TouchControls } from "./TouchControls";
import { getGameBridge, type GameUiBridge } from "../../ui/state/gameUiBridge";

type KeyName =
  | "left"
  | "right"
  | "down"
  | "a"
  | "d"
  | "space"
  | "w"
  | "up"
  | "shift"
  | "p"
  | "esc"
  | "r";
const emptyInput: PlayerInput = {
  left: false,
  right: false,
  down: false,
  jumpDown: false,
  jumpPressed: false,
  jumpReleased: false,
  run: false,
  pausePressed: false,
  restartPressed: false,
};

export class InputSystem {
  private readonly keys: Partial<Record<KeyName, Phaser.Input.Keyboard.Key>> =
    {};
  private readonly touch?: TouchControls;
  private readonly bridge?: GameUiBridge;
  private readonly blur = () => this.clear();

  constructor(private readonly scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;
    if (keyboard) {
      const codes: Record<KeyName, number> = {
        left: 37,
        right: 39,
        down: 40,
        a: 65,
        d: 68,
        space: 32,
        w: 87,
        up: 38,
        shift: 16,
        p: 80,
        esc: 27,
        r: 82,
      };
      (Object.keys(codes) as KeyName[]).forEach((name) => {
        this.keys[name] = keyboard.addKey(codes[name]);
      });
      keyboard.removeCapture([37, 39, 40, 65, 68, 32, 87, 38, 16, 80, 27, 82]);
    }
    this.bridge = getGameBridge(scene.game);
    if (!this.bridge) this.touch = new TouchControls(scene);
    window.addEventListener("blur", this.blur);
  }

  read(): PlayerInput {
    const active = document.activeElement as HTMLElement | null;
    if (
      active?.matches('input,textarea,select,[contenteditable="true"]') ||
      document.querySelector('[role="dialog"]')
    ) {
      this.clear();
      return { ...emptyInput };
    }
    const virtual = this.bridge?.touch.read();
    const jumpKeys = [this.keys.space, this.keys.w, this.keys.up];
    return {
      left:
        this.isDown(this.keys.left, this.keys.a) ||
        Boolean(virtual?.left) ||
        Boolean(this.touch?.getLeftDown()),
      right:
        this.isDown(this.keys.right, this.keys.d) ||
        Boolean(virtual?.right) ||
        Boolean(this.touch?.getRightDown()),
      down: this.isDown(this.keys.down),
      jumpDown:
        this.isDown(...jumpKeys) ||
        Boolean(virtual?.jumpDown) ||
        Boolean(this.touch?.getJumpDown()),
      jumpPressed:
        this.justDown(...jumpKeys) ||
        Boolean(virtual?.jumpPressed) ||
        Boolean(this.touch?.consumeJumpPressed()),
      jumpReleased:
        this.justUp(...jumpKeys) ||
        Boolean(virtual?.jumpReleased) ||
        Boolean(this.touch?.consumeJumpReleased()),
      run:
        Boolean(this.keys.shift?.isDown) ||
        Boolean(virtual?.run) ||
        Boolean(this.touch?.getRunDown()),
      pausePressed: this.bridge
        ? false
        : this.justDown(this.keys.p, this.keys.esc) ||
          Boolean(this.touch?.consumePausePressed()),
      restartPressed: this.justDown(this.keys.r),
    };
  }
  clear(): void {
    Object.values(this.keys).forEach((key) => key?.reset());
    this.bridge?.touch.clear();
  }
  clearPausePress(): void {
    this.touch?.consumePausePressed();
  }
  destroy(): void {
    this.clear();
    this.touch?.destroy();
    window.removeEventListener("blur", this.blur);
  }
  private isDown(
    ...keys: Array<Phaser.Input.Keyboard.Key | undefined>
  ): boolean {
    return keys.some((key) => Boolean(key?.isDown));
  }
  private justDown(
    ...keys: Array<Phaser.Input.Keyboard.Key | undefined>
  ): boolean {
    return keys.some((key) =>
      key ? Phaser.Input.Keyboard.JustDown(key) : false,
    );
  }
  private justUp(
    ...keys: Array<Phaser.Input.Keyboard.Key | undefined>
  ): boolean {
    return keys.some((key) =>
      key ? Phaser.Input.Keyboard.JustUp(key) : false,
    );
  }
}
