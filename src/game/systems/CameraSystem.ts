import Phaser from "phaser";
import type { LevelData } from "../types";
import { Player } from "../entities/Player";

export class CameraSystem {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly level: LevelData,
  ) {}
  private player?: Player;

  follow(player: Player): void {
    this.player = player;
    const camera = this.scene.cameras.main;
    camera.setBounds(0, 0, this.level.world.width, this.level.world.height);
    this.resize();
    camera.startFollow(player, false, 0.08, 0.1);
    this.scene.scale.on(Phaser.Scale.Events.RESIZE, this.resize, this);
  }

  private resize(): void {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    const portrait = height > width * 1.15;
    const zoom = portrait
      ? Math.max(0.88, Math.min(1.08, width / 390))
      : Math.min(width / 960, height / 540);
    const camera = this.scene.cameras.main;
    camera.setViewport(0, 0, width, height);
    camera.setZoom(Math.max(0.6, zoom));
    // Extra camera-only air below the stage keeps the hero above thumb controls.
    // This does not extend physics bounds or move the fall line/level geometry.
    camera.setBounds(
      0,
      0,
      this.level.world.width,
      this.level.world.height + (portrait ? (height / camera.zoom) * 0.45 : 0),
    );
    camera.setDeadzone(Math.min(140, (width / camera.zoom) * 0.2), 110);
    if (this.player) this.update(this.player);
  }

  update(player: Player): void {
    const camera = this.scene.cameras.main;
    const lookahead = Math.min(90, (camera.width / camera.zoom) * 0.2);
    camera.setFollowOffset(
      player.facing > 0 ? -lookahead : lookahead * 0.78,
      32,
    );
  }

  destroy(): void {
    this.scene.scale.off(Phaser.Scale.Events.RESIZE, this.resize, this);
  }
}
