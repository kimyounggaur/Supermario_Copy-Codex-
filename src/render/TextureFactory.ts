import { PALETTE, THEMES, mergePalette, type Palette, type ThemeId } from './palette';
import { createTextureDefinitions, type TextureDefinition } from './textureDefinitions';

export type TextureVariant = 'tile16' | 'icon32' | 'retina2x';
export type TextureDrawFn = (ctx: CanvasRenderingContext2D, size: number, palette: Palette) => void;

export interface BakeOptions {
  baseSize: number;
  superSample?: number;
  variants?: TextureVariant[];
}

export interface BakedTexture {
  id: string;
  canvas: HTMLCanvasElement;
  variants: Partial<Record<TextureVariant, HTMLCanvasElement>>;
  baseSize: number;
  internalSize: number;
}

export interface TextureFactoryOptions {
  createCanvas?: (width: number, height: number) => HTMLCanvasElement;
  dpr?: number;
  palette?: Palette;
  logPerformance?: boolean;
}

function defaultCreateCanvas(width: number, height: number): HTMLCanvasElement {
  if (typeof document === 'undefined') {
    throw new Error('TextureFactory needs a canvas provider outside the browser.');
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function contextFor(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not create a 2D canvas context for procedural texture baking.');
  }
  return ctx;
}

export class TextureFactory {
  private readonly cache = new Map<string, BakedTexture>();
  private readonly createCanvas: (width: number, height: number) => HTMLCanvasElement;
  private readonly dpr: number;
  private readonly logPerformance: boolean;
  private palette: Palette;

  constructor(options: TextureFactoryOptions = {}) {
    this.createCanvas = options.createCanvas ?? defaultCreateCanvas;
    this.dpr = options.dpr ?? (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
    this.palette = options.palette ?? PALETTE;
    this.logPerformance = options.logPerformance ?? true;
  }

  async bakeAll(theme: ThemeId = 'overworld'): Promise<void> {
    const palette = mergePalette(PALETTE, THEMES[theme].palette);
    this.rebakeWithPalette(palette);
  }

  bakeDefinitions(definitions: TextureDefinition[]): number {
    const start = performance.now();
    definitions.forEach((definition) => {
      this.bake(definition.id, definition.draw, {
        baseSize: definition.baseSize,
        superSample: definition.superSample,
        variants: definition.variants
      });
    });
    const elapsed = performance.now() - start;
    if (this.logPerformance) {
      console.info(`[TextureFactory] baked ${definitions.length} textures in ${elapsed.toFixed(1)}ms`);
    }
    return elapsed;
  }

  bake(id: string, drawFn: TextureDrawFn, opts: BakeOptions): BakedTexture {
    const superSample = opts.superSample ?? 4;
    const baseSize = opts.baseSize;
    const internalSize = baseSize * superSample;
    const internal = this.createCanvas(internalSize, internalSize);
    const internalCtx = contextFor(internal);
    internalCtx.clearRect(0, 0, internalSize, internalSize);
    drawFn(internalCtx, internalSize, this.palette);

    const baseCanvas = this.downsample(internal, baseSize);
    const variants = (opts.variants ?? []).reduce<Partial<Record<TextureVariant, HTMLCanvasElement>>>(
      (next, variant) => {
        next[variant] = this.downsample(internal, this.sizeForVariant(variant, baseSize));
        return next;
      },
      {}
    );

    const baked = { id, canvas: baseCanvas, variants, baseSize, internalSize };
    this.cache.set(id, baked);
    return baked;
  }

  get(id: string, variant?: TextureVariant): CanvasImageSource {
    const baked = this.getBaked(id);
    if (variant && baked.variants[variant]) {
      return baked.variants[variant];
    }
    return baked.canvas;
  }

  getBaked(id: string): BakedTexture {
    const baked = this.cache.get(id);
    if (!baked) {
      throw new Error(`Texture "${id}" has not been baked.`);
    }
    return baked;
  }

  getAll(): BakedTexture[] {
    return [...this.cache.values()];
  }

  rebakeWithPalette(palette: Palette): void {
    this.palette = palette;
    this.cache.clear();
    this.bakeDefinitions(createTextureDefinitions());
  }

  private sizeForVariant(variant: TextureVariant, baseSize: number): number {
    switch (variant) {
      case 'tile16':
        return 16 * this.dpr;
      case 'icon32':
        return 32 * this.dpr;
      case 'retina2x':
        return baseSize * 2 * this.dpr;
    }
  }

  private downsample(source: HTMLCanvasElement, size: number): HTMLCanvasElement {
    const canvas = this.createCanvas(size, size);
    const ctx = contextFor(canvas);
    ctx.clearRect(0, 0, size, size);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, 0, 0, size, size);
    return canvas;
  }
}
