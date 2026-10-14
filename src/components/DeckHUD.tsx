import React, { useState } from 'react';
import { Card } from '../types';
import { sounds } from '../audio';

interface DeckHUDProps {
  energy: number;
  maxEnergy: number;
  hand: Card[];
  nextCard: Card;
  selectedCard: Card | null;
  onSelectCard: (card: Card | null) => void;
  onDragStartCard: (card: Card, e: React.PointerEvent) => void;
  onSendEmote: (emoji: string) => void;
  isGameOver: boolean;
}

const EMOJIS = ['😡', '😢', '😂', '🔥', '👍', '😎', '😈', '😱'];

export const DeckHUD: React.FC<DeckHUDProps> = ({
  energy,
  maxEnergy,
  hand,
  nextCard,
  selectedCard,
  onSelectCard,
  onDragStartCard,
  onSendEmote,
  isGameOver,
}) => {
  const [showEmotePicker, setShowEmotePicker] = useState(false);

  const handleCardPointerDown = (card: Card, e: React.PointerEvent) => {
    if (isGameOver) return;
    if (energy < card.cost) return;

    sounds.playCardDrop();
    onSelectCard(card);
    onDragStartCard(card, e);
  };

  const handleEmoteClick = (emoji: string) => {
    sounds.playEmotePop();
    onSendEmote(emoji);
    setShowEmotePicker(false);
  };

  return (
    <div className="relative w-full max-w-md shrink-0 px-2 pt-1 pb-1.5 select-none z-30 flex flex-col items-center gap-1.5 bg-gradient-to-t from-[#17345D] via-[#17345D]/90 to-transparent font-body">
      {/* Emote Floating Picker */}
      {showEmotePicker && (
        <div className="absolute bottom-28 left-3 bg-gradient-to-b from-[#1c75e8] via-[#1769D2] to-[#17345D] border-2 border-[#FFC83D] p-2.5 rounded-2xl shadow-[0_0_30px_rgba(255,200,61,0.5)] flex flex-wrap gap-2 w-56 z-50 animate-in fade-in zoom-in-95 backdrop-blur-md">
          <div className="w-full text-xs font-display text-[#FFC83D] mb-1 flex justify-between items-center tracking-wider">
            <span>TAUNT:</span>
            <button
              onClick={() => setShowEmotePicker(false)}
              className="text-white hover:text-[#FFC83D] px-1 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleEmoteClick(emoji)}
              className="w-10 h-10 text-2xl flex items-center justify-center bg-gradient-to-b from-[#1c75e8] to-[#17345D] hover:from-[#388af6] hover:to-[#1769D2] active:scale-95 rounded-xl border border-white/60 transition cursor-pointer shadow-md"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Main Card Hand Row: Left Column (Emote + Next Card) and 4 Main Cards */}
      <div className="w-full max-w-md flex items-end justify-between gap-1.5 sm:gap-2">
        {/* Left Column: Responsive Flexbox for Emote button & Next Card slot */}
        <div className="flex flex-col items-center justify-end gap-1 shrink-0 w-9 sm:w-10">
          {/* Emote Trigger Button */}
          <button
            onClick={() => setShowEmotePicker(!showEmotePicker)}
            className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1769D2] to-[#17345D] hover:from-[#1c75e8] hover:to-[#1769D2] active:scale-95 border-2 border-[#FFC83D] shadow-md flex items-center justify-center text-white cursor-pointer transition shrink-0"
            title="Emotes"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#FFC83D] drop-shadow">
              <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM8 11C7.45 11 7 10.55 7 10C7 9.45 7.45 9 8 9C8.55 9 9 9.45 9 10C9 10.55 8.55 11 8 11ZM12 11C11.45 11 11 10.55 11 10C11 9.45 11.45 9 12 9C12.55 9 13 9.45 13 10C13 10.55 12.55 11 12 11ZM16 11C15.45 11 15 10.55 15 10C15 9.45 15.45 9 16 9C16.55 9 17 9.45 17 10C17 10.55 16.55 11 16 11Z" />
            </svg>
          </button>

          {/* Next Card Preview Slot */}
          <div className="flex flex-col items-center">
            <span className="text-[8px] sm:text-[9px] font-display text-[#FFC83D] uppercase leading-none mb-0.5">
              Next
            </span>
            <div className="relative w-8 h-10 sm:w-9 sm:h-11 rounded-lg bg-gradient-to-b from-[#1c75e8] to-[#17345D] border-2 border-[#FFC83D]/80 shadow-md flex flex-col items-center justify-center overflow-hidden">
              <span className="text-xs sm:text-sm select-none drop-shadow">{nextCard.icon}</span>
              {/* Cost badge */}
              <div className="absolute -bottom-0.5 -right-0.5 bg-[#79B957] text-[#123105] game-counter font-extrabold text-[8px] sm:text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white shadow">
                {nextCard.cost}
              </div>
            </div>
          </div>
        </div>

        {/* 4 Main Cards Hand - Fluid Responsive Flexbox Container */}
        <div className="flex-1 min-w-0 flex items-end justify-center gap-1 sm:gap-2">
          {hand.map((card, index) => {
            const canAfford = energy >= card.cost;
            const isSelected = selectedCard?.id === card.id;

            return (
              <div
                key={`${card.id}-${index}`}
                onPointerDown={(e) => handleCardPointerDown(card, e)}
                className={`relative flex-1 min-w-0 max-w-[76px] sm:max-w-[84px] h-[88px] sm:h-[100px] rounded-xl flex flex-col items-center justify-between p-1 transition-all cursor-pointer border-2 border-b-4 shadow-xl touch-none select-none overflow-hidden ${
                  isSelected
                    ? 'border-[#FFC83D] border-b-[#8c6000] scale-105 -translate-y-2 bg-gradient-to-b from-[#1c75e8] via-[#1769D2] to-[#17345D] shadow-[0_0_24px_rgba(255,200,61,0.9)] ring-2 ring-[#FFC83D]'
                    : canAfford
                    ? 'border-white border-b-[#0b1c36] bg-gradient-to-b from-[#1c75e8] via-[#1769D2] to-[#17345D] hover:border-[#FFC83D] active:translate-y-0.5 active:border-b-2 shadow-[0_4px_16px_rgba(23,52,93,0.5)]'
                    : 'border-[#3b68a8]/40 border-b-[#0a182d] bg-gradient-to-b from-[#17345D]/70 to-[#0f2444]/80 opacity-70 cursor-not-allowed'
                }`}
              >
                {/* Level Tag on top-left of card */}
                <div className="absolute top-0.5 left-0.5 z-10 text-[8px] sm:text-[9px] game-counter font-extrabold text-[#4a2800] bg-gradient-to-r from-[#ffe071] to-[#FFC83D] px-1 rounded-sm leading-tight border border-white shadow">
                  Lvl {card.level || 1}
                </div>

                {/* Passive Ability Icon Badge on top-right if present */}
                {card.passive && (
                  <div
                    className="absolute top-0.5 right-0.5 z-10 text-[8px] sm:text-[9px] bg-gradient-to-b from-[#1c75e8] to-[#1769D2] text-white px-1 rounded-sm leading-tight border border-white shadow"
                    title={`${card.passive.name}: ${card.passive.description}`}
                  >
                    {card.passive.icon}
                  </div>
                )}

                {/* Card Artwork / Icon & Name */}
                <div className="w-full flex-1 flex flex-col items-center justify-center relative mt-1">
                  <span className="text-2xl sm:text-3xl filter drop-shadow transform transition">
                    {card.icon}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-display text-white truncate max-w-full text-center leading-tight mt-0.5 drop-shadow">
                    {card.name}
                  </span>
                </div>

                {/* Circular Energy Cost Badge at bottom center */}
                <div
                  className={`flex items-center justify-center game-counter font-extrabold text-[11px] sm:text-xs w-5 h-5 rounded-full shadow-md border -mb-1 z-20 ${
                    canAfford
                      ? 'bg-[#79B957] text-[#123105] border-white shadow-[0_0_8px_rgba(121,185,87,0.8)]'
                      : 'bg-[#17345D] text-sky-200 border-[#3b68a8]'
                  }`}
                >
                  {card.cost}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Energy / Elixir Bar: Royal Fantasy Arena Amethyst / Emerald segments */}
      <div className="w-full max-w-md flex items-center gap-2 sm:gap-2.5 bg-[#17345D] px-2.5 py-1.5 rounded-2xl border-2 border-[#79B957] shadow-[0_4px_20px_rgba(121,185,87,0.4)]">
        {/* Glowing Green Elixir Number Badge */}
        <div
          className={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-gradient-to-tr from-[#79B957] via-[#9ae275] to-[#79B957] border-2 border-white flex items-center justify-center game-counter font-extrabold text-[#123105] text-xs sm:text-sm shadow-[0_0_12px_rgba(121,185,87,0.9)] ${
            Math.floor(energy) === maxEnergy ? 'animate-pulse ring-2 ring-[#FFC83D]' : ''
          }`}
        >
          {Math.floor(energy)}
        </div>

        {/* 10 Slanted / Angled Segments Track */}
        <div className="flex-1 min-w-0 flex gap-0.5 sm:gap-1 h-3.5 sm:h-4 bg-[#0f2444] rounded-xl p-0.5 border border-[#3b68a8] overflow-hidden shadow-inner">
          {Array.from({ length: maxEnergy }).map((_, idx) => {
            const isFilled = energy >= idx + 1;
            const isPartial = energy > idx && energy < idx + 1;
            const fillWidth = isFilled ? 100 : isPartial ? (energy - idx) * 100 : 0;

            return (
              <div
                key={idx}
                className="flex-1 min-w-0 bg-[#17345D]/60 rounded-[2px] overflow-hidden relative -skew-x-12"
              >
                <div
                  className="h-full bg-gradient-to-r from-[#9ae275] via-[#79B957] to-[#5a9c35] transition-all duration-100 shadow-[0_0_8px_rgba(121,185,87,0.95)]"
                  style={{ width: `${fillWidth}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
