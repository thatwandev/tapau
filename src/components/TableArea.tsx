import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import Card from './Card';
import type { ActionLogEntry, Card as CardType, Orientation, TableState } from '../game/types';

interface ScoutCardInspection {
  card: CardType;
  tableIndex: number;
  orientation: Orientation;
  mode: 'scout' | 'scoutAndShow';
  phase: 'inspect' | 'place';
}

interface Point {
  x: number;
  y: number;
}

interface TableAreaProps {
  table: TableState;
  scoutMode?: boolean;
  scoutFocusCardIndex?: number | null;
  scoutCard?: ScoutCardInspection | null;
  onScoutCard?: (index: number) => void;
  onFlipScoutCard?: () => void;
  onConfirmScoutCard?: () => void;
  onCancelScoutCard?: () => void;
  onScoutDragStart?: () => void;
  onScoutDrag?: (point: Point) => void;
  onScoutDragEnd?: (point: Point) => void;
  lastAction?: ActionLogEntry;
  currentPlayerName: string;
  isAITurn: boolean;
}

export default function TableArea({
  table,
  scoutMode = false,
  scoutFocusCardIndex = null,
  scoutCard = null,
  onScoutCard,
  onFlipScoutCard,
  onConfirmScoutCard,
  onCancelScoutCard,
  onScoutDragStart,
  onScoutDrag,
  onScoutDragEnd,
  lastAction,
  currentPlayerName,
  isAITurn,
}: TableAreaProps) {
  const lastIdx = table.activeSet.length - 1;
  const isInspecting = scoutCard?.phase === 'inspect';
  const isPlacing = scoutCard?.phase === 'place';
  const hasScoutInteraction = Boolean(scoutCard);
  const inspectionCard = scoutCard
    ? { ...scoutCard.card, orientation: scoutCard.orientation }
    : null;

  return (
    <section
      className="h-full w-full flex flex-col items-center justify-center px-4 py-4"
      aria-label="Active play area"
    >
      <div className="flex items-center justify-center gap-2 mb-1 min-h-5 flex-wrap text-center">
        {scoutMode && table.activeSet.length > 0 && (
          <span className="text-xs font-body text-score-round animate-pulse">
            Choose either end of the set to Scout
          </span>
        )}
        {isInspecting && scoutCard && (
          <span className="text-xs font-body font-semibold text-score-round">
            {scoutCard.mode === 'scoutAndShow' ? 'Scout & Show' : 'Scout'} · inspect the highlighted card
          </span>
        )}
        {isPlacing && (
          <span className="text-xs font-body font-semibold text-score-round animate-pulse">
            Drag the card into a gap in your hand
          </span>
        )}
        {!scoutMode && !hasScoutInteraction && (
          <>
            <span className={`text-xs font-body font-semibold ${isAITurn ? 'text-score-turn' : 'text-emerald-game'}`}>
              {table.phase === 'pickingUp' ? 'Set your hand' : table.phase === 'roundEnd' ? 'Round complete' : table.phase === 'gameEnd' ? 'Game complete' : `${currentPlayerName}${isAITurn ? ' is playing' : '’s turn'}`}
            </span>
            {table.activeSetType && table.activeSet.length > 0 && (
              <span className="text-xs font-body font-semibold text-score-turn uppercase tracking-wide">
                {table.activeSetType === 'run'
                  ? `Run of ${table.activeSet.length}`
                  : table.activeSetType === 'match'
                  ? `Match of ${table.activeSet.length}`
                  : 'Single'}
              </span>
            )}
          </>
        )}
      </div>

      <div className={[
        'relative w-full max-w-full md:max-w-[calc(100vw-28rem)] rounded-[12px] border-2 flex items-center justify-center px-2 py-2 transition-colors duration-200',
        scoutMode ? 'min-h-[148px]' : hasScoutInteraction ? 'min-h-[220px]' : 'min-h-[104px]',
        scoutMode || hasScoutInteraction ? 'border-score-round/80 bg-score-round/5' : 'border-dashed border-felt-light/60',
      ].join(' ')}>
        <AnimatePresence mode="wait">
          {table.activeSet.length === 0 ? (
            <motion.span
              key="empty"
              className="font-body text-sm text-card/30"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              No set played yet
            </motion.span>
          ) : (
            <motion.div
              key="set"
              className="hide-scrollbar w-full min-w-0 overflow-x-auto px-2 py-2"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: scoutMode ? 1.04 : 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            >
              <div className="flex w-max min-w-full items-center justify-center gap-2 px-2">
                {table.activeSet.map((card, index) => {
                  const isFocusedCard = index === scoutFocusCardIndex;
                  if (isFocusedCard && !scoutCard) return null;

                  if (isFocusedCard && scoutCard && inspectionCard) {
                    return (
                      <motion.div
                        key={card.id}
                        layout
                        className="relative z-10 flex min-w-[216px] flex-shrink-0 flex-col items-center gap-3 px-2"
                        aria-label="Selected Scout card inspector"
                      >
                        <motion.div
                          key={`${card.id}-${scoutCard.phase}`}
                          drag={isPlacing}
                          dragMomentum={false}
                          dragElastic={0.06}
                          onDragStart={onScoutDragStart}
                          onDrag={(_, info: PanInfo) => onScoutDrag?.(info.point)}
                          onDragEnd={(_, info: PanInfo) => onScoutDragEnd?.(info.point)}
                          className={`relative rounded-card ${isPlacing ? 'cursor-grab touch-none active:cursor-grabbing' : ''}`}
                          animate={{ scale: 1.12, x: 0, y: 0 }}
                          whileDrag={{ scale: 1.2, rotate: -2, zIndex: 40 }}
                          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                          style={{ transformOrigin: 'center center' }}
                          aria-label={isPlacing ? 'Drag scouted card to your hand' : 'Highlighted card to Scout'}
                        >
                          <span className="pointer-events-none absolute -inset-1 z-10 rounded-[14px] border-2 border-score-round shadow-[0_0_18px_rgba(250,204,21,.35)]" />
                          <Card card={inspectionCard} size="normal" />
                        </motion.div>

                        {isInspecting ? (
                          <>
                            <p className="text-center font-body text-[11px] text-card/65">
                              Choose which value will face up in your hand.
                            </p>
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={onFlipScoutCard}
                                aria-label="Flip scouted card 180 degrees"
                                aria-pressed={scoutCard.orientation === 'flipped'}
                                className="h-9 rounded-pill border border-felt-light/50 bg-felt/70 px-3 font-body text-xs font-semibold text-card hover:bg-felt-light"
                              >
                                Flip
                              </button>
                              <button
                                type="button"
                                onClick={onConfirmScoutCard}
                                className="h-9 rounded-pill bg-emerald-game px-3 font-body text-xs font-semibold text-white hover:brightness-110"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={onCancelScoutCard}
                                className="h-9 rounded-pill border border-white/15 px-3 font-body text-xs font-semibold text-card/75 hover:bg-white/10 hover:text-card"
                              >
                                Cancel
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5">
                            <p className="text-center font-body text-[11px] text-card/65">
                              {scoutCard.orientation === 'normal' ? 'Normal side up' : 'Flipped side up'} · drop between hand cards
                            </p>
                            <button
                              type="button"
                              onClick={onCancelScoutCard}
                              className="h-8 rounded-pill border border-white/15 px-3 font-body text-[11px] font-semibold text-card/70 hover:bg-white/10 hover:text-card"
                            >
                              Cancel Scout
                            </button>
                          </div>
                        )}
                      </motion.div>
                    );
                  }

                  const isScoutable = scoutMode && (index === 0 || index === lastIdx);

                  return isScoutable ? (
                    <motion.button
                      key={card.id}
                      type="button"
                      className="relative flex flex-shrink-0 rounded-card text-left outline-none focus-visible:ring-2 focus-visible:ring-score-round"
                      onClick={() => onScoutCard?.(index)}
                      aria-label={`Scout the ${index === 0 ? 'left' : 'right'} end card`}
                      whileHover={{ y: -5, scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <span className="absolute -inset-1 z-10 rounded-[14px] border-2 border-score-round animate-pulse pointer-events-none" />
                      <Card card={card} size={scoutMode ? 'normal' : 'small'} dealIndex={index} />
                    </motion.button>
                  ) : (
                    <div key={card.id} className="flex-shrink-0">
                      <Card card={card} size={scoutMode ? 'normal' : 'small'} dealIndex={index} />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!scoutMode && !hasScoutInteraction && (
        <p className="font-body text-xs text-card/30 mt-1 uppercase tracking-wider">
          Active Set
          {table.activeSetOwnerIndex >= 0 && (
            <span className="ml-1 normal-case text-card/40">— beating earns trophies</span>
          )}
        </p>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {lastAction && !scoutMode && !hasScoutInteraction && (
          <motion.div
            key={lastAction.id}
            className="mt-2 w-full max-w-lg rounded-xl border border-white/10 bg-felt-dark/80 px-3 py-1.5 text-center shadow-lg"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            aria-live="polite"
            aria-atomic="true"
          >
            <p className="font-body text-[9px] uppercase tracking-widest text-card/40">Latest action</p>
            <p className="mt-0.5 truncate font-body text-xs leading-tight text-card/90" title={lastAction.description}>{lastAction.description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
