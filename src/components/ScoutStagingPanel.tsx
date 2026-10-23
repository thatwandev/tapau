import { motion } from 'framer-motion';
import Card from './Card';
import type { Card as CardType, Orientation } from '../game/types';

interface ScoutStagingPanelProps {
  card: CardType;
  orientation: Orientation;
  mode: 'scout' | 'scoutAndShow';
  onFlip: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ScoutStagingPanel({
  card,
  orientation,
  mode,
  onFlip,
  onConfirm,
  onCancel,
}: ScoutStagingPanelProps) {
  const preview: CardType = { ...card, orientation };
  const activeValue = orientation === 'normal' ? card.topValue : card.bottomValue;
  const altValue = orientation === 'normal' ? card.bottomValue : card.topValue;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      role="dialog" aria-modal="true" aria-labelledby="scout-orientation-title"
    >
      <motion.div
        className="w-full max-w-md rounded-2xl border border-felt-light/40 bg-felt-dark p-5 shadow-2xl"
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p id="scout-orientation-title" className="font-body text-base font-semibold text-card">
              {mode === 'scoutAndShow' ? 'Scout & Show: flip the card' : 'Scout: flip the card'}
            </p>
            <p className="font-body text-xs text-card/50 mt-1">Choose which value will face up in your hand.</p>
          </div>
          <button
            aria-label="Back to choose a deck end"
            onClick={onCancel}
            className="min-w-11 min-h-11 flex items-center justify-center rounded-full text-card/60 hover:text-card hover:bg-white/10 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center py-7">
          <motion.div
            key={orientation}
            initial={{ rotateY: 90, scaleX: 0.82, opacity: 0.65 }}
            animate={{ rotateY: 0, scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            style={{ transformStyle: 'preserve-3d' }}
            className="relative [perspective:800px]"
          >
            <span className="absolute -inset-2 rounded-[18px] border-2 border-score-round animate-pulse pointer-events-none" />
            <Card card={preview} size="normal" />
          </motion.div>
          <p className="font-body text-sm text-card/70 mt-4">
            Active value: <span className="font-semibold text-card">{activeValue}</span>
            <span className="text-card/40"> · other side {altValue}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onFlip}
            aria-pressed={orientation === 'flipped'}
            aria-label="Flip scouted card"
            className="h-12 rounded-pill bg-felt/70 border border-felt-light/60 text-card font-body font-semibold text-sm hover:bg-felt-light transition-colors"
          >
            {orientation === 'flipped' ? 'Flip back' : 'Flip card'}
          </button>
          <button
            onClick={onConfirm}
            className="h-12 rounded-pill bg-emerald-game text-white font-body font-semibold text-sm hover:brightness-110 active:scale-95 transition-all"
          >
            Choose this card
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
