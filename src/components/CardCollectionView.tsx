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
  onCoinShortfall?: (itemTitle: string, requiredCoins: number, currentCoins: number) => void;
}

export const CardCollectionView: React.FC<CardCollectionViewProps> = ({
  inventory,
  activeDeck,
  playerCoins,
  onUpgradeCard,
  onEquipCard,
  onCoinShortfall,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<CardType | null>(null);
  const [equippingCardId, setEquippingCardId] = useState<CardType | null>(null);

  const selectedCard = selectedCardId ? ALL_CARDS[selectedCardId] : null;
  const selectedInventory = selectedCardId ? inventory[selectedCardId] : null;

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto p-3.5 select-none bg-gradient-to-b from-[#1448b8] via-[#0f3894] to-[#0a296e] text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-blue-400/30">
        <div>
          <h1 className="text-lg font-black text-white flex items-center gap-1.5 drop-shadow">
            Cards & Deck <Sparkles className="w-4 h-4 text-amber-400" />
          </h1>
          <span className="text-[11px] text-blue-100 font-bold">
            Build your 4-card tactical battle loadout
          </span>
        </div>
        <div className="flex items-center gap-1 bg-[#0c2a6b] border border-yellow-400/40 px-2.5 py-1 rounded-xl shadow">
          <span className="text-yellow-400 text-xs">🪙</span>
          <span className="text-xs font-black text-yellow-300">{playerCoins}</span>
        </div>
      </div>

      {/* Active Battle Deck (4 Cards) */}
      <div className="mt-3 bg-[#0c2a6b] border-2 border-blue-400/40 rounded-2xl p-3 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-sky-300 uppercase tracking-wider">
            Active Battle Deck (4 Cards)
          </span>
          {equippingCardId && (
            <span className="text-[10px] font-black text-yellow-300 animate-pulse bg-[#081b42] px-2 py-0.5 rounded-full border border-yellow-300/40">
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
                className={`relative bg-gradient-to-b from-[#1a4bb5] to-[#133785] rounded-xl p-2 border-2 flex flex-col items-center cursor-pointer transition active:scale-95 shadow ${
                  isTarget
                    ? 'border-yellow-300 bg-amber-500/20 animate-pulse'
                    : 'border-sky-300/40 hover:border-yellow-300'
                }`}
              >
                {/* Cost badge */}
                <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-emerald-500 text-teal-950 font-black text-[9px] flex items-center justify-center border border-white shadow">
                  {card.cost}
                </div>

                {/* Passive Ability Icon with refined pulse */}
                {card.passive && (
                  <div
                    data-ability-active="true"
                    className="unit-indicator-icon absolute top-1 right-1 w-4 h-4 rounded-full bg-[#0a235c] border border-sky-300 text-[9px] flex items-center justify-center shadow"
                    title={card.passive.name}
                  >
                    {card.passive.icon}
                  </div>
                )}

                <div className="w-10 h-10 rounded-xl bg-[#0a1e4a] border border-white/20 flex items-center justify-center text-2xl mt-2 shadow-inner">
                  {card.icon}
                </div>
                <span className="text-[11px] font-black text-white truncate max-w-full mt-1">
                  {card.name.split(' ')[0]}
                </span>
                <span className="text-[9px] font-black text-amber-950 bg-amber-400 px-1.5 rounded-full mt-0.5 shadow">
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
                className={`relative bg-[#0c2a6b] rounded-2xl p-2.5 border-2 transition cursor-pointer active:scale-98 flex flex-col justify-between shadow ${
                  canUpgrade
                    ? 'border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : isDeckMember
                    ? 'border-yellow-300'
                    : 'border-blue-400/40 hover:border-sky-300'
                }`}
              >
                {/* Deck tag */}
                {isDeckMember && (
                  <span className="absolute -top-2 left-3 bg-yellow-400 text-amber-950 font-black text-[8px] uppercase px-1.5 py-0.5 rounded shadow border border-white">
                    In Deck
                  </span>
                )}

                {/* Top card info */}
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1b4cb8] to-[#0d2760] p-1 border-2 border-white/40 flex items-center justify-center text-2xl relative shadow">
                    {card.icon}
                    <span className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-emerald-500 text-teal-950 font-black text-[9px] flex items-center justify-center border border-white shadow">
                      {card.cost}
                    </span>
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs font-black text-white truncate drop-shadow">
                      {card.name}
                    </span>
                    <span className="text-[10px] font-black text-amber-300">
                      Level {inv.level}
                    </span>
                    {card.passive && (
                      <span className="text-[9px] text-sky-200 flex items-center gap-1 mt-0.5 font-bold">
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
                  <div className="flex items-center justify-between text-[9px] text-blue-200 mb-0.5 font-bold">
                    <span>Cards</span>
                    <span className={inv.cards >= inv.cardsRequired ? 'text-emerald-300 font-black' : ''}>
                      {inv.cards}/{inv.cardsRequired}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#081d45] rounded-full overflow-hidden border border-blue-400/40">
                    <div
                      className={`h-full rounded-full transition-all ${
                        canUpgrade
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-300'
                          : 'bg-gradient-to-r from-blue-400 to-sky-300'
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
                    className="mt-2 w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-teal-950 font-black text-xs shadow-lg flex items-center justify-center gap-1 active:scale-95 cursor-pointer border border-white"
                  >
                    <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />
                    UPGRADE ({inv.upgradeCost} 🪙)
                  </button>
                ) : (
                  <div className="mt-2 flex items-center justify-between text-[10px] text-blue-200 font-bold px-1">
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
        <div className="fixed inset-0 z-50 bg-[#071940]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-gradient-to-b from-[#1844a8] via-[#123687] to-[#0a235c] rounded-3xl p-5 border-2 border-sky-300 shadow-2xl flex flex-col animate-in zoom-in-95">
            {/* Close button */}
            <button
              onClick={() => setSelectedCardId(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#1b4cb8] hover:bg-[#2563eb] flex items-center justify-center text-white border-2 border-white/60 cursor-pointer shadow active:scale-95 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 3D Big Unit Preview Card */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-700 border-2 border-white flex items-center justify-center text-4xl shadow-xl">
                {selectedCard.icon}
              </div>

              <h2 className="text-xl font-black text-white mt-2 drop-shadow">
                {selectedCard.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-black text-amber-950 bg-amber-400 border border-white px-2 py-0.5 rounded-full shadow">
                  Level {selectedInventory.level}
                </span>
                <span className="text-xs font-black text-teal-950 bg-emerald-400 border border-white px-2 py-0.5 rounded-full shadow">
                  Cost: {selectedCard.cost} Energy
                </span>
              </div>
              <p className="text-xs text-blue-100 text-center mt-2 px-2 font-medium">
                {selectedCard.description}
              </p>
            </div>

            {/* Passive Ability Feature Box with refined pulse */}
            {selectedCard.passive && (
              <div className="mt-3 bg-[#0a235c] border-2 border-sky-300/50 rounded-2xl p-3 flex items-center gap-3 shadow">
                <div
                  data-ability-active="true"
                  className="unit-indicator-icon w-10 h-10 rounded-xl bg-sky-500 border-2 border-white flex items-center justify-center text-2xl shrink-0 shadow"
                >
                  {selectedCard.passive.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-yellow-300 uppercase tracking-wide">
                    Passive: {selectedCard.passive.name}
                  </span>
                  <span className="text-[11px] text-blue-100 leading-snug">
                    {selectedCard.passive.description}
                  </span>
                </div>
              </div>
            )}

            {/* Combat Stats Grid */}
            <div className="grid grid-cols-2 gap-2 mt-3 bg-[#081d47] p-3 rounded-2xl border border-blue-400/40 text-xs shadow-inner">
              <div className="flex justify-between text-blue-200 font-bold">
                <span>Damage:</span>
                <strong className="text-white">{selectedCard.damage}</strong>
              </div>
              <div className="flex justify-between text-blue-200 font-bold">
                <span>Health:</span>
                <strong className="text-white">{selectedCard.hp}</strong>
              </div>
              <div className="flex justify-between text-blue-200 font-bold">
                <span>Fire Rate:</span>
                <strong className="text-white">
                  {selectedCard.fireRate > 0 ? `${selectedCard.fireRate}s` : 'Instant'}
                </strong>
              </div>
              <div className="flex justify-between text-blue-200 font-bold">
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
                className="flex-1 py-3 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 text-white font-black text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition border border-white shadow"
              >
                Use in Deck
              </button>

              {selectedInventory.cards >= selectedInventory.cardsRequired && (
                <button
                  onClick={() => {
                    if (playerCoins < selectedInventory.upgradeCost) {
                      onCoinShortfall?.(
                        `${selectedCard.name} (Lvl ${selectedInventory.level + 1})`,
                        selectedInventory.upgradeCost,
                        playerCoins
                      );
                      return;
                    }
                    sounds.playCardUpgrade();
                    onUpgradeCard(selectedCard.id);
                  }}
                  className={`flex-1 py-3 px-3 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition flex items-center justify-center gap-1 border border-white shadow ${
                    playerCoins < selectedInventory.upgradeCost
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-yellow-200'
                      : 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 text-teal-950'
                  }`}
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
