import React, { useState, useEffect } from 'react';
import { GameManager } from '@/lib/gameManager';
import { GameSetup, GameSettings } from '@/components/GameSetup';
import { GameBoard } from '@/components/GameBoard';
import { RulesModal } from '@/components/RulesModal';
import { GameState, Player, GameAction } from '../shared/types';

type AppState = 'setup' | 'playing' | 'rules';

export default function App() {
  const [appState, setAppState] = useState<AppState>('setup');
  const [gameManager] = useState(() => new GameManager());
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    // ゲーム状態の変更を監視
    const unsubscribe = gameManager.subscribe((newGameState) => {
      setGameState(newGameState);
      
      // 人間プレイヤーの情報を更新
      const humanPlayer = gameManager.getPlayer('human');
      setCurrentPlayer(humanPlayer);
    });

    return unsubscribe;
  }, [gameManager]);

  const handleStartGame = (settings: GameSettings) => {
    gameManager.startNewGame(
      settings.playerName,
      settings.playerCount,
      settings.aiDifficulty,
      settings.maxRounds
    );
    setAppState('playing');
  };

  const handleShowRules = () => {
    setShowRules(true);
  };

  const handleGameAction = (action: GameAction) => {
    gameManager.handlePlayerAction(action);
  };

  const handleBackToSetup = () => {
    setAppState('setup');
    setGameState(null);
    setCurrentPlayer(null);
  };

  // ゲーム状態に応じた表示
  if (appState === 'setup') {
    return (
      <>
        <GameSetup 
          onStartGame={handleStartGame} 
          onShowRules={handleShowRules}
        />
        <RulesModal 
          isOpen={showRules} 
          onClose={() => setShowRules(false)} 
        />
      </>
    );
  }

  if (appState === 'playing' && gameState && currentPlayer) {
    return (
      <>
        <GameBoard 
          gameState={gameState}
          currentPlayer={currentPlayer}
          onAction={handleGameAction}
        />
        
        {/* バックボタン（開発用） */}
        <button 
          onClick={handleBackToSetup}
          className="fixed top-4 left-4 bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
        >
          ← セットアップに戻る
        </button>
        
        <RulesModal 
          isOpen={showRules} 
          onClose={() => setShowRules(false)} 
        />
      </>
    );
  }

  // ローディング状態
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">ゲームを準備中...</p>
      </div>
    </div>
  );
}
