import type { Difficulty, PlayerCount } from '../game/types';

interface GameSetupScreenProps {
  playerCount: PlayerCount;
  difficulty: Difficulty;
  onSetPlayerCount: (n: PlayerCount) => void;
  onSetDifficulty: (d: Difficulty) => void;
  onPlay: () => void;
  onBack: () => void;
}

const PLAYER_COUNTS: { value: PlayerCount; label: string; desc: string }[] = [
  { value: 3, label: '3 Players', desc: '12 cards each' },
  { value: 4, label: '4 Players', desc: '11 cards each' },
  { value: 5, label: '5 Players', desc: '9 cards each' },
];

const DIFFICULTIES: { id: Difficulty; label: string; desc: string }[] = [
  { id: 'easy',     label: 'Easy',     desc: 'AI plays randomly — great for learning' },
  { id: 'standard', label: 'Standard', desc: 'AI builds toward strong future sets' },
  { id: 'hard',     label: 'Hard',     desc: 'AI weighs Shows against Scout & Show' },
];

export default function GameSetupScreen({
  playerCount,
  difficulty,
  onSetPlayerCount,
  onSetDifficulty,
  onPlay,
  onBack,
}: GameSetupScreenProps) {
  return (
    <div className="felt-noise min-h-dvh bg-felt flex flex-col items-center justify-center px-6 py-8 gap-6">

      {/* Header */}
      <div className="w-full max-w-sm flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label="Back to home"
          className="w-10 h-10 flex items-center justify-center rounded-full text-card/60 hover:text-card hover:bg-white/5 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <h2 className="font-display font-bold text-2xl text-card">Game Setup</h2>
      </div>

      {/* Player count */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <p className="font-body text-xs text-card/40 uppercase tracking-widest">
          Number of Players
        </p>
        <div className="grid grid-cols-3 gap-2">
          {PLAYER_COUNTS.map((p) => (
            <button
              key={p.value}
              className={[
                'flex flex-col items-center py-3 px-2 rounded-[16px] bg-card border-2 transition-all',
                playerCount === p.value
                  ? 'border-emerald-game scale-[1.02]'
                  : 'border-transparent hover:border-card-border',
              ].join(' ')}
              onClick={() => onSetPlayerCount(p.value)}
              aria-pressed={playerCount === p.value}
            >
              <span className="font-display font-bold text-xl text-card-text">{p.value}</span>
              <span className="font-body text-xs text-card-muted mt-0.5">{p.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <p className="font-body text-xs text-card/40 uppercase tracking-widest">
          Difficulty
        </p>
        {DIFFICULTIES.map((d) => (
          <button
            key={d.id}
            className={[
              'w-full text-left px-4 py-3 rounded-[16px] bg-card border-2 transition-all',
              difficulty === d.id
                ? 'border-emerald-game scale-[1.02]'
                : 'border-transparent hover:border-card-border',
            ].join(' ')}
            onClick={() => onSetDifficulty(d.id)}
            aria-pressed={difficulty === d.id}
          >
            <span className="font-body font-semibold text-card-text block">{d.label}</span>
            <span className="font-body text-xs text-card-muted">{d.desc}</span>
          </button>
        ))}
      </div>

      {/* Play button */}
      <div className="w-full max-w-sm">
        <button
          className="w-full h-[52px] rounded-pill bg-emerald-game text-white font-body font-semibold text-base hover:brightness-110 active:scale-95 transition-all"
          onClick={onPlay}
        >
          Play
        </button>
      </div>

    </div>
  );
}
