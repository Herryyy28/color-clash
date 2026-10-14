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
  onOpenRewardedAd?: (placementId: string) => void;
  onOpenLedgerModal?: () => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  playerCoins,
  playerGems,
  onAddCoins,
  onAddGems,
  onDeductGems,
  onOpenChestLoot,
  onOpenRewardedAd,
  onOpenLedgerModal,
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
    <div className="w-full h-full flex flex-col overflow-y-auto scroll-touch p-3 sm:p-4 pb-14 select-none bg-gradient-to-b from-[#1769D2] via-[#124d9c] to-[#17345D] text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b-2 border-[#FFC83D]/40 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-display text-white flex items-center gap-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            Royal Bazaar <ShoppingBag className="w-5 h-5 text-[#FFC83D]" />
          </h1>
          <span className="text-[11px] text-[#F7E7BE] font-body font-bold tracking-wide">
            Treasure chests, royal vaults & daily bounties
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#17345D] border-2 border-[#FFC83D] px-2.5 py-1 rounded-xl text-xs game-counter font-black text-[#FFC83D] shadow-md">
            <span>🪙</span> {playerCoins}
          </div>
          <div className="flex items-center gap-1 bg-[#17345D] border-2 border-[#79B957] px-2.5 py-1 rounded-xl text-xs game-counter font-black text-[#79B957] shadow-md">
            <span>💎</span> {playerGems}
          </div>
        </div>
      </div>

      {purchaseNotification && (
        <div className="my-2.5 p-2 rounded-xl bg-[#FFC83D] text-[#17345D] text-xs font-display text-center shadow-lg border-2 border-white animate-in slide-in-from-top">
          {purchaseNotification}
        </div>
      )}

      {/* 1. DAILY FREE GIFT BANNER */}
      <div className="mt-3 bg-gradient-to-r from-[#1769D2] to-[#17345D] border-2 border-b-4 border-[#FFC83D] border-b-[#b38615] rounded-2xl p-3 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FFC83D]/25 border-2 border-[#FFC83D] flex items-center justify-center text-3xl shadow-inner">
            🎁
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-display uppercase text-[#FFC83D] tracking-wider">
              King's Daily Gift
            </span>
            <span className="text-sm font-display text-white drop-shadow">100 Coins + 10 Gems</span>
            <span className="text-[10px] text-[#F7E7BE] font-body font-semibold">Free reward every 24h</span>
          </div>
        </div>

        <button
          disabled={hasClaimedDaily}
          onClick={handleClaimFreeDaily}
          className={`py-2 px-3.5 rounded-xl font-display text-xs uppercase tracking-wider cursor-pointer transition ${
            hasClaimedDaily
              ? 'bg-[#17345D] text-[#F7E7BE]/60 border border-white/20'
              : 'btn-royal-gold text-[#17345D] animate-bounce'
          }`}
        >
          {hasClaimedDaily ? 'CLAIMED' : 'CLAIM'}
        </button>
      </div>

      {/* 1.5 SPONSORED REWARDED AD COIN VAULT */}
      {onOpenRewardedAd && (
        <div className="mt-2.5 bg-[#17345D] border-2 border-b-4 border-[#FFC83D] border-b-[#b38615] rounded-2xl p-3 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#FFC83D] text-[#17345D] flex items-center justify-center text-xl font-black shadow-md border border-white">
              ▶
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-display uppercase text-[#FFC83D] tracking-wider flex items-center gap-1">
                Rewarded Ad Vault <Sparkles className="w-3 h-3 text-[#FFC83D]" />
              </span>
              <span className="text-sm font-display text-white drop-shadow">Free 100 Gold Coins</span>
              <span className="text-[10px] text-[#F7E7BE] font-body font-medium">Watch quick royal sponsor</span>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenRewardedAd('placement_shop_free');
            }}
            className="py-2 px-3.5 rounded-xl btn-royal-gold text-[#17345D] font-display text-xs uppercase tracking-wider shadow cursor-pointer transition flex items-center gap-1"
          >
            <span>WATCH AD</span>
          </button>
        </div>
      )}

      {/* 2. CARD CHESTS SECTION */}
      <div className="mt-4">
        <h2 className="text-xs sm:text-sm font-display text-[#FFC83D] uppercase tracking-wider mb-2 flex items-center gap-1.5 drop-shadow">
          <Sparkles className="w-4 h-4 text-[#FFC83D]" /> Royal Chests & Packs
        </h2>

        <div className="grid grid-cols-3 gap-2">
          {/* Silver Chest */}
          <div className="bg-[#17345D] rounded-2xl p-2.5 border-2 border-b-4 border-slate-400 border-b-slate-700 flex flex-col items-center text-center justify-between shadow-lg hover:border-[#FFC83D] transition">
            <span className="text-2xl mt-1">🥈</span>
            <span className="text-xs font-display text-white mt-1">Silver Chest</span>
            <span className="text-[9px] text-[#F7E7BE] game-counter font-bold">150 Coins + 10 Cards</span>
            <button
              onClick={() => handleBuyChest('silver', 60)}
              className="mt-2 w-full py-1.5 rounded-xl btn-arena-green text-white font-display text-xs flex items-center justify-center gap-1 cursor-pointer shadow"
            >
              <span>💎 60</span>
            </button>
          </div>

          {/* Gold Chest */}
          <div className="bg-[#17345D] rounded-2xl p-2.5 border-2 border-b-4 border-[#FFC83D] border-b-[#b38615] flex flex-col items-center text-center justify-between shadow-lg hover:border-[#FFC83D] transition">
            <span className="text-2xl mt-1">🪙</span>
            <span className="text-xs font-display text-[#FFC83D] mt-1">Gold Chest</span>
            <span className="text-[9px] text-[#F7E7BE] game-counter font-bold">500 Coins + 25 Cards</span>
            <button
              onClick={() => handleBuyChest('gold', 150)}
              className="mt-2 w-full py-1.5 rounded-xl btn-royal-gold text-[#17345D] font-display text-xs flex items-center justify-center gap-1 cursor-pointer shadow"
            >
              <span>💎 150</span>
            </button>
          </div>

          {/* Magical Mega Box */}
          <div className="bg-[#17345D] rounded-2xl p-2.5 border-2 border-b-4 border-fuchsia-400 border-b-purple-900 flex flex-col items-center text-center justify-between shadow-lg hover:border-[#FFC83D] transition">
            <span className="text-2xl mt-1">✨</span>
            <span className="text-xs font-display text-fuchsia-200 mt-1">Mega Box</span>
            <span className="text-[9px] text-[#F7E7BE] game-counter font-bold">1500 Coins + 60 Cards</span>
            <button
              onClick={() => handleBuyChest('magical', 350)}
              className="mt-2 w-full py-1.5 rounded-xl btn-battle-red text-white font-display text-xs flex items-center justify-center gap-1 cursor-pointer shadow"
            >
              <span>💎 350</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. COIN VAULT SECTION */}
      <div className="mt-4">
        <h2 className="text-xs sm:text-sm font-display text-[#FFC83D] uppercase tracking-wider mb-2 flex items-center gap-1.5 drop-shadow">
          <Coins className="w-4 h-4 text-[#FFC83D]" /> Royal Coin Treasury
        </h2>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#17345D] rounded-2xl p-2.5 border-2 border-b-4 border-[#1769D2] border-b-[#0c2448] flex flex-col items-center text-center justify-between shadow-lg">
            <span className="text-xl">🪙</span>
            <span className="text-xs font-display text-[#FFC83D] mt-1">1,000 Coins</span>
            <button
              onClick={() => handleBuyCoins(1000, 40)}
              className="mt-2 w-full py-1.5 rounded-xl btn-royal-blue text-white font-display text-xs cursor-pointer shadow"
            >
              💎 40
            </button>
          </div>

          <div className="bg-[#17345D] rounded-2xl p-2.5 border-2 border-b-4 border-[#1769D2] border-b-[#0c2448] flex flex-col items-center text-center justify-between shadow-lg">
            <span className="text-xl">💰</span>
            <span className="text-xs font-display text-[#FFC83D] mt-1">5,000 Coins</span>
            <button
              onClick={() => handleBuyCoins(5000, 180)}
              className="mt-2 w-full py-1.5 rounded-xl btn-royal-blue text-white font-display text-xs cursor-pointer shadow"
            >
              💎 180
            </button>
          </div>

          <div className="bg-[#17345D] rounded-2xl p-2.5 border-2 border-b-4 border-[#1769D2] border-b-[#0c2448] flex flex-col items-center text-center justify-between shadow-lg">
            <span className="text-xl">🏦</span>
            <span className="text-xs font-display text-[#FFC83D] mt-1">15,000 Coins</span>
            <button
              onClick={() => handleBuyCoins(15000, 450)}
              className="mt-2 w-full py-1.5 rounded-xl btn-royal-blue text-white font-display text-xs cursor-pointer shadow"
            >
              💎 450
            </button>
          </div>
        </div>
      </div>

      {/* 4. GEM REFILL SECTION */}
      <div className="mt-4 mb-2">
        <h2 className="text-xs font-black text-[#79B957] uppercase tracking-wider mb-2 flex items-center gap-1.5 drop-shadow">
          <Gem className="w-3.5 h-3.5 text-[#79B957]" /> Gem Stash
        </h2>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#17345D] rounded-2xl p-3 border-2 border-[#79B957]/50 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💎</span>
              <div className="flex flex-col">
                <span className="text-xs font-black text-[#79B957]">+100 Gems</span>
                <span className="text-[9px] text-[#F7E7BE] font-bold">Booster Pouch</span>
              </div>
            </div>
            <button
              onClick={() => {
                sounds.playRewardClaim();
                onAddGems(100);
                showNotification('Added 100 Gems!');
              }}
              className="py-1.5 px-3 rounded-xl btn-arena-green text-white font-display text-xs cursor-pointer shadow"
            >
              +100
            </button>
          </div>

          <div className="bg-[#17345D] rounded-2xl p-3 border-2 border-[#79B957]/50 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <div className="flex flex-col">
                <span className="text-xs font-black text-[#79B957]">+500 Gems</span>
                <span className="text-[9px] text-[#F7E7BE] font-bold">Royal Hoard</span>
              </div>
            </div>
            <button
              onClick={() => {
                sounds.playRewardClaim();
                onAddGems(500);
                showNotification('Added 500 Gems!');
              }}
              className="py-1.5 px-3 rounded-xl btn-arena-green text-white font-display text-xs cursor-pointer shadow"
            >
              +500
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
