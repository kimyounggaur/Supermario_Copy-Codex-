import Phaser from "phaser";
import { DEPTHS } from "../config/constants";
import { prefersReducedMotion } from "../../ui/state/preferences";

export class ParticleSystem {
  private effects = new Set<Phaser.GameObjects.GameObject>();
  constructor(private readonly scene: Phaser.Scene) {
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.effects.forEach((effect) => effect.destroy());
      this.effects.clear();
    });
  }
  jumpDust(x: number, y: number): void {
    this.burst(x, y + 18, "dust-particle", 6, 220, 70);
  }
  landDust(x: number, y: number): void {
    this.effect(x, y + 20, "art-fx-land", 76, 30, 170);
  }
  collectSpark(x: number, y: number): void {
    this.effect(x, y, "art-fx-collect", 64, 64, 550);
    this.burst(x, y, "spark-particle", 6, 360, 95);
  }
  hurt(x: number, y: number): void {
    this.effect(x, y, "art-fx-hurt", 54, 54, 160);
  }
  enemyBurst(x: number, y: number): void {
    this.burst(x, y, "leaf-particle", 10, 320, 100);
  }
  private effect(
    x: number,
    y: number,
    key: string,
    width: number,
    height: number,
    duration: number,
  ): void {
    if (this.effects.size >= 20 || !this.scene.textures.exists(key)) return;
    const image = this.scene.add
      .image(x, y, key)
      .setDisplaySize(width, height)
      .setDepth(DEPTHS.particles);
    this.effects.add(image);
    this.scene.tweens.add({
      targets: image,
      alpha: 0,
      duration,
      onComplete: () => {
        this.effects.delete(image);
        image.destroy();
      },
    });
  }
  private burst(
    x: number,
    y: number,
    texture: string,
    quantity: number,
    lifespan: number,
    speed: number,
  ): void {
    if (this.effects.size >= 20) return;
    if (prefersReducedMotion()) quantity = Math.min(3, quantity);
    const emitter = this.scene.add.particles(x, y, texture, {
      speed: { min: speed * 0.4, max: speed },
      angle: { min: 205, max: 335 },
      lifespan,
      quantity,
      scale: { start: 1, end: 0 },
      alpha: { start: 0.9, end: 0 },
      gravityY: 420,
      emitting: false,
    });
    this.effects.add(emitter);
    emitter.setDepth(DEPTHS.particles);
    emitter.explode(quantity);
    this.scene.time.delayedCall(lifespan + 80, () => {
      this.effects.delete(emitter);
      emitter.destroy();
    });
  }
}
