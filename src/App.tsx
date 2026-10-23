import { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Difficulty, PlayerCount, Card as CardType, Orientation } from './game/types';
import { areContiguousInHand, canBeatActiveSet, classifySet } from './game/engine';
import { GameProvider } from './state/GameProvider';
import { useGame } from './state/useGame';
import StartScreen from './components/StartScreen';
import GameSetupScreen from './components/GameSetupScreen';
import HUD from './components/HUD';
import OpponentPanel from './components/OpponentPanel';
import TableArea from './components/TableArea';
import PlayerHand from './components/PlayerHand';
import ActionBar from './components/ActionBar';
import ActionLog from './components/ActionLog';
import ToastBanner from './components/ToastBanner';
import RoundSummaryModal from './components/RoundSummaryModal';
import TutorialOverlay from './components/TutorialOverlay';
import SettingsMenu from './components/SettingsMenu';

type Screen = 'start' | 'setup' | 'game';

// ── Inner game screen ─────────────────────────────────────────────
function GameScreen({ onRestartToSetup }: { onRestartToSetup: (difficulty: Difficulty, playerCount: PlayerCount) => void }) {
  const { state, dispatch } = useGame();
  const [selectedIds, setSelectedIds]   = useState<string[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [actionLogCollapsed, setActionLogCollapsed] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  // Scout mode: player is picking an end card from the active set
  const [scoutMode, setScoutMode]       = useState<false | 'scout' | 'scoutAndShow'>(false);
  // The player first chooses the card orientation, then a separate hand insertion gap.
  const [scoutStaging, setScoutStaging] = useState<{
    card: CardType; tableIndex: number; mode: 'scout' | 'scoutAndShow'; orientation: Orientation;
  } | null>(null);
  const [scoutPlacement, setScoutPlacement] = useState<{
    card: CardType; tableIndex: number; mode: 'scout' | 'scoutAndShow'; orientation: Orientation;
  } | null>(null);
  const [scoutHoverIndex, setScoutHoverIndex] = useState<number | null>(null);
  const scoutHoverIndexRef = useRef<number | null>(null);
  const handDropZoneRef = useRef<HTMLDivElement>(null);
  const handCardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const scoutDragStartCenters = useRef<Array<number | null>>([]);
  const scoutDragStartScrollLeft = useRef(0);
  const scoutEdgeScrollTime = useRef(0);
  const [roundEndReadyKey, setRoundEndReadyKey] = useState<string | null>(null);
  // Scout & Show stays provisional until the player chooses a legal Show.
  const [pendingScoutedCard, setPendingScoutedCard] = useState<{
    tableCardIndex: number; handInsertIndex: number; scoutedOrientation: Orientation;
  } | null>(null);

  const human = state.players[0];
  const isPickingUp = state.table.phase === 'pickingUp';
  const isRoundComplete = state.table.phase === 'roundEnd';
  const isRoundEnd  = state.table.phase === 'roundEnd' || state.table.phase === 'gameEnd';
  const lastActionId = state.actionLog.at(-1)?.id ?? `round-${state.table.round}`;
  const roundEndActionKey = `${state.table.round}:${lastActionId}`;
  const showRoundSummary = state.table.phase === 'gameEnd' || (isRoundComplete && roundEndReadyKey === roundEndActionKey);
  const isAITurn    = state.table.currentTurnIndex > 0 && state.table.phase === 'playing';
  const isMyTurn    = state.table.currentTurnIndex === 0 && state.table.phase === 'playing';
  const visibleHand = pendingScoutedCard
    ? [
        ...human.hand.slice(0, pendingScoutedCard.handInsertIndex),
        { ...state.table.activeSet[pendingScoutedCard.tableCardIndex], orientation: pendingScoutedCard.scoutedOrientation },
        ...human.hand.slice(pendingScoutedCard.handInsertIndex),
      ].filter((card): card is CardType => Boolean(card))
    : human.hand;
  const activeSetAfterPendingScout = pendingScoutedCard
    ? state.table.activeSet.filter((_, index) => index !== pendingScoutedCard.tableCardIndex)
    : state.table.activeSet;
  const tableForShow = pendingScoutedCard
    ? {
        ...state.table,
        activeSet: activeSetAfterPendingScout,
        activeSetType: activeSetAfterPendingScout.length ? classifySet(activeSetAfterPendingScout).type : null,
      }
    : state.table;
  const scoutCardInteraction = scoutPlacement
    ? { ...scoutPlacement, phase: 'place' as const }
    : scoutStaging
      ? { ...scoutStaging, phase: 'inspect' as const }
      : null;
  const selectedCards = visibleHand.filter((card) => selectedIds.includes(card.id));
  const canLegallyShow = selectedCards.length > 0
    && areContiguousInHand(visibleHand, selectedIds)
    && classifySet(selectedCards).valid
    && canBeatActiveSet(selectedCards, tableForShow);

  // Let the final play/scout and its card movement finish before opening the modal.
  useEffect(() => {
    if (!isRoundComplete) return;
    const timer = window.setTimeout(() => setRoundEndReadyKey(roundEndActionKey), 1100);
    return () => window.clearTimeout(timer);
  }, [isRoundComplete, roundEndActionKey]);

  // Trigger every AI seat, including AI turns following another AI.
  useEffect(() => {
    if (!isAITurn) return;
    const timer = setTimeout(() => dispatch({ type: 'AI_TAKE_TURN' }), 900);
    return () => clearTimeout(timer);
  }, [isAITurn, state.table.currentTurnIndex, state.table.round, state.actionLog.length, dispatch]);

  // ── Actions ──────────────────────────────────────────────────────

  function handleShow() {
    if (!canLegallyShow) return;
    if (pendingScoutedCard) {
      dispatch({
        type: 'SCOUT_AND_SHOW',
        ...pendingScoutedCard,
        showCardIds: selectedIds,
      });
      setPendingScoutedCard(null);
    } else {
      dispatch({ type: 'SHOW', cardIds: selectedIds });
    }
    setSelectedIds([]);
  }

  function handleScoutStart() {
    if (state.table.activeSet.length === 0 || pendingScoutedCard) return;
    setScoutMode('scout');
    setSelectedIds([]);
  }

  function handleScoutAndShowStart() {
    if (!human.chips.scoutAndShow || state.table.activeSet.length === 0 || pendingScoutedCard) return;
    setScoutMode('scoutAndShow');
    setSelectedIds([]);
  }

  function handleScoutCardPicked(tableCardIndex: number) {
    if (!scoutMode) return;
    const card = state.table.activeSet[tableCardIndex];
    if (!card) return;
    // Enter staging — player now picks orientation & insert position before dispatching
    setScoutStaging({ card, tableIndex: tableCardIndex, mode: scoutMode, orientation: card.orientation });
    setScoutMode(false);
  }

  function handleScoutOrientationConfirm() {
    if (!scoutStaging) return;
    setScoutPlacement(scoutStaging);
    setScoutStaging(null);
  }

  function handleScoutPlacementConfirm(insertIndex: number) {
    if (!scoutPlacement) return;
    setScoutDropTarget(null);
    if (scoutPlacement.mode === 'scoutAndShow') {
      setPendingScoutedCard({
        tableCardIndex: scoutPlacement.tableIndex,
        handInsertIndex: insertIndex,
        scoutedOrientation: scoutPlacement.orientation,
      });
      setSelectedIds([]);
    } else {
      dispatch({
        type: 'SCOUT',
        tableCardIndex: scoutPlacement.tableIndex,
        handInsertIndex: insertIndex,
        scoutedOrientation: scoutPlacement.orientation,
      });
    }
    setScoutPlacement(null);
    setScoutMode(false);
  }

  function handleScoutCancelStaging() {
    setScoutStaging(null);
    setScoutMode(false);
    setSelectedIds([]);
  }

  function handleScoutPlacementDropOutside() {
    if (!scoutPlacement) return;
    setScoutStaging(scoutPlacement);
    setScoutPlacement(null);
    setScoutDropTarget(null);
  }

  function handleScoutPlacementCancel() {
    setScoutMode(false);
    setScoutDropTarget(null);
    setSelectedIds([]);
    setScoutPlacement(null);
    setScoutStaging(null);
  }

  function getScoutInsertionIndex(point: { x: number; y: number }) {
    const viewport = handDropZoneRef.current;
    const clientX = point.x - window.scrollX;
    const scrollDelta = viewport ? viewport.scrollLeft - scoutDragStartScrollLeft.current : 0;
    const startCenters = scoutDragStartCenters.current;

    for (let index = 0; index < human.hand.length; index += 1) {
      const storedCenter = startCenters[index];
      const card = handCardRefs.current[index];
      const center = storedCenter ?? (card
        ? card.getBoundingClientRect().left + card.getBoundingClientRect().width / 2
        : null);
      if (center !== null && center !== undefined && clientX < center - scrollDelta) return index;
    }
    return human.hand.length;
  }

  function setScoutDropTarget(index: number | null) {
    scoutHoverIndexRef.current = index;
    setScoutHoverIndex((current) => current === index ? current : index);
  }

  function handleScoutDragStart() {
    scoutDragStartScrollLeft.current = handDropZoneRef.current?.scrollLeft ?? 0;
    scoutDragStartCenters.current = handCardRefs.current
      .slice(0, human.hand.length)
      .map((card) => card
        ? card.getBoundingClientRect().left + card.getBoundingClientRect().width / 2
        : null);
    setScoutDropTarget(null);
  }

  function handleScoutDrag(point: { x: number; y: number }) {
    const viewport = handDropZoneRef.current;
    if (!viewport || !scoutPlacement) return;

    const rect = viewport.getBoundingClientRect();
    const clientX = point.x - window.scrollX;
    const clientY = point.y - window.scrollY;
    const isOverHand = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
    if (!isOverHand) {
      setScoutDropTarget(null);
      return;
    }

    const now = Date.now();
    const edgeSize = 42;
    if (now - scoutEdgeScrollTime.current > 70) {
      if (clientX < rect.left + edgeSize) {
        viewport.scrollBy({ left: -28, behavior: 'auto' });
        scoutEdgeScrollTime.current = now;
      } else if (clientX > rect.right - edgeSize) {
        viewport.scrollBy({ left: 28, behavior: 'auto' });
        scoutEdgeScrollTime.current = now;
      }
    }

    const nextIndex = getScoutInsertionIndex(point);
    setScoutDropTarget(nextIndex);
  }

  function handleScoutDragEnd(point: { x: number; y: number }) {
    const rect = handDropZoneRef.current?.getBoundingClientRect();
    const clientX = point.x - window.scrollX;
    const clientY = point.y - window.scrollY;
    const isOverHand = Boolean(rect
      && clientX >= rect.left && clientX <= rect.right
      && clientY >= rect.top && clientY <= rect.bottom);
    if (isOverHand) {
      handleScoutPlacementConfirm(scoutHoverIndexRef.current ?? getScoutInsertionIndex(point));
      return;
    }
    handleScoutPlacementDropOutside();
  }

  function handleCancelScoutAndShow() {
    setPendingScoutedCard(null);
    setSelectedIds([]);
  }

  return (
    <div className="relative h-dvh overflow-hidden bg-felt">
      <div className="felt-noise h-dvh overflow-hidden bg-felt flex flex-col" inert={isRoundEnd}>
      <HUD
        human={human}
        opponents={state.players.slice(1)}
        table={state.table}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Toast banner */}
      <ToastBanner message={state.lastToast} messageKey={state.actionLog.at(-1)?.id} />

      {/* ── GAME LAYOUT ────────────────────────────────────────────
          Zones (top → bottom):
          1. Opponent row  — compact HUD panels for ALL AI opponents
          2. Table centre  — active set, fills remaining space (flex-1)
          3. Player hand   — centred horizontal rack
          4. Action bar    — fixed-height bottom strip
      ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-h-0 pt-14 overflow-hidden">

        {/* ── ZONE 1: Opponent row ── */}
        <div className="flex gap-2 px-3 pt-2 pb-1 flex-shrink-0 overflow-x-auto hide-scrollbar">
          {state.players.slice(1).map((opponent, index) => (
            <OpponentPanel
              key={`${opponent.name}-${index}`}
              player={opponent}
              isCurrentTurn={isAITurn && state.table.currentTurnIndex === index + 1}
            />
          ))}
        </div>

        {/* ── ZONE 2: centered table with an overlay action log ── */}
        <div className="relative flex-1 min-h-0 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <TableArea
              table={state.table}
              scoutMode={scoutMode !== false}
              scoutFocusCardIndex={scoutStaging?.tableIndex ?? scoutPlacement?.tableIndex ?? pendingScoutedCard?.tableCardIndex ?? null}
              scoutCard={scoutCardInteraction}
              onScoutCard={handleScoutCardPicked}
              onFlipScoutCard={() => setScoutStaging((current) => current && ({
                ...current,
                orientation: current.orientation === 'normal' ? 'flipped' : 'normal',
              }))}
              onConfirmScoutCard={handleScoutOrientationConfirm}
              onCancelScoutCard={scoutPlacement ? handleScoutPlacementCancel : handleScoutCancelStaging}
              onScoutDragStart={handleScoutDragStart}
              onScoutDrag={handleScoutDrag}
              onScoutDragEnd={handleScoutDragEnd}
              lastAction={state.actionLog.at(-1)}
              currentPlayerName={state.players[state.table.currentTurnIndex]?.name ?? 'Game'}
              isAITurn={isAITurn}
            />
          </div>

          <aside className={`absolute inset-y-0 right-0 z-20 hidden flex-col transition-[width] md:flex ${actionLogCollapsed ? 'w-12 bg-transparent' : 'w-56 border-l border-felt-light/20 bg-felt-dark/90 shadow-xl backdrop-blur-sm'}`}>
            <ActionLog
              entries={state.actionLog}
              collapsed={actionLogCollapsed}
              compact
              onToggle={() => setActionLogCollapsed((collapsed) => !collapsed)}
            />
          </aside>
        </div>

        {/* Action log — mobile-only bottom strip (above hand) */}
        <div className={`md:hidden flex-shrink-0 overflow-hidden transition-[height] ${actionLogCollapsed ? 'h-10 bg-transparent' : 'h-24 border-t border-felt-light/20 bg-felt-dark/80'}`}>
          <ActionLog
            entries={state.actionLog}
            collapsed={actionLogCollapsed}
            compact
            onToggle={() => setActionLogCollapsed((collapsed) => !collapsed)}
          />
        </div>

        {/* ── ZONE 3: Player hand ── */}
        <div className="flex-shrink-0">
          <PlayerHand
            hand={visibleHand}
            selectedIds={selectedIds}
            isPickingUp={isPickingUp}
            handFlipped={human.handFlipped}
            scoutDropIndex={scoutPlacement ? scoutHoverIndex : null}
            handDropZoneRef={handDropZoneRef}
            handCardRefs={handCardRefs}
            onSelectCard={(id) => {
              if (!isMyTurn || scoutMode || scoutStaging || scoutPlacement) return;
              setSelectedIds((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
              );
            }}
            onFlipHand={() => dispatch({ type: 'FLIP_HAND' })}
            onConfirmHand={() => dispatch({ type: 'CONFIRM_HAND' })}
          />
        </div>

        {/* ── ZONE 4: Action bar ── */}
        <ActionBar
          player={human}
          canShow={isMyTurn && !scoutMode && !scoutStaging && !scoutPlacement && canLegallyShow}
          canScout={isMyTurn && !scoutMode && !scoutStaging && !scoutPlacement && state.table.activeSet.length > 0}
          canScoutAndShow={isMyTurn && !scoutMode && !scoutStaging && !scoutPlacement && !pendingScoutedCard && human.chips.scoutAndShow && state.table.activeSet.length > 0}
          isPendingScoutAndShow={Boolean(pendingScoutedCard)}
          onShow={handleShow}
          onScout={handleScoutStart}
          onScoutAndShow={handleScoutAndShowStart}
          isChoosingScoutEnd={scoutMode !== false}
          scoutCancelLabel={scoutMode === 'scoutAndShow' ? 'Cancel Scout & Show' : 'Cancel Scout'}
          onCancelScoutSelection={() => setScoutMode(false)}
          onCancelScoutAndShow={handleCancelScoutAndShow}
        />
      </div>

      {/* Settings */}
      <SettingsMenu
        isOpen={settingsOpen && !isRoundEnd}
        difficulty={state.difficulty}
        playerCount={state.playerCount}
        onSetDifficulty={(d) => { dispatch({ type: 'SET_DIFFICULTY', difficulty: d }); setSettingsOpen(false); }}
        onSetPlayerCount={(n) => { dispatch({ type: 'SET_PLAYER_COUNT', playerCount: n }); setSettingsOpen(false); }}
        onOpenTutorial={() => { setShowTutorial(true); setTutorialStep(0); }}
        onRestartGame={() => { dispatch({ type: 'RESTART_GAME' }); setSettingsOpen(false); onRestartToSetup(state.difficulty, state.playerCount); }}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Tutorial */}
      <AnimatePresence>
        {showTutorial && !isRoundEnd && (
          <TutorialOverlay
            step={tutorialStep}
            onNext={() => setTutorialStep((s) => Math.min(s + 1, 4))}
            onBack={() => setTutorialStep((s) => Math.max(s - 1, 0))}
            onClose={() => { setShowTutorial(false); setTutorialStep(0); }}
          />
        )}
      </AnimatePresence>
      </div>

      {/* Keep the summary modal outside the inert game surface so its next-round button remains usable. */}
      <AnimatePresence>
        {showRoundSummary && (
          <RoundSummaryModal
            round={state.table.round}
            players={state.players}
            roundEndReason={state.table.roundEndReason}
            activeSetOwnerIndex={state.table.activeSetOwnerIndex}
            isFinal={state.table.phase === 'gameEnd'}
            onNextRound={() => {
              setSettingsOpen(false);
              setShowTutorial(false);
              dispatch({ type: 'NEXT_ROUND' });
            }}
            onNewGame={() => onRestartToSetup(state.difficulty, state.playerCount)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]           = useState<Screen>('start');
  const [difficulty, setDifficulty]   = useState<Difficulty>('standard');
  const [playerCount, setPlayerCount] = useState<PlayerCount>(3);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  if (screen === 'start') {
    return (
      <>
        <StartScreen
          onStartGame={() => setScreen('setup')}
          onOpenTutorial={() => { setShowTutorial(true); setTutorialStep(0); }}
        />
        <AnimatePresence>
          {showTutorial && (
            <TutorialOverlay
              step={tutorialStep}
              onNext={() => setTutorialStep((s) => Math.min(s + 1, 4))}
              onBack={() => setTutorialStep((s) => Math.max(s - 1, 0))}
              onClose={() => { setShowTutorial(false); setTutorialStep(0); }}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  if (screen === 'setup') {
    return (
      <GameSetupScreen
        playerCount={playerCount}
        difficulty={difficulty}
        onSetPlayerCount={setPlayerCount}
        onSetDifficulty={setDifficulty}
        onPlay={() => setScreen('game')}
        onBack={() => setScreen('start')}
      />
    );
  }

  return (
    <GameProvider
      key={`${difficulty}-${playerCount}`}
      initialDifficulty={difficulty}
      initialPlayerCount={playerCount}
    >
      <GameScreen onRestartToSetup={(nextDifficulty, nextPlayerCount) => {
        setDifficulty(nextDifficulty);
        setPlayerCount(nextPlayerCount);
        setScreen('setup');
      }} />
    </GameProvider>
  );
}
