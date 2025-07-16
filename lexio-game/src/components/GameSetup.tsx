import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { Users, Bot, Gamepad2, Info } from 'lucide-react';

export interface GameSettings {
  playerCount: number;
  playerName: string;
  aiCount: number;
  maxRounds: number;
  aiDifficulty: 'easy' | 'medium' | 'hard';
}

interface GameSetupProps {
  onStartGame: (settings: GameSettings) => void;
  onShowRules: () => void;
}

export function GameSetup({ onStartGame, onShowRules }: GameSetupProps) {
  const [settings, setSettings] = useState<GameSettings>({
    playerCount: 3,
    playerName: '',
    aiCount: 2,
    maxRounds: 3,
    aiDifficulty: 'medium'
  });
  
  const isMobile = useIsMobile();

  const handlePlayerCountChange = (count: number) => {
    setSettings(prev => ({
      ...prev,
      playerCount: count,
      aiCount: count - 1
    }));
  };

  const handleStartGame = () => {
    if (!settings.playerName.trim()) {
      alert('プレイヤー名を入力してください');
      return;
    }
    onStartGame(settings);
  };

  const getMaxNumberForPlayers = (count: number) => {
    switch (count) {
      case 2: return 5;
      case 3: return 9;
      case 4: return 13;
      case 5: return 15;
      default: return 9;
    }
  };

  if (isMobile) {
    // モバイル版レイアウト
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 px-4 py-6 safe-area">
        <div className="max-w-sm mx-auto">
          {/* ゲームタイトル */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Lexio
            </h1>
            <p className="text-gray-600 text-sm">レキシオ - 韓国発の戦略カードゲーム</p>
            <p className="text-xs text-gray-500 mt-1">麻雀 × ポーカー × 大富豪</p>
          </div>

          <div className="space-y-6">
            {/* プレイヤー名 */}
            <Card className="p-4">
              <div className="space-y-3">
                <Label htmlFor="playerName" className="text-base font-semibold">プレイヤー名</Label>
                <Input
                  id="playerName"
                  placeholder="あなたの名前を入力"
                  value={settings.playerName}
                  onChange={(e) => setSettings(prev => ({ ...prev, playerName: e.target.value }))}
                  className="h-12 text-base"
                />
              </div>
            </Card>

            {/* プレイ人数 */}
            <Card className="p-4">
              <div className="space-y-4">
                <Label className="text-base font-semibold">プレイ人数 (2-5人)</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 3, 4, 5].map((count) => (
                    <Button
                      key={count}
                      variant={settings.playerCount === count ? 'default' : 'outline'}
                      onClick={() => handlePlayerCountChange(count)}
                      className="h-16 flex flex-col items-center justify-center p-2"
                    >
                      <Users className="w-5 h-5 mb-1" />
                      <span className="text-sm">{count}人</span>
                    </Button>
                  ))}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1 bg-blue-50 p-2 rounded">
                  <Info className="w-4 h-4" />
                  {settings.playerCount}人プレイ: 数字1-{getMaxNumberForPlayers(settings.playerCount)}を使用
                </div>
              </div>
            </Card>

            {/* AI設定 */}
            <Card className="p-4">
              <div className="space-y-4">
                <Label className="text-base font-semibold">AI対戦相手</Label>
                <div className="flex items-center gap-2 mb-3 bg-gray-50 p-3 rounded">
                  <Bot className="w-5 h-5" />
                  <span className="text-sm">{settings.aiCount}体のAI</span>
                  <Badge variant="secondary" className="text-xs">{settings.playerCount - 1}体必要</Badge>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="difficulty" className="text-sm font-medium">AI難易度</Label>
                  <Select
                    value={settings.aiDifficulty}
                    onValueChange={(value: 'easy' | 'medium' | 'hard') => 
                      setSettings(prev => ({ ...prev, aiDifficulty: value }))
                    }
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">初級 - ランダムプレイ</SelectItem>
                      <SelectItem value="medium">中級 - 基本戦略</SelectItem>
                      <SelectItem value="hard">上級 - 高度な戦略</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* ラウンド数 */}
            <Card className="p-4">
              <div className="space-y-4">
                <Label className="text-base font-semibold">ラウンド数</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 5, 7].map((rounds) => (
                    <Button
                      key={rounds}
                      variant={settings.maxRounds === rounds ? 'default' : 'outline'}
                      onClick={() => setSettings(prev => ({ ...prev, maxRounds: rounds }))}
                      className="h-12 text-base"
                    >
                      {rounds}ラウンド
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            {/* アクションボタン */}
            <div className="space-y-3 pt-2">
              <Button 
                onClick={handleStartGame}
                className="w-full h-14 text-lg font-semibold"
                disabled={!settings.playerName.trim()}
              >
                <Gamepad2 className="w-6 h-6 mr-2" />
                ゲーム開始
              </Button>
              
              <Button 
                onClick={onShowRules}
                variant="outline"
                className="w-full h-12"
              >
                <Info className="w-5 h-5 mr-2" />
                ルール説明
              </Button>
            </div>

            {/* ゲーム概要 */}
            <div className="text-center text-sm text-gray-600 pt-4 border-t">
              <p>プレイ時間: 1ラウンド約5分</p>
              <p>対象年齢: 8歳以上</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // デスクトップ版レイアウト（既存）
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* ゲームタイトル */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Lexio
          </h1>
          <p className="text-gray-600">レキシオ - 韓国発の戦略カードゲーム</p>
          <p className="text-sm text-gray-500 mt-1">麻雀 × ポーカー × 大富豪</p>
        </div>

        <Card className="p-6 space-y-6">
          {/* プレイヤー名 */}
          <div className="space-y-2">
            <Label htmlFor="playerName">プレイヤー名</Label>
            <Input
              id="playerName"
              placeholder="あなたの名前を入力"
              value={settings.playerName}
              onChange={(e) => setSettings(prev => ({ ...prev, playerName: e.target.value }))}
            />
          </div>

          {/* プレイ人数 */}
          <div className="space-y-3">
            <Label>プレイ人数 (2-5人)</Label>
            <div className="grid grid-cols-4 gap-2">
              {[2, 3, 4, 5].map((count) => (
                <Button
                  key={count}
                  variant={settings.playerCount === count ? 'default' : 'outline'}
                  onClick={() => handlePlayerCountChange(count)}
                  className="h-12 flex flex-col items-center justify-center p-2"
                >
                  <Users className="w-4 h-4 mb-1" />
                  <span className="text-xs">{count}人</span>
                </Button>
              ))}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Info className="w-3 h-3" />
              {settings.playerCount}人プレイ: 数字1-{getMaxNumberForPlayers(settings.playerCount)}を使用
            </div>
          </div>

          {/* AI設定 */}
          <div className="space-y-3">
            <Label>AI対戦相手</Label>
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4" />
              <span className="text-sm">{settings.aiCount}体のAI</span>
              <Badge variant="secondary">{settings.playerCount - 1}体必要</Badge>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="difficulty" className="text-sm">AI難易度</Label>
              <Select
                value={settings.aiDifficulty}
                onValueChange={(value: 'easy' | 'medium' | 'hard') => 
                  setSettings(prev => ({ ...prev, aiDifficulty: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">初級 - ランダムプレイ</SelectItem>
                  <SelectItem value="medium">中級 - 基本戦略</SelectItem>
                  <SelectItem value="hard">上級 - 高度な戦略</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ラウンド数 */}
          <div className="space-y-3">
            <Label>ラウンド数</Label>
            <div className="grid grid-cols-3 gap-2">
              {[3, 5, 7].map((rounds) => (
                <Button
                  key={rounds}
                  variant={settings.maxRounds === rounds ? 'default' : 'outline'}
                  onClick={() => setSettings(prev => ({ ...prev, maxRounds: rounds }))}
                  className="h-10"
                >
                  {rounds}ラウンド
                </Button>
              ))}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="space-y-3 pt-4">
            <Button 
              onClick={handleStartGame}
              className="w-full h-12 text-lg"
              disabled={!settings.playerName.trim()}
            >
              <Gamepad2 className="w-5 h-5 mr-2" />
              ゲーム開始
            </Button>
            
            <Button 
              onClick={onShowRules}
              variant="outline"
              className="w-full"
            >
              <Info className="w-4 h-4 mr-2" />
              ルール説明
            </Button>
          </div>
        </Card>

        {/* ゲーム概要 */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>プレイ時間: 1ラウンド約5分</p>
          <p>対象年齢: 8歳以上</p>
        </div>
      </div>
    </div>
  );
}