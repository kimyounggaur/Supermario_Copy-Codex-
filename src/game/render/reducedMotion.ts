import Phaser from 'phaser';
import { prefersReducedMotion } from '../../ui/state/preferences';

interface SceneMotion {
  reduced: boolean;
  tweens: Set<Phaser.Tweens.Tween>;
}

const scenes = new WeakMap<Phaser.Scene, SceneMotion>();

/** Only decorative loops belong here; movement paths and item emergence keep their timings. */
export function trackDecorativeTween(
  scene: Phaser.Scene,
  tween: Phaser.Tweens.Tween
): void {
  let motion = scenes.get(scene);
  if (!motion) {
    motion = { reduced: prefersReducedMotion(), tweens: new Set() };
    scenes.set(scene, motion);
    const tracked = motion;
    const sync = (): void => {
      const reduced = prefersReducedMotion();
      if (reduced === tracked.reduced) return;
      tracked.reduced = reduced;
      tracked.tweens.forEach((item) =>
        reduced ? item.pause() : item.resume()
      );
    };
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, sync);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.events.off(Phaser.Scenes.Events.POST_UPDATE, sync);
      tracked.tweens.clear();
      scenes.delete(scene);
    });
  }
  motion.tweens.add(tween);
  if (motion.reduced) tween.pause();
}
