# Sky Sprout Animation Principles

1. Pop-in placement uses scale `0.4 -> 1.0` with `Back.Out` over 180ms.
2. Deletion uses scale-to-zero, small rotation, and a short dust puff.
3. Idle objects must not freeze; editor idle motion runs at low amplitude.
4. Living objects use phase-randomized breathing or bobbing.
5. Selection feedback uses a moving yellow outline and fixed-size handles.
6. Motion must respect `prefers-reduced-motion` in the DOM UI.
7. New per-frame animation should update transforms only, not recreate textures.
