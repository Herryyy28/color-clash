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
  opponentAvatarId?: string;
  opponentName?: string;
  opponentLevel?: number;
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
  opponentAvatarId,
  opponentName,
  opponentLevel,
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
    <div className="w-full shrink-0 px-2 pt-1 pb-1 select-none z-30 flex flex-col items-center bg-gradient-to-b from-[#17345D] via-[#17345D]/70 to-transparent font-body">
      {/* 1. Top Mini Status & Currency Bar */}
      <div className="w-full max-w-md flex items-center justify-between px-1 mb-1 text-[11px] font-black">
        {/* Currencies Pill Group */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Animated Coins Pill - Clickable to open Ledger */}
          <button
            onClick={onOpenLedger}
            title="Tap to view wallet audit ledger and transactions"
            className="flex items-center gap-1.5 bg-[#17345D] border-2 border-[#FFC83D] hover:border-yellow-200 px-2.5 py-0.5 rounded-full shadow-[0_2px_8px_rgba(255,200,61,0.35)] cursor-pointer active:scale-95 transition min-h-[28px]"
          >
            <span className="text-xs leading-none">🪙</span>
            <span className="text-[#FFC83D] game-counter font-extrabold text-[11px] sm:text-xs">
              {displayedCoins}
            </span>
          </button>

          {/* Gems */}
          <button
            onClick={onOpenLedger}
            title="Tap to view wallet ledger"
            className="flex items-center gap-1.5 bg-[#17345D] border-2 border-[#79B957] hover:border-emerald-200 px-2.5 py-0.5 rounded-full shadow-[0_2px_8px_rgba(121,185,87,0.35)] cursor-pointer active:scale-95 transition min-h-[28px]"
          >
            <span className="text-xs leading-none">💎</span>
            <span className="text-[#9ae275] game-counter font-extrabold text-[11px] sm:text-xs">
              {playerGems}
            </span>
          </button>

          {/* VIP Badge if active */}
          {isVip && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-[#ffe071] via-[#FFC83D] to-[#d49b10] text-[#4a2800] px-2.5 py-0.5 rounded-full shadow font-display text-[9px] border border-white">
              👑 VIP
            </div>
          )}
        </div>

        {/* Action Controls: Sound mute toggle & Pause button (Accessible 32x32px touch targets) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleMute}
            className="w-8 h-8 rounded-full bg-[#1769D2] hover:bg-[#1c75e8] border-2 border-white/80 flex items-center justify-center text-xs text-white active:scale-90 transition cursor-pointer shadow-md"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className={`w-8 h-8 rounded-full border-2 border-white/90 hover:border-[#FFC83D] flex items-center justify-center text-white active:scale-90 transition cursor-pointer shadow-md ${
              isPaused
                ? 'bg-gradient-to-b from-[#ffe071] via-[#FFC83D] to-[#d49b10] text-[#4a2800] ring-2 ring-[#FFC83D]'
                : 'bg-[#1769D2] hover:bg-[#1c75e8]'
            }`}
            title="Pause Match"
            aria-label="Pause Match"
          >
            <Pause className="w-3.5 h-3.5 fill-current drop-shadow" />
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
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-b from-[#1c75e8] via-[#1769D2] to-[#17345D] border-2 border-[#FFC83D] group-hover:border-white shadow-md flex items-center justify-center overflow-hidden p-0.5">
            {/* Level Tag on top-left of avatar */}
            <div className="absolute top-0.5 left-0.5 bg-[#FFC83D] text-[#4a2800] text-[8px] sm:text-[9px] font-black px-1 rounded-sm leading-none border border-white z-10 shadow">
              {currentLevel.level}
            </div>
            {/* Dynamic Player Avatar */}
            {renderAvatarSvg(playerAvatarId, 'w-9 h-9 sm:w-10 sm:h-10 drop-shadow')}
          </div>
          {/* Blue Name Banner */}
          <div className="bg-gradient-to-r from-[#1769D2] to-[#124d9c] text-white font-display text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full -mt-1.5 shadow border border-white truncate max-w-[68px] sm:max-w-[76px] text-center">
            {playerName}
          </div>
        </div>

        {/* Center: Dual Score Indicators, Territory Progress Bar & Timer */}
        <div className="flex-1 min-w-0 flex flex-col items-center justify-center px-1 sm:px-2 w-full">
          {/* Territory % Tags: Proportional Flex Row */}
          <div className="w-full flex items-center justify-between px-1 mb-0.5 z-20">
            <span className="bg-[#1769D2] text-white game-counter font-extrabold text-xs sm:text-sm px-2.5 py-0.5 rounded-full shadow-md border-2 border-white leading-none shrink-0">
              {bluePercent}%
            </span>
            <span className="text-[11px] sm:text-xs font-display text-sky-100 tracking-widest uppercase opacity-95 drop-shadow truncate px-1">
              TERRITORY
            </span>
            <span className="bg-[#F04452] text-white game-counter font-extrabold text-xs sm:text-sm px-2.5 py-0.5 rounded-full shadow-md border-2 border-white leading-none shrink-0">
              {redPercent}%
            </span>
          </div>

          {/* Split Color Territory Bar (Royal Blue #1769D2 vs Battle Red #F04452) */}
          <div className="w-full h-3.5 sm:h-4 bg-[#0f2444] rounded-full p-0.5 border-2 border-white shadow-[0_3px_12px_rgba(23,52,93,0.5)] flex overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-[#388af6] via-[#1769D2] to-[#124d9c] transition-all duration-300 rounded-l-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.6)]"
              style={{ width: `${bluePercent}%` }}
            />
            {/* Clean white separator line */}
            <div className="w-1 h-full bg-[#FFC83D] shadow-[0_0_6px_rgba(255,200,61,0.9)] z-10 shrink-0 rounded-full" />
            <div
              className="h-full bg-gradient-to-r from-[#f87480] via-[#F04452] to-[#b31926] transition-all duration-300 rounded-r-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.6)]"
              style={{ width: `${redPercent}%` }}
            />
          </div>

          {/* Match Countdown Clock */}
          <div className="w-full flex items-center justify-center mt-1">
            <div className="flex items-center gap-1.5 bg-[#17345D] border-2 border-[#3b68a8] px-3 py-0.5 rounded-full text-xs font-extrabold text-white shadow-md">
              <Timer className="w-3.5 h-3.5 text-[#FFC83D] shrink-0" />
              <span className={`game-counter ${timeRemaining < 30 ? 'text-[#FFC83D] animate-pulse font-extrabold' : 'text-white'}`}>
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
              {opponentLevel || currentLevel.level}
            </div>
            {/* Dynamic Opponent Avatar */}
            {renderAvatarSvg(opponentAvatarId || 'red_trainer', 'w-9 h-9 sm:w-10 sm:h-10 drop-shadow')}
          </div>
          {/* Red Name Banner */}
          <div className="bg-gradient-to-r from-[#e11d48] to-[#b91c1c] text-white font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full -mt-1.5 shadow border border-white truncate max-w-[68px] sm:max-w-[76px] text-center">
            {opponentName || currentLevel.opponentName || 'Trainer'}
          </div>
        </div>
      </div>
    </div>
  );
};
