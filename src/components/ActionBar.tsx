import ChipToken from './ChipToken';
import type { Player } from '../game/types';

interface ActionBarProps {
  player: Player;
  canShow: boolean;
  canScout: boolean;
  canScoutAndShow: boolean;
  isPendingScoutAndShow: boolean;
  isChoosingScoutEnd: boolean;
  scoutCancelLabel: string;
  onShow: () => void;
  onScout: () => void;
  onScoutAndShow: () => void;
  onCancelScoutAndShow: () => void;
  onCancelScoutSelection: () => void;
}

export default function ActionBar({
  player,
  canShow,
  canScout,
  canScoutAndShow,
  isPendingScoutAndShow,
  isChoosingScoutEnd,
  scoutCancelLabel,
  onShow,
  onScout,
  onScoutAndShow,
  onCancelScoutAndShow,
  onCancelScoutSelection,
}: ActionBarProps) {
  return (
    <div
      className="bg-felt-dark px-3 pt-3 pb-4 flex flex-col gap-2"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
    >
      {/* Player chip tokens row */}
      <div className="flex items-center gap-3 justify-center">
        <ChipToken type="scout" count={player.chips.scout} />
        <div
          className={[
            'flex items-center gap-1 px-2 py-1 rounded-pill text-xs font-body font-semibold transition-colors',
            player.chips.scoutAndShow ? 'bg-emerald-game/20 text-emerald-game' : 'bg-white/5 text-card/30',
          ].join(' ')}
          title="Scout & Show token (once per round)"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
          <span>{player.chips.scoutAndShow ? 'S&S Ready' : 'S&S Used'}</span>
        </div>
        <div className="ml-auto">
          <ChipToken type="trophies" count={player.trophies.length} />
        </div>
      </div>

      {/* Primary action row */}
      <div className="flex items-center gap-2">
        {isChoosingScoutEnd ? (
          <button
            className="h-12 w-full rounded-pill border border-felt-light/50 bg-felt/70 font-body text-sm font-semibold text-card hover:bg-felt-light transition-colors"
            onClick={onCancelScoutSelection}
            aria-label={`${scoutCancelLabel} and return to your turn`}
          >
            {scoutCancelLabel}
          </button>
        ) : isPendingScoutAndShow ? (
          <>
            <button
              className="flex-1 h-12 rounded-pill bg-emerald-game text-white font-body font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:brightness-110 active:enabled:scale-95 transition-all"
              disabled={!canShow}
              onClick={onShow}
              aria-label="Show selected cards"
            >
              Show &amp; Finish
            </button>
            <button
              className="h-12 px-3 rounded-pill bg-felt text-card/60 font-body font-semibold text-sm border border-felt-light/40 hover:text-card hover:border-felt-light transition-all"
              onClick={onCancelScoutAndShow}
              aria-label="Cancel Scout and Show"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
        <button
          className="flex-1 h-12 rounded-pill bg-emerald-game text-white font-body font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:brightness-110 active:enabled:scale-95 transition-all"
          disabled={!canShow}
          onClick={onShow}
          aria-label="Show selected cards"
        >
          Show
        </button>

        <button
          className="flex-1 h-12 rounded-pill bg-chip-scout text-white font-body font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:brightness-110 active:enabled:scale-95 transition-all"
          disabled={!canScout || isPendingScoutAndShow}
          onClick={onScout}
          aria-label="Scout a card from the table"
        >
          Scout
        </button>

        <button
          className="flex-1 h-12 rounded-pill bg-card text-card-text font-body font-semibold text-sm hover:brightness-95 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={!canScoutAndShow || isPendingScoutAndShow}
          onClick={onScoutAndShow}
          aria-label="Scout then Show (once per round)"
          title="Scout a card then immediately play a set (once per round)"
        >
          S&amp;S
        </button>

          </>
        )}
      </div>
    </div>
  );
}
