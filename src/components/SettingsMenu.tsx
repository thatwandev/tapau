import { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Difficulty, PlayerCount } from '../game/types';

interface SettingsMenuProps {
  isOpen: boolean;
  difficulty: Difficulty;
  playerCount: PlayerCount;
  onSetDifficulty: (d: Difficulty) => void;
  onSetPlayerCount: (n: PlayerCount) => void;
  onOpenTutorial: () => void;
  onRestartGame: () => void;
  onClose: () => void;
}

const DIFFICULTIES: { id: Difficulty; label: string }[] = [
  { id: 'easy',     label: 'Easy'     },
  { id: 'standard', label: 'Standard' },
  { id: 'hard',     label: 'Hard'     },
];

const PLAYER_COUNTS: PlayerCount[] = [3, 4, 5];

export default function SettingsMenu({
  isOpen,
  difficulty,
  playerCount,
  onSetDifficulty,
  onSetPlayerCount,
  onOpenTutorial,
  onRestartGame,
  onClose,
}: SettingsMenuProps) {
  const firstOptionRef = useRef<HTMLButtonElement>(null);

  // Focus first option when panel opens
  useEffect(() => {
    if (isOpen) {
      // slight delay to let the animation start
      const t = setTimeout(() => firstOptionRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Escape closes
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Slide-in panel */}
          <motion.div
            className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-felt-dark flex flex-col gap-5 p-6 overflow-y-auto"
            style={{ paddingTop: 'calc(env(safe-area-inset-top) + 24px)' }}
            initial={{ x: -288 }}
            animate={{ x: 0 }}
            exit={{ x: -288 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            role="dialog"
            aria-label="Settings"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-xl text-card">Settings</h2>
              <button
                aria-label="Close settings"
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-card/60 hover:text-card hover:bg-white/10 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Player count */}
            <div className="flex flex-col gap-2">
              <p className="font-body text-xs text-card/40 uppercase tracking-widest">Players</p>
              <div className="flex gap-2">
                {PLAYER_COUNTS.map((n, i) => (
                    <button
                      key={n}
                      ref={i === 0 ? firstOptionRef : undefined}
                      onClick={() => onSetPlayerCount(n)}
                      aria-pressed={playerCount === n}
                    className={[
                      'flex-1 h-10 rounded-[12px] font-body font-semibold text-sm transition-all',
                      playerCount === n
                        ? 'bg-emerald-game text-white'
                        : 'bg-felt text-card/70 hover:text-card border border-felt-light/40',
                    ].join(' ')}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="flex flex-col gap-2">
              <p className="font-body text-xs text-card/40 uppercase tracking-widest">Difficulty</p>
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => onSetDifficulty(d.id)}
                  aria-pressed={difficulty === d.id}
                  className={[
                    'text-left px-3 py-2 rounded-[12px] font-body font-semibold text-sm capitalize transition-all',
                    difficulty === d.id
                      ? 'bg-emerald-game text-white'
                      : 'bg-felt text-card/70 hover:text-card',
                  ].join(' ')}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Other actions */}
            <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-felt-light/30">
              <button
                onClick={() => { onOpenTutorial(); onClose(); }}
                className="text-left font-body text-sm text-card/70 hover:text-card transition-colors"
              >
                How to Play
              </button>
              <button
                onClick={onRestartGame}
                className="text-left font-body text-sm text-score-ai hover:brightness-110 transition-colors"
              >
                Restart Game
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
