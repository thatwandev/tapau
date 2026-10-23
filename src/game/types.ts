export type Orientation = 'normal' | 'flipped';
export type Difficulty = 'easy' | 'standard' | 'hard';
export type PlayerCount = 3 | 4 | 5;
export type GamePhase = 'start' | 'pickingUp' | 'playing' | 'scouting' | 'roundEnd' | 'gameEnd';
export type RoundEndReason = 'emptyHand' | 'lockout' | null;
export type PlayerId = 'human' | 'ai';
export type SetType = 'run' | 'match' | 'single';
export type SetOrder = 'asc' | 'desc' | null;

export interface Card {
  id: string;
  topValue: number;
  bottomValue: number;
  orientation: Orientation;
}

export interface ChipSet {
  scout: number;   // Scout Chips (point tokens, awarded when your card is scouted)
  scoutAndShow: boolean; // one-per-round Scout&Show token; true = still available
}

export interface Player {
  id: PlayerId;
  name: string;
  hand: Card[];
  chips: ChipSet;
  trophies: Card[];    // cards collected from beaten active sets (1 pt each)
  score: number;       // cumulative across rounds
  handFlipped: boolean;
}

export interface ActionLogEntry {
  id: string;
  turnIndex: number;    // which turn number
  playerName: string;
  action: 'show' | 'scout' | 'scoutAndShow' | 'pass' | 'deal' | 'roundEnd';
  description: string; // human-readable, e.g. "SHOWED a Run of 3: [4, 5, 6]"
}

export interface TableState {
  activeSet: Card[];
  activeSetType: SetType | null;
  activeSetOwnerIndex: number; // index into players[] of who played the current set
  currentTurnIndex: number;
  startingPlayerIndex: number;
  consecutiveScouts: number;   // scouts since the last Show
  round: number;
  phase: GamePhase;
  roundEndReason: RoundEndReason;
}

export interface GameState {
  players: Player[];  // index 0 = human; indices 1…N-1 = AI opponents
  table: TableState;
  difficulty: Difficulty;
  playerCount: PlayerCount;
  deck: Card[];
  actionLog: ActionLogEntry[];
  lastToast: string | null;   // latest action description for the toast banner
  tutorialActive: boolean;
  tutorialStep: number;
}
