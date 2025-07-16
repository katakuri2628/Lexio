// Lexio Game Types

export type Suit = 'cloud' | 'star' | 'moon' | 'sun';
export type CardNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

export interface Card {
  id: string;
  suit: Suit;
  number: CardNumber;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  coins: number;
  isAI: boolean;
  isActive: boolean;
  isWinner: boolean;
}

export type PlayType = 'single' | 'pair' | 'triple' | 'straight' | 'flush' | 'fullHouse' | 'fourOfAKind' | 'straightFlush';

export interface Play {
  type: PlayType;
  cards: Card[];
  player: string;
  strength: number;
}

export interface GameState {
  players: Player[];
  currentPlayer: number;
  deck: Card[];
  lastPlay: Play | null;
  phase: 'waiting' | 'playing' | 'roundEnd' | 'gameEnd';
  round: number;
  maxRounds: number;
  playerCount: number;
  maxNumber: CardNumber;
  winner: string | null;
}

export interface GameAction {
  type: 'play' | 'pass' | 'newRound' | 'newGame';
  cards?: Card[];
  playType?: PlayType;
}

export const SUIT_COLORS = {
  cloud: '#60A5FA',    // 雲（青）
  star: '#FCD34D',     // 星（黄）
  moon: '#34D399',     // 月（緑）
  sun: '#F87171'       // 太陽（赤）
} as const;

export const SUIT_NAMES = {
  cloud: '雲',
  star: '星',
  moon: '月',
  sun: '太陽'
} as const;

export const SUIT_STRENGTH = {
  cloud: 1,
  star: 2,
  moon: 3,
  sun: 4
} as const;

export const PLAY_TYPE_NAMES = {
  single: 'シングル',
  pair: 'ペア',
  triple: 'トリプル',
  straight: 'ストレート',
  flush: 'フラッシュ',
  fullHouse: 'フルハウス',
  fourOfAKind: 'フォーカード',
  straightFlush: 'ストレートフラッシュ'
} as const;

export const PLAY_TYPE_STRENGTH = {
  single: 1,
  pair: 2,
  triple: 3,
  straight: 4,
  flush: 5,
  fullHouse: 6,
  fourOfAKind: 7,
  straightFlush: 8
} as const;