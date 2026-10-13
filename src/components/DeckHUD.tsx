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
    <div className="relative w-full px-2 pb-2 pt-1 select-none z-30 flex flex-col gap-1.5 bg-gradient-to-t from-[#050b18] via-[#091224] to-transparent">
      {/* Emote Floating Picker */}
      {showEmotePicker && (
        <div className="absolute bottom-28 left-3 bg-[#0a1128]/95 border-2 border-sky-400 p-2.5 rounded-2xl shadow-2xl flex flex-wrap gap-2 w-56 z-50 animate-in fade-in zoom-in-95 backdrop-blur-md">
          <div className="w-full text-xs font-black text-sky-400 mb-1 flex justify-between items-center">
            <span>Taunt:</span>
            <button
              onClick={() => setShowEmotePicker(false)}
              className="text-slate-400 hover:text-white px-1 font-bold"
            >
              ✕
            </button>
          </div>
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleEmoteClick(emoji)}
              className="w-10 h-10 text-2xl flex items-center justify-center bg-slate-800/90 hover:bg-slate-700 active:scale-95 rounded-xl border border-slate-600 transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Cards Row: Emote + Next card on left, 4 main cards in center */}
      <div className="flex items-end justify-between gap-1.5">
        {/* Left Column: Emote bubble button & Next Card slot */}
        <div className="flex flex-col items-center gap-1 min-w-[42px]">
          {/* Blue Chat / Emote button */}
          <button
            onClick={() => setShowEmotePicker(!showEmotePicker)}
            className="w-8 h-8 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] active:scale-95 border-2 border-white shadow-md flex items-center justify-center text-white cursor-pointer transition"
            title="Emotes"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
              <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM8 11C7.45 11 7 10.55 7 10C7 9.45 7.45 9 8 9C8.55 9 9 9.45 9 10C9 10.55 8.55 11 8 11ZM12 11C11.45 11 11 10.55 11 10C11 9.45 11.45 9 12 9C12.55 9 13 9.45 13 10C13 10.55 12.55 11 12 11ZM16 11C15.45 11 15 10.55 15 10C15 9.45 15.45 9 16 9C16.55 9 17 9.45 17 10C17 10.55 16.55 11 16 11Z" />
            </svg>
          </button>

          {/* Next Card mini slot */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-slate-300 leading-none mb-0.5">
              Next:
            </span>
            <div className="relative w-9 h-11 rounded-lg bg-[#0f172a] border border-white/60 flex flex-col items-center justify-center shadow-inner overflow-hidden">
              <span className="text-sm select-none">{nextCard.icon}</span>
              {/* Cost badge */}
              <div className="absolute -bottom-0.5 -right-0.5 bg-[#22c55e] text-slate-950 font-black text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
                {nextCard.cost}
              </div>
            </div>
          </div>
        </div>

        {/* 4 Main Cards Hand */}
        <div className="flex-1 flex gap-1.5 justify-center">
          {hand.map((card, index) => {
            const canAfford = energy >= card.cost;
            const isSelected = selectedCard?.id === card.id;

            return (
              <div
                key={`${card.id}-${index}`}
                onPointerDown={(e) => handleCardPointerDown(card, e)}
                className={`relative flex-1 max-w-[76px] h-24 rounded-xl flex flex-col items-center justify-between p-1 transition-all cursor-pointer border-2 shadow-xl touch-none select-none overflow-hidden ${
                  isSelected
                    ? 'border-white scale-105 -translate-y-2.5 bg-gradient-to-b from-[#1e40af] to-[#0f172a] shadow-[0_0_16px_rgba(255,255,255,0.7)]'
                    : canAfford
                    ? 'border-white/80 bg-gradient-to-b from-[#1e293b] to-[#0f172a] hover:border-white active:scale-95'
                    : 'border-slate-700/60 bg-[#070b14]/90 opacity-45 grayscale cursor-not-allowed'
                }`}
              >
                {/* Level Tag on top-left of card */}
                <div className="absolute top-1 left-1 z-10 text-[9px] font-black text-slate-300 bg-black/60 px-1 rounded-sm leading-tight">
                  Lvl {card.level || 1}
                </div>

                {/* Card Artwork / Icon */}
                <div className="w-full flex-1 flex flex-col items-center justify-center relative mt-1">
                  <span className="text-3xl filter drop-shadow transform transition">
                    {card.icon}
                  </span>
                  <span className="text-[10px] font-black text-white truncate max-w-full text-center leading-none mt-1">
                    {card.name}
                  </span>
                </div>

                {/* Circular / Hexagonal Energy Cost Badge at bottom center */}
                <div
                  className={`flex items-center justify-center font-black text-xs w-5 h-5 rounded-full shadow-md border -mb-1.5 z-20 ${
                    canAfford
                      ? 'bg-[#22c55e] text-slate-950 border-white'
                      : 'bg-slate-700 text-slate-400 border-slate-500'
                  }`}
                >
                  {card.cost}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Energy / Elixir Bar: Matching the exact segmented lime-green bar from screenshots */}
      <div className="flex items-center gap-1.5 bg-[#030712]/90 px-2 py-1 rounded-xl border border-emerald-500/40 shadow-inner">
        {/* Glowing Green Elixir Number Badge */}
        <div className="w-7 h-7 rounded-full bg-[#22c55e] border-2 border-white flex items-center justify-center font-black text-slate-950 text-sm shadow-[0_0_10px_rgba(34,197,94,0.6)]">
          {Math.floor(energy)}
        </div>

        {/* 10 Slanted / Angled Segments Bar */}
        <div className="flex-1 flex gap-0.5 h-3.5 bg-[#0b1324] rounded-lg p-0.5 border border-slate-700/80 overflow-hidden">
          {Array.from({ length: maxEnergy }).map((_, idx) => {
            const isFilled = energy >= idx + 1;
            const isPartial = energy > idx && energy < idx + 1;
            const fillWidth = isFilled ? 100 : isPartial ? (energy - idx) * 100 : 0;

            return (
              <div
                key={idx}
                className="flex-1 bg-[#1e293b]/80 rounded-[2px] overflow-hidden relative -skew-x-12"
              >
                <div
                  className="h-full bg-gradient-to-r from-[#4ade80] to-[#22c55e] transition-all duration-100 shadow-[0_0_6px_rgba(74,222,128,0.9)]"
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
