import Phaser from 'phaser';
import { registerProceduralTextures } from '../../render/phaserTextures';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    registerProceduralTextures(this);
    this.scene.start('PreloadScene');
  }
}
