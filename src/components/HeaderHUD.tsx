import React from 'react';
import { Volume2, VolumeX, Info, Trophy, Timer } from 'lucide-react';
import { LevelConfig } from '../types';

interface HeaderHUDProps {
  bluePercent: number;
  redPercent: number;
  timeRemaining: number;
  currentLevel: LevelConfig;
  playerTrophies: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenTechModal: () => void;
  onOpenUnityModal: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  bluePercent,
  redPercent,
  timeRemaining,
  currentLevel,
  playerTrophies,
  isMuted,
  onToggleMute,
  onOpenTechModal,
  onOpenUnityModal,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-md mx-auto pt-2 px-3 pb-1 flex flex-col gap-1.5 select-none z-20">
      {/* Top Players Row */}
      <div className="flex items-center justify-between gap-2">
        {/* Blue Player Profile (Left) */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-b from-sky-400 to-blue-600 flex items-center justify-center text-xl shadow-lg border-2 border-white">
              🧢
              {/* Trophy badge on top right */}
              <div className="absolute -top-1.5 -right-2 bg-slate-900 border border-amber-400 rounded-full px-1.5 py-0.2 flex items-center gap-0.5 shadow">
                <Trophy className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                <span className="text-[10px] font-black text-amber-400">{playerTrophies}</span>
              </div>
            </div>
            {/* Nameplate */}
            <span className="bg-blue-600 text-white font-extrabold text-[11px] px-3 py-0.5 rounded-full mt-1 shadow -translate-y-1 border border-blue-400">
              You
            </span>
          </div>
        </div>

        {/* Center Percentage & Timer */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Territory % Pill on Top (from video 00:31: white pill with 50%) */}
          <div className="bg-white border-2 border-slate-900 text-blue-600 font-black text-sm px-4 py-0.5 rounded-full shadow-md -mb-1.5 z-10">
            {bluePercent}%
          </div>

          {/* Split Territory Bar */}
          <div className="w-full h-4.5 bg-slate-950 rounded-full p-0.5 border-2 border-slate-900 shadow flex overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all duration-300 rounded-l-full"
              style={{ width: `${bluePercent}%` }}
            />
            {/* White divider marker */}
            <div className="w-1 h-full bg-white shadow z-10 -ml-0.5 -mr-0.5" />
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-300 rounded-r-full"
              style={{ width: `${redPercent}%` }}
            />
          </div>

          {/* Countdown Clock (Stopwatch from video 00:31: ⏱️ 3:00) */}
          <div className="flex items-center gap-1 mt-1 bg-slate-900/90 border border-slate-700 px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-sm">
            <Timer className="w-3.5 h-3.5 text-slate-300" />
            <span className={timeRemaining < 30 ? 'text-rose-400 animate-pulse font-black' : 'font-extrabold'}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* Red Opponent Profile (Right) */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-b from-rose-500 to-red-700 flex items-center justify-center text-xl shadow-lg border-2 border-white">
              🦎
              {/* Trophy badge */}
              <div className="absolute -top-1.5 -left-2 bg-slate-900 border border-amber-400 rounded-full px-1.5 py-0.2 flex items-center gap-0.5 shadow">
                <Trophy className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                <span className="text-[10px] font-black text-amber-400">{currentLevel.opponentTrophies}</span>
              </div>
            </div>
            {/* Nameplate */}
            <span className="bg-rose-600 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-full mt-1 shadow -translate-y-1 border border-rose-400 truncate max-w-[80px]">
              {currentLevel.opponentName}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Tools: Unity 6 Blueprint & Sound */}
      <div className="flex items-center justify-between px-1 text-[11px]">
        <button
          onClick={onOpenUnityModal}
          className="bg-sky-600/90 hover:bg-sky-500 text-white font-black px-2.5 py-0.5 rounded-lg border border-sky-400 shadow transition active:scale-95 flex items-center gap-1"
        >
          <span>Unity Blueprint</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenTechModal}
            className="bg-indigo-600/80 hover:bg-indigo-500 text-white font-bold px-2 py-0.5 rounded-lg border border-indigo-400 shadow transition active:scale-95 flex items-center gap-1"
          >
            <Info className="w-3 h-3" />
            <span>Tech</span>
          </button>
          <button
            onClick={onToggleMute}
            className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 border border-slate-600 transition"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-sky-400" />}
          </button>
        </div>
      </div>
    </div>
  );
};
