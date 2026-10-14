import React from 'react';
import { Play, Trophy, Coins, Gem, Sparkles, Shield, ChevronRight, Clock, Lock, Gift, Flame, Cpu } from 'lucide-react';
import { PlayerProfile, ChestSlot, Card, LevelConfig } from '../types';
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
  onOpenSpinTab,
  onOpenUnityModal,
  onOpenTechModal,
}) => {
  const avgEnergy = (
    activeDeck.reduce((acc, c) => acc + c.cost, 0) / (activeDeck.length || 1)
  ).toFixed(1);

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-y-auto overflow-x-hidden p-3.5 select-none bg-gradient-to-b from-[#0c1322] via-[#091122] to-[#070b14] text-white">
      {/* 1. TOP CURRENCY & PROFILE BAR */}
      <div className="w-full flex items-center justify-between gap-2 shrink-0">
        {/* Profile Avatar & Level */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 p-0.5 shadow-md border border-white/30 flex items-center justify-center text-xl">
              🧑‍🚀
            </div>
            <span className="absolute -bottom-1 -left-1 bg-amber-400 text-slate-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0c1322] shadow">
              {playerProfile.level}
            </span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-black tracking-wide text-white">
              {playerProfile.name}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-14 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full"
                  style={{
                    width: `${Math.min(100, (playerProfile.exp / playerProfile.maxExp) * 100)}%`,
                  }}
                />
              </div>
              <span className="text-[9px] font-bold text-slate-400">
                {playerProfile.exp}/{playerProfile.maxExp}
              </span>
            </div>
          </div>
        </div>

        {/* Currencies Pills */}
        <div className="flex items-center gap-1.5">
          {/* Trophies */}
          <div className="flex items-center gap-1 bg-black/40 border border-amber-500/30 px-2 py-1 rounded-xl shadow-inner">
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
            className="flex items-center gap-1 bg-black/40 border border-yellow-500/30 px-2 py-1 rounded-xl shadow-inner hover:border-yellow-400 cursor-pointer active:scale-95 transition"
          >
            <Coins className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs font-black text-yellow-300">
              {playerProfile.coins}
            </span>
            <span className="text-[10px] text-yellow-400 font-black ml-0.5">+</span>
          </button>

          {/* Gems */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenShopTab();
            }}
            className="flex items-center gap-1 bg-black/40 border border-emerald-500/30 px-2 py-1 rounded-xl shadow-inner hover:border-emerald-400 cursor-pointer active:scale-95 transition"
          >
            <Gem className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-black text-emerald-300">
              {playerProfile.gems}
            </span>
            <span className="text-[10px] text-emerald-400 font-black ml-0.5">+</span>
          </button>
        </div>
      </div>

      {/* 2. SECTOR / ARENA HERO BANNER */}
      <div className="relative w-full rounded-2xl overflow-hidden mt-3 p-3.5 border border-sky-500/30 shadow-[0_8px_25px_rgba(14,165,233,0.15)] bg-gradient-to-r from-blue-900/90 via-slate-900 to-indigo-950/90">
        <div className="absolute top-0 right-0 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest flex items-center gap-1">
              <Shield className="w-3 h-3 text-sky-400" /> Current Sector
            </span>
            <h2 className="text-base font-black text-white mt-0.5">
              Sector {currentLevel.level}: {currentLevel.name}
            </h2>
            <span className="text-[11px] text-slate-300 mt-0.5">
              Opponent: <strong className="text-rose-400">{currentLevel.opponentName}</strong> (🏆 {currentLevel.opponentTrophies})
            </span>
          </div>

          {/* Sector Selector Arrows */}
          <div className="flex items-center gap-1 bg-black/40 border border-slate-700/60 rounded-xl p-1">
            <button
              disabled={selectedSectorIndex <= 0}
              onClick={() => {
                sounds.playClick();
                onSelectSector(Math.max(0, selectedSectorIndex - 1));
              }}
              className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-300 disabled:opacity-30 cursor-pointer"
            >
              ◀
            </button>
            <span className="text-xs font-black px-1 text-sky-300">
              {selectedSectorIndex + 1}/{levels.length}
            </span>
            <button
              disabled={selectedSectorIndex >= levels.length - 1}
              onClick={() => {
                sounds.playClick();
                onSelectSector(Math.min(levels.length - 1, selectedSectorIndex + 1));
              }}
              className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-300 disabled:opacity-30 cursor-pointer"
            >
              ▶
            </button>
          </div>
        </div>

        {/* Win Reward Preview */}
        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
          <span className="flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Win: +15 Trophies
          </span>
          <span className="flex items-center gap-1 text-yellow-300 font-bold">
            <Coins className="w-3.5 h-3.5 text-yellow-400" /> +{currentLevel.rewardCoins} Coins
          </span>
        </div>
      </div>

      {/* 3. ACTIVE BATTLE DECK PREVIEW */}
      <div className="w-full mt-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-2.5">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-slate-200">Battle Deck</span>
            <span className="text-[10px] font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded-full border border-sky-800">
              ⚡ Avg: {avgEnergy}
            </span>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onOpenDeckTab();
            }}
            className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-0.5 cursor-pointer"
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
              className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl p-1.5 border border-slate-700/80 flex flex-col items-center shadow cursor-pointer active:scale-95 transition"
            >
              {/* Energy Pip */}
              <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-[9px] flex items-center justify-center shadow">
                {card.cost}
              </div>

              {/* Passive Ability Icon with refined pulse */}
              {card.passive && (
                <div
                  data-ability-active="true"
                  className="unit-indicator-icon absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-950/90 border border-sky-400/80 text-[9px] flex items-center justify-center"
                  title={`${card.passive.name}: ${card.passive.description}`}
                >
                  {card.passive.icon}
                </div>
              )}

              {/* Icon */}
              <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-lg mt-2">
                {card.icon}
              </div>
              <span className="text-[10px] font-bold text-white truncate max-w-full mt-1">
                {card.name.split(' ')[0]}
              </span>
              <span className="text-[8px] font-black text-amber-400 bg-black/50 px-1.5 rounded-full mt-0.5">
                Lvl {card.level}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. CHEST SLOTS (4 SLOTS) */}
      <div className="w-full mt-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-2.5">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-black text-slate-200 flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-amber-400" /> Reward Chests
          </span>
          <span className="text-[10px] font-bold text-slate-400">
            {chestSlots.filter((c) => !c.isOpened).length}/4 Slots Full
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {chestSlots.map((slot) => {
            if (slot.isOpened) {
              return (
                <div
                  key={slot.id}
                  className="h-20 rounded-xl border border-dashed border-slate-700/60 bg-black/20 flex flex-col items-center justify-center text-slate-500"
                >
                  <Lock className="w-4 h-4 mb-1 text-slate-600" />
                  <span className="text-[9px] font-bold">Empty</span>
                </div>
              );
            }

            const isUnlocking = slot.unlockStartedAt !== null;
            const elapsed = isUnlocking ? (Date.now() - slot.unlockStartedAt!) / 1000 : 0;
            const remaining = Math.max(0, slot.unlockDurationSeconds - elapsed);
            const isReady = isUnlocking && remaining <= 0;

            const tierColors = {
              wooden: 'from-amber-900 to-amber-950 border-amber-600/60 text-amber-300',
              silver: 'from-slate-600 to-slate-800 border-slate-400/60 text-slate-200',
              gold: 'from-yellow-600 to-amber-800 border-yellow-400/80 text-yellow-300',
              magical: 'from-purple-800 to-indigo-950 border-fuchsia-400/80 text-fuchsia-300',
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
                className={`h-20 rounded-xl p-1 flex flex-col items-center justify-between border bg-gradient-to-b ${tierColors} transition active:scale-95 cursor-pointer relative shadow ${
                  isReady ? 'animate-bounce shadow-[0_0_15px_rgba(250,204,21,0.6)]' : ''
                }`}
              >
                <span className="text-xl mt-0.5">{tierIcons}</span>
                <span className="text-[9px] font-black uppercase truncate max-w-full">
                  {slot.name.split(' ')[0]}
                </span>

                {isReady ? (
                  <span className="text-[8px] font-black bg-amber-400 text-slate-950 px-1 rounded-md animate-pulse">
                    OPEN!
                  </span>
                ) : isUnlocking ? (
                  <span className="text-[8px] font-bold text-sky-300 flex items-center gap-0.5 bg-black/60 px-1 rounded">
                    <Clock className="w-2.5 h-2.5" />
                    {Math.ceil(remaining)}s
                  </span>
                ) : (
                  <span className="text-[8px] font-bold text-slate-300 bg-black/60 px-1 rounded">
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
          className="group relative w-full max-w-xs py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 hover:from-amber-300 hover:to-red-400 text-slate-950 font-black text-xl tracking-wider shadow-[0_8px_30px_rgba(249,115,22,0.6)] border-2 border-white cursor-pointer active:scale-95 transition flex items-center justify-center gap-3 overflow-hidden"
        >
          {/* Shimmer sweep */}
          <div className="absolute inset-0 w-1/2 h-full bg-white/25 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />
          <Play className="w-6 h-6 fill-current text-slate-950" />
          <span>BATTLE</span>
          <Flame className="w-5 h-5 text-yellow-200 fill-current animate-pulse" />
        </button>
        <span className="text-[10px] font-bold text-slate-400 mt-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-sky-400" />
          Tap to enter the Red vs. Blue 50% territory clash!
        </span>
      </div>

      {/* 6. DEV & ARCHITECTURE SHORTCUTS */}
      <div className="w-full flex items-center justify-center gap-3 pt-1 border-t border-slate-800/60 text-slate-400 shrink-0">
        <button
          onClick={() => {
            sounds.playClick();
            onOpenUnityModal();
          }}
          className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-800/80 cursor-pointer active:scale-95"
        >
          📱 Unity 3D Blueprint
        </button>
        <button
          onClick={() => {
            sounds.playClick();
            onOpenTechModal();
          }}
          className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/80 cursor-pointer active:scale-95"
        >
          <Cpu className="w-3 h-3" /> Engine Architecture
        </button>
      </div>
    </div>
  );
};
