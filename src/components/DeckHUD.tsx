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
                className={`relative flex-1 max-w-[76px] h-24 rounded-xl flex flex-col items-center justify-between p-1.5 transition-all cursor-pointer border-2 shadow-lg touch-none select-none ${
                  isSelected
                    ? 'scale-105 border-sky-300 ring-2 ring-sky-400 bg-sky-950/80 -translate-y-2'
                    : canAfford
                    ? 'border-slate-600 hover:border-sky-400 bg-gradient-to-b from-slate-800 to-slate-900 active:scale-95'
                    : 'border-slate-800 bg-slate-950/70 opacity-60 grayscale cursor-not-allowed'
                }`}
              >
                {/* Card Icon and Name */}
                <div className="flex flex-col items-center w-full">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-2xl shadow-inner border border-slate-700">
                    {card.icon}
                  </div>
                  <span className="text-[10px] font-bold text-slate-200 mt-1 truncate max-w-full text-center">
                    {card.name}
                  </span>
                </div>

                {/* Energy Cost Hexagon/Badge */}
                <div
                  className={`flex items-center justify-center font-black text-xs px-2 py-0.5 rounded-full shadow border ${
                    canAfford
                      ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-slate-950 border-white'
                      : 'bg-slate-700 text-slate-400 border-slate-600'
                  }`}
                >
                  <Zap className="w-3 h-3 fill-current inline mr-0.5" />
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
