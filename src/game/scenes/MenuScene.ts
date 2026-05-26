import Phaser from 'phaser';
import { DEPTHS, GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
import { AudioManager } from '../systems/AudioManager';
import { publishGameState } from '../utils/debugState';

export class MenuScene extends Phaser.Scene {
  private started = false;
  private subtitle?: Phaser.GameObjects.Text;
  private startButtonItems: Array<Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text> = [];
  private levelSelectItems: Array<Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text> = [];

  constructor() {
    super('MenuScene');
  }

  create(): void {
    this.started = false;
    publishGameState('title');
    this.drawScene();

    this.input.keyboard?.once('keydown-ENTER', this.openLevelSelect, this);
    this.input.keyboard?.once('keydown-SPACE', this.openLevelSelect, this);
  }

  private drawScene(): void {
    const sky = this.add.graphics().setDepth(DEPTHS.background);
    sky.fillGradientStyle(0x79d5ff, 0x79d5ff, 0xb9f2ff, 0xb9f2ff, 1);
    sky.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    sky.fillStyle(0xffffff, 0.55);
    sky.fillEllipse(170, 130, 230, 64);
    sky.fillEllipse(420, 95, 170, 48);
    sky.fillEllipse(760, 145, 260, 70);
    sky.fillStyle(0xa3e188, 1);
    sky.fillRoundedRect(0, 440, GAME_WIDTH, 110, 24);
    sky.fillStyle(0x77c970, 1);
    sky.fillEllipse(420, 452, 500, 70);

    this.add
      .text(GAME_WIDTH / 2, 145, 'Sky Sprout Runner', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '56px',
        color: '#123237',
        stroke: '#f7fffb',
        strokeThickness: 6
      })
      .setOrigin(0.5)
      .setDepth(DEPTHS.ui);

    this.subtitle = this.add
      .text(GAME_WIDTH / 2, 205, 'Wind Island Ascent', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '22px',
        color: '#24464b'
      })
      .setOrigin(0.5)
      .setDepth(DEPTHS.ui);

    this.add.image(GAME_WIDTH / 2, 310, 'sprout-idle').setScale(2.2).setDepth(DEPTHS.ui);

    const button = this.add
      .rectangle(GAME_WIDTH / 2, 405, 190, 58, 0xf4fff7, 0.92)
      .setStrokeStyle(3, 0x2d9560, 0.9)
      .setDepth(DEPTHS.ui)
      .setInteractive({ useHandCursor: true });
    const label = this.add
      .text(GAME_WIDTH / 2, 405, 'Start', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '28px',
        color: '#123237'
      })
      .setOrigin(0.5)
      .setDepth(DEPTHS.ui + 1);

    button.on('pointerover', () => button.setFillStyle(0xe4fff1, 1));
    button.on('pointerout', () => button.setFillStyle(0xf4fff7, 0.92));
    button.on('pointerdown', this.openLevelSelect, this);
    label.setInteractive({ useHandCursor: true }).on('pointerdown', this.openLevelSelect, this);
    this.startButtonItems = [button, label];
  }

  private openLevelSelect(): void {
    if (this.levelSelectItems.length > 0) {
      return;
    }

    AudioManager.get().play('button');
    this.subtitle?.setVisible(false);
    for (const item of this.startButtonItems) {
      item.setVisible(false);
      if (item.input) {
        item.disableInteractive();
      }
    }

    const levels = [
      'Level 1  Wind Island Ascent',
      'Level 2  구름 섬의 시련',
      'Level 3  별빛 폭풍 전장',
      'Level 4  고대 신전의 최후 관문'
    ];

    levels.forEach((label, index) => {
      this.createLevelButton(300 + index * 62, index + 1, label);
    });
  }

  private createLevelButton(y: number, levelNumber: number, label: string): void {
    const button = this.add
      .rectangle(GAME_WIDTH / 2, y, 340, 52, 0xf0fef4, 0.96)
      .setStrokeStyle(2, 0x2d9560, 0.95)
      .setDepth(DEPTHS.ui)
      .setInteractive({ useHandCursor: true });
    const text = this.add
      .text(GAME_WIDTH / 2, y, label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        color: '#123237'
      })
      .setOrigin(0.5)
      .setDepth(DEPTHS.ui + 1)
      .setInteractive({ useHandCursor: true });

    const startSelectedLevel = () => this.startGame(levelNumber);
    button.on('pointerover', () => button.setFillStyle(0xe4fff1, 1));
    button.on('pointerout', () => button.setFillStyle(0xf0fef4, 0.96));
    button.on('pointerdown', startSelectedLevel);
    text.on('pointerdown', startSelectedLevel);
    this.levelSelectItems.push(button, text);
  }

  private startGame(levelNumber: number): void {
    if (this.started) {
      return;
    }

    this.started = true;
    AudioManager.get().play('button');
    this.scene.start('LevelScene', { levelNumber });
  }
}
