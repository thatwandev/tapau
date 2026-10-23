import Card from './Card';
import ChipToken from './ChipToken';
import type { Player } from '../game/types';

interface OpponentAreaProps {
  ai: Player;
}

export default function OpponentArea({ ai }: OpponentAreaProps) {
  const visibleCount = Math.min(ai.hand.length, 6);
  const extraCount = ai.hand.length - visibleCount;

  return (
    <section
      className="bg-felt-light px-4 py-3 flex items-center gap-4"
      aria-label="Opponent area"
    >
      {/* Card backs — stacked silhouettes */}
      <div className="flex items-center gap-[-8px]">
        {Array.from({ length: visibleCount }).map((_, i) => (
          <div key={i} style={{ marginLeft: i > 0 ? '-8px' : 0 }}>
            <Card
              card={{ id: `back-${i}`, topValue: 0, bottomValue: 0, orientation: 'normal' }}
              showBack
              size="small"
            />
          </div>
        ))}
        {extraCount > 0 && (
          <span className="text-card/60 font-body text-xs ml-2">+{extraCount}</span>
        )}
      </div>

      {/* Chip tokens */}
      <div className="flex items-center gap-2 ml-2">
        <ChipToken type="scout" count={ai.chips.scout} size="small" />
        <ChipToken type="trophies" count={ai.trophies.length} size="small" />
      </div>

      {/* Card count */}
      <span className="font-body text-xs text-card/40 ml-auto" aria-label={`Opponent has ${ai.hand.length} cards`}>
        {ai.hand.length} cards
      </span>
    </section>
  );
}
