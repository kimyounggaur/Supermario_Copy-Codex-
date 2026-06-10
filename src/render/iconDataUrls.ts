import { PALETTE } from './palette';
import { TextureFactory } from './TextureFactory';
import { createTextureDefinitions, textureKeyForObjectType } from './textureDefinitions';

const iconCache = new Map<string, string>();

export function getTextureIconDataUrl(objectType: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const key = textureKeyForObjectType(objectType);
  if (iconCache.has(key)) {
    return iconCache.get(key)!;
  }

  const definition = createTextureDefinitions().find((item) => item.id === key);
  if (!definition) {
    return null;
  }

  const factory = new TextureFactory({ palette: PALETTE, logPerformance: false, dpr: 1 });
  const baked = factory.bake(definition.id, definition.draw, {
    baseSize: definition.baseSize,
    superSample: definition.superSample,
    variants: ['icon32']
  });
  const icon = baked.variants.icon32 ?? baked.canvas;
  const dataUrl = icon.toDataURL('image/png');
  iconCache.set(key, dataUrl);
  return dataUrl;
}
