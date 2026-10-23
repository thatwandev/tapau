import { motion, useReducedMotion } from 'framer-motion';
import type { Card as CardType } from '../game/types';

interface CardProps {
  card: CardType;
  selected?: boolean;
  showBack?: boolean;
  size?: 'normal' | 'small';
  /** index in hand — used to stagger deal animation */
  dealIndex?: number;
  onClick?: () => void;
}

export default function Card({
  card,
  selected = false,
  showBack = false,
  size = 'normal',
  dealIndex = 0,
  onClick,
}: CardProps) {
  const shouldReduceMotion = useReducedMotion();
  const springTransition = shouldReduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 300, damping: 24 };

  const isNormal = size === 'normal';
  const width = isNormal ? 'w-[72px] md:w-[84px]' : 'w-[60px]';
  const height = isNormal ? 'h-[104px] md:h-[120px]' : 'h-[88px]';

  if (showBack) {
    return (
      <motion.div
        className={`${width} ${height} rounded-card bg-card-text border border-card-border relative flex-shrink-0`}
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.05) 4px, rgba(255,255,255,0.05) 8px)',
        }}
        aria-hidden="true"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 280, damping: 22, delay: dealIndex * 0.04 }}
      />
    );
  }

  const displayValue = card.orientation === 'normal' ? card.topValue : card.bottomValue;
  const altValue    = card.orientation === 'normal' ? card.bottomValue : card.topValue;

  const primarySize   = isNormal ? 'text-xl md:text-2xl' : 'text-sm';
  const secondarySize = isNormal ? 'text-sm' : 'text-[11px]';

  return (
    <motion.div
      layoutId={card.id}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`Card ${displayValue} (other side: ${altValue})${selected ? ', selected' : ''}`}
      aria-pressed={onClick ? selected : undefined}
      className={[
        width,
        height,
        'rounded-card bg-card border border-card-border relative flex-shrink-0 select-none',
        onClick ? 'cursor-pointer' : '',
      ].join(' ')}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      /* Deal animation */
      initial={{ y: -60, opacity: 0 }}
      animate={{
        y: selected ? -8 : 0,
        opacity: 1,
        scale: selected ? 1.04 : 1,
      }}
      transition={shouldReduceMotion
        ? { duration: 0 }
        : { ...springTransition, delay: dealIndex * 0.04 }}
      whileHover={onClick ? { y: selected ? -8 : -3 } : undefined}
      whileTap={onClick ? { scale: 0.97 } : undefined}
    >
      {/* Selected ring */}
      {selected && (
        <span className="absolute inset-0 rounded-card ring-2 ring-emerald-game pointer-events-none" />
      )}

      {/* Primary (active) value — top-left */}
      <span
        className={`absolute top-1.5 left-2 font-body font-semibold text-card-text ${primarySize}`}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {displayValue}
      </span>

      {/* Alternate value — bottom-right, rotated 180° */}
      <span
        className={`absolute bottom-1.5 right-2 font-body font-semibold text-card-muted rotate-180 inline-block ${secondarySize}`}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {altValue}
      </span>
    </motion.div>
  );
}
