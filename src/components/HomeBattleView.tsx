import React from 'react';
import { Crown, Trophy, Coins, Gem, Sparkles, Shield, ChevronRight, Clock, Lock, Gift, Flame, Cpu, Settings as SettingsIcon, Swords } from 'lucide-react';
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
  onOpenSettingsTab?: () => void;
  onOpenUnityModal: () => void;
  onOpenTechModal: () => void;
  onOpenAvatarModal: () => void;
  onOpenNoAdsModal: () => void;
  onOpenRewardedAd: (placementId: string) => void;
  onOpenDailyRewardModal: () => void;
  onOpenLedgerModal: () => void;
  onOpenEconomyModal: () => void;
  onOpenSectorModal?: () => void;
  onOpenDebugPanel?: () => void;
}

/**
 * High-fidelity stylized 3D Fantasy Royal Paladin Champion
 * Standing proudly atop the kingdom castle pedestal with sword and shield
 */
const renderCommanderHeroSvg = () => (
  <svg viewBox="0 0 160 180" className="w-36 h-40 sm:w-44 sm:h-48 drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]">
    <defs>
      <linearGradient id="knightSteel" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="40%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
      <linearGradient id="royalBlueArmor" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="50%" stopColor="#2563eb" />
        <stop offset="100%" stopColor="#1e3a8a" />
      </linearGradient>
      <linearGradient id="armorGold" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
      <linearGradient id="capeVelvet" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1d4ed8" />
        <stop offset="70%" stopColor="#172554" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="bladeRuneGlow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="#e0f2fe" />
        <stop offset="100%" stopColor="#38bdf8" />
      </linearGradient>
      <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Shadow on Pedestal */}
    <ellipse cx="80" cy="165" rx="46" ry="11" fill="#041235" opacity="0.65" />

    {/* Royal Cape Flapping Behind */}
    <path d="M48 64 C30 90, 24 140, 36 160 C50 162, 70 148, 80 135 C90 148, 110 162, 124 160 C136 140, 130 90, 112 64 Z" fill="url(#capeVelvet)" stroke="#1e3a8a" strokeWidth="2" />
    <path d="M36 160 C42 150, 48 152, 54 161" stroke="#f59e0b" strokeWidth="2" fill="none" />
    <path d="M106 161 C112 152, 118 150, 124 160" stroke="#f59e0b" strokeWidth="2" fill="none" />

    {/* Armored Legs & Greaves */}
    <g>
      {/* Left Greave */}
      <path d="M60 124 L56 156 L72 156 L72 124 Z" fill="url(#knightSteel)" stroke="#334155" strokeWidth="1.5" />
      <path d="M52 156 L76 156 L72 163 L50 163 Z" fill="url(#royalBlueArmor)" stroke="#f59e0b" strokeWidth="1.5" />
      <circle cx="64" cy="132" r="3.5" fill="url(#armorGold)" />
      {/* Right Greave */}
      <path d="M88 124 L88 156 L104 156 L100 124 Z" fill="url(#knightSteel)" stroke="#334155" strokeWidth="1.5" />
      <path d="M84 156 L108 156 L110 163 L88 163 Z" fill="url(#royalBlueArmor)" stroke="#f59e0b" strokeWidth="1.5" />
      <circle cx="96" cy="132" r="3.5" fill="url(#armorGold)" />
    </g>

    {/* Armored Belt & Faulds with Lion/Sun Buckle */}
    <path d="M54 112 L106 112 L100 128 L60 128 Z" fill="url(#royalBlueArmor)" stroke="#1e3a8a" strokeWidth="2" />
    <path d="M64 128 L72 140 L88 140 L96 128 Z" fill="url(#knightSteel)" stroke="#f59e0b" strokeWidth="1.5" />
    <circle cx="80" cy="120" r="7" fill="url(#armorGold)" stroke="#ffffff" strokeWidth="1" />
    <polygon points="80,115 82,118 85,118 83,121 84,124 80,122 76,124 77,121 75,118 78,118" fill="#78350f" />

    {/* Torso & Cuirass / Breastplate */}
    <path d="M46 64 L114 64 L104 112 L56 112 Z" fill="url(#royalBlueArmor)" stroke="#f59e0b" strokeWidth="2" />
    {/* Golden Inlaid Lion Crest / Fleur-de-lis */}
    <path d="M58 72 L70 72 L66 94 L56 90 Z" fill="url(#armorGold)" opacity="0.9" />
    <path d="M102 72 L90 72 L94 94 L104 90 Z" fill="url(#armorGold)" opacity="0.9" />
    <polygon points="80,72 86,84 80,98 74,84" fill="url(#armorGold)" stroke="#ffffff" strokeWidth="1" />

    {/* Left Arm & Royal Heraldic Shield */}
    <g>
      {/* Shoulder Pauldron */}
      <path d="M26 62 L48 58 L52 82 L30 84 Z" fill="url(#royalBlueArmor)" stroke="#f59e0b" strokeWidth="2" />
      <polygon points="26,62 38,58 38,76 26,78" fill="url(#armorGold)" />
      {/* Heraldic Shield */}
      <path d="M16 86 L44 82 L42 126 C42 142 30 152 30 152 C30 152 18 142 18 126 Z" fill="url(#royalBlueArmor)" stroke="#ffffff" strokeWidth="2" />
      {/* Shield Golden Border and Crossed Swords Emblem */}
      <path d="M20 90 L40 86 L38 124 C38 136 30 144 30 144 C30 144 22 136 22 124 Z" fill="#1e3a8a" stroke="url(#armorGold)" strokeWidth="1.5" />
      <polygon points="30,94 34,104 42,106 36,112 38,120 30,115 22,120 24,112 18,106 26,104" fill="url(#armorGold)" />
    </g>

    {/* Right Arm & Enchanted Runic Broadsword */}
    <g>
      {/* Right Shoulder Pauldron */}
      <path d="M134 62 L112 58 L108 82 L130 84 Z" fill="url(#royalBlueArmor)" stroke="#f59e0b" strokeWidth="2" />
      <polygon points="134,62 122,58 122,76 134,78" fill="url(#armorGold)" />
      {/* Forearm & Gauntlet */}
      <path d="M116 82 L128 82 L136 104 L124 106 Z" fill="url(#knightSteel)" stroke="#334155" strokeWidth="1.5" />
      {/* Sword Guard & Pommel */}
      <rect x="124" y="98" width="22" height="5" rx="2.5" fill="url(#armorGold)" stroke="#ffffff" strokeWidth="0.8" transform="rotate(-25 135 100)" />
      <circle cx="130" cy="112" r="4" fill="url(#armorGold)" />
      {/* Enchanted Broadsword Blade */}
      <polygon points="136,96 154,34 157,32 153,92" fill="url(#bladeRuneGlow)" stroke="#38bdf8" strokeWidth="1.5" filter="url(#glowEffect)" />
      <line x1="145" y1="88" x2="152" y2="44" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
    </g>

    {/* Knight's Greathelm with Golden Visor & Plume */}
    <g>
      {/* Plume / Feathers */}
      <path d="M80 12 C72 20 68 32 72 40 C76 34 84 32 80 12 Z" fill="#38bdf8" />
      <path d="M80 12 C88 20 92 32 88 40 C84 34 76 32 80 12 Z" fill="#2563eb" />
      <path d="M80 8 C80 20 84 30 80 40" stroke="#f59e0b" strokeWidth="2" />

      {/* Main Helmet Shell */}
      <path d="M58 40 L102 40 L106 66 L80 74 L54 66 Z" fill="url(#knightSteel)" stroke="#1e293b" strokeWidth="2" />
      {/* Golden Crown Rim */}
      <path d="M56 42 L104 42 L102 48 L58 48 Z" fill="url(#armorGold)" stroke="#ffffff" strokeWidth="0.8" />
      {/* Cross-shaped Visor Slits with Heroic Blue Eyes */}
      <path d="M64 54 L96 54 L94 62 L66 62 Z" fill="#0f172a" />
      <line x1="68" y1="58" x2="92" y2="58" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" filter="url(#glowEffect)" />
      <line x1="80" y1="52" x2="80" y2="66" stroke="#f59e0b" strokeWidth="1.5" />
    </g>
  </svg>
);

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
  onOpenSettingsTab,
  onOpenUnityModal,
  onOpenTechModal,
  onOpenAvatarModal,
  onOpenNoAdsModal,
  onOpenRewardedAd,
  onOpenDailyRewardModal,
  onOpenLedgerModal,
  onOpenEconomyModal,
  onOpenSectorModal,
  onOpenDebugPanel,
}) => {
  const avgEnergy = (
    activeDeck.reduce((acc, c) => acc + c.cost, 0) / (activeDeck.length || 1)
  ).toFixed(1);

  // Trophy Road target for current sector (e.g. 70 trophies for sector 2)
  const targetTrophies = currentLevel.level * 50;
  const trophyProgress = Math.min(100, Math.round((playerProfile.trophies / targetTrophies) * 100));

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-y-auto overflow-x-hidden scroll-touch px-3 pt-2 pb-6 select-none bg-gradient-to-b from-[#1769D2] via-[#124d9c] to-[#17345D] text-white font-body">
      {/* ======================================================== */}
      {/* 1. TOP CURRENCY & PROFILE BAR (Royal Fantasy Arena)      */}
      {/* ======================================================== */}
      <div className="w-full flex items-center justify-between gap-1 shrink-0 pt-0.5">
        {/* Profile Avatar Pill - Tap to change avatar/name */}
        <div
          onClick={() => {
            sounds.playClick();
            onOpenAvatarModal();
          }}
          className="flex items-center gap-1.5 cursor-pointer group active:scale-95 transition bg-[#17345D] hover:bg-[#1f4273] border-2 border-[#FFC83D] pl-1 pr-2.5 py-1 rounded-2xl shadow-[0_4px_12px_rgba(23,52,93,0.5)]"
          title="Tap to change avatar or edit player name"
        >
          <div className="relative">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#1769D2] to-[#17345D] p-0.5 shadow border-2 border-white group-hover:border-[#FFC83D] flex items-center justify-center overflow-hidden">
              {renderAvatarSvg(playerProfile.avatarId || 'kid_headphones', 'w-8 h-8 sm:w-9 sm:h-9')}
            </div>
            {playerProfile.isVip && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#FFC83D] text-[#4a2800] text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white shadow">
                <Crown className="w-2.5 h-2.5 fill-current" />
              </span>
            )}
            <span className="absolute -bottom-1 -left-1 bg-[#FFC83D] text-[#4a2800] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#17345D] shadow">
              {playerProfile.level}
            </span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] sm:text-xs font-display tracking-wide text-white group-hover:text-[#FFC83D] truncate max-w-[80px] sm:max-w-[100px]">
              {playerProfile.name}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-[#FFC83D] font-black game-counter">
              <Trophy className="w-3 h-3 text-[#FFC83D] fill-[#FFC83D]" />
              <span>{playerProfile.trophies}</span>
            </div>
          </div>
        </div>

        {/* Currencies Pills & Settings Gear */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Gold Coins Pill */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenLedgerModal();
            }}
            title="Coins - tap for wallet ledger"
            className="flex items-center gap-1 bg-[#17345D] border-2 border-[#FFC83D] hover:border-yellow-200 px-2 py-1 rounded-xl shadow cursor-pointer active:scale-95 transition min-h-[32px]"
          >
            <span className="text-xs leading-none">🪙</span>
            <span className="text-xs font-extrabold text-[#FFC83D] game-counter">
              {playerProfile.coins}
            </span>
            <span className="text-[9px] text-[#4a2800] font-extrabold bg-[#FFC83D] w-3.5 h-3.5 rounded-full flex items-center justify-center ml-0.5 shadow-sm">
              +
            </span>
          </button>

          {/* Gems Pill */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenShopTab();
            }}
            title="Gems - tap to open shop"
            className="flex items-center gap-1 bg-[#17345D] border-2 border-[#79B957] hover:border-emerald-300 px-2 py-1 rounded-xl shadow cursor-pointer active:scale-95 transition min-h-[32px]"
          >
            <span className="text-xs leading-none">💎</span>
            <span className="text-xs font-extrabold text-[#9ae275] game-counter">
              {playerProfile.gems}
            </span>
            <span className="text-[9px] text-[#123105] font-extrabold bg-[#79B957] w-3.5 h-3.5 rounded-full flex items-center justify-center ml-0.5 shadow-sm">
              +
            </span>
          </button>

          {/* Settings Cog Icon */}
          <button
            onClick={() => {
              sounds.playClick();
              if (onOpenSettingsTab) {
                onOpenSettingsTab();
              } else {
                onOpenTechModal();
              }
            }}
            title="Settings"
            className="w-8 h-8 rounded-xl bg-[#17345D] hover:bg-[#1f4273] border-2 border-[#3b68a8] hover:border-[#FFC83D] flex items-center justify-center text-sky-200 hover:text-white cursor-pointer active:scale-95 transition shadow"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SECTOR BANNER (Royal Fantasy Arena)                   */}
      {/* ======================================================== */}
      <div className="w-full flex items-center justify-center gap-1.5 my-1.5 shrink-0">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#17345D] via-[#1769D2] to-[#17345D] border-2 border-[#FFC83D] px-3.5 py-1 rounded-full shadow-[0_4px_16px_rgba(23,52,93,0.6)]">
          <button
            disabled={selectedSectorIndex <= 0}
            onClick={() => {
              sounds.playClick();
              onSelectSector(Math.max(0, selectedSectorIndex - 1));
            }}
            className="text-[#FFC83D] hover:text-white disabled:opacity-20 text-xs font-black px-1.5 py-0.5 cursor-pointer active:scale-90 transition font-display"
            title="Previous Realm"
          >
            ◀
          </button>
          
          {/* Clickable Sector Label to open full Sector Selection Map */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenSectorModal?.();
            }}
            className="flex items-center gap-1.5 px-2 cursor-pointer hover:scale-102 active:scale-98 transition"
            title="Tap to open Realm Map"
          >
            <span className="text-xs font-display text-[#FFC83D] uppercase tracking-widest">
              Sector {currentLevel.level}:
            </span>
            <span className="text-xs sm:text-sm font-display text-white drop-shadow truncate max-w-[140px]">
              {currentLevel.name}
            </span>
          </button>

          <button
            disabled={selectedSectorIndex >= levels.length - 1}
            onClick={() => {
              sounds.playClick();
              onSelectSector(Math.min(levels.length - 1, selectedSectorIndex + 1));
            }}
            className="text-sky-300 hover:text-white disabled:opacity-20 text-xs font-black px-1.5 py-0.5 cursor-pointer active:scale-90 transition font-display"
            title="Next Realm"
          >
            ▶
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. CENTRAL 3D PEDESTAL & HERO SHOWCASE (Reference 110.2s) */}
      {/* ======================================================== */}
      <div className="relative w-full flex-1 min-h-[190px] sm:min-h-[220px] max-h-[260px] flex items-center justify-center my-auto overflow-visible">
        {/* Ambient Halo & Energy Beams */}
        <div className="absolute w-56 h-56 rounded-full bg-sky-400/20 blur-3xl pointer-events-none" />

        {/* Left Floating Action Badges */}
        <div className="absolute left-1 top-2 flex flex-col gap-2 z-20">
          {/* Starter Bundle / VIP No Ads */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenNoAdsModal();
            }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#2055be] via-[#1a449e] to-[#123175] border-2 border-amber-400 border-b-4 border-b-amber-600 flex flex-col items-center justify-center shadow-[0_4px_16px_rgba(251,191,36,0.5)] cursor-pointer active:translate-y-1 active:border-b-2 transition group animate-bounce"
            title="VIP No Ads Starter Pack"
          >
            <Crown className="w-5 h-5 text-amber-400 fill-amber-400 group-hover:scale-110 transition" />
            <span className="text-[9px] font-display text-yellow-300 uppercase leading-none mt-0.5">
              VIP
            </span>
          </button>

          {/* 7-Day Daily Vault Streak */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenDailyRewardModal();
            }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#2055be] via-[#1a449e] to-[#123175] border-2 border-sky-300 border-b-4 border-b-sky-700 flex flex-col items-center justify-center shadow-[0_4px_16px_rgba(56,189,248,0.4)] cursor-pointer active:translate-y-1 active:border-b-2 transition group"
            title="7-Day Daily Rewards Calendar"
          >
            <span className="text-xl group-hover:scale-110 transition select-none">🎁</span>
            <span className="text-[9px] font-display text-sky-200 uppercase leading-none mt-0.5">
              Vault
            </span>
          </button>
        </div>

        {/* Center 3D Pedestal Stage */}
        <div className="relative flex flex-col items-center justify-center z-10">
          {/* Animated 3D Floating Hero Mascot */}
          <div className="animate-float cursor-pointer hover:scale-105 transition-transform" onClick={() => sounds.playBattleHorns()}>
            {renderCommanderHeroSvg()}
          </div>

          {/* 3D Fantasy Kingdom Castle Dais & Stone Pedestal Platform */}
          <div className="relative -mt-6 w-48 sm:w-56 h-14 flex items-center justify-center pointer-events-none">
            {/* Outer Magical Aura Glow */}
            <div className="absolute inset-x-0 bottom-1 h-9 rounded-[100%] bg-gradient-to-r from-emerald-500/30 via-sky-400/40 to-amber-400/30 blur-md shadow-[0_0_30px_rgba(56,189,248,0.6)]" />
            
            {/* Carved Stone Turret Base with Green Grass & Gold Trim */}
            <div className="absolute inset-x-2 bottom-2 h-8 rounded-[100%] bg-gradient-to-b from-[#b8b7a8] via-[#8f8e80] to-[#5a5950] border-2 border-[#ffc84a] shadow-[0_6px_12px_rgba(0,0,0,0.6)] flex items-center justify-center overflow-hidden">
              {/* Inner Grass & Flagstone Inset */}
              <div className="w-[88%] h-5 rounded-[100%] bg-gradient-to-b from-[#79b957] via-[#5e9e3c] to-[#3f6e27] border border-[#b7de78] flex items-center justify-center">
                {/* Gold Crest / Cross Center */}
                <div className="w-16 h-2 rounded-[100%] bg-[#ffc84a]/70 shadow-sm" />
              </div>
            </div>
          </div>

          {/* Sector Progression Tag below pedestal (Warm Parchment Banner - Tap to open Map) */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenSectorModal?.();
            }}
            className="parchment-panel px-3.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-display text-[#3b2207] shadow-[0_4px_12px_rgba(23,52,93,0.4)] flex items-center gap-1.5 -mt-1 z-20 cursor-pointer hover:scale-105 active:scale-95 transition"
            title="Tap to browse and select Battle Realms"
          >
            <Shield className="w-3.5 h-3.5 text-[#b3830c]" />
            <span>Realm: <strong className="text-[#3b2207] font-display">{currentLevel.name}</strong> • <strong className="text-[#946927] game-counter font-extrabold">{targetTrophies} 🏆</strong></span>
          </button>
        </div>

        {/* Right Floating Action Badges */}
        <div className="absolute right-1 top-2 flex flex-col gap-2 z-20">
          {/* Daily Spin Wheel Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenSpinTab();
            }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#1c75e8] via-[#1769D2] to-[#17345D] border-2 border-[#FFC83D] border-b-4 border-b-[#8c6000] flex flex-col items-center justify-center shadow-[0_4px_16px_rgba(255,200,61,0.4)] cursor-pointer active:translate-y-1 active:border-b-2 transition group relative"
            title="Daily Lucky Spin"
          >
            <span className="text-xl group-hover:rotate-45 transition-transform duration-300 select-none">🎡</span>
            <span className="text-[9px] font-display text-[#FFC83D] uppercase leading-none mt-0.5">
              Spin
            </span>
            {/* Red FREE notification pill */}
            <span className="absolute -top-1.5 -right-1 bg-[#F04452] text-white text-[7px] font-display px-1.5 rounded-full border border-white animate-pulse shadow">
              FREE
            </span>
          </button>

          {/* Rewarded Ad Free Coins */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenRewardedAd('placement_home_reward');
            }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#1c75e8] via-[#1769D2] to-[#17345D] border-2 border-[#79B957] border-b-4 border-b-[#285014] flex flex-col items-center justify-center shadow-[0_4px_16px_rgba(121,185,87,0.4)] cursor-pointer active:translate-y-1 active:border-b-2 transition group relative"
            title="Watch Rewarded Video Ad"
          >
            <span className="text-xl group-hover:scale-110 transition select-none">▶️</span>
            <span className="text-[8px] font-display text-[#9ae275] uppercase leading-none mt-0.5">
              +100🪙
            </span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. TROPHY ROAD PROGRESS BAR (Royal Fantasy Arena)        */}
      {/* ======================================================== */}
      <div className="w-full max-w-sm mx-auto my-1 bg-[#17345D] border-2 border-[#FFC83D]/60 rounded-xl px-2.5 py-1.5 shadow-[0_4px_12px_rgba(23,52,93,0.5)] shrink-0">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-[#FFC83D] font-display flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-[#FFC83D]" /> Trophy Road
          </span>
          <span className="text-[#FFC83D] game-counter font-extrabold text-xs">
            {playerProfile.trophies} / {targetTrophies} 🏆
          </span>
        </div>
        <div className="w-full h-2.5 bg-[#0f2444] rounded-full p-0.5 border border-[#3b68a8] flex overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FFC83D] via-[#ffe071] to-[#e6a715] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(255,200,61,0.8)]"
            style={{ width: `${trophyProgress}%` }}
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. THE ICONIC VICTORY GOLD "BATTLE" BUTTON               */}
      {/* ======================================================== */}
      <div className="w-full max-w-sm mx-auto my-1 shrink-0">
        <button
          onClick={() => {
            sounds.playClick();
            onStartBattle();
          }}
          className="btn-royal-gold group relative w-full py-4 px-4 rounded-2xl cursor-pointer flex items-center justify-between overflow-hidden shadow-[0_10px_30px_rgba(255,200,61,0.5)]"
        >
          {/* Left Industrial Caution / Hazard Diagonal Stripes */}
          <div className="flex items-center gap-1 opacity-80 pl-1 select-none pointer-events-none">
            <span className="text-xl sm:text-2xl font-black text-[#5c3c00]/70 -skew-x-12">/</span>
            <span className="text-xl sm:text-2xl font-black text-[#5c3c00]/70 -skew-x-12">/</span>
            <span className="text-xl sm:text-2xl font-black text-[#5c3c00]/70 -skew-x-12">/</span>
          </div>

          {/* Central Bold 3D BATTLE Text */}
          <div className="flex items-center gap-2">
            <Swords className="w-6 h-6 sm:w-7 sm:h-7 text-[#4a2800] fill-[#4a2800] drop-shadow group-hover:rotate-12 transition-transform" />
            <span className="text-2xl sm:text-3xl font-display text-[#4a2800] tracking-wider uppercase drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
              BATTLE
            </span>
          </div>

          {/* Right Industrial Caution / Hazard Diagonal Stripes */}
          <div className="flex items-center gap-1 opacity-80 pr-1 select-none pointer-events-none">
            <span className="text-xl sm:text-2xl font-black text-[#5c3c00]/70 -skew-x-12">/</span>
            <span className="text-xl sm:text-2xl font-black text-[#5c3c00]/70 -skew-x-12">/</span>
            <span className="text-xl sm:text-2xl font-black text-[#5c3c00]/70 -skew-x-12">/</span>
          </div>

          {/* Ambient Glint Shimmer Sweep */}
          <div className="absolute inset-0 w-1/3 h-full bg-white/40 skew-x-12 -translate-x-full group-hover:translate-x-[400%] transition-transform duration-1000 pointer-events-none" />
        </button>
      </div>

      {/* ======================================================== */}
      {/* 6. DECK QUICK PREVIEW & CHEST SLOTS                      */}
      {/* ======================================================== */}
      <div className="w-full max-w-sm mx-auto flex flex-col gap-1.5 shrink-0 mt-1">
        {/* Active Hand Preview Bar (Royal Fantasy Arena) */}
        <div className="w-full bg-[#17345D] border-2 border-[#3b68a8] rounded-xl p-2 flex items-center justify-between shadow-[0_4px_12px_rgba(23,52,93,0.5)]">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-display text-[#FFC83D] uppercase tracking-wider">Deck:</span>
            <div className="flex gap-1.5">
              {activeDeck.slice(0, 4).map((card) => (
                <div
                  key={card.id}
                  onClick={() => {
                    sounds.playClick();
                    onOpenDeckTab();
                  }}
                  className="w-7 h-8 rounded-lg bg-gradient-to-b from-[#1c75e8] to-[#17345D] border-2 border-[#FFC83D]/70 flex flex-col items-center justify-center cursor-pointer hover:border-[#FFC83D] relative shadow active:scale-90 transition"
                  title={card.name}
                >
                  <span className="text-xs select-none">{card.icon}</span>
                  <span className="absolute -bottom-1 -right-1 bg-[#79B957] text-[#123105] text-[8px] game-counter font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white shadow">
                    {card.cost}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenDeckTab();
            }}
            className="text-[11px] font-display text-[#FFC83D] hover:text-white flex items-center gap-0.5 cursor-pointer active:scale-95 transition"
          >
            Cards <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Chest Slots Row with Chunky Royal 3D Borders */}
        <div className="grid grid-cols-4 gap-1.5 w-full">
          {chestSlots.map((slot) => {
            if (slot.isOpened) {
              return (
                <div
                  key={slot.id}
                  className="h-16 rounded-xl border-2 border-dashed border-[#3b68a8]/60 bg-[#0f2444]/60 flex flex-col items-center justify-center text-blue-200"
                >
                  <Lock className="w-3.5 h-3.5 mb-0.5 text-blue-300/70" />
                  <span className="text-[9px] font-body font-semibold">Empty</span>
                </div>
              );
            }

            const isUnlocking = slot.unlockStartedAt !== null;
            const elapsed = isUnlocking ? (Date.now() - slot.unlockStartedAt!) / 1000 : 0;
            const remaining = Math.max(0, slot.unlockDurationSeconds - elapsed);
            const isReady = isUnlocking && remaining <= 0;

            const tierColors = {
              wooden: 'from-amber-600 to-amber-900 border-[#d4a962] border-b-[#5c3c00] text-amber-100',
              silver: 'from-[#2b589a] to-[#17345D] border-sky-300 border-b-[#0b1c36] text-white',
              gold: 'from-[#FFC83D] via-[#e6a715] to-[#8c6000] border-yellow-100 border-b-[#5c3c00] text-amber-950',
              magical: 'from-purple-600 to-indigo-950 border-fuchsia-300 border-b-purple-950 text-white',
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
                className={`h-16 rounded-xl p-1 flex flex-col items-center justify-between border-2 border-b-4 bg-gradient-to-b ${tierColors} transition active:translate-y-1 active:border-b-2 cursor-pointer relative shadow ${
                  isReady ? 'animate-bounce shadow-[0_0_14px_rgba(255,200,61,0.8)] border-[#FFC83D]' : ''
                }`}
              >
                <span className="text-base select-none">{tierIcons}</span>
                <span className="text-[9px] font-display uppercase truncate max-w-full leading-none">
                  {slot.name.split(' ')[0]}
                </span>
                {isReady ? (
                  <span className="text-[8px] font-display bg-[#FFC83D] text-[#4a2800] px-1.5 py-0.2 rounded-sm animate-pulse shadow">
                    OPEN!
                  </span>
                ) : isUnlocking ? (
                  <span className="text-[8px] game-counter font-extrabold text-sky-200 flex items-center gap-0.5 bg-[#17345D] px-1 rounded-sm border border-[#3b68a8]">
                    <Clock className="w-2 h-2 text-[#FFC83D]" />
                    {Math.ceil(remaining)}s
                  </span>
                ) : (
                  <span className="text-[8px] font-display text-blue-100 bg-[#17345D] px-1.5 rounded-sm border border-[#3b68a8]">
                    Unlock
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
