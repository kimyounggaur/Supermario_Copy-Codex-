import Phaser from 'phaser';
import { getLevelObjects, type LevelObject } from '../../game/data/LevelData';
import type { EditorEventBus } from '../EditorEventBus';
import type { EditorState } from '../schemas/levelDefaults';
import { isObjectEditable } from '../systems/EditorAdvancedTools';
import { snapToGrid } from '../utils/gridMath';
import { registerProceduralTextures } from '../../render/phaserTextures';
import { textureKeyForObjectType } from '../../render/textureDefinitions';

type DragState = {
  ids: string[];
  startX: number;
  startY: number;
};

type ObjectSprite = {
  image: Phaser.GameObjects.Image;
  baseScaleX: number;
  baseScaleY: number;
  baseY: number;
  phase: number;
  type: string;
  locked: boolean;
};

export class EditorScene extends Phaser.Scene {
  private bus!: EditorEventBus;
  private state!: EditorState;
  private gridGraphics!: Phaser.GameObjects.Graphics;
  private overlayGraphics!: Phaser.GameObjects.Graphics;
  private readonly objectSprites = new Map<string, ObjectSprite>();
  private dragState: DragState | null = null;
  private isPanning = false;
  private antsOffset = 0;
  private lastAntsStep = 0;

  constructor() {
    super('EditorScene');
  }

  init(data: { bus: EditorEventBus; state: EditorState }): void {
    this.bus = data.bus;
    this.state = data.state;
  }

  create(): void {
    registerProceduralTextures(this);
    this.cameras.main.setBackgroundColor('#c9f3ff');
    this.gridGraphics = this.add.graphics();
    this.overlayGraphics = this.add.graphics();
    this.input.mouse?.disableContextMenu();

    const unsubscribeState = this.bus.on('state:changed', (state) => {
      this.state = state;
      const camera = this.cameras?.main;
      if (!camera) {
        return;
      }

      camera.setBounds(
        0,
        0,
        state.level.world.widthTiles * state.level.world.tileSize,
        state.level.world.heightTiles * state.level.world.tileSize
      );
      camera.setZoom(state.camera.zoom);
      this.render();
    });
    const unsubscribeFocus = this.bus.on('focus', ({ x, y }) => {
      const camera = this.cameras?.main;
      if (!camera) {
        return;
      }

      camera.centerOn(x, y);
      this.emitCamera();
    });

    this.input.on('pointerdown', this.handlePointerDown, this);
    this.input.on('pointermove', this.handlePointerMove, this);
    this.input.on('pointerup', this.handlePointerUp, this);
    this.input.on('wheel', this.handleWheel, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      unsubscribeState();
      unsubscribeFocus();
      this.input.off('pointerdown', this.handlePointerDown, this);
      this.input.off('pointermove', this.handlePointerMove, this);
      this.input.off('pointerup', this.handlePointerUp, this);
      this.input.off('wheel', this.handleWheel, this);
    });

    this.render();
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (pointer.rightButtonDown() || this.state.activeTool === 'pan') {
      this.isPanning = true;
      return;
    }

    const world = this.worldPoint(pointer);
    const hit = this.hitTest(world.x, world.y);
    if (this.state.activeTool === 'brush' || this.state.activeTool === 'rectangle') {
      this.bus.emit('place', world);
      return;
    }

    if (this.state.activeTool === 'path') {
      this.bus.emit('path:addWaypoint', world);
      return;
    }

    if (this.state.activeTool === 'erase') {
      if (hit) {
        this.bus.emit('delete', { ids: [hit.id] });
      }
      return;
    }

    if (hit) {
      const additive = Boolean(pointer.event instanceof MouseEvent && pointer.event.shiftKey);
      const ids = additive ? [...new Set([...this.state.selectedIds, hit.id])] : [hit.id];
      this.bus.emit('select', { ids, additive });
      this.dragState = { ids, startX: world.x, startY: world.y };
      return;
    }

    this.bus.emit('select', { ids: [], additive: false });
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    const world = this.worldPoint(pointer);
    this.bus.emit('cursor', world);

    if (this.isPanning && pointer.isDown) {
      const camera = this.cameras.main;
      camera.scrollX -= pointer.velocity.x / camera.zoom / 16;
      camera.scrollY -= pointer.velocity.y / camera.zoom / 16;
      this.emitCamera();
    }
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    if (this.isPanning) {
      this.isPanning = false;
      return;
    }

    if (!this.dragState || this.state.activeTool !== 'select') {
      this.dragState = null;
      return;
    }

    const world = this.worldPoint(pointer);
    const snappedStart = this.state.grid.snap
      ? snapToGrid({ x: this.dragState.startX, y: this.dragState.startY }, this.state.grid.tileSize)
      : { x: this.dragState.startX, y: this.dragState.startY };
    const snappedEnd = this.state.grid.snap
      ? snapToGrid(world, this.state.grid.tileSize)
      : world;
    const delta = { x: snappedEnd.x - snappedStart.x, y: snappedEnd.y - snappedStart.y };

    if (Math.abs(delta.x) > 0 || Math.abs(delta.y) > 0) {
      this.bus.emit('move', { ids: this.dragState.ids, delta });
    }

    this.dragState = null;
  }

  private handleWheel(
    _pointer: Phaser.Input.Pointer,
    _objects: Phaser.GameObjects.GameObject[],
    _deltaX: number,
    deltaY: number
  ): void {
    const camera = this.cameras.main;
    const nextZoom = Phaser.Math.Clamp(camera.zoom + (deltaY < 0 ? 0.1 : -0.1), 0.35, 2.6);
    camera.setZoom(nextZoom);
    this.emitCamera();
    this.render();
  }

  private worldPoint(pointer: Phaser.Input.Pointer): { x: number; y: number } {
    const point = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    if (!this.state.grid.snap) {
      return { x: point.x, y: point.y };
    }

    return snapToGrid(point, this.state.grid.tileSize);
  }

  private emitCamera(): void {
    const camera = this.cameras?.main;
    if (!camera) {
      return;
    }

    this.bus.emit('camera', { x: camera.scrollX, y: camera.scrollY, zoom: camera.zoom });
  }

  private hitTest(x: number, y: number): LevelObject | null {
    const objects = getLevelObjects(this.state.level)
      .filter((object) => isObjectEditable(object, this.state.layers))
      .reverse();
    return (
      objects.find(
        (object) =>
          x >= object.x - object.width / 2 &&
          x <= object.x + object.width / 2 &&
          y >= object.y - object.height / 2 &&
          y <= object.y + object.height / 2
      ) ?? null
    );
  }

  private render(): void {
    if (!this.gridGraphics || !this.overlayGraphics) {
      return;
    }

    const width = this.state.level.world.widthTiles * this.state.level.world.tileSize;
    const height = this.state.level.world.heightTiles * this.state.level.world.tileSize;
    this.gridGraphics.clear();
    this.overlayGraphics.clear();

    this.gridGraphics.fillStyle(0xe7fbff, 1);
    this.gridGraphics.fillRect(0, 0, width, height);
    this.gridGraphics.lineStyle(4, 0x278b9d, 0.5);
    this.gridGraphics.strokeRect(0, 0, width, height);

    if (this.state.grid.visible) {
      const step = this.state.grid.tileSize * (this.cameras.main.zoom < 0.6 ? 2 : 1);
      this.gridGraphics.lineStyle(1, 0x6fb8c9, 0.28);
      for (let x = 0; x <= width; x += step) {
        this.gridGraphics.lineBetween(x, 0, x, height);
      }
      for (let y = 0; y <= height; y += step) {
        this.gridGraphics.lineBetween(0, y, width, y);
      }
    }

    const visibleObjects = getLevelObjects(this.state.level).filter(
      (object) => object.visible && this.state.layers[object.layer].visible
    );
    const visibleIds = new Set(visibleObjects.map((object) => object.id));

    for (const [id, sprite] of this.objectSprites) {
      if (!visibleIds.has(id)) {
        this.playDeleteFeedback(sprite.image);
        this.objectSprites.delete(id);
      }
    }

    for (const object of visibleObjects) {
      if (!object.visible || !this.state.layers[object.layer].visible) {
        continue;
      }
      this.drawObject(object);
    }

    this.drawOverlay();
  }

  private drawObject(object: LevelObject): void {
    const textureKey = textureKeyForObjectType(object.type);
    let sprite = this.objectSprites.get(object.id);

    if (!sprite) {
      const image = this.add.image(object.x, object.y, textureKey).setDepth(depthForObject(object));
      image.setAlpha(object.locked ? 0.38 : 0.96);
      image.setData('objectId', object.id);
      sprite = {
        image,
        baseScaleX: 1,
        baseScaleY: 1,
        baseY: object.y,
        phase: stablePhase(object.id),
        type: object.type,
        locked: object.locked
      };
      this.objectSprites.set(object.id, sprite);
      this.applySpriteSize(sprite, object);
      this.playPlaceFeedback(sprite.image, sprite.baseScaleX, sprite.baseScaleY);
      return;
    }

    sprite.image.setTexture(textureKey);
    sprite.image.setPosition(object.x, object.y);
    sprite.image.setAlpha(object.locked ? 0.38 : 0.96);
    sprite.image.setDepth(depthForObject(object));
    sprite.baseY = object.y;
    sprite.type = object.type;
    sprite.locked = object.locked;
    this.applySpriteSize(sprite, object);
  }

  update(time: number): void {
    if (!this.overlayGraphics) {
      return;
    }

    for (const sprite of this.objectSprites.values()) {
      if (sprite.image.active && !sprite.locked) {
        const strength = idleStrength(sprite.type);
        sprite.image.y = sprite.baseY + Math.sin(time / 1000 + sprite.phase) * strength.y;
        sprite.image.rotation = Math.sin(time / 1200 + sprite.phase) * strength.rotation;
      }
    }

    if (time - this.lastAntsStep > 60) {
      this.antsOffset = (this.antsOffset + 1) % 12;
      this.lastAntsStep = time;
      this.drawOverlay();
    }
  }

  private applySpriteSize(sprite: ObjectSprite, object: LevelObject): void {
    sprite.image.setDisplaySize(object.width, object.height);
    sprite.baseScaleX = sprite.image.scaleX;
    sprite.baseScaleY = sprite.image.scaleY;
  }

  private playPlaceFeedback(
    image: Phaser.GameObjects.Image,
    targetScaleX: number,
    targetScaleY: number
  ): void {
    image.setScale(targetScaleX * 0.4, targetScaleY * 0.4);
    this.tweens.add({
      targets: image,
      scaleX: targetScaleX,
      scaleY: targetScaleY,
      duration: 180,
      ease: 'Back.Out'
    });
    this.spawnPuff(image.x, image.y + image.displayHeight / 2 - 4, 4);
  }

  private playDeleteFeedback(image: Phaser.GameObjects.Image): void {
    this.spawnPuff(image.x, image.y, 3);
    this.tweens.add({
      targets: image,
      scaleX: 0,
      scaleY: 0,
      angle: image.angle + 15,
      alpha: 0,
      duration: 140,
      ease: 'Back.In',
      onComplete: () => image.destroy()
    });
  }

  private spawnPuff(x: number, y: number, count: number): void {
    for (let i = 0; i < count; i += 1) {
      const angle = (i / Math.max(count, 1)) * Math.PI * 2;
      const puff = this.add
        .image(x, y, 'dust-particle')
        .setDepth(1000)
        .setAlpha(0.72)
        .setScale(0.35);
      this.tweens.add({
        targets: puff,
        x: x + Math.cos(angle) * 12,
        y: y + Math.sin(angle) * 8 - 6,
        scaleX: 0.75,
        scaleY: 0.75,
        alpha: 0,
        duration: 220,
        ease: 'Quad.Out',
        onComplete: () => puff.destroy()
      });
    }
  }

  private drawOverlay(): void {
    this.overlayGraphics.clear();
    this.drawSelectedPaths();

    for (const id of this.state.selectedIds) {
      const object = getLevelObjects(this.state.level).find((item) => item.id === id);
      if (!object) {
        continue;
      }

      const x = object.x - object.width / 2 - 5;
      const y = object.y - object.height / 2 - 5;
      const w = object.width + 10;
      const h = object.height + 10;
      this.overlayGraphics.fillStyle(0xffd800, 0.08);
      this.overlayGraphics.fillRect(x, y, w, h);
      this.drawMarchingRect(x, y, w, h);
      this.drawSelectionHandles(x, y, w, h);
    }
  }

  private drawMarchingRect(x: number, y: number, w: number, h: number): void {
    const dash = 8;
    const gap = 6;
    const drawDashLine = (x1: number, y1: number, x2: number, y2: number) => {
      const length = Phaser.Math.Distance.Between(x1, y1, x2, y2);
      const dx = (x2 - x1) / Math.max(length, 1);
      const dy = (y2 - y1) / Math.max(length, 1);
      for (let offset = -this.antsOffset; offset < length; offset += dash + gap) {
        const start = Math.max(0, offset);
        const end = Math.min(length, offset + dash);
        if (end <= 0) {
          continue;
        }
        this.overlayGraphics.lineStyle(2, 0xffd800, 0.95);
        this.overlayGraphics.lineBetween(
          x1 + dx * start,
          y1 + dy * start,
          x1 + dx * end,
          y1 + dy * end
        );
      }
    };

    drawDashLine(x, y, x + w, y);
    drawDashLine(x + w, y, x + w, y + h);
    drawDashLine(x + w, y + h, x, y + h);
    drawDashLine(x, y + h, x, y);
  }

  private drawSelectionHandles(x: number, y: number, w: number, h: number): void {
    const points = [
      [x, y],
      [x + w / 2, y],
      [x + w, y],
      [x + w, y + h / 2],
      [x + w, y + h],
      [x + w / 2, y + h],
      [x, y + h],
      [x, y + h / 2]
    ];
    points.forEach(([px, py]) => {
      this.overlayGraphics.fillStyle(0x000000, 0.18);
      this.overlayGraphics.fillCircle(px + 1, py + 2, 5);
      this.overlayGraphics.fillStyle(0xffffff, 1);
      this.overlayGraphics.fillCircle(px, py, 5);
      this.overlayGraphics.lineStyle(1, 0xc77400, 0.95);
      this.overlayGraphics.strokeCircle(px, py, 5);
    });
  }

  private drawSelectedPaths(): void {
    for (const id of this.state.selectedIds) {
      const object = getLevelObjects(this.state.level).find((item) => item.id === id);
      if (!object || object.type !== 'movingBreezePlatform' || object.waypoints.length < 2) {
        continue;
      }

      this.overlayGraphics.lineStyle(3, object.mode === 'loop' ? 0x48c78e : 0x247ba0, 0.95);
      object.waypoints.forEach((waypoint, index) => {
        const next = object.waypoints[index + 1] ?? (object.mode === 'loop' ? object.waypoints[0] : null);
        this.overlayGraphics.fillStyle(0xffffff, 1);
        this.overlayGraphics.fillCircle(waypoint.x, waypoint.y, 6);
        this.overlayGraphics.lineStyle(2, 0x1b5768, 1);
        this.overlayGraphics.strokeCircle(waypoint.x, waypoint.y, 6);
        if (next) {
          this.overlayGraphics.lineBetween(waypoint.x, waypoint.y, next.x, next.y);
        }
      });
    }
  }
}

export function createEditorGame(
  parent: HTMLElement,
  bus: EditorEventBus,
  state: EditorState,
  size: { width: number; height: number }
): Phaser.Game {
  const game = new Phaser.Game({
    type: Phaser.CANVAS,
    parent,
    width: size.width,
    height: size.height,
    backgroundColor: '#c9f3ff',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: []
  });
  game.scene.add('EditorScene', new EditorScene(), true, { bus, state });
  return game;
}

function depthForObject(object: LevelObject): number {
  switch (object.layer) {
    case 'decorations':
      return 1;
    case 'terrain':
      return 2;
    case 'platforms':
      return 3;
    case 'items':
      return 4;
    case 'enemies':
      return 5;
    case 'hazards':
      return 6;
    case 'utilities':
      return 7;
  }
}

function stablePhase(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return (hash % 628) / 100;
}

function idleStrength(type: string): { y: number; rotation: number } {
  if (type === 'driftBug' || type === 'puffHopper' || type === 'windWisp') {
    return { y: 1.2, rotation: 0.025 };
  }
  if (type === 'lightSeedShard' || type === 'bigLightSeed' || type === 'breezeOrb') {
    return { y: 1.4, rotation: 0.018 };
  }
  if (type === 'growthBud' || type === 'tinySprout' || type === 'cloudTuft') {
    return { y: 0.8, rotation: 0.016 };
  }
  return { y: 0.35, rotation: 0 };
}
