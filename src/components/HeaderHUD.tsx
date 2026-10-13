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
      {/* Top Bar with Players & Controls */}
      <div className="flex items-center justify-between gap-2">
        {/* Blue Player Profile */}
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur px-2.5 py-1.5 rounded-xl border border-sky-500/40 shadow">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-lg shadow-inner border border-sky-300">
            🧢
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-sky-400 leading-tight">You</span>
            <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold leading-none">
              <Trophy className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>{playerTrophies}</span>
            </div>
          </div>
        </div>

        {/* Action icons (Unity Plan & Tech Stack Advisor & Sound) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenUnityModal}
            title="Unity 6 Android Roadmap & C# Code"
            className="flex items-center gap-1 bg-sky-600/90 hover:bg-sky-500 text-white text-xs font-bold px-2 py-1.5 rounded-lg border border-sky-400 shadow cursor-pointer transition active:scale-95"
          >
            <span>Unity Plan</span>
          </button>

          <button
            onClick={onOpenTechModal}
            title="Tech Recommendation (Unity vs Godot vs Web)"
            className="flex items-center gap-1 bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-bold px-2 py-1.5 rounded-lg border border-indigo-400 shadow cursor-pointer transition active:scale-95"
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 border border-slate-600 cursor-pointer transition active:scale-95"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
          </button>
        </div>

        {/* Red Opponent Profile */}
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur px-2.5 py-1.5 rounded-xl border border-rose-500/40 shadow">
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-rose-400 leading-tight truncate max-w-[70px]">
              {currentLevel.opponentName}
            </span>
            <div className="flex items-center justify-end gap-1 text-[11px] text-amber-400 font-bold leading-none">
              <Trophy className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>{currentLevel.opponentTrophies}</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-red-700 flex items-center justify-center text-lg shadow-inner border border-rose-400">
            🤖
          </div>
        </div>
      </div>

      {/* Territory Progress Split Bar & Match Timer (Identical to video layout) */}
      <div className="relative flex items-center h-8 bg-slate-950 rounded-xl p-0.5 border-2 border-slate-700/80 shadow-lg overflow-hidden">
        {/* Blue territory fill */}
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-sky-500 transition-all duration-300 rounded-l-lg flex items-center pl-2"
          style={{ width: `${bluePercent}%` }}
        />

        {/* Red territory fill */}
        <div
          className="h-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-300 rounded-r-lg flex items-center justify-end pr-2"
          style={{ width: `${redPercent}%` }}
        />

        {/* Center Percentage Display and Timer */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-600 px-3 py-0.5 rounded-full shadow-md">
            <span className="text-xs font-black text-sky-400 tracking-wider">
              {bluePercent}%
            </span>
            <div className="flex items-center gap-1 text-slate-300 text-xs font-bold">
              <Timer className="w-3 h-3 text-amber-400" />
              <span className={timeRemaining < 30 ? 'text-rose-400 animate-pulse' : 'text-white'}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            <span className="text-xs font-black text-rose-400 tracking-wider">
              {redPercent}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
