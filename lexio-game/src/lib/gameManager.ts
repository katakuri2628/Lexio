import { GameState, Player, Card, GameAction, Play } from '../../shared/types';
import { createDeck, dealCards, analyzePlay, calculateScore, getMaxNumber } from './gameLogic';
import { AIPlayer, AIDifficulty } from './aiPlayer';

export class GameManager {
  private gameState: GameState;
  private aiPlayers: Map<string, AIPlayer> = new Map();
  private listeners: ((gameState: GameState) => void)[] = [];

  constructor() {
    this.gameState = this.createInitialGameState();
  }

  // ゲーム状態の変更を監視
  subscribe(listener: (gameState: GameState) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.gameState));
  }

  private createInitialGameState(): GameState {
    return {
      players: [],
      currentPlayer: 0,
      deck: [],
      lastPlay: null,
      phase: 'waiting',
      round: 1,
      maxRounds: 3,
      playerCount: 3,
      maxNumber: 9,
      winner: null
    };
  }

  // 新しいゲームを開始
  startNewGame(playerName: string, playerCount: number, aiDifficulty: AIDifficulty, maxRounds: number) {
    const players: Player[] = [];
    
    // 人間プレイヤーを追加
    players.push({
      id: 'human',
      name: playerName,
      hand: [],
      coins: 100,
      isAI: false,
      isActive: true,
      isWinner: false
    });

    // AIプレイヤーを追加
    for (let i = 1; i < playerCount; i++) {
      const aiId = `ai-${i}`;
      players.push({
        id: aiId,
        name: `AI ${i}`,
        hand: [],
        coins: 100,
        isAI: true,
        isActive: true,
        isWinner: false
      });
      
      this.aiPlayers.set(aiId, new AIPlayer(aiDifficulty));
    }

    this.gameState = {
      players,
      currentPlayer: 0,
      deck: [],
      lastPlay: null,
      phase: 'playing',
      round: 1,
      maxRounds,
      playerCount,
      maxNumber: getMaxNumber(playerCount),
      winner: null
    };

    this.startNewRound();
  }

  // 新しいラウンドを開始
  private startNewRound() {
    // デッキを作成してシャッフル
    const deck = createDeck(this.gameState.playerCount);
    
    // カードを配布
    const hands = dealCards(deck, this.gameState.playerCount);
    
    // プレイヤーに手札を配布
    this.gameState.players.forEach((player, index) => {
      player.hand = hands[index] || [];
    });

    // 雲の3を持つプレイヤーを最初の親にする（テスト用に人間プレイヤーから開始）
    const startPlayerIndex = 0; // this.findPlayerWithCloudThree();
    this.gameState.currentPlayer = startPlayerIndex;
    this.gameState.lastPlay = null;
    this.gameState.phase = 'playing';

    this.notifyListeners();
    
    // AIプレイヤーのターンの場合、自動実行
    this.scheduleAIAction();
  }

  private findPlayerWithCloudThree(): number {
    for (let i = 0; i < this.gameState.players.length; i++) {
      const hasCloudThree = this.gameState.players[i].hand.some(
        card => card.suit === 'cloud' && card.number === 3
      );
      if (hasCloudThree) return i;
    }
    return 0; // フォールバック
  }

  // プレイヤーのアクション処理
  handlePlayerAction(action: GameAction): boolean {
    if (this.gameState.phase !== 'playing') return false;
    
    const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
    if (!currentPlayer) return false;

    switch (action.type) {
      case 'play':
        return this.handlePlayAction(action, currentPlayer);
      case 'pass':
        return this.handlePassAction();
      case 'newRound':
        this.handleNewRound();
        return true;
      case 'newGame':
        this.gameState = this.createInitialGameState();
        this.notifyListeners();
        return true;
      default:
        return false;
    }
  }

  private handlePlayAction(action: GameAction, player: Player): boolean {
    if (!action.cards || !action.playType) return false;

    // カードが手札にあるかチェック
    const cardIds = action.cards.map(card => card.id);
    const hasAllCards = cardIds.every(id => 
      player.hand.some(card => card.id === id)
    );
    if (!hasAllCards) return false;

    // 役の有効性をチェック
    const playAnalysis = analyzePlay(action.cards);
    if (!playAnalysis) return false;

    // 前のプレイより強いかチェック
    if (this.gameState.lastPlay) {
      if (this.gameState.lastPlay.type !== playAnalysis.type ||
          playAnalysis.strength <= this.gameState.lastPlay.strength) {
        return false;
      }
    }

    // 手札からカードを削除
    player.hand = player.hand.filter(card => !cardIds.includes(card.id));

    // プレイを記録
    this.gameState.lastPlay = {
      type: playAnalysis.type,
      cards: action.cards,
      player: player.id,
      strength: playAnalysis.strength
    };

    // ラウンド終了チェック
    if (player.hand.length === 0) {
      this.endRound();
      return true;
    }

    // 次のプレイヤーへ
    this.nextPlayer();
    return true;
  }

  private handlePassAction(): boolean {
    // 全員がパスした場合は場をクリア
    const allPlayersCount = this.gameState.players.filter(p => p.isActive).length;
    const nextPlayerIndex = this.getNextActivePlayerIndex();
    
    // 次のプレイヤーが最後にプレイしたプレイヤーの場合、場をクリア
    if (this.gameState.lastPlay && 
        this.gameState.players[nextPlayerIndex]?.id === this.gameState.lastPlay.player) {
      this.gameState.lastPlay = null;
    }

    this.nextPlayer();
    return true;
  }

  private handleNewRound() {
    if (this.gameState.round >= this.gameState.maxRounds) {
      this.endGame();
    } else {
      this.gameState.round++;
      this.startNewRound();
    }
  }

  private nextPlayer() {
    this.gameState.currentPlayer = this.getNextActivePlayerIndex();
    this.notifyListeners();
    this.scheduleAIAction();
  }

  private getNextActivePlayerIndex(): number {
    let nextIndex = (this.gameState.currentPlayer + 1) % this.gameState.players.length;
    
    // アクティブなプレイヤーを探す
    let attempts = 0;
    while (!this.gameState.players[nextIndex]?.isActive && attempts < this.gameState.players.length) {
      nextIndex = (nextIndex + 1) % this.gameState.players.length;
      attempts++;
    }
    
    return nextIndex;
  }

  private scheduleAIAction() {
    const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
    if (!currentPlayer?.isAI || this.gameState.phase !== 'playing') return;

    // AIの思考時間をシミュレート
    setTimeout(() => {
      this.executeAIAction(currentPlayer);
    }, 1000 + Math.random() * 2000); // 1-3秒のランダムな思考時間
  }

  private executeAIAction(player: Player) {
    const ai = this.aiPlayers.get(player.id);
    if (!ai) return;

    const decision = ai.makeDecision(this.gameState, player.id);
    
    const action: GameAction = {
      type: decision.action,
      cards: decision.cards,
      playType: decision.playType
    };

    this.handlePlayerAction(action);
  }

  private endRound() {
    // 得点計算
    this.gameState.players.forEach((player, index) => {
      const score = calculateScore(this.gameState.players, index);
      player.coins += score;
      
      // コインが0以下になったプレイヤーは脱落
      if (player.coins <= 0) {
        player.isActive = false;
      }
    });

    // アクティブなプレイヤーが1人以下の場合はゲーム終了
    const activePlayers = this.gameState.players.filter(p => p.isActive);
    if (activePlayers.length <= 1) {
      this.endGame();
      return;
    }

    this.gameState.phase = 'roundEnd';
    this.notifyListeners();
  }

  private endGame() {
    // 最多コインを持つプレイヤーを勝者とする
    const winner = this.gameState.players.reduce((best, current) => 
      current.coins > best.coins ? current : best
    );
    
    winner.isWinner = true;
    this.gameState.winner = winner.id;
    this.gameState.phase = 'gameEnd';
    this.notifyListeners();
  }

  // 現在のゲーム状態を取得
  getGameState(): GameState {
    return { ...this.gameState };
  }

  // 特定のプレイヤーの情報を取得
  getPlayer(playerId: string): Player | null {
    return this.gameState.players.find(p => p.id === playerId) || null;
  }

  // ゲームが進行中かチェック
  isGameActive(): boolean {
    return this.gameState.phase === 'playing';
  }
}