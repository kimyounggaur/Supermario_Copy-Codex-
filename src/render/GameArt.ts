import Phaser from 'phaser';

type Actor = Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
interface Visual { target: Actor; image: Phaser.GameObjects.Image; kind: 'player' | 'terrain' | 'item'; }
const textureMap: Record<string, string> = {
  'light-seed-shard': 'light-seed', 'big-light-seed': 'light-seed', 'drift-bug': 'drift-bug',
  'thorn-crystal': 'thorn-pod', 'breeze-orb': 'breeze-orb', 'growth-bud': 'growth-bud',
  'glow-lantern': 'checkpoint-lantern', 'glow-lantern-active': 'checkpoint-lantern',
  'terrain-rune-box': 'tile-rune', 'terrain-rune-box-used': 'tile-rune',
  'terrain-cloud': 'platform-cloud', 'moving-platform': 'platform-cloud'
};

/** Display-only companions keep every original physics texture, size, offset and collider intact. */
export class GameArt {
  private visuals: Visual[] = [];
  private readonly reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  constructor(private readonly scene: Phaser.Scene) {
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.update, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.update, this);
      this.visuals = [];
    });
  }

  attach(target: Actor): void {
    const key = target.texture.key;
    const player = key.startsWith('sprout-');
    const ground = ['terrain-grass', 'terrain-stone', 'terrain-sky-brick'].includes(key);
    const asset = player ? 'art-sprout-idle' : ground
      ? this.meadowTexture(target.displayWidth, target.displayHeight, key !== 'terrain-grass')
      : textureMap[key] ? `art-${textureMap[key]}` : '';
    if (!asset || !this.scene.textures.exists(asset)) return;
    const image = this.scene.add.image(target.x, target.y, asset).setDepth(target.depth + 0.1);
    image.setName(`art:${target.name || key}`);
    // Rendering is delegated, not visibility: collectible/defeat logic still owns visible/active.
    const renderable = target as unknown as { renderCanvas: () => void; renderWebGL: () => void };
    renderable.renderCanvas = () => undefined;
    renderable.renderWebGL = () => undefined;
    this.visuals.push({ target, image, kind: player ? 'player' : key.startsWith('terrain-') ? 'terrain' : 'item' });
    this.update(this.scene.time.now);
  }

  burst(x: number, y: number, kind: 'collect' | 'land'): void {
    const key = `art-fx-${kind}`;
    if (!this.scene.textures.exists(key)) return;
    const fx = this.scene.add.image(x, y, key).setDepth(25).setDisplaySize(kind === 'land' ? 55 : 44, kind === 'land' ? 22 : 44);
    this.scene.tweens.add({ targets: fx, alpha: 0, scaleX: fx.scaleX * 1.4, scaleY: fx.scaleY * 1.4,
      duration: this.reduced ? 120 : kind === 'land' ? 180 : 360, onComplete: () => fx.destroy() });
  }

  private update(time = 0): void {
    for (const { target, image, kind } of this.visuals) {
      if (!target.active || !target.scene) { image.setVisible(false); continue; }
      image.setVisible(target.visible).setAlpha(target.alpha).setFlipX(target.flipX).setRotation(target.rotation);
      const body = target.body as Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | null;
      const key = target.texture.key;
      if (kind === 'player') {
        const state = key.replace('sprout-', '');
        const pose = state === 'run' ? (this.reduced || Math.floor(time / 140) % 2 === 0 ? 'run-a' : 'run-b')
          : state === 'hurt' ? 'idle' : state === 'wall' ? 'jump' : state === 'crouch' ? 'land' : state;
        image.setTexture(`art-sprout-${pose}`).setOrigin(0.5, 244 / 256);
        const height = (body?.height ?? 34) + (state === 'crouch' ? 10 : 20);
        image.setDisplaySize(state === 'crouch' ? height * 1.2 : height, height);
        image.setPosition(body?.center.x ?? target.x, body?.bottom ?? target.y + 20);
        if (state === 'hurt') image.setTint(0xffcbb0); else image.clearTint();
      } else if (kind === 'terrain') {
        if (textureMap[key]) image.setTexture(`art-${textureMap[key]}`);
        image.setDisplaySize(target.displayWidth, target.displayHeight).setPosition(target.x, target.y);
        if (key.endsWith('-used')) image.setTint(0x87a79a); else image.clearTint();
      } else {
        if (textureMap[key]) image.setTexture(`art-${textureMap[key]}`);
        const floorAligned = key === 'drift-bug' || key.startsWith('glow-lantern');
        const width = key === 'drift-bug' ? 42 : key.startsWith('glow-lantern') ? 46
          : key === 'moving-platform' ? target.displayWidth : key === 'thorn-crystal' ? target.displayWidth : 30;
        const height = key === 'drift-bug' ? 35 : key.startsWith('glow-lantern') ? 56
          : key === 'moving-platform' || key === 'thorn-crystal' ? target.displayHeight : 34;
        image.setDisplaySize(width, height).setOrigin(0.5, floorAligned ? 244 / 256 : 0.5);
        image.setPosition(body?.center.x ?? target.x, floorAligned ? body?.bottom ?? target.y : target.y);
        if (key.endsWith('-active')) image.setTint(0xffef9e); else image.clearTint();
      }
    }
  }

  private meadowTexture(width: number, height: number, stone = false): string {
    const w = Math.max(1, Math.round(width)), h = Math.max(1, Math.round(height));
    const key = `art-ground-${w}-${h}-${stone}`;
    if (this.scene.textures.exists(key)) return key;
    if (!this.scene.textures.exists('art-platform-meadow')) return 'terrain-grass';
    const source = this.scene.textures.get('art-platform-meadow').getSourceImage() as HTMLImageElement;
    const canvas = document.createElement('canvas'); canvas.width = w * 2; canvas.height = h * 2;
    const ctx = canvas.getContext('2d'); if (!ctx) return 'terrain-grass';
    ctx.scale(2, 2); ctx.beginPath(); ctx.roundRect(0, 0, w, h, Math.min(10, h / 3)); ctx.clip();
    ctx.fillStyle = stone ? '#b98e60' : '#87bf38'; ctx.fillRect(0, 0, w, h);
    // Interior strips have no alpha gutters. Mirrored joins avoid obvious tile seams.
    const segment = stone ? 96 : 160;
    for (let x = 0, i = 0; x < w; x += segment, i++) {
      ctx.save(); ctx.translate(x + (i % 2 ? segment : 0), 0); ctx.scale(i % 2 ? -1 : 1, 1);
      ctx.drawImage(source, 330, 205, 300, 160, 0, stone ? 0 : 23, segment, stone ? h : Math.max(1, h - 23));
      if (!stone) ctx.drawImage(source, 330, 108, 300, 100, 0, -2, segment, 30);
      ctx.restore();
    }
    if (stone) { ctx.fillStyle = '#f8e5b03d'; ctx.fillRect(0, 0, w, 5); }
    const shade = ctx.createLinearGradient(0, 0, 0, h); shade.addColorStop(0, '#ffffff00'); shade.addColorStop(1, '#422e294f');
    ctx.fillStyle = shade; ctx.fillRect(0, 0, w, h);
    this.scene.textures.addCanvas(key, canvas); return key;
  }
}
