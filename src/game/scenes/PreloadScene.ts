import Phaser from 'phaser';
import {
  ART_TEXTURES,
  GAME_ART_EFFECTS,
  GAME_ART_IMAGES,
  artUrl
} from '../render/artCatalog';

export class PreloadScene extends Phaser.Scene {
  private missing: string[] = [];
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    this.missing = [];
    const progress = (value: number): void => {
      this.game.events.emit('art:progress', value);
      window.dispatchEvent(
        new CustomEvent('sky-sprout:art-progress', { detail: value })
      );
    };
    const failed = (file: Phaser.Loader.File): void => {
      this.missing.push(file.key);
      this.game.events.emit('art:error', { key: file.key, url: file.src });
    };
    this.load.on(Phaser.Loader.Events.PROGRESS, progress);
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, failed);
    this.load.once(Phaser.Loader.Events.COMPLETE, () => {
      this.load.off(Phaser.Loader.Events.PROGRESS, progress);
      this.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, failed);
    });
    if (!this.textures.exists(ART_TEXTURES.sprout)) {
      this.load.spritesheet(
        ART_TEXTURES.sprout,
        artUrl('raster/sprout-keyposes-strip.png'),
        { frameWidth: 256, frameHeight: 256 },
        { responseType: 'blob', timeout: 15000 }
      );
    }
    for (const [key, path] of GAME_ART_IMAGES) {
      if (!this.textures.exists(key))
        this.load.image(key, artUrl(path), {
          responseType: 'blob',
          timeout: 15000
        });
    }
    for (const [key, path] of GAME_ART_EFFECTS) {
      if (!this.textures.exists(key))
        this.load.svg(key, artUrl(path), undefined, {
          responseType: 'text',
          timeout: 15000
        });
    }
    progress(0);
  }

  create(): void {
    const expected = [
      ART_TEXTURES.sprout,
      ...GAME_ART_IMAGES.map(([key]) => key),
      ...GAME_ART_EFFECTS.map(([key]) => key)
    ];
    const missing = expected.filter((key) => !this.textures.exists(key));
    const result = {
      missing: Array.from(new Set([...this.missing, ...missing]))
    };
    this.game.events.emit('art:progress', 1);
    this.game.events.emit('art:ready', result);
    window.dispatchEvent(
      new CustomEvent('sky-sprout:art-ready', { detail: result })
    );
    const launch = window.__SKY_SPROUT_LAUNCH;
    if (launch?.skipMenu || launch?.level) {
      this.scene.start('LevelScene', {
        level: launch.level,
        testPlay: launch.testPlay
      });
      return;
    }

    this.scene.start('MenuScene');
  }
}
