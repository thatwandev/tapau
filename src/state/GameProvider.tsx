import { useReducer } from 'react';
import type { Difficulty, PlayerCount } from '../game/types';
import { gameReducer } from './gameReducer';
import { createMockGameState } from '../game/mockData';
import { GameContext } from './game-context';

interface GameProviderProps {
  children: React.ReactNode;
  initialDifficulty: Difficulty;
  initialPlayerCount: PlayerCount;
}

export function GameProvider({ children, initialDifficulty, initialPlayerCount }: GameProviderProps) {
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    () => createMockGameState(initialDifficulty, initialPlayerCount),
  );
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}
