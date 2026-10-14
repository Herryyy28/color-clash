import React, { useState } from 'react';
import { sounds } from '../audio';
import confetti from 'canvas-confetti';
import { ShoppingBag, Coins, Gem, Gift, Sparkles, Check, ArrowRight, ShieldCheck } from 'lucide-react';

interface ShopViewProps {
  playerCoins: number;
  playerGems: number;
  onAddCoins: (amount: number) => void;
  onAddGems: (amount: number) => void;
  onDeductGems: (amount: number) => boolean;
  onOpenChestLoot: (tier: 'silver' | 'gold' | 'magical') => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  playerCoins,
  playerGems,
  onAddCoins,
  onAddGems,
  onDeductGems,
  onOpenChestLoot,
}) => {
  const [hasClaimedDaily, setHasClaimedDaily] = useState(false);
  const [purchaseNotification, setPurchaseNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setPurchaseNotification(msg);
    setTimeout(() => setPurchaseNotification(null), 2500);
  };

  const handleClaimFreeDaily = () => {
    if (hasClaimedDaily) return;
    setHasClaimedDaily(true);
    sounds.playRewardClaim();
    onAddCoins(100);
    onAddGems(10);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
    showNotification('Claimed 100 Coins & 10 Gems!');
  };

  const handleBuyCoins = (coins: number, gemCost: number) => {
    if (onDeductGems(gemCost)) {
      sounds.playRewardClaim();
      onAddCoins(coins);
      showNotification(`Purchased ${coins} Coins!`);
    } else {
      showNotification('Not enough Gems!');
    }
  };

  const handleBuyChest = (tier: 'silver' | 'gold' | 'magical', gemCost: number) => {
    if (onDeductGems(gemCost)) {
      sounds.playRewardClaim();
      onOpenChestLoot(tier);
      showNotification(`Opened ${tier.toUpperCase()} Chest!`);
    } else {
      showNotification('Not enough Gems!');
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto p-3.5 select-none bg-gradient-to-b from-[#0c1322] via-[#091122] to-[#070b14] text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-lg font-black text-white flex items-center gap-1.5">
            Shop & Offers <ShoppingBag className="w-4 h-4 text-sky-400" />
          </h1>
          <span className="text-[11px] text-slate-400">
            Card packs, coin vaults and daily rewards
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black/40 border border-yellow-500/40 px-2 py-0.5 rounded-xl text-xs font-black text-yellow-300">
            <span>🪙</span> {playerCoins}
          </div>
          <div className="flex items-center gap-1 bg-black/40 border border-emerald-500/40 px-2 py-0.5 rounded-xl text-xs font-black text-emerald-300">
            <span>💎</span> {playerGems}
          </div>
        </div>
      </div>

      {purchaseNotification && (
        <div className="my-2 p-2 rounded-xl bg-sky-500 text-slate-950 text-xs font-black text-center shadow animate-in slide-in-from-top">
          {purchaseNotification}
        </div>
      )}

      {/* 1. DAILY FREE GIFT BANNER */}
      <div className="mt-3 bg-gradient-to-r from-indigo-900 via-blue-900 to-sky-950 border border-sky-400/40 rounded-2xl p-3 shadow flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/60 flex items-center justify-center text-3xl shadow">
            🎁
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
              Daily Gift
            </span>
            <span className="text-sm font-black text-white">100 Coins + 10 Gems</span>
            <span className="text-[10px] text-slate-300">Free every 24 hours</span>
          </div>
        </div>

        <button
          disabled={hasClaimedDaily}
          onClick={handleClaimFreeDaily}
          className={`py-2 px-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow cursor-pointer transition active:scale-95 ${
            hasClaimedDaily
              ? 'bg-slate-800 text-slate-500 border border-slate-700'
              : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border border-white animate-pulse'
          }`}
        >
          {hasClaimedDaily ? 'CLAIMED' : 'CLAIM'}
        </button>
      </div>

      {/* 2. CARD CHESTS SECTION */}
      <div className="mt-4">
        <h2 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Card Packs & Chests
        </h2>

        <div className="grid grid-cols-3 gap-2">
          {/* Silver Chest */}
          <div className="bg-slate-900/90 rounded-2xl p-2.5 border border-slate-700 flex flex-col items-center text-center justify-between shadow">
            <span className="text-2xl mt-1">🥈</span>
            <span className="text-xs font-black text-slate-200 mt-1">Silver Chest</span>
            <span className="text-[9px] text-slate-400">150 Coins + 10 Cards</span>
            <button
              onClick={() => handleBuyChest('silver', 60)}
              className="mt-2 w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] flex items-center justify-center gap-1 active:scale-95 cursor-pointer shadow"
            >
              <span>💎 60</span>
            </button>
          </div>

          {/* Gold Chest */}
          <div className="bg-slate-900/90 rounded-2xl p-2.5 border border-yellow-500/60 flex flex-col items-center text-center justify-between shadow">
            <span className="text-2xl mt-1">🪙</span>
            <span className="text-xs font-black text-yellow-300 mt-1">Gold Chest</span>
            <span className="text-[9px] text-slate-400">500 Coins + 25 Cards</span>
            <button
              onClick={() => handleBuyChest('gold', 150)}
              className="mt-2 w-full py-1.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-[11px] flex items-center justify-center gap-1 active:scale-95 cursor-pointer shadow"
            >
              <span>💎 150</span>
            </button>
          </div>

          {/* Magical Mega Box */}
          <div className="bg-slate-900/90 rounded-2xl p-2.5 border border-fuchsia-500/60 flex flex-col items-center text-center justify-between shadow">
            <span className="text-2xl mt-1">✨</span>
            <span className="text-xs font-black text-fuchsia-300 mt-1">Mega Box</span>
            <span className="text-[9px] text-slate-400">1500 Coins + 60 Cards</span>
            <button
              onClick={() => handleBuyChest('magical', 350)}
              className="mt-2 w-full py-1.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black text-[11px] flex items-center justify-center gap-1 active:scale-95 cursor-pointer shadow"
            >
              <span>💎 350</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. COIN VAULT SECTION */}
      <div className="mt-4">
        <h2 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Coins className="w-3.5 h-3.5 text-yellow-400" /> Coin Store
        </h2>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-900/90 rounded-2xl p-2.5 border border-slate-800 flex flex-col items-center text-center justify-between">
            <span className="text-xl">🪙</span>
            <span className="text-[11px] font-black text-yellow-300 mt-1">1,000 Coins</span>
            <button
              onClick={() => handleBuyCoins(1000, 40)}
              className="mt-2 w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-black text-[10px] border border-slate-700 cursor-pointer active:scale-95"
            >
              💎 40
            </button>
          </div>

          <div className="bg-slate-900/90 rounded-2xl p-2.5 border border-slate-800 flex flex-col items-center text-center justify-between">
            <span className="text-xl">💰</span>
            <span className="text-[11px] font-black text-yellow-300 mt-1">5,000 Coins</span>
            <button
              onClick={() => handleBuyCoins(5000, 180)}
              className="mt-2 w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-black text-[10px] border border-slate-700 cursor-pointer active:scale-95"
            >
              💎 180
            </button>
          </div>

          <div className="bg-slate-900/90 rounded-2xl p-2.5 border border-slate-800 flex flex-col items-center text-center justify-between">
            <span className="text-xl">🏦</span>
            <span className="text-[11px] font-black text-yellow-300 mt-1">15,000 Coins</span>
            <button
              onClick={() => handleBuyCoins(15000, 450)}
              className="mt-2 w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-black text-[10px] border border-slate-700 cursor-pointer active:scale-95"
            >
              💎 450
            </button>
          </div>
        </div>
      </div>

      {/* 4. GEM REFILL SECTION */}
      <div className="mt-4 mb-2">
        <h2 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Gem className="w-3.5 h-3.5 text-emerald-400" /> Gem Pouch
        </h2>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💎</span>
              <div className="flex flex-col">
                <span className="text-xs font-black text-emerald-300">+100 Gems</span>
                <span className="text-[9px] text-slate-400">Booster Pack</span>
              </div>
            </div>
            <button
              onClick={() => {
                sounds.playRewardClaim();
                onAddGems(100);
                showNotification('Added 100 Gems!');
              }}
              className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs cursor-pointer active:scale-95 shadow"
            >
              +100
            </button>
          </div>

          <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <div className="flex flex-col">
                <span className="text-xs font-black text-emerald-300">+500 Gems</span>
                <span className="text-[9px] text-slate-400">Mega Stash</span>
              </div>
            </div>
            <button
              onClick={() => {
                sounds.playRewardClaim();
                onAddGems(500);
                showNotification('Added 500 Gems!');
              }}
              className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs cursor-pointer active:scale-95 shadow"
            >
              +500
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
