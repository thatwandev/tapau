import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Player, RoundEndReason } from '../game/types';

interface RoundSummaryModalProps {
  round: number;
  players: Player[];
  roundEndReason: RoundEndReason;
  activeSetOwnerIndex: number;
  isFinal: boolean;
  onNextRound: () => void;
  onNewGame: () => void;
}

function playerRoundScore(player: Player, index: number, reason: RoundEndReason, ownerIndex: number) {
  const penalty = reason === 'lockout' && index === ownerIndex ? 0 : player.hand.length;
  return player.trophies.length + player.chips.scout - penalty;
}

export default function RoundSummaryModal({
  round,
  players,
  roundEndReason,
  activeSetOwnerIndex,
  isFinal,
  onNextRound,
  onNewGame,
}: RoundSummaryModalProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { btnRef.current?.focus(); }, []);

  const winnerScore = Math.max(...players.map((player) => player.score));
  const winners = players.filter((player) => player.score === winnerScore).map((player) => player.name);
  const roundEndMessage = roundEndReason === 'emptyHand'
    ? `${players[activeSetOwnerIndex]?.name ?? 'A player'} emptied their hand! The round has ended.`
    : roundEndReason === 'lockout'
    ? `All players scouted back to ${players[activeSetOwnerIndex]?.name ?? 'the active set owner'}'s cards! The round has ended.`
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="round-summary-title"
    >
      <motion.div
        className="bg-card rounded-modal w-full max-w-lg max-h-full overflow-y-auto flex flex-col gap-4 p-6"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.88 }}
        transition={{ duration: 0.24, ease: 'easeOut' }}
      >
        <h2 id="round-summary-title" className="font-display font-bold text-2xl text-card-text text-center">
          {isFinal ? 'Game Complete' : `Round ${round} Complete`}
        </h2>

        {isFinal ? (
          <p className="font-body text-sm text-center text-card-muted">
            {winners.length === 1 ? `${winners[0]} wins with ${winnerScore} points.` : `Tie game: ${winners.join(' and ')} share the win with ${winnerScore} points.`}
          </p>
        ) : (
          <>
            {roundEndMessage && <p className="font-body text-sm font-semibold text-card-text text-center">{roundEndMessage}</p>}
            <p className="font-body text-xs text-card-muted text-center">
              Score = trophies + Scout chips − cards in hand. The player who held the set through a lockout avoids the hand penalty.
            </p>
          </>
        )}

        <div className="flex flex-col divide-y divide-card-border border-y border-card-border">
          {players.map((player, index) => {
            const penalty = roundEndReason === 'lockout' && index === activeSetOwnerIndex ? 0 : player.hand.length;
            const roundScore = playerRoundScore(player, index, roundEndReason, activeSetOwnerIndex);
            const isHuman = index === 0;
            return (
              <div key={`${player.name}-${index}`} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 py-3">
                <div>
                  <p className={`font-body font-semibold ${isHuman ? 'text-score-player' : 'text-score-ai'}`}>
                    {player.name}{isHuman ? ' (You)' : ''}{roundEndReason === 'lockout' && index === activeSetOwnerIndex ? ' · lockout bonus' : ''}
                  </p>
                  <p className="font-body text-[11px] text-card-muted">
                    {player.trophies.length} trophies + {player.chips.scout} chips − {penalty} cards
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-lg text-card-text">{roundScore >= 0 ? `+${roundScore}` : roundScore}</p>
                  <p className="font-body text-[10px] text-card-muted uppercase">This round</p>
                </div>
                <div className="text-right min-w-12">
                  <p className="font-display font-bold text-lg text-card-text">{player.score}</p>
                  <p className="font-body text-[10px] text-card-muted uppercase">Total</p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          ref={btnRef}
          className="w-full h-12 rounded-pill bg-emerald-game text-white font-body font-semibold text-base hover:brightness-110 active:scale-95 transition-all"
          onClick={isFinal ? onNewGame : onNextRound}
        >
          {isFinal ? 'Start a New Game' : 'Begin Next Round'}
        </button>
      </motion.div>
    </div>
  );
}
