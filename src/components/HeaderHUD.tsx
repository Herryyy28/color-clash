import React from 'react';
import { Timer } from 'lucide-react';
import { LevelConfig } from '../types';

interface HeaderHUDProps {
  bluePercent: number;
  redPercent: number;
  timeRemaining: number;
  currentLevel: LevelConfig;
  playerTrophies: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenTechModal?: () => void;
  onOpenUnityModal?: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  bluePercent,
  redPercent,
  timeRemaining,
  currentLevel,
  isMuted,
  onToggleMute,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full px-2 pt-1 pb-1 select-none z-30 flex flex-col items-center">
      {/* Exact Top Row Layout matching screenshot */}
      <div className="w-full flex items-center justify-between gap-1.5">
        {/* Blue Player Profile (Left) */}
        <div className="flex flex-col items-center">
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-b from-[#1e88e5] to-[#1565c0] border-2 border-white shadow-md flex items-center justify-center overflow-hidden">
            {/* Level Tag on top-left of avatar */}
            <div className="absolute top-0.5 left-0.5 bg-[#0d47a1] text-white text-[9px] font-black px-1 rounded-sm leading-none border border-blue-300/40">
              0
            </div>
            {/* Cyan-haired kid avatar with blue cap & headphones */}
            <svg viewBox="0 0 64 64" className="w-10 h-10 drop-shadow">
              {/* Headphones */}
              <path d="M12 28 C12 12, 52 12, 52 28" fill="none" stroke="#374151" strokeWidth="4" />
              <rect x="8" y="24" width="8" height="14" rx="3" fill="#0284c7" />
              <rect x="48" y="24" width="8" height="14" rx="3" fill="#0284c7" />
              {/* Face */}
              <circle cx="32" cy="32" r="16" fill="#fed7aa" />
              {/* Cyan hair */}
              <path d="M18 26 C20 18, 44 18, 46 26 C44 22, 38 20, 32 21 C26 20, 20 22, 18 26 Z" fill="#06b6d4" />
              {/* Blue backwards cap */}
              <ellipse cx="32" cy="22" rx="14" ry="7" fill="#2563eb" />
              <path d="M30 15 L44 14" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />
              {/* Eyes & Smile */}
              <circle cx="26" cy="32" r="2" fill="#1e293b" />
              <circle cx="38" cy="32" r="2" fill="#1e293b" />
              <path d="M28 38 Q32 41 36 38" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          {/* Blue Name Banner */}
          <div className="bg-[#1976d2] text-white font-black text-[10px] px-3 py-0.5 rounded-full -mt-1.5 shadow border border-blue-300">
            You
          </div>
        </div>

        {/* Center: Dual Progress Bar, Percentage & Timer */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-[210px]">
          {/* Territory % Tag centered above bar (e.g. 50% in bright blue) */}
          <div className="bg-white/95 text-[#0284c7] font-black text-xs px-3 py-0.5 rounded-full shadow-md border border-slate-900 -mb-1.5 z-20">
            {bluePercent}%
          </div>

          {/* Split Color Territory Bar */}
          <div className="w-full h-4 bg-[#0a0f1d] rounded-full p-0.5 border border-white/60 shadow-inner flex overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-[#0284c7] to-[#38bdf8] transition-all duration-300 rounded-l-full"
              style={{ width: `${bluePercent}%` }}
            />
            {/* Clean white separator line */}
            <div className="w-0.5 h-full bg-white shadow-sm z-10" />
            <div
              className="h-full bg-gradient-to-r from-[#f43f5e] to-[#e11d48] transition-all duration-300 rounded-r-full"
              style={{ width: `${redPercent}%` }}
            />
          </div>

          {/* Countdown Clock with Stopwatch Icon */}
          <div className="flex items-center gap-1 mt-1 bg-[#0b1329]/90 border border-slate-700/80 px-2.5 py-0.5 rounded-full text-[11px] font-black text-white shadow">
            <Timer className="w-3 h-3 text-sky-400" />
            <span className={timeRemaining < 30 ? 'text-rose-400 animate-pulse' : ''}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* Red Opponent Profile (Right) */}
        <div className="flex flex-col items-center">
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-b from-[#e53935] to-[#c62828] border-2 border-white shadow-md flex items-center justify-center overflow-hidden">
            {/* Level Tag on top-right of avatar */}
            <div className="absolute top-0.5 right-0.5 bg-[#b71c1c] text-white text-[9px] font-black px-1 rounded-sm leading-none border border-red-300/40">
              5
            </div>
            {/* Zombie / Red Trainer Monster avatar */}
            <svg viewBox="0 0 64 64" className="w-10 h-10 drop-shadow">
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
          <div className="bg-[#d32f2f] text-white font-black text-[10px] px-2.5 py-0.5 rounded-full -mt-1.5 shadow border border-red-300 truncate max-w-[70px]">
            Trainer
          </div>
        </div>
      </div>
    </div>
  );
};
