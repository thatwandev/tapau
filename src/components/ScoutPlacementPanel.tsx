import { Fragment, useRef, useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import Card from './Card';
import type { Card as CardType, Orientation } from '../game/types';

interface ScoutPlacementPanelProps {
  card: CardType;
  orientation: Orientation;
  hand: CardType[];
  mode: 'scout' | 'scoutAndShow';
  onBack: () => void;
  onCancel: () => void;
  onConfirm: (insertIndex: number) => void;
  onDropOutside: () => void;
}

function HandCardPreview({ card }: { card: CardType }) {
  const activeValue = card.orientation === 'normal' ? card.topValue : card.bottomValue;
  const otherValue = card.orientation === 'normal' ? card.bottomValue : card.topValue;
  return (
    <div className="relative h-[94px] w-[66px] flex-shrink-0 rounded-card border border-card-border bg-card" aria-label={`Hand card ${activeValue}`}>
      <span className="absolute left-1.5 top-1 font-body text-lg font-semibold text-card-text">{activeValue}</span>
      <span className="absolute bottom-1 right-1.5 rotate-180 font-body text-xs font-semibold text-card-muted">{otherValue}</span>
    </div>
  );
}

export default function ScoutPlacementPanel({
  card,
  orientation,
  hand,
  mode,
  onBack,
  onCancel,
  onConfirm,
  onDropOutside,
}: ScoutPlacementPanelProps) {
  const preview: CardType = { ...card, orientation };
  const viewportRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const lastEdgeScrollAt = useRef(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function isPointOverHand(point: { x: number; y: number }) {
    const rect = viewportRef.current?.getBoundingClientRect();
    return Boolean(rect && point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom);
  }

  function insertionIndexAt(point: { x: number; y: number }) {
    for (let index = 0; index < cardRefs.current.length; index += 1) {
      const rect = cardRefs.current[index]?.getBoundingClientRect();
      if (rect && point.x < rect.left + rect.width / 2) return index;
    }
    return hand.length;
  }

  function updateDropTarget(info: PanInfo) {
    const viewport = viewportRef.current;
    if (!viewport || !isPointOverHand(info.point)) {
      setHoverIndex((current) => current === null ? current : null);
      return;
    }

    const rect = viewport.getBoundingClientRect();
    const nearEdge = 38;
    const now = Date.now();
    if (now - lastEdgeScrollAt.current > 70) {
      if (info.point.x < rect.left + nearEdge) {
        viewport.scrollBy({ left: -24, behavior: 'auto' });
        lastEdgeScrollAt.current = now;
      } else if (info.point.x > rect.right - nearEdge) {
        viewport.scrollBy({ left: 24, behavior: 'auto' });
        lastEdgeScrollAt.current = now;
      }
    }

    const nextIndex = insertionIndexAt(info.point);
    setHoverIndex((current) => current === nextIndex ? current : nextIndex);
  }

  function finishDrag(info: PanInfo) {
    setIsDragging(false);
    if (isPointOverHand(info.point)) {
      onConfirm(insertionIndexAt(info.point));
      return;
    }
    setHoverIndex(null);
    onDropOutside();
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-5"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      role="dialog" aria-modal="true" aria-labelledby="scout-placement-title"
    >
      <motion.div
        className="flex max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-felt-light/40 bg-felt-dark shadow-2xl"
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      >
        <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
          <div>
            <p id="scout-placement-title" className="font-body text-base font-semibold text-card">
              Drag the scouted card into your hand
            </p>
            <p className="mt-1 font-body text-xs text-card/50">
              Hover over a gap to open it. Drop outside your hand to flip or retry.
            </p>
          </div>
          <button
            aria-label="Back to card flip choice"
            onClick={onBack}
            className="min-h-11 min-w-11 rounded-full text-card/60 hover:bg-white/10 hover:text-card"
          >
            <svg className="mx-auto" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        </div>

        <div className="flex flex-shrink-0 flex-col items-center justify-center gap-2 px-4 py-3 sm:py-4">
          <motion.div
            drag
            dragMomentum={false}
            dragElastic={0.08}
            onDragStart={() => { setIsDragging(true); setHoverIndex(null); }}
            onDrag={(_, info) => updateDropTarget(info)}
            onDragEnd={(_, info) => finishDrag(info)}
            className="relative z-10 cursor-grab touch-none select-none active:cursor-grabbing"
            style={{ opacity: isDragging ? 0.92 : 1 }}
            whileDrag={{ scale: 1.08, rotate: -2, zIndex: 40 }}
            aria-label="Drag scouted card to a hand gap"
          >
            <Card card={preview} size="normal" />
          </motion.div>
          <p className="font-body text-xs text-card/55" aria-live="polite">
            {isDragging && hoverIndex !== null
              ? `Release to insert ${hoverIndex === 0 ? 'at the start' : hoverIndex === hand.length ? 'at the end' : `between cards ${hoverIndex} and ${hoverIndex + 1}`}`
              : orientation === 'normal' ? 'Normal side up · drag this card' : 'Flipped side up · drag this card'}
          </p>
        </div>

        <div className="min-h-0 flex-1 px-2 py-3 sm:px-5">
          <div
            ref={viewportRef}
            className={`h-full min-h-[138px] overflow-x-auto overflow-y-hidden rounded-xl border px-2 py-2 hide-scrollbar transition-colors ${hoverIndex !== null ? 'border-emerald-game/70 bg-emerald-game/5' : 'border-felt-light/20'}`}
            aria-label="Hand drop zone"
          >
            <div className="flex min-h-full w-max min-w-full items-center justify-center px-2 sm:px-4">
              {Array.from({ length: hand.length + 1 }, (_, index) => (
                <Fragment key={`hand-position-${index}`}>
                  <AnimatePresence initial={false}>
                    {hoverIndex === index && (
                      <motion.div
                        key={`open-gap-${index}`}
                        layout
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 82, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                        className="relative flex h-[108px] flex-shrink-0 items-center justify-center"
                        aria-label={`Open insertion gap ${index + 1}`}
                      >
                        <span className="h-24 w-1 rounded-full bg-emerald-game shadow-[0_0_12px_rgba(16,185,129,.6)]" />
                        <span className="absolute -top-1 rounded-full bg-emerald-game px-2 py-0.5 font-body text-[10px] font-semibold text-white">
                          DROP
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {hand[index] && (
                    <motion.div
                      layout
                      ref={(element) => { cardRefs.current[index] = element; }}
                      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                      className="relative flex-shrink-0 px-1"
                    >
                      <HandCardPreview card={hand[index]} />
                    </motion.div>
                  )}
                </Fragment>
              ))}
            </div>
          </div>
          <p className="mt-2 text-center font-body text-xs text-card/40">
            {hoverIndex === null ? 'Your hand · drag the scouted card over a gap' : 'Drop to add the card here'}
          </p>
        </div>

        <div className="flex flex-shrink-0 flex-col-reverse gap-2 border-t border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex gap-2">
            <button onClick={onBack} className="h-11 rounded-pill border border-felt-light/50 px-5 font-body text-sm font-semibold text-card/80 hover:bg-white/10">
              Back to flip
            </button>
            <button onClick={onCancel} className="h-11 rounded-pill px-4 font-body text-sm text-card/50 hover:bg-white/10 hover:text-card">
              Cancel
            </button>
          </div>
          <p className="self-center text-center font-body text-xs text-card/45 sm:text-right">
            {mode === 'scoutAndShow' ? 'After placement, choose a legal Show.' : 'A valid drop completes Scout.'}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
