import React, { useState } from 'react';
import { Card, CardInventoryItem, CardType, PassiveAbility } from '../types';
import { ALL_CARDS } from '../cardsData';
import { sounds } from '../audio';
import { Shield, Zap, Sparkles, ArrowUp, X, Check, Flame, Trophy, Info } from 'lucide-react';

interface CardCollectionViewProps {
  inventory: Record<CardType, CardInventoryItem>;
  activeDeck: Card[];
  playerCoins: number;
  onUpgradeCard: (cardId: CardType) => void;
  onEquipCard: (cardId: CardType, slotIndex: number) => void;
}

export const CardCollectionView: React.FC<CardCollectionViewProps> = ({
  inventory,
  activeDeck,
  playerCoins,
  onUpgradeCard,
  onEquipCard,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<CardType | null>(null);
  const [equippingCardId, setEquippingCardId] = useState<CardType | null>(null);

  const selectedCard = selectedCardId ? ALL_CARDS[selectedCardId] : null;
  const selectedInventory = selectedCardId ? inventory[selectedCardId] : null;

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto p-3.5 select-none bg-gradient-to-b from-[#0c1322] via-[#091122] to-[#070b14] text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-lg font-black text-white flex items-center gap-1.5">
            Cards & Deck <Sparkles className="w-4 h-4 text-amber-400" />
          </h1>
          <span className="text-[11px] text-slate-400">
            Build your 4-card tactical battle loadout
          </span>
        </div>
        <div className="flex items-center gap-1 bg-black/40 border border-yellow-500/40 px-2.5 py-1 rounded-xl">
          <span className="text-yellow-400 text-xs">🪙</span>
          <span className="text-xs font-black text-yellow-300">{playerCoins}</span>
        </div>
      </div>

      {/* Active Battle Deck (4 Cards) */}
      <div className="mt-3 bg-slate-900/80 border border-sky-500/30 rounded-2xl p-3 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-sky-400 uppercase tracking-wider">
            Active Battle Deck (4 Cards)
          </span>
          {equippingCardId && (
            <span className="text-[10px] font-bold text-amber-400 animate-pulse">
              Select a slot to replace
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {activeDeck.slice(0, 4).map((card, idx) => {
            const inv = inventory[card.id];
            const isTarget = equippingCardId !== null;

            return (
              <div
                key={card.id}
                onClick={() => {
                  if (equippingCardId) {
                    sounds.playClick();
                    onEquipCard(equippingCardId, idx);
                    setEquippingCardId(null);
                  } else {
                    sounds.playClick();
                    setSelectedCardId(card.id);
                  }
                }}
                className={`relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl p-2 border flex flex-col items-center cursor-pointer transition active:scale-95 ${
                  isTarget
                    ? 'border-amber-400 bg-amber-950/40 animate-pulse'
                    : 'border-slate-700 hover:border-sky-400'
                }`}
              >
                {/* Cost badge */}
                <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] flex items-center justify-center">
                  {card.cost}
                </div>

                {/* Passive Ability Icon with refined pulse */}
                {card.passive && (
                  <div
                    data-ability-active="true"
                    className="unit-indicator-icon absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-950/90 border border-sky-400/80 text-[9px] flex items-center justify-center"
                    title={card.passive.name}
                  >
                    {card.passive.icon}
                  </div>
                )}

                <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-2xl mt-2">
                  {card.icon}
                </div>
                <span className="text-[11px] font-bold text-white truncate max-w-full mt-1">
                  {card.name.split(' ')[0]}
                </span>
                <span className="text-[9px] font-black text-amber-400">
                  Lvl {inv?.level || card.level}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Collection Grid */}
      <div className="mt-4 flex-1">
        <h2 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
          Card Collection ({Object.keys(ALL_CARDS).length} Cards)
        </h2>

        <div className="grid grid-cols-2 gap-2.5">
          {Object.values(ALL_CARDS).map((card) => {
            const inv = inventory[card.id] || {
              id: card.id,
              level: 1,
              cards: 4,
              cardsRequired: 10,
              upgradeCost: 50,
            };

            const isDeckMember = activeDeck.some((c) => c.id === card.id);
            const canUpgrade = inv.cards >= inv.cardsRequired && playerCoins >= inv.upgradeCost;
            const progress = Math.min(100, (inv.cards / inv.cardsRequired) * 100);

            return (
              <div
                key={card.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedCardId(card.id);
                }}
                className={`relative bg-slate-900/90 rounded-2xl p-2.5 border transition cursor-pointer active:scale-98 flex flex-col justify-between ${
                  canUpgrade
                    ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : isDeckMember
                    ? 'border-sky-500/60'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Deck tag */}
                {isDeckMember && (
                  <span className="absolute -top-2 left-3 bg-sky-500 text-slate-950 font-black text-[8px] uppercase px-1.5 py-0.5 rounded shadow">
                    In Deck
                  </span>
                )}

                {/* Top card info */}
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-black p-1 border border-white/10 flex items-center justify-center text-2xl relative shadow">
                    {card.icon}
                    <span className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] flex items-center justify-center">
                      {card.cost}
                    </span>
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs font-black text-white truncate">
                      {card.name}
                    </span>
                    <span className="text-[10px] font-bold text-amber-400">
                      Level {inv.level}
                    </span>
                    {card.passive && (
                      <span className="text-[9px] text-sky-300 flex items-center gap-1 mt-0.5">
                        <span
                          data-ability-active="true"
                          className="unit-indicator-icon text-[10px]"
                        >
                          {card.passive.icon}
                        </span>
                        <span className="truncate">{card.passive.name}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2.5">
                  <div className="flex items-center justify-between text-[9px] text-slate-400 mb-0.5 font-bold">
                    <span>Cards</span>
                    <span className={inv.cards >= inv.cardsRequired ? 'text-emerald-400 font-black' : ''}>
                      {inv.cards}/{inv.cardsRequired}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className={`h-full rounded-full transition-all ${
                        canUpgrade
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                          : 'bg-gradient-to-r from-blue-500 to-sky-400'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Upgrade Button if ready */}
                {canUpgrade ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playCardUpgrade();
                      onUpgradeCard(card.id);
                    }}
                    className="mt-2 w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />
                    UPGRADE ({inv.upgradeCost} 🪙)
                  </button>
                ) : (
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 px-1">
                    <span>DMG: {card.damage}</span>
                    <span>HP: {card.hp}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Detail & Inspector Modal */}
      {selectedCard && selectedInventory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-5 border-2 border-sky-500/60 shadow-2xl flex flex-col animate-in zoom-in-95">
            {/* Close button */}
            <button
              onClick={() => setSelectedCardId(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 3D Big Unit Preview Card */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-900 border-2 border-white/40 flex items-center justify-center text-4xl shadow-xl">
                {selectedCard.icon}
              </div>

              <h2 className="text-xl font-black text-white mt-2">
                {selectedCard.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-black text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded-full">
                  Level {selectedInventory.level}
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                  Cost: {selectedCard.cost} Energy
                </span>
              </div>
              <p className="text-xs text-slate-300 text-center mt-2 px-2">
                {selectedCard.description}
              </p>
            </div>

            {/* Passive Ability Feature Box with refined pulse */}
            {selectedCard.passive && (
              <div className="mt-3 bg-sky-950/50 border border-sky-500/50 rounded-2xl p-3 flex items-center gap-3">
                <div
                  data-ability-active="true"
                  className="unit-indicator-icon w-10 h-10 rounded-xl bg-sky-900/80 border border-sky-400 flex items-center justify-center text-2xl shrink-0"
                >
                  {selectedCard.passive.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-sky-300 uppercase tracking-wide">
                    Passive: {selectedCard.passive.name}
                  </span>
                  <span className="text-[11px] text-slate-300 leading-snug">
                    {selectedCard.passive.description}
                  </span>
                </div>
              </div>
            )}

            {/* Combat Stats Grid */}
            <div className="grid grid-cols-2 gap-2 mt-3 bg-black/40 p-3 rounded-2xl border border-slate-800 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Damage:</span>
                <strong className="text-white">{selectedCard.damage}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Health:</span>
                <strong className="text-white">{selectedCard.hp}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Fire Rate:</span>
                <strong className="text-white">
                  {selectedCard.fireRate > 0 ? `${selectedCard.fireRate}s` : 'Instant'}
                </strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Paint Radius:</span>
                <strong className="text-white">{selectedCard.paintRadius} tiles</strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => {
                  sounds.playClick();
                  setEquippingCardId(selectedCard.id);
                  setSelectedCardId(null);
                }}
                className="flex-1 py-3 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition"
              >
                Use in Deck
              </button>

              {selectedInventory.cards >= selectedInventory.cardsRequired && (
                <button
                  disabled={playerCoins < selectedInventory.upgradeCost}
                  onClick={() => {
                    sounds.playCardUpgrade();
                    onUpgradeCard(selectedCard.id);
                  }}
                  className="flex-1 py-3 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer active:scale-95 transition flex items-center justify-center gap-1"
                >
                  <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />
                  Upgrade ({selectedInventory.upgradeCost} 🪙)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
