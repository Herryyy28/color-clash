import React from 'react';
import { Crown, Play, Trophy, Coins, Gem, Sparkles, Shield, ChevronRight, Clock, Lock, Gift, Flame, Cpu } from 'lucide-react';
import { PlayerProfile, ChestSlot, Card, LevelConfig } from '../types';
import { renderAvatarSvg } from './AvatarSelectionModal';
import { sounds } from '../audio';

interface HomeBattleViewProps {
  playerProfile: PlayerProfile;
  currentLevel: LevelConfig;
  selectedSectorIndex: number;
  onSelectSector: (index: number) => void;
  levels: LevelConfig[];
  activeDeck: Card[];
  chestSlots: ChestSlot[];
  onOpenChest: (slotId: string) => void;
  onStartUnlockChest: (slotId: string) => void;
  onStartBattle: () => void;
  onOpenDeckTab: () => void;
  onOpenShopTab: () => void;
  onOpenSpinTab: () => void;
  onOpenUnityModal: () => void;
  onOpenTechModal: () => void;
  onOpenAvatarModal: () => void;
  onOpenNoAdsModal: () => void;
}

export const HomeBattleView: React.FC<HomeBattleViewProps> = ({
  playerProfile,
  currentLevel,
  selectedSectorIndex,
  onSelectSector,
  levels,
  activeDeck,
  chestSlots,
  onOpenChest,
  onStartUnlockChest,
  onStartBattle,
  onOpenDeckTab,
  onOpenShopTab,
  onOpenSpinTab: _onOpenSpinTab,
  onOpenUnityModal,
  onOpenTechModal,
  onOpenAvatarModal,
  onOpenNoAdsModal,
}) => {
  const avgEnergy = (
    activeDeck.reduce((acc, c) => acc + c.cost, 0) / (activeDeck.length || 1)
  ).toFixed(1);

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-y-auto overflow-x-hidden p-3.5 select-none bg-gradient-to-b from-[#1448b8] via-[#0f3894] to-[#0a296e] text-white">
      {/* 1. TOP CURRENCY & PROFILE BAR */}
      <div className="w-full flex items-center justify-between gap-2 shrink-0">
        {/* Profile Avatar & Level - Clickable to open Avatar Selection */}
        <div
          onClick={() => {
            sounds.playClick();
            onOpenAvatarModal();
          }}
          className="flex items-center gap-2 cursor-pointer group active:scale-95 transition"
          title="Tap to change avatar or edit name"
        >
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 p-0.5 shadow-md border-2 border-white/80 group-hover:border-yellow-300 flex items-center justify-center overflow-hidden">
              {renderAvatarSvg(playerProfile.avatarId || 'kid_headphones', 'w-9 h-9')}
            </div>
            {playerProfile.isVip && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-amber-950 text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white shadow">
                <Crown className="w-2.5 h-2.5 fill-current" />
              </span>
            )}
            <span className="absolute -bottom-1 -left-1 bg-amber-400 text-amber-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#10378e] shadow">
              {playerProfile.level}
            </span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-black tracking-wide text-white group-hover:text-yellow-300 flex items-center gap-1">
              {playerProfile.name}
              <span className="text-[9px] text-blue-200 font-normal">✎</span>
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-14 h-1.5 bg-[#092257] rounded-full overflow-hidden border border-blue-400/40">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-blue-400 rounded-full"
                  style={{
                    width: `${Math.min(100, (playerProfile.exp / playerProfile.maxExp) * 100)}%`,
                  }}
                />
              </div>
              <span className="text-[9px] font-bold text-blue-200">
                {playerProfile.exp}/{playerProfile.maxExp}
              </span>
            </div>
          </div>
        </div>

        {/* Currencies Pills & VIP Button */}
        <div className="flex items-center gap-1.5">
          {/* VIP / No Ads Button matching 0-2s video */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenNoAdsModal();
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl shadow border text-xs font-black cursor-pointer active:scale-95 transition ${
              playerProfile.isVip
                ? 'bg-amber-400/20 border-amber-300 text-amber-300'
                : 'bg-gradient-to-r from-amber-400 to-yellow-400 border-white text-amber-950 animate-pulse'
            }`}
          >
            <Crown className="w-3.5 h-3.5 fill-current" />
            <span className="text-[10px] font-black">
              {playerProfile.isVip ? 'VIP' : 'NO ADS'}
            </span>
          </button>

          {/* Trophies */}
          <div className="flex items-center gap-1 bg-[#0c2a6b] border border-amber-400/40 px-2 py-1 rounded-xl shadow-inner">
            <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-black text-amber-300">
              {playerProfile.trophies}
            </span>
          </div>

          {/* Coins */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenShopTab();
            }}
            className="flex items-center gap-1 bg-[#0c2a6b] border border-yellow-400/40 px-2 py-1 rounded-xl shadow-inner hover:border-yellow-300 cursor-pointer active:scale-95 transition"
          >
            <Coins className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs font-black text-yellow-300">
              {playerProfile.coins}
            </span>
            <span className="text-[10px] text-yellow-300 font-black ml-0.5">+</span>
          </button>

          {/* Gems */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenShopTab();
            }}
            className="flex items-center gap-1 bg-[#0c2a6b] border border-emerald-400/40 px-2 py-1 rounded-xl shadow-inner hover:border-emerald-300 cursor-pointer active:scale-95 transition"
          >
            <Gem className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-black text-emerald-300">
              {playerProfile.gems}
            </span>
            <span className="text-[10px] text-emerald-300 font-black ml-0.5">+</span>
          </button>
        </div>
      </div>

      {/* 2. SECTOR / ARENA HERO BANNER */}
      <div className="relative w-full rounded-2xl overflow-hidden mt-3 p-3.5 border-2 border-sky-300/50 shadow-[0_6px_25px_rgba(14,165,233,0.3)] bg-gradient-to-r from-[#1a4cb8] via-[#143d99] to-[#123687]">
        <div className="absolute top-0 right-0 w-36 h-36 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-sky-300 uppercase tracking-widest flex items-center gap-1">
              <Shield className="w-3 h-3 text-sky-300" /> Current Sector
            </span>
            <h2 className="text-base font-black text-white mt-0.5 drop-shadow">
              Sector {currentLevel.level}: {currentLevel.name}
            </h2>
            <span className="text-[11px] text-blue-100 mt-0.5">
              Opponent: <strong className="text-rose-300 font-black">{currentLevel.opponentName}</strong> (🏆 {currentLevel.opponentTrophies})
            </span>
          </div>

          {/* Sector Selector Arrows */}
          <div className="flex items-center gap-1 bg-[#0a235c] border border-blue-400/40 rounded-xl p-1 shadow">
            <button
              disabled={selectedSectorIndex <= 0}
              onClick={() => {
                sounds.playClick();
                onSelectSector(Math.max(0, selectedSectorIndex - 1));
              }}
              className="w-7 h-7 rounded-lg bg-[#153e96] hover:bg-[#1a4db8] flex items-center justify-center font-bold text-white disabled:opacity-30 cursor-pointer active:scale-95 transition"
            >
              ◀
            </button>
            <span className="text-xs font-black px-1.5 text-sky-200">
              {selectedSectorIndex + 1}/{levels.length}
            </span>
            <button
              disabled={selectedSectorIndex >= levels.length - 1}
              onClick={() => {
                sounds.playClick();
                onSelectSector(Math.min(levels.length - 1, selectedSectorIndex + 1));
              }}
              className="w-7 h-7 rounded-lg bg-[#153e96] hover:bg-[#1a4db8] flex items-center justify-center font-bold text-white disabled:opacity-30 cursor-pointer active:scale-95 transition"
            >
              ▶
            </button>
          </div>
        </div>

        {/* Win Reward Preview */}
        <div className="mt-2.5 pt-2 border-t border-white/20 flex items-center justify-between text-[11px] text-blue-100 font-bold">
          <span className="flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Win: +15 Trophies
          </span>
          <span className="flex items-center gap-1 text-yellow-300 font-black">
            <Coins className="w-3.5 h-3.5 text-yellow-400" /> +{currentLevel.rewardCoins} Coins
          </span>
        </div>
      </div>

      {/* 3. ACTIVE BATTLE DECK PREVIEW */}
      <div className="w-full mt-3 bg-[#0d2d70] border border-blue-400/40 rounded-2xl p-2.5 shadow">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-white">Battle Deck</span>
            <span className="text-[10px] font-black text-sky-300 bg-[#092257] px-2 py-0.5 rounded-full border border-sky-400/40">
              ⚡ Avg: {avgEnergy}
            </span>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onOpenDeckTab();
            }}
            className="text-[11px] font-bold text-sky-300 hover:text-sky-200 flex items-center gap-0.5 cursor-pointer active:scale-95 transition"
          >
            Manage Deck <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* 4 Active Hand Mini Cards */}
        <div className="grid grid-cols-4 gap-1.5">
          {activeDeck.slice(0, 4).map((card) => (
            <div
              key={card.id}
              onClick={() => {
                sounds.playClick();
                onOpenDeckTab();
              }}
              className="relative bg-gradient-to-b from-[#1848b3] to-[#123687] rounded-xl p-1.5 border border-sky-300/40 flex flex-col items-center shadow cursor-pointer active:scale-95 transition hover:border-yellow-300"
            >
              {/* Energy Pip */}
              <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 text-teal-950 font-black text-[9px] flex items-center justify-center shadow border border-white/60">
                {card.cost}
              </div>

              {/* Passive Ability Icon with refined pulse */}
              {card.passive && (
                <div
                  data-ability-active="true"
                  className="unit-indicator-icon absolute top-1 right-1 w-4 h-4 rounded-full bg-[#0a235c] border border-sky-300 text-[9px] flex items-center justify-center shadow"
                  title={`${card.passive.name}: ${card.passive.description}`}
                >
                  {card.passive.icon}
                </div>
              )}

              {/* Icon */}
              <div className="w-8 h-8 rounded-lg bg-[#0c2459] border border-blue-300/30 flex items-center justify-center text-lg mt-2 shadow-inner">
                {card.icon}
              </div>
              <span className="text-[10px] font-black text-white truncate max-w-full mt-1">
                {card.name.split(' ')[0]}
              </span>
              <span className="text-[8px] font-black text-amber-950 bg-amber-400 px-1.5 rounded-full mt-0.5 shadow">
                Lvl {card.level}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. CHEST SLOTS (4 SLOTS) */}
      <div className="w-full mt-3 bg-[#0d2d70] border border-blue-400/40 rounded-2xl p-2.5 shadow">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-black text-white flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-amber-400" /> Reward Chests
          </span>
          <span className="text-[10px] font-bold text-blue-200">
            {chestSlots.filter((c) => !c.isOpened).length}/4 Slots Full
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {chestSlots.map((slot) => {
            if (slot.isOpened) {
              return (
                <div
                  key={slot.id}
                  className="h-20 rounded-xl border-2 border-dashed border-blue-400/40 bg-[#092257]/60 flex flex-col items-center justify-center text-blue-200"
                >
                  <Lock className="w-4 h-4 mb-1 text-blue-300" />
                  <span className="text-[9px] font-bold">Empty</span>
                </div>
              );
            }

            const isUnlocking = slot.unlockStartedAt !== null;
            const elapsed = isUnlocking ? (Date.now() - slot.unlockStartedAt!) / 1000 : 0;
            const remaining = Math.max(0, slot.unlockDurationSeconds - elapsed);
            const isReady = isUnlocking && remaining <= 0;

            const tierColors = {
              wooden: 'from-amber-600 to-amber-800 border-amber-300 text-amber-100',
              silver: 'from-sky-600 to-blue-800 border-sky-300 text-white',
              gold: 'from-yellow-500 to-amber-600 border-yellow-200 text-yellow-100',
              magical: 'from-purple-600 to-indigo-800 border-fuchsia-300 text-white',
            }[slot.tier];

            const tierIcons = {
              wooden: '📦',
              silver: '🥈',
              gold: '🪙',
              magical: '✨',
            }[slot.tier];

            return (
              <button
                key={slot.id}
                onClick={() => {
                  if (isReady) {
                    onOpenChest(slot.id);
                  } else if (!isUnlocking) {
                    onStartUnlockChest(slot.id);
                  }
                }}
                className={`h-20 rounded-xl p-1 flex flex-col items-center justify-between border-2 bg-gradient-to-b ${tierColors} transition active:scale-95 cursor-pointer relative shadow ${
                  isReady ? 'animate-bounce shadow-[0_0_15px_rgba(250,204,21,0.6)]' : ''
                }`}
              >
                <span className="text-xl mt-0.5">{tierIcons}</span>
                <span className="text-[9px] font-black uppercase truncate max-w-full">
                  {slot.name.split(' ')[0]}
                </span>

                {isReady ? (
                  <span className="text-[8px] font-black bg-amber-400 text-amber-950 px-1 rounded-md animate-pulse shadow">
                    OPEN!
                  </span>
                ) : isUnlocking ? (
                  <span className="text-[8px] font-black text-sky-200 flex items-center gap-0.5 bg-[#092257] px-1 rounded border border-blue-400/40">
                    <Clock className="w-2.5 h-2.5" />
                    {Math.ceil(remaining)}s
                  </span>
                ) : (
                  <span className="text-[8px] font-black text-blue-100 bg-[#092257] px-1 rounded border border-blue-400/40">
                    Unlock
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. BIG BATTLE BUTTON & ACTION PROMPT */}
      <div className="w-full flex flex-col items-center my-3 shrink-0">
        <button
          onClick={() => {
            sounds.playClick();
            onStartBattle();
          }}
          className="group relative w-full max-w-xs py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 hover:from-amber-300 hover:to-red-400 text-amber-950 font-black text-xl tracking-wider shadow-[0_8px_30px_rgba(249,115,22,0.6)] border-2 border-white cursor-pointer active:scale-95 transition flex items-center justify-center gap-3 overflow-hidden"
        >
          {/* Shimmer sweep */}
          <div className="absolute inset-0 w-1/2 h-full bg-white/30 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />
          <Play className="w-6 h-6 fill-current text-amber-950" />
          <span>BATTLE</span>
          <Flame className="w-5 h-5 text-yellow-200 fill-current animate-pulse" />
        </button>
        <span className="text-[10px] font-bold text-blue-200 mt-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-sky-300" />
          Tap to enter the Red vs. Blue 50% territory clash!
        </span>
      </div>

      {/* 6. DEV & ARCHITECTURE SHORTCUTS */}
      <div className="w-full flex items-center justify-center gap-3 pt-1 border-t border-blue-400/30 text-blue-200 shrink-0">
        <button
          onClick={() => {
            sounds.playClick();
            onOpenUnityModal();
          }}
          className="text-[11px] font-black text-sky-200 hover:text-white flex items-center gap-1 bg-blue-900/60 px-2.5 py-1 rounded-lg border border-blue-300/40 cursor-pointer active:scale-95 shadow"
        >
          📱 Unity 3D Blueprint
        </button>
        <button
          onClick={() => {
            sounds.playClick();
            onOpenTechModal();
          }}
          className="text-[11px] font-black text-emerald-200 hover:text-white flex items-center gap-1 bg-blue-900/60 px-2.5 py-1 rounded-lg border border-emerald-300/40 cursor-pointer active:scale-95 shadow"
        >
          <Cpu className="w-3 h-3 text-emerald-300" /> Engine Architecture
        </button>
      </div>
    </div>
  );
};
