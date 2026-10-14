import React from 'react';
import { Timer, Pause } from 'lucide-react';
import { LevelConfig } from '../types';
import { renderAvatarSvg } from './AvatarSelectionModal';

interface HeaderHUDProps {
  bluePercent: number;
  redPercent: number;
  timeRemaining: number;
  currentLevel: LevelConfig;
  playerTrophies: number;
  playerName?: string;
  playerAvatarId?: string;
  playerCoins?: number;
  playerGems?: number;
  isVip?: boolean;
  onOpenAvatarModal?: () => void;
  onOpenLedger?: () => void;
  onOpenRewardedAd?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  isPaused?: boolean;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  bluePercent,
  redPercent,
  timeRemaining,
  currentLevel,
  playerName = 'You',
  playerAvatarId = 'kid_headphones',
  playerCoins = 0,
  playerGems = 0,
  isVip = false,
  onOpenAvatarModal,
  onOpenLedger,
  onOpenRewardedAd,
  isMuted,
  onToggleMute,
  onPause,
  isPaused = false,
}) => {
  // Smooth animated counter for coins
  const [displayedCoins, setDisplayedCoins] = React.useState(playerCoins);

  React.useEffect(() => {
    if (displayedCoins === playerCoins) return;
    const diff = playerCoins - displayedCoins;
    const step = Math.sign(diff) * Math.max(1, Math.ceil(Math.abs(diff) / 10));
    const timer = setTimeout(() => {
      setDisplayedCoins((prev) => {
        if (Math.abs(playerCoins - prev) <= Math.abs(step)) return playerCoins;
        return prev + step;
      });
    }, 30);
    return () => clearTimeout(timer);
  }, [playerCoins, displayedCoins]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full px-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))] pt-[max(0.25rem,env(safe-area-inset-top))] pb-1 select-none z-30 flex flex-col items-center bg-gradient-to-b from-[#1448b8]/75 via-[#123e9a]/40 to-transparent">
      {/* 1. Top Mini Status & Currency Bar */}
      <div className="w-full max-w-md flex items-center justify-between px-1 mb-1 text-[11px] font-black">
        {/* Currencies Pill Group */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Animated Coins Pill - Clickable to open Ledger */}
          <button
            onClick={onOpenLedger}
            title="Tap to view wallet audit ledger and transactions"
            className="flex items-center gap-1 bg-gradient-to-r from-[#1a55c6] to-[#2267ea] border border-amber-300/70 hover:border-yellow-300 px-2.5 py-0.5 rounded-full shadow-[0_2px_8px_rgba(245,158,11,0.25)] cursor-pointer active:scale-95 transition"
          >
            <span className="text-[11px] leading-none">🪙</span>
            <span className="text-yellow-300 font-black tracking-wide text-[10px] sm:text-xs">
              {displayedCoins}
            </span>
          </button>

          {/* Gems */}
          <button
            onClick={onOpenLedger}
            title="Tap to view wallet ledger"
            className="flex items-center gap-1 bg-gradient-to-r from-[#1a55c6] to-[#2267ea] border border-emerald-300/70 hover:border-emerald-200 px-2.5 py-0.5 rounded-full shadow-[0_2px_8px_rgba(16,185,129,0.25)] cursor-pointer active:scale-95 transition"
          >
            <span className="text-[11px] leading-none">💎</span>
            <span className="text-emerald-300 font-black tracking-wide text-[10px] sm:text-xs">
              {playerGems}
            </span>
          </button>

          {/* VIP Badge if active */}
          {isVip && (
            <div className="flex items-center gap-0.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 px-2 py-0.5 rounded-full shadow font-black text-[9px] border border-white">
              👑 VIP
            </div>
          )}
        </div>

        {/* Action Controls: Sound mute toggle & Pause button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleMute}
            className="w-6 h-6 rounded-full bg-gradient-to-b from-[#256cf0] to-[#1c55c5] border border-white/70 hover:from-[#2e74f8] hover:to-[#2262dc] flex items-center justify-center text-[11px] text-white active:scale-90 transition cursor-pointer shadow-md"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className={`w-6 h-6 rounded-full border border-white/80 hover:border-yellow-300 flex items-center justify-center text-white active:scale-90 transition cursor-pointer shadow-md ${
              isPaused
                ? 'bg-gradient-to-b from-amber-400 to-yellow-500 text-amber-950 ring-2 ring-yellow-300'
                : 'bg-gradient-to-b from-[#256cf0] to-[#1c55c5] hover:from-[#387bf8] hover:to-[#2262dc]'
            }`}
            title="Pause Match"
          >
            <Pause className="w-3 h-3 fill-current drop-shadow" />
          </button>
        </div>
      </div>

      {/* 2. Main Battle Header: Left Player, Center Score Bars & Timer, Right Opponent */}
      <div className="w-full max-w-md flex items-center justify-between gap-1.5 sm:gap-2 px-0.5">
        {/* Blue Player Profile (Left) - Clickable to open Avatar Selection */}
        <div
          onClick={onOpenAvatarModal}
          className="flex flex-col items-center cursor-pointer group active:scale-95 transition shrink-0"
          title="Tap to change avatar or edit name"
        >
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-b from-[#38bdf8] to-[#1d4ed8] border-2 border-white group-hover:border-yellow-300 shadow-md flex items-center justify-center overflow-hidden p-0.5">
            {/* Level Tag on top-left of avatar */}
            <div className="absolute top-0.5 left-0.5 bg-[#0284c7] text-white text-[8px] sm:text-[9px] font-black px-1 rounded-sm leading-none border border-white/80 z-10 shadow">
              {currentLevel.level}
            </div>
            {/* Dynamic Player Avatar */}
            {renderAvatarSvg(playerAvatarId, 'w-9 h-9 sm:w-10 sm:h-10 drop-shadow')}
          </div>
          {/* Blue Name Banner */}
          <div className="bg-gradient-to-r from-[#0284c7] to-[#2563eb] text-white font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full -mt-1.5 shadow border border-white truncate max-w-[68px] sm:max-w-[76px] text-center">
            {playerName}
          </div>
        </div>

        {/* Center: Dual Score Indicators, Territory Progress Bar & Timer (Responsive Proportional Flexbox Container) */}
        <div className="flex-1 min-w-0 flex flex-col items-center justify-center px-1 sm:px-2 w-full">
          {/* Territory % Tags: Proportional Flex Row */}
          <div className="w-full flex items-center justify-between px-1 mb-0.5 z-20">
            <span className="bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white font-black text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full shadow-md border-2 border-white leading-none shrink-0">
              {bluePercent}%
            </span>
            <span className="text-[10px] sm:text-[11px] font-black text-sky-100 tracking-wider uppercase opacity-95 drop-shadow truncate px-1">
              Territory
            </span>
            <span className="bg-gradient-to-r from-[#f43f5e] to-[#e11d48] text-white font-black text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full shadow-md border-2 border-white leading-none shrink-0">
              {redPercent}%
            </span>
          </div>

          {/* Split Color Territory Bar - Responsive fluid flexbox with light blue gradient container */}
          <div className="w-full h-3.5 sm:h-4 bg-gradient-to-r from-[#1746a8] via-[#1d57c7] to-[#1746a8] rounded-full p-0.5 border-2 border-white shadow-[0_3px_12px_rgba(14,165,233,0.35)] flex overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-[#0ea5e9] via-[#38bdf8] to-[#60a5fa] transition-all duration-300 rounded-l-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.6)]"
              style={{ width: `${bluePercent}%` }}
            />
            {/* Clean white separator line */}
            <div className="w-1 h-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)] z-10 shrink-0 rounded-full" />
            <div
              className="h-full bg-gradient-to-r from-[#fb7185] via-[#f43f5e] to-[#e11d48] transition-all duration-300 rounded-r-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.6)]"
              style={{ width: `${redPercent}%` }}
            />
          </div>

          {/* Match Countdown Clock (Responsive Proportional Flexbox Container) */}
          <div className="w-full flex items-center justify-center mt-1">
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#1a55c6] via-[#2267ea] to-[#1a55c6] border border-sky-300/70 px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black text-white shadow-md">
              <Timer className="w-3 h-3 text-sky-300 shrink-0" />
              <span className={timeRemaining < 30 ? 'text-amber-300 animate-pulse font-extrabold' : 'text-white'}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        </div>

        {/* Red Opponent Profile (Right) */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-b from-[#f87171] to-[#dc2626] border-2 border-white shadow-md flex items-center justify-center overflow-hidden p-0.5">
            {/* Level Tag on top-right of avatar */}
            <div className="absolute top-0.5 right-0.5 bg-[#b91c1c] text-white text-[8px] sm:text-[9px] font-black px-1 rounded-sm leading-none border border-white/80 z-10 shadow">
              {Math.max(1, currentLevel.level + 1)}
            </div>
            {/* Zombie / Red Trainer Monster avatar */}
            <svg viewBox="0 0 64 64" className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow">
              {/* Red Spiked Helmet */}
              <path d="M16 26 C16 14, 48 14, 48 26 L52 30 L12 30 Z" fill="#991b1b" />
              <path d="M32 10 L30 18 L34 18 Z" fill="#facc15" />
              {/* Face */}
              <circle cx="32" cy="34" r="15" fill="#86efac" />
              {/* Eyes */}
              <circle cx="26" cy="32" r="2.5" fill="#dc2626" />
              <circle cx="38" cy="32" r="2.5" fill="#dc2626" />
              {/* Stitch mouth */}
              <path d="M26 40 L38 40" stroke="#14532d" strokeWidth="2" strokeLinecap="round" />
              <path d="M29 38 L29 42 M35 38 L35 42" stroke="#14532d" strokeWidth="1.5" />
            </svg>
          </div>
          {/* Red Name Banner */}
          <div className="bg-gradient-to-r from-[#e11d48] to-[#b91c1c] text-white font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full -mt-1.5 shadow border border-white truncate max-w-[68px] sm:max-w-[76px] text-center">
            {currentLevel.opponentName || 'Trainer'}
          </div>
        </div>
      </div>
    </div>
  );
};
