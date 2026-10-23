import { Fragment } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Card from './Card';
import type { Card as CardType } from '../game/types';
import type { MutableRefObject, RefObject } from 'react';

interface PlayerHandProps {
  hand: CardType[];
  selectedIds: string[];
  /** true = the player is in the pick-up phase and may flip the whole hand once */
  isPickingUp: boolean;
  /** true = the whole hand has already been flipped this round */
  handFlipped: boolean;
  onSelectCard: (id: string) => void;
  /** Called when the player commits their hand orientation and starts playing */
  onConfirmHand: () => void;
  /** Called to toggle the entire hand 180° — only valid during pickingUp */
  onFlipHand: () => void;
  scoutDropIndex: number | null;
  handDropZoneRef: RefObject<HTMLDivElement | null>;
  handCardRefs: MutableRefObject<Array<HTMLDivElement | null>>;
}

export default function PlayerHand({
  hand,
  selectedIds,
  isPickingUp,
  handFlipped,
  onSelectCard,
  onConfirmHand,
  onFlipHand,
  scoutDropIndex,
  handDropZoneRef,
  handCardRefs,
}: PlayerHandProps) {
  return (
    <section className="flex-1 flex flex-col items-center justify-center px-4 py-4" aria-label="Your hand">

      {/* One-time hand orientation banner — shown only during pickingUp phase */}
      {isPickingUp && (
        <div className="mb-3 rounded-[12px] bg-felt-dark border border-felt-light/40 px-4 py-3 flex flex-col gap-2">
          <p className="font-body text-sm text-card/80 leading-snug">
            <span className="font-semibold text-card">Pick up your hand.</span>{' '}
            You may flip your entire hand once to use the other values. Once you confirm, your card order is locked for this round.
          </p>
          <div className="flex gap-2">
            <button
              className={[
                'flex-1 h-10 rounded-pill font-body font-semibold text-sm transition-all',
                handFlipped
                  ? 'bg-score-round text-card-text'
                  : 'bg-felt/60 text-card/70 border border-felt-light/60 hover:bg-felt-light',
              ].join(' ')}
              onClick={onFlipHand}
              aria-pressed={handFlipped}
              aria-label="Flip entire hand 180 degrees"
            >
              {/* Rotate SVG icon */}
              <span className="inline-flex items-center gap-1.5 justify-center">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 4v6h6" />
                  <path d="M23 20v-6h-6" />
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
                </svg>
                {handFlipped ? 'Flipped' : 'Flip Hand'}
              </span>
            </button>
            <button
              className="flex-1 h-10 rounded-pill bg-emerald-game text-white font-body font-semibold text-sm hover:brightness-110 active:scale-95 transition-all"
              onClick={onConfirmHand}
              aria-label="Confirm hand orientation and start playing"
            >
              Confirm Hand
            </button>
          </div>
        </div>
      )}

      <p className="font-body text-xs text-card/40 mb-2 uppercase tracking-wider text-center">
        Your Hand {handFlipped && !isPickingUp && (
          <span className="normal-case text-score-round ml-1">(flipped)</span>
        )}
      </p>

      {/* Horizontal scroll rack — centred, no visible scrollbar, fixed order */}
      <div
        ref={handDropZoneRef}
        className={`hide-scrollbar overflow-x-auto overflow-y-hidden pt-5 pb-4 w-full max-w-full rounded-xl transition-colors ${scoutDropIndex !== null ? 'bg-emerald-game/5 ring-1 ring-inset ring-emerald-game/30' : ''}`}
        style={{ WebkitOverflowScrolling: 'touch' }}
        aria-label={scoutDropIndex !== null ? 'Hand drop zone. Release to insert the scouted card.' : 'Your cards'}
      >
        <div className="flex w-max min-w-full mx-auto items-end justify-center px-4 pb-1">
          <AnimatePresence mode="popLayout">
            {hand.map((card, i) => {
              const selected = selectedIds.includes(card.id);
              return (
                <Fragment key={card.id}>
                  <AnimatePresence initial={false}>
                    {scoutDropIndex === i && (
                      <motion.div
                        key={`scout-gap-${i}`}
                        layout
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 62, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                        className="relative flex h-[128px] flex-shrink-0 items-center justify-center"
                        aria-label={`Insertion gap ${i + 1}`}
                      >
                        <span className="h-28 w-1 rounded-full bg-emerald-game shadow-[0_0_12px_rgba(16,185,129,.6)]" />
                        <span className="absolute top-0 rounded-full bg-emerald-game px-2 py-0.5 font-body text-[9px] font-semibold text-white">
                          DROP
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <motion.div
                    layout
                    ref={(element) => { handCardRefs.current[i] = element; }}
                    transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                    className="relative flex-shrink-0"
                    style={{ marginLeft: i > 0 ? '-12px' : 0, zIndex: selected ? hand.length + i + 10 : i }}
                  >
                    <Card
                      card={card}
                      selected={!isPickingUp && selected}
                      dealIndex={i}
                      onClick={isPickingUp ? undefined : () => onSelectCard(card.id)}
                    />
                  </motion.div>
                </Fragment>
              );
            })}
            <AnimatePresence initial={false}>
              {scoutDropIndex === hand.length && (
                <motion.div
                  key="scout-gap-end"
                  layout
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 62, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                  className="relative flex h-[128px] flex-shrink-0 items-center justify-center"
                  aria-label={`Insertion gap ${hand.length + 1}`}
                >
                  <span className="h-28 w-1 rounded-full bg-emerald-game shadow-[0_0_12px_rgba(16,185,129,.6)]" />
                  <span className="absolute top-0 rounded-full bg-emerald-game px-2 py-0.5 font-body text-[9px] font-semibold text-white">
                    DROP
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
