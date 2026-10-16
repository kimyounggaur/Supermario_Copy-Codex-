export type TouchAction = "left" | "right" | "jump" | "run";

/** Pointer ownership keeps one finger's release from cancelling another finger. */
export class TouchInputState {
  private pointers = new Map<number, TouchAction>();
  private pressed = false;
  private released = false;

  setPointer(id: number, action: TouchAction): void {
    const wasJumping = this.isHeld("jump");
    this.pointers.set(id, action);
    if (!wasJumping && this.isHeld("jump")) this.pressed = true;
  }

  releasePointer(id: number): void {
    const wasJumping = this.isHeld("jump");
    this.pointers.delete(id);
    if (wasJumping && !this.isHeld("jump")) this.released = true;
  }

  isHeld(action: TouchAction): boolean {
    return [...this.pointers.values()].includes(action);
  }

  read() {
    const sample = {
      left: this.isHeld("left"),
      right: this.isHeld("right"),
      run: this.isHeld("run"),
      jumpDown: this.isHeld("jump"),
      jumpPressed: this.pressed,
      jumpReleased: this.released,
    };
    this.pressed = false;
    this.released = false;
    return sample;
  }

  clear(): void {
    this.pointers.clear();
    this.pressed = false;
    this.released = false;
  }
}
