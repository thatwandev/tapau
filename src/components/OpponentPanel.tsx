import type { Player } from '../game/types';

interface OpponentPanelProps {
  player: Player;
  isCurrentTurn: boolean;
}

export default function OpponentPanel({ player, isCurrentTurn }: OpponentPanelProps) {
  return (
    <div
      className={[
        'flex-1 min-w-[128px] rounded-[12px] border px-3 py-2 flex flex-col gap-1.5 transition-all duration-200',
        isCurrentTurn
          ? 'bg-felt-light border-score-turn ring-1 ring-score-turn/40'
          : 'bg-felt-dark border-felt-light/30',
      ].join(' ')}
      aria-label={`${player.name}${isCurrentTurn ? ', thinking' : ''}`}
    >
      {/* Name + turn badge */}
      <div className="flex items-center justify-between gap-1">
        <span className="font-body font-semibold text-xs text-card truncate">{player.name}</span>
        {isCurrentTurn ? (
          <span className="text-[9px] font-body font-bold text-score-turn bg-score-turn/15 px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
            ●&nbsp;Thinking
          </span>
        ) : (
          <span className="text-[9px] font-body text-card/30 flex-shrink-0">waiting</span>
        )}
      </div>

      {/* Stats: Cards | Chips | Trophies */}
      <div className="grid grid-cols-3 gap-0.5">
        <div className="flex flex-col items-center">
          <span className="font-display font-bold text-base text-card leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {player.hand.length}
          </span>
          <span className="font-body text-[9px] text-card/40 uppercase tracking-wide mt-0.5">Cards</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-display font-bold text-base text-chip-scout leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {player.chips.scout}
          </span>
          <span className="font-body text-[9px] text-card/40 uppercase tracking-wide mt-0.5">Chips</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-display font-bold text-base text-score-round leading-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {player.trophies.length}
          </span>
          <span className="font-body text-[9px] text-card/40 uppercase tracking-wide mt-0.5">Pts</span>
        </div>
      </div>

      {/* Cumulative score */}
      <div className="flex items-center justify-between border-t border-felt-light/20 pt-1">
        <span className="font-body text-[9px] text-card/40 uppercase">Score</span>
        <span className="font-display font-bold text-sm text-score-ai" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {player.score}
        </span>
      </div>
    </div>
  );
}
