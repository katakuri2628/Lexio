import { Card, PlayType, Play, GameState, Player } from '../../shared/types';
import { analyzePlay, compareCards, getCardStrength, calculate2Penalty } from './gameLogic';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export interface AIDecision {
  action: 'play' | 'pass';
  cards?: Card[];
  playType?: PlayType;
}

export class AIPlayer {
  private difficulty: AIDifficulty;

  constructor(difficulty: AIDifficulty) {
    this.difficulty = difficulty;
  }

  makeDecision(gameState: GameState, playerId: string): AIDecision {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return { action: 'pass' };

    switch (this.difficulty) {
      case 'easy':
        return this.makeEasyDecision(gameState, player);
      case 'medium':
        return this.makeMediumDecision(gameState, player);
      case 'hard':
        return this.makeHardDecision(gameState, player);
      default:
        return { action: 'pass' };
    }
  }

  private makeEasyDecision(gameState: GameState, player: Player): AIDecision {
    // 簡単な戦略：ランダムに有効な手を選ぶ
    const possiblePlays = this.findPossiblePlays(player.hand, gameState.lastPlay);
    
    if (possiblePlays.length === 0) {
      return { action: 'pass' };
    }

    // 30%の確率でパス（戦略性を低く）
    if (Math.random() < 0.3) {
      return { action: 'pass' };
    }

    // ランダムに選択
    const randomPlay = possiblePlays[Math.floor(Math.random() * possiblePlays.length)];
    return {
      action: 'play',
      cards: randomPlay.cards,
      playType: randomPlay.type
    };
  }

  private makeMediumDecision(gameState: GameState, player: Player): AIDecision {
    // 中級戦略：基本的な戦略を考慮
    const possiblePlays = this.findPossiblePlays(player.hand, gameState.lastPlay);
    
    if (possiblePlays.length === 0) {
      return { action: 'pass' };
    }

    // 2の牌を多く持っている場合は積極的にプレイ
    const twos = player.hand.filter(card => card.number === 2);
    const shouldBeAggressive = twos.length >= 2;

    // 手札が少ない場合は積極的
    const isEndgame = player.hand.length <= 5;

    // パスの確率を調整
    const passChance = shouldBeAggressive || isEndgame ? 0.1 : 0.2;
    if (Math.random() < passChance) {
      return { action: 'pass' };
    }

    // 弱いカードから出すことを優先
    const sortedPlays = possiblePlays.sort((a, b) => a.strength - b.strength);
    
    // 2の牌を優先的に出す
    const playsWithTwos = sortedPlays.filter(play => 
      play.cards.some(card => card.number === 2)
    );
    
    if (playsWithTwos.length > 0) {
      const play = playsWithTwos[0];
      return {
        action: 'play',
        cards: play.cards,
        playType: play.type
      };
    }

    // 一番弱い手を選択
    const play = sortedPlays[0];
    return {
      action: 'play',
      cards: play.cards,
      playType: play.type
    };
  }

  private makeHardDecision(gameState: GameState, player: Player): AIDecision {
    // 上級戦略：高度な戦略とゲーム状況の分析
    const possiblePlays = this.findPossiblePlays(player.hand, gameState.lastPlay);
    
    if (possiblePlays.length === 0) {
      return { action: 'pass' };
    }

    // ゲーム状況の分析
    const analysis = this.analyzeGameState(gameState, player);
    
    // 戦略的判断
    if (analysis.shouldPass) {
      return { action: 'pass' };
    }

    // 最適な手を選択
    const bestPlay = this.selectBestPlay(possiblePlays, analysis, player);
    
    return {
      action: 'play',
      cards: bestPlay.cards,
      playType: bestPlay.type
    };
  }

  private findPossiblePlays(hand: Card[], lastPlay: Play | null): Play[] {
    const possiblePlays: Play[] = [];

    // 全ての可能な組み合わせを試す
    const combinations = this.generateCardCombinations(hand);
    
    for (const combination of combinations) {
      const analysis = analyzePlay(combination);
      if (!analysis) continue;

      const play: Play = {
        type: analysis.type,
        cards: combination,
        player: '',
        strength: analysis.strength
      };

      // 最初のプレイまたは前のプレイより強い場合
      if (!lastPlay || (lastPlay.type === play.type && play.strength > lastPlay.strength)) {
        possiblePlays.push(play);
      }
    }

    return possiblePlays;
  }

  private generateCardCombinations(hand: Card[]): Card[][] {
    const combinations: Card[][] = [];

    // シングル（1枚）
    for (const card of hand) {
      combinations.push([card]);
    }

    // ペア（2枚）
    for (let i = 0; i < hand.length; i++) {
      for (let j = i + 1; j < hand.length; j++) {
        if (hand[i].number === hand[j].number) {
          combinations.push([hand[i], hand[j]]);
        }
      }
    }

    // トリプル（3枚）
    for (let i = 0; i < hand.length; i++) {
      for (let j = i + 1; j < hand.length; j++) {
        for (let k = j + 1; k < hand.length; k++) {
          if (hand[i].number === hand[j].number && hand[j].number === hand[k].number) {
            combinations.push([hand[i], hand[j], hand[k]]);
          }
        }
      }
    }

    // 5枚役（ストレート、フラッシュなど）
    const fiveCardCombinations = this.generateFiveCardCombinations(hand);
    combinations.push(...fiveCardCombinations);

    return combinations;
  }

  private generateFiveCardCombinations(hand: Card[]): Card[][] {
    const combinations: Card[][] = [];
    
    if (hand.length < 5) return combinations;

    // 5枚の組み合わせをすべて生成
    const indices = this.getCombinations(hand.length, 5);
    
    for (const indexSet of indices) {
      const cards = indexSet.map(i => hand[i]);
      const analysis = analyzePlay(cards);
      
      if (analysis && ['straight', 'flush', 'fullHouse', 'fourOfAKind', 'straightFlush'].includes(analysis.type)) {
        combinations.push(cards);
      }
    }

    return combinations;
  }

  private getCombinations(n: number, k: number): number[][] {
    const result: number[][] = [];
    
    function backtrack(start: number, path: number[]) {
      if (path.length === k) {
        result.push([...path]);
        return;
      }
      
      for (let i = start; i < n; i++) {
        path.push(i);
        backtrack(i + 1, path);
        path.pop();
      }
    }
    
    backtrack(0, []);
    return result;
  }

  private analyzeGameState(gameState: GameState, player: Player) {
    const otherPlayers = gameState.players.filter(p => p.id !== player.id);
    const minOpponentCards = Math.min(...otherPlayers.map(p => p.hand.length));
    const myCardCount = player.hand.length;
    
    // 2の牌の数
    const twosCount = player.hand.filter(card => card.number === 2).length;
    const penaltyRisk = calculate2Penalty(player.hand.filter(card => card.number === 2));
    
    // 相手が少ない手札を持っている場合は保守的に
    const shouldBeConservative = minOpponentCards <= 3 && myCardCount > 5;
    
    // 2のペナルティリスクが高い場合は積極的に
    const shouldBeAggressive = twosCount >= 2 || penaltyRisk > myCardCount * 3;
    
    // エンドゲーム判定
    const isEndgame = myCardCount <= 4 || minOpponentCards <= 2;
    
    return {
      shouldPass: shouldBeConservative && !shouldBeAggressive && !isEndgame,
      shouldBeAggressive,
      isEndgame,
      penaltyRisk,
      minOpponentCards
    };
  }

  private selectBestPlay(plays: Play[], analysis: any, player: Player): Play {
    // 2の牌を含む手を優先
    const playsWithTwos = plays.filter(play => 
      play.cards.some(card => card.number === 2)
    );
    
    if (playsWithTwos.length > 0 && analysis.shouldBeAggressive) {
      return playsWithTwos.reduce((best, current) => 
        current.strength < best.strength ? current : best
      );
    }
    
    // エンドゲームでは手札を減らすことを優先
    if (analysis.isEndgame) {
      return plays.reduce((best, current) => 
        current.cards.length > best.cards.length ? current : best
      );
    }
    
    // 通常は最も弱い手を選択（カードを温存）
    return plays.reduce((best, current) => 
      current.strength < best.strength ? current : best
    );
  }
}