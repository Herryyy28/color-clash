import React, { useState } from 'react';
import { MessageSquare, Zap } from 'lucide-react';
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

const EMOJIS = ['😡', '😢', '😂', '🔥', '👎', '😎', '😈', '😱'];

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
    <div className="relative w-full max-w-md mx-auto px-3 pb-3 pt-1 select-none z-20 flex flex-col gap-1.5">
      {/* Emote Floating Picker */}
      {showEmotePicker && (
        <div className="absolute bottom-28 left-4 bg-slate-900/95 border-2 border-sky-500 p-2.5 rounded-2xl shadow-2xl flex flex-wrap gap-2 w-56 z-50 animate-in fade-in zoom-in-95">
          <div className="w-full text-xs font-bold text-sky-400 mb-1 flex justify-between items-center">
            <span>Battle Taunt:</span>
            <button
              onClick={() => setShowEmotePicker(false)}
              className="text-slate-400 hover:text-white px-1"
            >
              ✕
            </button>
          </div>
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleEmoteClick(emoji)}
              className="w-10 h-10 text-2xl flex items-center justify-center bg-slate-800 hover:bg-slate-700 hover:scale-110 active:scale-95 rounded-xl border border-slate-600 transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Energy / Ink Bar (Styled exactly like the video's bright green angled gauge) */}
      <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur px-2.5 py-1.5 rounded-xl border border-emerald-500/40 shadow-md">
        {/* Energy Number Badge */}
        <div className="flex items-center justify-center bg-gradient-to-br from-emerald-400 to-green-600 text-slate-950 font-black text-sm w-7 h-7 rounded-lg shadow-inner border border-emerald-200">
          <Zap className="w-3.5 h-3.5 fill-slate-950 text-slate-950 inline mr-0.5" />
          {Math.floor(energy)}
        </div>

        {/* Energy Segments Bar */}
        <div className="flex-1 flex gap-1 h-3.5 bg-slate-900 rounded-lg p-0.5 border border-slate-700 overflow-hidden">
          {Array.from({ length: maxEnergy }).map((_, idx) => {
            const isFilled = energy >= idx + 1;
            const isPartial = energy > idx && energy < idx + 1;
            const fillWidth = isFilled ? 100 : isPartial ? (energy - idx) * 100 : 0;

            return (
              <div
                key={idx}
                className="flex-1 bg-slate-800 rounded-sm overflow-hidden relative"
              >
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-100"
                  style={{ width: `${fillWidth}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Cards Row: Next Card slot + 4 Hand Cards + Emote bubble */}
      <div className="flex items-end justify-between gap-1.5">
        {/* Left column: Emote toggle & Next Card */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => setShowEmotePicker(!showEmotePicker)}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-sky-400 border border-slate-600 shadow cursor-pointer transition active:scale-95"
            title="Send Emote"
          >
            <MessageSquare className="w-4 h-4 fill-sky-400/20" />
          </button>

          {/* Next Card mini slot */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              Next:
            </span>
            <div className="w-9 h-11 bg-slate-800/90 rounded-lg border border-slate-600 flex flex-col items-center justify-center relative p-0.5 shadow-sm">
              <span className="text-sm">{nextCard.icon}</span>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 font-black text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
                {nextCard.cost}
              </div>
            </div>
          </div>
        </div>

        {/* 4 Hand Cards */}
        <div className="flex-1 flex gap-1.5 justify-center">
          {hand.map((card, index) => {
            const canAfford = energy >= card.cost;
            const isSelected = selectedCard?.id === card.id;

            return (
              <div
                key={`${card.id}-${index}`}
                onPointerDown={(e) => handleCardPointerDown(card, e)}
                className={`relative flex-1 max-w-[78px] h-25 rounded-xl flex flex-col items-center justify-between p-1 transition-all cursor-pointer border-2 shadow-xl touch-none select-none ${
                  isSelected
                    ? 'scale-105 border-white ring-4 ring-sky-400 bg-gradient-to-b from-sky-800 to-blue-950 -translate-y-2.5'
                    : canAfford
                    ? 'border-slate-500 hover:border-sky-300 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 active:scale-95'
                    : 'border-slate-800 bg-slate-950/85 opacity-55 grayscale cursor-not-allowed'
                }`}
              >
                {/* Passive Ability Pill Badge */}
                {card.passive && (
                  <div
                    title={`${card.passive.name}: ${card.passive.description}`}
                    className="absolute -top-1.5 -right-1.5 bg-slate-900 border border-amber-400/90 rounded-full w-5.5 h-5.5 flex items-center justify-center text-xs shadow-md z-10 animate-ability-pulse"
                  >
                    {card.passive.icon}
                  </div>
                )}

                {/* Card Artwork Box */}
                <div className="w-full flex-1 rounded-lg bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-700/60 flex flex-col items-center justify-center p-0.5 overflow-hidden shadow-inner relative">
                  <span className="text-2xl filter drop-shadow transform hover:scale-110 transition">
                    {card.icon}
                  </span>
                  <span className="text-[10px] font-black text-slate-200 truncate max-w-full text-center leading-none mt-0.5">
                    {card.name}
                  </span>
                </div>

                {/* Reference-accurate Energy Cost Badge at bottom center */}
                <div
                  className={`flex items-center justify-center font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-md border -mb-1 z-10 ${
                    canAfford
                      ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-slate-950 border-white'
                      : 'bg-slate-800 text-slate-400 border-slate-600'
                  }`}
                >
                  <Zap className="w-2.5 h-2.5 fill-current inline mr-0.5" />
                  {card.cost}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
