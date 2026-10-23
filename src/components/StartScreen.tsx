interface StartScreenProps {
  onStartGame: () => void;
  onOpenTutorial: () => void;
}

export default function StartScreen({ onStartGame, onOpenTutorial }: StartScreenProps) {
  return (
    <div className="felt-noise min-h-dvh bg-felt flex flex-col items-center justify-center px-6 gap-10">
      {/* Title block */}
      <div className="text-center">
        <h1 className="font-display font-bold text-6xl text-card leading-tight">
          Tapau
        </h1>
        <p className="font-body text-card/50 text-base mt-2">
          A Scout-inspired card game
        </p>
      </div>

      {/* Two actions */}
      <div className="w-full max-w-xs flex flex-col gap-4 items-center">
        <button
          className="w-full h-[52px] rounded-pill bg-emerald-game text-white font-body font-semibold text-base hover:brightness-110 active:scale-95 transition-all"
          onClick={onStartGame}
        >
          Start Game
        </button>
        <button
          className="font-body text-sm text-card/50 underline underline-offset-2 hover:text-card/80 transition-colors"
          onClick={onOpenTutorial}
        >
          How to Play
        </button>
      </div>
    </div>
  );
}
