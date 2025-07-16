import React, { useState } from 'react';
import { GameState, Player, Card as CardType, GameAction, PLAY_TYPE_NAMES } from '../../shared/types';
import { Card, Hand } from './Card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { analyzePlay } from '@/lib/gameLogic';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Coins, Users, Trophy, ArrowLeft } from 'lucide-react';

interface GameBoardProps {
  gameState: GameState;
  currentPlayer: Player;
  onAction: (action: GameAction) => void;
}

export function GameBoard({ gameState, currentPlayer, onAction }: GameBoardProps) {
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const isMobile = useIsMobile();
  const isMyTurn = gameState.players[gameState.currentPlayer]?.id === currentPlayer.id;

  const handleCardClick = (cardId: string) => {
    if (!isMyTurn) return;
    
    const newSelected = new Set(selectedCards);
    if (newSelected.has(cardId)) {
      newSelected.delete(cardId);
    } else {
      newSelected.add(cardId);
    }
    setSelectedCards(newSelected);
  };

  const handlePlay = () => {
    if (selectedCards.size === 0) return;
    
    const selectedCardObjects = currentPlayer.hand.filter(card => selectedCards.has(card.id));
    const playAnalysis = analyzePlay(selectedCardObjects);
    
    if (!playAnalysis) {
      alert('無効な組み合わせです');
      return;
    }
    
    onAction({
      type: 'play',
      cards: selectedCardObjects,
      playType: playAnalysis.type
    });
    
    setSelectedCards(new Set());
  };

  const handlePass = () => {
    onAction({ type: 'pass' });
    setSelectedCards(new Set());
  };

  const canPlay = () => {
    if (selectedCards.size === 0) return false;
    
    const selectedCardObjects = currentPlayer.hand.filter(card => selectedCards.has(card.id));
    const playAnalysis = analyzePlay(selectedCardObjects);
    
    if (!playAnalysis) return false;
    
    // 最初のプレイまたは前のプレイより強いかチェック
    if (!gameState.lastPlay) return true;
    if (gameState.lastPlay.type !== playAnalysis.type) return false;
    
    return playAnalysis.strength > gameState.lastPlay.strength;
  };

  const getSelectedPlayInfo = () => {
    if (selectedCards.size === 0) return null;
    
    const selectedCardObjects = currentPlayer.hand.filter(card => selectedCards.has(card.id));
    const playAnalysis = analyzePlay(selectedCardObjects);
    
    return playAnalysis;
  };

  if (isMobile) {
    // モバイル版レイアウト
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 flex flex-col">
        {/* ヘッダー */}
        <div className="bg-white shadow-md p-3 safe-top">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>ラウンド {gameState.round}/{gameState.maxRounds}</span>
              </div>
              <div className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span>{currentPlayer.coins}</span>
              </div>
            </div>
            
            {gameState.phase === 'gameEnd' && gameState.winner && (
              <div className="flex items-center gap-1 text-yellow-600 text-sm">
                <Trophy className="w-5 h-5" />
                <span className="font-bold">勝者: {gameState.players.find(p => p.id === gameState.winner)?.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* 他のプレイヤー */}
        <div className="p-3">
          <div className="grid grid-cols-2 gap-2">
            {gameState.players.filter(p => p.id !== currentPlayer.id).map((player) => (
              <div
                key={player.id}
                className={cn(
                  'bg-white rounded-lg p-3 shadow-sm',
                  gameState.players[gameState.currentPlayer]?.id === player.id && 'ring-2 ring-blue-500'
                )}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-sm truncate">{player.name}</span>
                  {player.isAI && <Badge variant="secondary" className="text-xs">AI</Badge>}
                </div>
                <div className="flex justify-between text-xs text-gray-600 mb-2">
                  <span>手札: {player.hand.length}枚</span>
                  <span>{player.coins} コイン</span>
                </div>
                
                {/* 他プレイヤーの手札（裏面） */}
                <div className="flex gap-1 justify-center">
                  {player.hand.slice(0, Math.min(4, player.hand.length)).map((_, cardIndex) => (
                    <Card 
                      key={`${player.id}-hidden-${cardIndex}`}
                      card={{ id: 'hidden', suit: 'cloud', number: 1 }}
                      isHidden={true}
                      size="small"
                    />
                  ))}
                  {player.hand.length > 4 && (
                    <div className="w-10 h-14 bg-gray-200 rounded flex items-center justify-center text-xs">
                      +{player.hand.length - 4}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 場のカード */}
        <div className="bg-white mx-3 rounded-lg p-4 shadow-sm flex-1 min-h-0">
          <h3 className="text-lg font-semibold mb-3 text-center">場のカード</h3>
          {gameState.lastPlay ? (
            <div className="flex flex-col items-center gap-3">
              <div className="text-sm text-gray-600 text-center">
                {gameState.players.find(p => p.id === gameState.lastPlay?.player)?.name} の
                {PLAY_TYPE_NAMES[gameState.lastPlay.type]}
              </div>
              <div className="flex gap-2 justify-center flex-wrap">
                {gameState.lastPlay.cards.map((card) => (
                  <Card key={card.id} card={card} size="small" />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              まだカードが出されていません
            </div>
          )}
        </div>

        {/* 手札エリア */}
        <div className="bg-white mx-3 mb-3 rounded-lg shadow-sm">
          <div className="p-3 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">あなたの手札</h3>
              {isMyTurn && (
                <Badge variant="default">あなたのターン</Badge>
              )}
            </div>
            
            {/* 選択中のプレイ情報 */}
            {selectedCards.size > 0 && (
              <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  選択中: {selectedCards.size}枚
                  {getSelectedPlayInfo() && (
                    <span className="ml-2 font-semibold">
                      ({PLAY_TYPE_NAMES[getSelectedPlayInfo()!.type]})
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <Hand
            cards={currentPlayer.hand}
            selectedCards={selectedCards}
            onCardClick={handleCardClick}
            className="py-2"
          />
        </div>

        {/* アクションバー（固定） */}
        <div className="bg-white border-t p-4 safe-bottom">
          <div className="flex gap-3">
            <Button
              onClick={handlePlay}
              disabled={!isMyTurn || !canPlay()}
              className="flex-1 h-12 text-lg"
              size="lg"
            >
              カードを出す
            </Button>
            <Button
              onClick={handlePass}
              disabled={!isMyTurn}
              variant="outline"
              className="flex-1 h-12 text-lg"
              size="lg"
            >
              パス
            </Button>
          </div>

          {/* ゲーム終了時のアクション */}
          {gameState.phase === 'roundEnd' && (
            <div className="mt-3">
              <Button
                onClick={() => onAction({ type: 'newRound' })}
                className="w-full h-12 text-lg"
                size="lg"
              >
                次のラウンドへ
              </Button>
            </div>
          )}
          
          {gameState.phase === 'gameEnd' && (
            <div className="mt-3">
              <Button
                onClick={() => onAction({ type: 'newGame' })}
                className="w-full h-12 text-lg"
                size="lg"
              >
                新しいゲーム
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // デスクトップ版レイアウト（既存）
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー情報 */}
        <div className="flex justify-between items-center mb-6 bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>ラウンド {gameState.round}/{gameState.maxRounds}</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-500" />
              <span>{currentPlayer.coins} コイン</span>
            </div>
          </div>
          
          {gameState.phase === 'gameEnd' && gameState.winner && (
            <div className="flex items-center gap-2 text-yellow-600">
              <Trophy className="w-6 h-6" />
              <span className="font-bold">勝者: {gameState.players.find(p => p.id === gameState.winner)?.name}</span>
            </div>
          )}
        </div>

        {/* 他のプレイヤー表示 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {gameState.players.filter(p => p.id !== currentPlayer.id).map((player, index) => (
            <div
              key={player.id}
              className={cn(
                'bg-white rounded-lg p-4 shadow-md',
                gameState.players[gameState.currentPlayer]?.id === player.id && 'ring-2 ring-blue-500'
              )}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{player.name}</span>
                {player.isAI && <Badge variant="secondary">AI</Badge>}
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>手札: {player.hand.length}枚</span>
                <span>{player.coins} コイン</span>
              </div>
              
              {/* 他プレイヤーの手札（裏面） */}
              <div className="flex gap-1 mt-2 justify-center">
                {player.hand.slice(0, Math.min(5, player.hand.length)).map((_, cardIndex) => (
                  <Card 
                    key={`${player.id}-hidden-${cardIndex}`}
                    card={{ id: 'hidden', suit: 'cloud', number: 1 }}
                    isHidden={true}
                    size="small"
                  />
                ))}
                {player.hand.length > 5 && (
                  <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center text-xs">
                    +{player.hand.length - 5}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 場のカード表示 */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-center">場のカード</h3>
          {gameState.lastPlay ? (
            <div className="flex flex-col items-center gap-4">
              <div className="text-sm text-gray-600">
                {gameState.players.find(p => p.id === gameState.lastPlay?.player)?.name} の
                {PLAY_TYPE_NAMES[gameState.lastPlay.type]}
              </div>
              <div className="flex gap-2 justify-center">
                {gameState.lastPlay.cards.map((card) => (
                  <Card key={card.id} card={card} size="medium" />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              まだカードが出されていません
            </div>
          )}
        </div>

        {/* 自分の手札とアクション */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">あなたの手札</h3>
            {isMyTurn && (
              <Badge variant="default">あなたのターン</Badge>
            )}
          </div>
          
          <Hand
            cards={currentPlayer.hand}
            selectedCards={selectedCards}
            onCardClick={handleCardClick}
            className="mb-6"
          />

          {/* 選択中のプレイ情報 */}
          {selectedCards.size > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                選択中: {selectedCards.size}枚
                {getSelectedPlayInfo() && (
                  <span className="ml-2 font-semibold">
                    ({PLAY_TYPE_NAMES[getSelectedPlayInfo()!.type]})
                  </span>
                )}
              </div>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={handlePlay}
              disabled={!isMyTurn || !canPlay()}
              className="px-8"
            >
              カードを出す
            </Button>
            <Button
              onClick={handlePass}
              disabled={!isMyTurn}
              variant="outline"
              className="px-8"
            >
              パス
            </Button>
          </div>

          {/* ゲーム終了時のアクション */}
          {gameState.phase === 'roundEnd' && (
            <div className="mt-6 text-center">
              <Button
                onClick={() => onAction({ type: 'newRound' })}
                className="px-8"
              >
                次のラウンドへ
              </Button>
            </div>
          )}
          
          {gameState.phase === 'gameEnd' && (
            <div className="mt-6 text-center">
              <Button
                onClick={() => onAction({ type: 'newGame' })}
                className="px-8"
              >
                新しいゲーム
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}