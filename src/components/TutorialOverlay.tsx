import { useRef, useEffect } from 'react';

const TUTORIAL_STEPS = [
  {
    title: 'Picking Up Your Hand',
    body: 'At the start of each round you pick up your hand. Before your first move, you may flip your entire hand once — this swaps all cards to their other side. Once you press Confirm Hand, your card order and orientation are locked for the rest of the round.',
  },
  {
    title: 'The Active Set',
    body: 'This is the shared play area in the centre. The current set of cards played this turn lives here. You must beat it with a higher or longer set.',
  },
  {
    title: 'Show a Set',
    body: 'Select two or more cards from your hand that form a run (all active values strictly ascending or descending). Press Show to play them onto the table and beat the active set.',
  },
  {
    title: 'Scout a Card',
    body: 'Press Scout to take one card from the active set and insert it into your hand. This costs one Scout Chip. You choose where in your hand to insert the scouted card.',
  },
  {
    title: 'Scout & Show Chips',
    body: 'Amber tokens are Scout Chips — spend one to Scout a card from the table. Blue tokens are Show Chips — spend one for a bonus Show play. Chips remaining at round end score you points.',
  },
];

interface TutorialOverlayProps {
  step: number;
  onNext: () => void;
  onBack: () => void;
  onClose: () => void;
}

export default function TutorialOverlay({
  step,
  onNext,
  onBack,
  onClose,
}: TutorialOverlayProps) {
  const current = TUTORIAL_STEPS[step];
  const isLast = step === TUTORIAL_STEPS.length - 1;
  const nextBtnRef = useRef<HTMLButtonElement>(null);

  // Focus next/done button on step change
  useEffect(() => {
    nextBtnRef.current?.focus();
  }, [step]);

  // Escape closes
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center pb-28 px-4 bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
    >
      <div className="bg-card rounded-modal w-full max-w-sm flex flex-col gap-4 p-5">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <h3
            id="tutorial-title"
            className="font-body font-semibold text-card-text text-base"
          >
            {current.title}
          </h3>
          <button
            aria-label="Close tutorial"
            onClick={onClose}
            className="w-8 h-8 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-felt/10 text-card-muted hover:bg-felt/20 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <p className="font-body text-sm text-card-text/80 leading-relaxed">
          {current.body}
        </p>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-1.5" aria-label={`Step ${step + 1} of ${TUTORIAL_STEPS.length}`}>
          {TUTORIAL_STEPS.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step ? 'bg-emerald-game' : 'bg-card-muted'
              }`}
            />
          ))}
        </div>

        {/* Nav buttons */}
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button
              className="flex-1 h-11 rounded-pill bg-card border border-card-border text-card-text font-body font-semibold text-sm hover:bg-felt/10 transition-colors"
              onClick={onBack}
            >
              Back
            </button>
          )}
          <button
            ref={nextBtnRef}
            className="flex-1 h-11 rounded-pill bg-emerald-game text-white font-body font-semibold text-sm hover:brightness-110 active:scale-95 transition-all"
            onClick={isLast ? onClose : onNext}
          >
            {isLast ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
