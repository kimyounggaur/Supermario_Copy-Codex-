export type TouchAction = 'left' | 'right' | 'jump' | 'run' | 'pause';

/** DOM and canvas controls share the same edge-triggered input semantics. */
export class TouchInputState {
  left = false;
  right = false;
  jump = false;
  run = false;
  private jumpPressed = false;
  private jumpReleased = false;
  private pausePressed = false;

  set(action: TouchAction, down: boolean): void {
    if (action === 'pause') { if (down) this.pausePressed = true; return; }
    if (action === 'jump') {
      if (down && !this.jump) this.jumpPressed = true;
      if (!down && this.jump) this.jumpReleased = true;
    }
    this[action] = down;
  }

  consume(edge: 'jumpPressed' | 'jumpReleased' | 'pausePressed'): boolean {
    const value = this[edge]; this[edge] = false; return value;
  }

  reset(): void {
    this.left = this.right = this.jump = this.run = false;
    this.jumpPressed = this.jumpReleased = this.pausePressed = false;
  }
}
