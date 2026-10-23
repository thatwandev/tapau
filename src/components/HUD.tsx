import { useState, useEffect } from 'react';
import ChipToken from './ChipToken';
import type { Player, TableState } from '../game/types';

function AnimatedScore({ value, className, 'aria-label': ariaLabel }: { value: number; className: string; 'aria-label'?: string }) {
  const [displayed, setDisplayed] = useState(value);
  useEffect(() => {
    if (displayed === value) return;
    const diff = value - displayed;
    const steps = Math.min(Math.abs(diff), 20);
    const stepSize = diff / steps;
    let current = displayed;
    let count = 0;
    const interval = setInterval(() => {
      count++;
      current += stepSize;
      setDisplayed(count === steps ? value : Math.round(current));
      if (count >= steps) clearInterval(interval);
    }, 500 / steps);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <span className={className} style={{ fontVariantNumeric: 'tabular-nums' }} aria-label={ariaLabel}>{displayed}</span>;
}

interface HUDProps {
  human: Player;
  opponents: Player[];
  table: TableState;
  onOpenSettings: () => void;
}

export default function HUD({ human, opponents, table, onOpenSettings }: HUDProps) {
  // For the HUD score display show combined opponent score when multiple
  const opponentScore = opponents.reduce((sum, p) => sum + p.score, 0);
  const opponentLabel = opponents.length === 1 ? opponents[0].name : 'CPU Total';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-20 bg-felt-dark h-14 flex items-center px-4 gap-3"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Settings gear */}
      <button
        aria-label="Open settings"
        onClick={onOpenSettings}
        className="w-11 h-11 flex items-center justify-center text-card/60 hover:text-card transition-colors rounded-full hover:bg-white/5"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {/* Centre: opponent score | Round badge | player score */}
      <div className="flex-1 flex items-center justify-center gap-3">
        <AnimatedScore
          value={opponentScore}
          className="font-display font-bold text-xl text-score-ai"
          aria-label={`${opponentLabel} score: ${opponentScore}`}
        />

        <span className="font-display font-bold text-sm px-3 py-0.5 rounded-pill bg-score-round/20 text-score-round">
          R{table.round}
        </span>

        <AnimatedScore
          value={human.score}
          className="font-display font-bold text-xl text-score-player"
          aria-label={`Your score: ${human.score}`}
        />
      </div>

      {/* Right: player chip + trophies */}
      <div className="flex items-center gap-2">
        <ChipToken type="scout" count={human.chips.scout} size="small" />
        <ChipToken type="trophies" count={human.trophies.length} size="small" />
      </div>

      {/* Aria-live region for score announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        Your score: {human.score}. {opponentLabel} score: {opponentScore}.
      </div>
    </header>
  );
}
