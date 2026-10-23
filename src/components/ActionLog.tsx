import { useEffect, useRef } from 'react';
import type { ActionLogEntry } from '../game/types';

interface ActionLogProps {
  entries: ActionLogEntry[];
  collapsed: boolean;
  onToggle: () => void;
  compact?: boolean;
}

const ACTION_COLORS: Record<ActionLogEntry['action'], string> = {
  show: 'text-emerald-game',
  scout: 'text-chip-scout',
  scoutAndShow: 'text-score-turn',
  pass: 'text-card/40',
  deal: 'text-score-round',
  roundEnd: 'text-score-round',
};

const ACTION_LABELS: Record<ActionLogEntry['action'], string> = {
  show: 'SHOW',
  scout: 'SCOUT',
  scoutAndShow: 'SCOUT & SHOW',
  pass: 'PASS',
  deal: 'DEAL',
  roundEnd: 'END',
};

export default function ActionLog({ entries, collapsed, onToggle, compact = false }: ActionLogProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (list && !collapsed) list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
  }, [entries.length, collapsed]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={`flex min-h-10 flex-shrink-0 items-center gap-2 ${compact && collapsed ? 'justify-center px-1' : 'justify-between px-3'}`}>
        <p className={`truncate font-body text-[10px] uppercase tracking-widest text-card/50 ${compact && collapsed ? 'sr-only' : ''}`}>Action Log</p>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand action log' : 'Minimize action log'}
          title={collapsed ? 'Expand action log' : 'Minimize action log'}
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center text-card/60 transition-colors hover:text-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-game ${compact && collapsed ? '' : 'rounded-full hover:bg-white/10'}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={collapsed ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
          </svg>
        </button>
      </div>
      {!collapsed && (
        <div
          ref={listRef}
          className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-1"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,.2) transparent' }}
          aria-label="Recent game actions"
          aria-live="polite"
        >
          {entries.length === 0 && <p className="font-body text-xs italic text-card/30">No actions yet.</p>}
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-1.5 text-xs">
              <span className={`flex-shrink-0 font-body font-bold ${ACTION_COLORS[entry.action]}`}>
                {ACTION_LABELS[entry.action]}
              </span>
              <span className="font-body leading-tight text-card/70">{entry.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
