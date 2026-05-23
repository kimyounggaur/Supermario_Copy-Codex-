import { ControlsHelp } from './components/ControlsHelp';
import { GameCanvas } from './components/GameCanvas';
import { LandingPanel } from './components/LandingPanel';

export default function App() {
  return (
    <main className="app-shell" aria-label="Sky Sprout Runner game">
      <LandingPanel />
      <GameCanvas />
      <ControlsHelp />
    </main>
  );
}
