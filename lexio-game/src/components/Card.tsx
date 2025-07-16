import React from 'react';
import { Card as CardType, SUIT_COLORS, SUIT_NAMES } from '../../shared/types';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface CardProps {
  card: CardType;
  isSelected?: boolean;
  isPlayable?: boolean;
  isHidden?: boolean;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  className?: string;
}

export function Card({ 
  card, 
  isSelected = false, 
  isPlayable = true, 
  isHidden = false,
  size = 'medium',
  onClick,
  className 
}: CardProps) {
  const isMobile = useIsMobile();
  
  const sizeClasses = {
    small: isMobile ? 'w-12 h-18 text-xs' : 'w-10 h-14 text-xs',
    medium: isMobile ? 'w-20 h-28 text-base' : 'w-16 h-24 text-sm',
    large: isMobile ? 'w-24 h-34 text-lg' : 'w-20 h-30 text-base'
  };

  if (isHidden) {
    return (
      <div 
        className={cn(
          'relative rounded-lg border-2 border-gray-400 bg-gradient-to-br from-blue-900 to-blue-700',
          'flex items-center justify-center cursor-default shadow-md',
          sizeClasses[size],
          className
        )}
      >
        <div className="text-white/50 text-lg font-bold">?</div>
      </div>
    );
  }

  const suitColor = SUIT_COLORS[card.suit];
  const suitName = SUIT_NAMES[card.suit];
  
  // 2の牌は特別な色合い
  const is2Card = card.number === 2;
  const is1Card = card.number === 1;
  
  return (
    <div 
      className={cn(
        'relative rounded-lg border-2 bg-white cursor-pointer transition-all duration-200 shadow-md',
        'active:scale-95 select-none', // モバイル向けのアクティブ状態
        !isMobile && 'hover:shadow-lg hover:-translate-y-1', // デスクトップのみホバー効果
        sizeClasses[size],
        isSelected && 'ring-2 ring-blue-500 ring-offset-2 -translate-y-2 scale-105',
        !isPlayable && 'opacity-50 cursor-not-allowed',
        is2Card && 'ring-2 ring-red-500',
        is1Card && 'ring-2 ring-yellow-500',
        // モバイルでのタッチ操作向け最小サイズ確保
        isMobile && 'min-w-[44px] min-h-[60px]',
        className
      )}
      style={{ borderColor: suitColor }}
      onClick={isPlayable ? onClick : undefined}
    >
      {/* カード内容 */}
      <div className="absolute inset-1 flex flex-col justify-between p-1">
        {/* 左上の数字とスート */}
        <div className="flex flex-col items-center" style={{ color: suitColor }}>
          <div className={cn(
            'font-bold leading-none',
            is2Card && 'text-red-600',
            is1Card && 'text-yellow-600',
            isMobile && size === 'medium' && 'text-lg' // モバイルでより大きく
          )}>
            {card.number}
          </div>
          <div className={cn(
            'leading-none',
            isMobile ? 'text-xs' : 'text-xs'
          )}>{suitName}</div>
        </div>
        
        {/* 中央のスートアイコン */}
        <div 
          className={cn(
            'absolute inset-0 flex items-center justify-center opacity-20',
            isMobile ? 'text-3xl' : 'text-2xl'
          )}
          style={{ color: suitColor }}
        >
          {getSuitIcon(card.suit)}
        </div>
        
        {/* 右下の数字とスート（逆さま） */}
        <div 
          className="flex flex-col items-center transform rotate-180 self-end"
          style={{ color: suitColor }}
        >
          <div className={cn(
            'font-bold leading-none',
            is2Card && 'text-red-600',
            is1Card && 'text-yellow-600',
            isMobile && size === 'medium' && 'text-lg'
          )}>
            {card.number}
          </div>
          <div className={cn(
            'leading-none',
            isMobile ? 'text-xs' : 'text-xs'
          )}>{suitName}</div>
        </div>
      </div>
      
      {/* 特殊カードの表示 */}
      {is2Card && (
        <div className={cn(
          'absolute -top-1 -right-1 bg-red-500 rounded-full flex items-center justify-center text-white font-bold',
          isMobile ? 'w-5 h-5 text-xs' : 'w-4 h-4 text-xs'
        )}>
          ⚠
        </div>
      )}
      
      {is1Card && (
        <div className={cn(
          'absolute -top-1 -right-1 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold',
          isMobile ? 'w-5 h-5 text-xs' : 'w-4 h-4 text-xs'
        )}>
          ★
        </div>
      )}
    </div>
  );
}

function getSuitIcon(suit: string): string {
  switch (suit) {
    case 'cloud': return '☁';
    case 'star': return '⭐';
    case 'moon': return '🌙';
    case 'sun': return '☀';
    default: return '?';
  }
}

// カード選択用のハンドコンポーネント
interface HandProps {
  cards: CardType[];
  selectedCards: Set<string>;
  onCardClick: (cardId: string) => void;
  maxSelectable?: number;
  className?: string;
}

export function Hand({ 
  cards, 
  selectedCards, 
  onCardClick, 
  maxSelectable,
  className 
}: HandProps) {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    // モバイル版：横スクロール可能なカード表示
    return (
      <div className={cn(
        'w-full overflow-x-auto scrollbar-hide',
        className
      )}>
        <div className="flex gap-3 p-2 pb-4" style={{ minWidth: 'max-content' }}>
          {cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              isSelected={selectedCards.has(card.id)}
              isPlayable={!maxSelectable || selectedCards.size < maxSelectable || selectedCards.has(card.id)}
              onClick={() => onCardClick(card.id)}
              size="medium"
            />
          ))}
        </div>
      </div>
    );
  }
  
  // デスクトップ版：既存のレイアウト
  return (
    <div className={cn('flex flex-wrap gap-2 justify-center', className)}>
      {cards.map((card) => (
        <Card
          key={card.id}
          card={card}
          isSelected={selectedCards.has(card.id)}
          isPlayable={!maxSelectable || selectedCards.size < maxSelectable || selectedCards.has(card.id)}
          onClick={() => onCardClick(card.id)}
        />
      ))}
    </div>
  );
}