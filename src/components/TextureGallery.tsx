import { useMemo, useState } from 'react';
import { PALETTE } from '../render/palette';
import { TextureFactory } from '../render/TextureFactory';
import { createTextureDefinitions } from '../render/textureDefinitions';

type GalleryBackground = 'light' | 'dark' | 'checker';

export function TextureGallery() {
  const [background, setBackground] = useState<GalleryBackground>('checker');
  const textures = useMemo(() => {
    if (typeof document === 'undefined') {
      return [];
    }

    const factory = new TextureFactory({ palette: PALETTE, dpr: 1, logPerformance: false });
    factory.bakeDefinitions(createTextureDefinitions());
    return factory.getAll().map((texture) => ({
      id: texture.id,
      base: texture.canvas.toDataURL('image/png'),
      icon: (texture.variants.icon32 ?? texture.canvas).toDataURL('image/png'),
      tile: (texture.variants.tile16 ?? texture.canvas).toDataURL('image/png'),
      retina: (texture.variants.retina2x ?? texture.canvas).toDataURL('image/png')
    }));
  }, []);

  return (
    <section className={`texture-gallery texture-gallery--${background}`} aria-label="Texture gallery">
      <header className="texture-gallery__header">
        <div>
          <h1>Texture Gallery</h1>
          <p>{textures.length} baked procedural textures</p>
        </div>
        <div className="texture-gallery__toggles" aria-label="Background preview">
          {(['checker', 'light', 'dark'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              className={background === mode ? 'is-active' : ''}
              onClick={() => setBackground(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
      </header>
      <div className="texture-gallery__grid">
        {textures.map((texture) => (
          <article className="texture-gallery__item" key={texture.id}>
            <div className="texture-gallery__preview">
              <img src={texture.retina} alt="" />
            </div>
            <strong>{texture.id}</strong>
            <div className="texture-gallery__variants">
              <img src={texture.tile} alt={`${texture.id} 16px`} />
              <img src={texture.icon} alt={`${texture.id} 32px`} />
              <img src={texture.base} alt={`${texture.id} base`} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
