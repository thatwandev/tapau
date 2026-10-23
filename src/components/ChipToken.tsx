interface ChipTokenProps {
  type: 'scout' | 'trophies';
  count: number;
  size?: 'normal' | 'small';
}

export default function ChipToken({ type, count, size = 'normal' }: ChipTokenProps) {
  const bg       = type === 'scout' ? 'bg-chip-scout' : 'bg-score-round/80';
  const label    = type === 'scout' ? 'Scout Chips' : 'Trophies';
  const dim      = size === 'small' ? 'w-8 h-8' : 'w-10 h-10';
  const iconSize = size === 'small' ? 12 : 16;
  const badgePos = size === 'small' ? '-top-0.5 -right-0.5' : '-top-1 -right-1';

  return (
    <div
      className={`relative inline-flex items-center justify-center ${dim} rounded-full ${bg} flex-shrink-0`}
      aria-label={`${label}: ${count}`}
      title={`${label}: ${count}`}
    >
      {type === 'scout' ? (
        /* Magnifying glass */
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      ) : (
        /* Trophy */
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
          <path d="M4 22h16"/>
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
        </svg>
      )}

      {/* Count badge */}
      <span
        className={`absolute ${badgePos} w-4 h-4 rounded-full bg-white text-[10px] font-body font-semibold text-card-text flex items-center justify-center leading-none`}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {count}
      </span>
    </div>
  );
}
