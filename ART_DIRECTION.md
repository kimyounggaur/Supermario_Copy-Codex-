# Sky Sprout Art Direction

## Style

The project uses modern soft shading: rounded silhouettes, high-chroma colors,
upper-left light, smooth gradients, bevels, specular bands, and soft contact
shadows. It is intentionally IP-safe: Mario Maker reference techniques are
translated onto the original Sky Sprout object set.

## Shared Visual Grammar

- Light always comes from the upper-left.
- Forms are separated by tonal steps, not black outlines.
- Every solid object has at least one rounded edge.
- Blocks use bevels, rivets, speckles, and subtle ambient occlusion.
- Living objects use vertical oval eyes with small gloss dots.
- Editor and gameplay icons must come from the same procedural texture factory.

## Avoid

- Flat single-color fills for shippable objects.
- 1px black outlines as the primary shape definition.
- Default CSS-looking shadows on game-world UI.
- Creating gradients or paths inside per-frame gameplay loops.

## Rendering Audit

| Object family | Previous implementation | Gap | Priority |
|---|---|---|---|
| Terrain blocks | Phaser Graphics flat fills in BootScene and EditorScene | No shared factory, limited bevel/highlight, editor/game mismatch | High |
| Rune box | Small flat rounded rect with simple diamond | No dedicated rivets, extrusion, sweep highlight, used-state polish | High |
| Items | Simple circles/ellipses | Limited radial light, no shared icon variant | High |
| Enemies | Simple ellipses/circles | Not enough facial detail, weak idle life | Medium |
| Editor selection | Static blue rectangle | No marching ants, handles, or pop feedback | High |
| Palette UI | CSS swatches | Did not use gameplay textures | High |
| Background | Scene-local graphics | No reusable theme palette or gallery verification | Medium |

## Strategy

Use procedural high-resolution baking by default. Each texture is drawn once to a
4x internal canvas and downsampled to runtime variants. This keeps asset size low,
supports future theme swaps, and prevents gradient/path creation during gameplay.

## Phase Estimate

| Phase | Implemented path | Main files |
|---|---|---|
| V1 | PaintKit, TextureFactory, palettes, easing | `src/render/*` |
| V2-V5 | Original Sky Sprout texture recipes | `src/render/textureDefinitions.ts` |
| V6 | Editor placement/delete/select feedback | `src/editor/scenes/EditorScene.ts` |
| V7 | Theme-ready palette overrides | `src/render/palette.ts` |
| V8 | UI tokens, texture-backed palette, gallery | `src/styles/global.css`, `PalettePanel.tsx` |
| V9 | Unit tests, build, browser gallery check | `tests/unit/renderingArtKit.test.ts` |
