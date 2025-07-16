import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from './Card';
import { SUIT_COLORS, SUIT_NAMES } from '../../shared/types';
import { AlertTriangle, Star, Coins, Target } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  const exampleCards = [
    { id: 'ex1', suit: 'cloud' as const, number: 3 as const },
    { id: 'ex2', suit: 'star' as const, number: 7 as const },
    { id: 'ex3', suit: 'moon' as const, number: 1 as const },
    { id: 'ex4', suit: 'sun' as const, number: 2 as const },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Lexio ルール説明
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概要</TabsTrigger>
            <TabsTrigger value="cards">カード</TabsTrigger>
            <TabsTrigger value="play">プレイ方法</TabsTrigger>
            <TabsTrigger value="scoring">得点計算</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Target className="w-5 h-5" />
                ゲーム概要
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Lexioは韓国発の革新的なボードゲームで、麻雀、ポーカー、大富豪の要素を融合した戦略的カードゲームです。
                手札を上手く管理し、相手より早く手札をなくすことを目指します。
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-600">プレイ人数</h4>
                  <p>2-5人</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-green-600">プレイ時間</h4>
                  <p>1ラウンド約5分</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-600">対象年齢</h4>
                  <p>8歳以上</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cards" className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-4">カードシステム</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* スート説明 */}
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold mb-3">4つのスート（色）</h4>
                  <div className="space-y-2">
                    {Object.entries(SUIT_NAMES).map(([suit, name]) => (
                      <div key={suit} className="flex items-center gap-3">
                        <div 
                          className="w-6 h-6 rounded-full border-2"
                          style={{ backgroundColor: SUIT_COLORS[suit as keyof typeof SUIT_COLORS] }}
                        />
                        <span className="font-medium">{name}</span>
                        <span className="text-sm text-gray-500">
                          {suit === 'cloud' && '（最弱）'}
                          {suit === 'sun' && '（最強）'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 数字説明 */}
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold mb-3">数字の範囲</h4>
                  <div className="space-y-2">
                    <div>2人: 1-5</div>
                    <div>3人: 1-9</div>
                    <div>4人: 1-13</div>
                    <div>5人: 1-15</div>
                  </div>
                </div>
              </div>

              {/* 特殊な数字 */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200 mt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-5 h-5" />
                  特殊な数字
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">2</Badge>
                    <span>最強の数字だが、手札に残るとペナルティ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-500">1</Badge>
                    <span>ストレート作成時に最大数字の次として使用可能</span>
                  </div>
                </div>
              </div>

              {/* カード例 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">カード例</h4>
                <div className="flex gap-4 justify-center">
                  {exampleCards.map((card) => (
                    <Card key={card.id} card={card} size="medium" />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="play" className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-4">プレイ方法</h3>
              
              <div className="space-y-6">
                {/* 基本出し */}
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold mb-3 text-blue-600">基本出し（1-3枚）</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Badge>シングル</Badge>
                      <p className="text-sm mt-1">1枚出し</p>
                    </div>
                    <div>
                      <Badge>ペア</Badge>
                      <p className="text-sm mt-1">同じ数字2枚</p>
                    </div>
                    <div>
                      <Badge>トリプル</Badge>
                      <p className="text-sm mt-1">同じ数字3枚</p>
                    </div>
                  </div>
                  <p className="text-red-600 text-sm mt-2">※4枚出しは禁止</p>
                </div>

                {/* ポーカー役 */}
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold mb-3 text-green-600">ポーカー役（5枚出し）</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex justify-between">
                      <Badge variant="outline">ストレート</Badge>
                      <span className="text-sm">連続する5つの数字</span>
                    </div>
                    <div className="flex justify-between">
                      <Badge variant="outline">フラッシュ</Badge>
                      <span className="text-sm">同じ色の5枚</span>
                    </div>
                    <div className="flex justify-between">
                      <Badge variant="outline">フルハウス</Badge>
                      <span className="text-sm">3枚+2枚の組み合わせ</span>
                    </div>
                    <div className="flex justify-between">
                      <Badge variant="outline">フォーカード</Badge>
                      <span className="text-sm">同じ数字4枚+1枚</span>
                    </div>
                    <div className="flex justify-between col-span-2">
                      <Badge variant="outline">ストレートフラッシュ</Badge>
                      <span className="text-sm">同じ色の連続する5枚</span>
                    </div>
                  </div>
                </div>

                {/* 強さの判定 */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold mb-3">強さの判定</h4>
                  <div className="space-y-2">
                    <div>
                      <strong>数字:</strong> 3 &lt; 4 &lt; 5 &lt; ... &lt; 1 &lt; 2（2が最強）
                    </div>
                    <div>
                      <strong>色:</strong> 雲（青）&lt; 星（黄）&lt; 月（緑）&lt; 太陽（赤）
                    </div>
                    <div>
                      <strong>制約:</strong> 同じタイプの出し方でのみ比較可能
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scoring" className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-500" />
                得点システム
              </h3>
              
              <div className="space-y-6">
                {/* ラウンド終了時の得点 */}
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold mb-3 text-green-600">ラウンド終了時の得点計算</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-500">1位</Badge>
                      <span>他プレイヤーの残り牌数分のコインチップを獲得</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">2位以下</Badge>
                      <span>下位プレイヤーとの牌数差分を獲得</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">最下位</Badge>
                      <span>コインチップ獲得なし</span>
                    </div>
                  </div>
                </div>

                {/* 2の牌ペナルティ */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold mb-3 text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    2の牌ペナルティ
                  </h4>
                  <div className="space-y-2">
                    <div>残った2の牌1枚: 残り牌数×2倍</div>
                    <div>残った2の牌2枚: 残り牌数×4倍</div>
                    <div>残った2の牌3枚: 残り牌数×8倍</div>
                    <div>残った2の牌4枚: 残り牌数×16倍</div>
                  </div>
                </div>

                {/* ゲーム終了条件 */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold mb-3 text-blue-700">ゲーム終了条件</h4>
                  <div className="space-y-2">
                    <div>• プレイヤーのコインチップが0になった時点で脱落</div>
                    <div>• 3-5ラウンド終了後、最多コインチップ保持者が勝利</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center pt-4">
          <Button onClick={onClose} className="px-8">
            ルールを理解しました
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}