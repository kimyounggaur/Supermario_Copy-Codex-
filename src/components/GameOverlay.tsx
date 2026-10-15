import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ART_BASE } from '../render/ArtAssets';
import type { HudPayload } from '../game/types';
import type { ScenePanelData, PanelAction } from '../game/systems/ScenePanel';
import type { TouchAction } from '../game/systems/TouchInputState';

const initialHud: HudPayload = { health: 3, shards: 0, totalShards: 0, score: 0, elapsedSeconds: 0, checkpointLabel: 'Start', powerActive: false, highScore: 0 };
const input = (action: TouchAction, down: boolean) => window.dispatchEvent(new CustomEvent('sky-sprout:input', { detail: { action, down } }));
const resetInput = () => window.dispatchEvent(new Event('sky-sprout:input-reset'));
const icon = (name: string) => `${ART_BASE}svg/${name}.svg`;

export function GameOverlay({ testPlay, onExit }: { testPlay: boolean; onExit: () => void }) {
  const [hud, setHud] = useState(initialHud);
  const [ready, setReady] = useState(false);
  const [panel, setPanel] = useState<ScenePanelData | null>(null);
  const held = useRef(new Map<number, TouchAction>());
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hudUpdate = (event: Event) => setHud((event as CustomEvent<HudPayload>).detail);
    const showPanel = (event: Event) => { resetInput(); held.current.clear(); setPanel((event as CustomEvent<ScenePanelData>).detail); };
    const gameState = (event: Event) => {
      const playing = (event as CustomEvent<string>).detail === 'playing';
      if (playing) { setReady(true); setPanel(null); }
    };
    const release = () => { held.current.clear(); resetInput(); };
    window.addEventListener('sky-sprout:hud', hudUpdate);
    window.addEventListener('sky-sprout:panel', showPanel);
    window.addEventListener('sky-sprout-state', gameState);
    window.addEventListener('blur', release);
    document.addEventListener('visibilitychange', release);
    return () => {
      release();
      window.removeEventListener('sky-sprout:hud', hudUpdate);
      window.removeEventListener('sky-sprout:panel', showPanel);
      window.removeEventListener('sky-sprout-state', gameState);
      window.removeEventListener('blur', release);
      document.removeEventListener('visibilitychange', release);
    };
  }, []);

  useEffect(() => {
    if (panel) dialog.current?.querySelector('button')?.focus();
    else if (ready) document.querySelector<HTMLDivElement>('.game-canvas-host')?.focus({ preventScroll: true });
  }, [panel, ready]);

  const action = (id: PanelAction) => {
    resetInput();
    if (id === 'menu' || (id === 'next' && panel?.nextLabel === 'menu')) { onExit(); return; }
    window.dispatchEvent(new CustomEvent('sky-sprout:panel-action', { detail: id }));
  };
  const releasePointer = (event: PointerEvent<HTMLButtonElement>) => {
    const id = held.current.get(event.pointerId);
    held.current.delete(event.pointerId);
    if (id && ![...held.current.values()].includes(id)) input(id, false);
  };
  const keyInput = (event: KeyboardEvent<HTMLButtonElement>, id: TouchAction, down: boolean) => {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault(); event.stopPropagation(); input(id, down);
  };
  const control = (id: TouchAction, label: string, image: string, caption: string) => (
    <button type="button" className={`sprout-control sprout-control--${id}`} aria-label={label} disabled={!ready || Boolean(panel)}
      onPointerDown={event => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); held.current.set(event.pointerId, id); input(id, true); }}
      onPointerUp={releasePointer} onPointerCancel={releasePointer} onLostPointerCapture={releasePointer}
      onKeyDown={event => keyInput(event, id, true)} onKeyUp={event => keyInput(event, id, false)} onBlur={() => input(id, false)}>
      <img src={icon(image)} alt="" draggable="false" /><span>{caption}</span>
    </button>
  );
  const trapTab = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;
    const buttons = dialog.current?.querySelectorAll<HTMLButtonElement>('button');
    if (!buttons?.length) return;
    const first = buttons[0], last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  const title = panel?.kind === 'pause' ? '잠깐, 숨을 고르고' : panel?.kind === 'complete' ? '바람의 문에 도착했어요!' : '다시, 가볍게 도약!';

  return <>
    <header className="sprout-hud" aria-label="Game status">
      <div className="sprout-health" aria-label={`Health ${hud.health} of 3`}>
        {[0, 1, 2].map(i => <img key={i} src={icon('health-leaf')} alt="" className={i < hud.health ? '' : 'is-empty'} />)}
      </div>
      <div className="sprout-seeds"><img src={icon('seed-icon')} alt="" /><strong key={hud.shards}>{hud.shards}<small> / {hud.totalShards}</small></strong></div>
      <div className="sprout-score"><small>SCORE</small><strong>{hud.score.toLocaleString()}</strong></div>
      <div className="sprout-time"><small>TIME</small><strong>{Math.floor(hud.elapsedSeconds / 60)}:{String(hud.elapsedSeconds % 60).padStart(2, '0')}</strong></div>
      {testPlay ? <button className="sprout-icon-button editor-return" onClick={onExit} aria-label="Return to Editor">에디터로</button>
        : <button className="sprout-icon-button" aria-label="Pause" disabled={!ready || Boolean(panel)} onClick={() => input('pause', true)}><img src={icon('pause')} alt="" /></button>}
    </header>
    <div className="sprout-world-label"><span>{testPlay ? 'SKY FORGE · TEST PLAY' : 'SKY ISLANDS · ADVENTURE'}</span><span>{hud.powerActive ? '✦ 바람의 힘' : hud.checkpointLabel === 'Start' ? '빛의 씨앗을 따라가요' : `◈ ${hud.checkpointLabel}`}</span></div>
    {!ready && <div className="sprout-loading" role="status">하늘섬으로 가는 중…</div>}
    <footer className="sprout-controls" aria-label="Game controls">
      <div className="sprout-controls__group">{control('left', 'Move left', 'arrow-right', '이동')}{control('right', 'Move right', 'arrow-right', '이동')}</div>
      <p className="sprout-key-hint">← → 이동 <span>SPACE 점프</span> SHIFT 달리기</p>
      <div className="sprout-controls__group">{control('run', 'Run', 'run', '달리기')}{control('jump', 'Jump', 'jump', '점프')}</div>
    </footer>
    {panel && <div className="sprout-dialog-shade"><div className="sprout-dialog" role="dialog" aria-modal="true" aria-labelledby="sprout-dialog-title" ref={dialog} onKeyDown={trapTab}>
      <img className="sprout-dialog__hero" src={`${ART_BASE}raster/sprout-${panel.kind === 'complete' ? 'jump' : 'idle'}.webp`} alt="" />
      <small>{panel.kind === 'pause' ? 'TAKE A BREATH' : panel.kind === 'complete' ? 'WONDERFUL ADVENTURE' : 'ONE MORE LITTLE ADVENTURE'}</small>
      <h2 id="sprout-dialog-title">{title}</h2>
      {panel.kind === 'pause' ? <p>준비되면, 다시 하늘섬으로!</p> : <div className="sprout-results"><div><small>이번 점수</small><strong>{(panel.score ?? 0).toLocaleString()}</strong></div><div><small>최고 점수</small><strong>{(panel.bestScore ?? 0).toLocaleString()}</strong></div>
        {panel.kind === 'complete' && <p>빛의 씨앗 {panel.shards} / {panel.totalShards} · {panel.elapsedSeconds}초</p>}</div>}
      {panel.kind === 'pause' && <button className="sprout-primary" aria-label="Resume" onClick={() => action('resume')}>계속 모험하기 <span>→</span></button>}
      {panel.kind === 'complete' && <button className="sprout-primary" aria-label={panel.nextLabel === 'menu' ? 'Back to Menu' : 'Next Level'} onClick={() => action('next')}>{panel.nextLabel === 'menu' ? '모험을 마치고 돌아가기' : '다음 하늘섬으로'} <span>→</span></button>}
      <button className={panel.kind === 'gameOver' ? 'sprout-primary' : 'sprout-secondary'} aria-label="Restart" onClick={() => action('restart')}>다시 도전하기 <span>↻</span></button>
      <button className="sprout-text-button" aria-label="Menu" onClick={() => action('menu')}>{testPlay ? '에디터로 돌아가기' : '시작 화면으로'}</button>
    </div></div>}
  </>;
}
