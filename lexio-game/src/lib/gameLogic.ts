import { Card, CardNumber, Suit, PlayType, Play, SUIT_STRENGTH, PLAY_TYPE_STRENGTH } from '../../shared/types';

// カードの強さを計算（2が最強、1が特殊）
export function getCardStrength(card: Card): number {
  if (card.number === 2) return 100; // 2が最強
  if (card.number === 1) return 99;  // 1が2番目に強い
  return card.number;
}

// スートの強さを取得
export function getSuitStrength(suit: Suit): number {
  return SUIT_STRENGTH[suit];
}

// カードを比較（より強いカードが正の値）
export function compareCards(a: Card, b: Card): number {
  const strengthDiff = getCardStrength(a) - getCardStrength(b);
  if (strengthDiff !== 0) return strengthDiff;
  return getSuitStrength(a.suit) - getSuitStrength(b.suit);
}

// デッキを作成
export function createDeck(playerCount: number): Card[] {
  const suits: Suit[] = ['cloud', 'star', 'moon', 'sun'];
  const maxNumber = getMaxNumber(playerCount);
  const deck: Card[] = [];
  
  for (const suit of suits) {
    for (let number = 1; number <= maxNumber; number++) {
      deck.push({
        id: `${suit}-${number}`,
        suit,
        number: number as CardNumber
      });
    }
  }
  
  return shuffleDeck(deck);
}

// プレイ人数に応じた最大数字を取得
export function getMaxNumber(playerCount: number): CardNumber {
  switch (playerCount) {
    case 2: return 5;
    case 3: return 9;
    case 4: return 13;
    case 5: return 15;
    default: return 9;
  }
}

// デッキをシャッフル
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// カードを配布
export function dealCards(deck: Card[], playerCount: number): Card[][] {
  const hands: Card[][] = Array.from({ length: playerCount }, () => []);
  
  deck.forEach((card, index) => {
    hands[index % playerCount].push(card);
  });
  
  return hands;
}

// 役の判定
export function analyzePlay(cards: Card[]): { type: PlayType; strength: number } | null {
  if (!cards.length) return null;
  
  const sortedCards = [...cards].sort((a, b) => compareCards(a, b));
  
  if (cards.length === 1) {
    return {
      type: 'single',
      strength: calculatePlayStrength('single', sortedCards)
    };
  }
  
  if (cards.length === 2) {
    if (sortedCards[0].number === sortedCards[1].number) {
      return {
        type: 'pair',
        strength: calculatePlayStrength('pair', sortedCards)
      };
    }
    return null;
  }
  
  if (cards.length === 3) {
    if (sortedCards[0].number === sortedCards[1].number && 
        sortedCards[1].number === sortedCards[2].number) {
      return {
        type: 'triple',
        strength: calculatePlayStrength('triple', sortedCards)
      };
    }
    return null;
  }
  
  if (cards.length === 5) {
    return analyzeFiveCardPlay(sortedCards);
  }
  
  return null;
}

// 5枚役の判定
function analyzeFiveCardPlay(cards: Card[]): { type: PlayType; strength: number } | null {
  const isFlush = cards.every(card => card.suit === cards[0].suit);
  const isStraight = checkStraight(cards);
  
  if (isFlush && isStraight) {
    return {
      type: 'straightFlush',
      strength: calculatePlayStrength('straightFlush', cards)
    };
  }
  
  const numberCounts = getNumberCounts(cards);
  const counts = Object.values(numberCounts).sort((a, b) => b - a);
  
  if (counts[0] === 4) {
    return {
      type: 'fourOfAKind',
      strength: calculatePlayStrength('fourOfAKind', cards)
    };
  }
  
  if (counts[0] === 3 && counts[1] === 2) {
    return {
      type: 'fullHouse',
      strength: calculatePlayStrength('fullHouse', cards)
    };
  }
  
  if (isFlush) {
    return {
      type: 'flush',
      strength: calculatePlayStrength('flush', cards)
    };
  }
  
  if (isStraight) {
    return {
      type: 'straight',
      strength: calculatePlayStrength('straight', cards)
    };
  }
  
  return null;
}

// ストレート判定（1の特殊ルール含む）
function checkStraight(cards: Card[]): boolean {
  const numbers = cards.map(card => card.number).sort((a, b) => a - b);
  
  // 通常のストレート
  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] - numbers[i - 1] !== 1) {
      break;
    }
    if (i === numbers.length - 1) return true;
  }
  
  // 1が最大数字の次として使用される場合（例: 7-8-9-1-2 は無効、7-8-9-1のみ有効）
  if (numbers[0] === 1 && numbers.length === 4) {
    const withoutOne = numbers.slice(1);
    for (let i = 1; i < withoutOne.length; i++) {
      if (withoutOne[i] - withoutOne[i - 1] !== 1) {
        return false;
      }
    }
    return true;
  }
  
  return false;
}

// 数字の出現回数をカウント
function getNumberCounts(cards: Card[]): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const card of cards) {
    counts[card.number] = (counts[card.number] || 0) + 1;
  }
  return counts;
}

// プレイの強さを計算
function calculatePlayStrength(type: PlayType, cards: Card[]): number {
  const baseStrength = PLAY_TYPE_STRENGTH[type] * 1000000;
  const highestCard = cards.reduce((highest, card) => 
    compareCards(card, highest) > 0 ? card : highest
  );
  
  const cardStrength = getCardStrength(highestCard) * 1000 + getSuitStrength(highestCard.suit);
  
  return baseStrength + cardStrength;
}

// プレイ比較
export function comparePlays(a: Play, b: Play): number {
  // 同じタイプの場合のみ比較可能
  if (a.type !== b.type) return 0;
  return a.strength - b.strength;
}

// 2の牌のペナルティ計算
export function calculate2Penalty(remainingCards: Card[]): number {
  const twos = remainingCards.filter(card => card.number === 2).length;
  const totalRemaining = remainingCards.length;
  
  if (twos === 0) return totalRemaining;
  
  return totalRemaining * Math.pow(2, twos);
}

// 得点計算
export function calculateScore(players: { hand: Card[]; }[], playerIndex: number): number {
  const sortedPlayers = players
    .map((player, index) => ({ ...player, originalIndex: index }))
    .sort((a, b) => {
      const aScore = calculate2Penalty(a.hand);
      const bScore = calculate2Penalty(b.hand);
      return aScore - bScore;
    });
  
  const playerRank = sortedPlayers.findIndex(p => p.originalIndex === playerIndex);
  
  if (playerRank === 0) {
    // 1位：他プレイヤーの残り牌数分を獲得
    return sortedPlayers.slice(1).reduce((sum, player) => sum + calculate2Penalty(player.hand), 0);
  }
  
  if (playerRank === sortedPlayers.length - 1) {
    // 最下位：0点
    return 0;
  }
  
  // 2位以下：下位プレイヤーとの牌数差分を獲得
  const playerScore = calculate2Penalty(sortedPlayers[playerRank].hand);
  return sortedPlayers.slice(playerRank + 1).reduce((sum, player) => {
    const playerPenalty = calculate2Penalty(player.hand);
    return sum + Math.max(0, playerPenalty - playerScore);
  }, 0);
}