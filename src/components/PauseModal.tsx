import React, { useState } from 'react';
import { Play, Settings, LogOut, Volume2, VolumeX, Shield, Timer, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { LevelConfig } from '../types';
import { sounds } from '../audio';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onQuit: () => void;
  currentLevel: LevelConfig;
  timeRemaining: number;
  bluePercent: number;
  redPercent: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSettingsTab?: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onQuit,
  currentLevel,
  timeRemaining,
  bluePercent,
  redPercent,
  isMuted,
  onToggleMute,
  onOpenSettingsTab,
}) => {
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [bgmMuted, setBgmMuted] = useState(false);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleResume = () => {
    sounds.playClick();
    onResume();
  };

  const handleQuit = () => {
    sounds.playClick();
    onQuit();
  };

  const handleToggleSettings = () => {
    sounds.playClick();
    setShowSettingsPanel((prev) => !prev);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a235c]/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      {/* Modal Container: Light-blue gradient container, zero dark-gray/black backgrounds */}
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1e5ecc] via-[#2167ec] to-[#1546af] border-2 border-sky-300 shadow-[0_12px_40px_rgba(27,91,214,0.6)] p-5 flex flex-col items-center gap-3.5 text-white animate-in zoom-in-95 duration-200">
        {/* Header Ribbon / Title */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] border-2 border-white flex items-center justify-center shadow-[0_0_16px_rgba(56,189,248,0.7)] mb-1.5">
            <span className="text-2xl drop-shadow select-none">⏸️</span>
          </div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-sky-100 to-sky-200 tracking-wider uppercase drop-shadow-md">
            Match Paused
          </h2>
          <span className="text-xs font-bold text-sky-200/90 -mt-0.5">
            Sector {currentLevel.level} • {currentLevel.name}
          </span>
        </div>

        {/* Live Match Snapshot Pill */}
        <div className="w-full bg-gradient-to-r from-[#1746a8]/90 via-[#1d57c7]/85 to-[#1746a8]/90 border border-sky-300/60 rounded-2xl p-3 shadow-inner flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-black">
            <span className="text-sky-200 flex items-center gap-1">
              <Timer className="w-3.5 h-3.5 text-sky-300" /> Time Left:
            </span>
            <span className="text-yellow-300 bg-[#163f96] px-2 py-0.5 rounded-full border border-sky-300/40">
              {formatTime(timeRemaining)}
            </span>
          </div>

          {/* Territory Mini Bar */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-black">
              <span className="text-sky-300">You: {bluePercent}%</span>
              <span className="text-rose-300">Enemy: {redPercent}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#10337d] border border-sky-300/40 p-0.5 flex overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] rounded-l-full transition-all"
                style={{ width: `${bluePercent}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-[#fb7185] to-[#f43f5e] rounded-r-full transition-all"
                style={{ width: `${redPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Inline Quick Settings Panel (Expandable) */}
        {showSettingsPanel && (
          <div className="w-full bg-gradient-to-b from-[#194bb8] to-[#133b94] rounded-2xl p-3 border border-sky-300/60 flex flex-col gap-2.5 shadow-inner animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between border-b border-sky-300/30 pb-1.5">
              <span className="text-xs font-black text-yellow-300 uppercase tracking-wide">
                Match Audio & Settings
              </span>
              <span className="text-[10px] text-sky-200 font-bold">Preferences</span>
            </div>

            {/* Sound FX Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#2055be] border border-sky-300/50 flex items-center justify-center text-sky-200">
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white leading-tight">Sound Effects</span>
                  <span className="text-[9px] text-sky-200/80">Battle audio & splats</span>
                </div>
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  onToggleMute();
                }}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center shadow border border-sky-300/50 ${
                  !isMuted ? 'bg-emerald-400 justify-end' : 'bg-[#1b439e] justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* BGM Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#2055be] border border-sky-300/50 flex items-center justify-center text-sky-200">
                  <span className="text-xs select-none">🎵</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white leading-tight">Background Music</span>
                  <span className="text-[9px] text-sky-200/80">Battle ambient score</span>
                </div>
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  setBgmMuted((m) => !m);
                }}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center shadow border border-sky-300/50 ${
                  !bgmMuted ? 'bg-emerald-400 justify-end' : 'bg-[#1b439e] justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Haptic Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#2055be] border border-sky-300/50 flex items-center justify-center text-sky-200">
                  <span className="text-xs select-none">📳</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white leading-tight">Haptic Vibration</span>
                  <span className="text-[9px] text-sky-200/80">Impact feedback</span>
                </div>
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  setHapticEnabled((h) => !h);
                }}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center shadow border border-sky-300/50 ${
                  hapticEnabled ? 'bg-emerald-400 justify-end' : 'bg-[#1b439e] justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {onOpenSettingsTab && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenSettingsTab();
                }}
                className="w-full py-1 text-center text-[10px] font-black text-sky-300 hover:text-white underline cursor-pointer"
              >
                Go to Full App Settings & Tech Guide →
              </button>
            )}
          </div>
        )}

        {/* Action Buttons Stack (Proportional Flexbox) */}
        <div className="w-full flex flex-col gap-2 pt-1">
          {/* 1. Resume Button (Primary) */}
          <button
            onClick={handleResume}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#16a34a] via-[#22c55e] to-[#4ade80] hover:from-[#15803d] hover:to-[#22c55e] active:scale-[0.98] text-emerald-950 font-black text-sm sm:text-base border-2 border-white shadow-[0_4px_18px_rgba(34,197,94,0.6)] flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <Play className="w-5 h-5 fill-emerald-950 text-emerald-950" />
            <span>RESUME BATTLE</span>
          </button>

          {/* 2. Settings Button */}
          <button
            onClick={handleToggleSettings}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#256cf0] via-[#387bf8] to-[#256cf0] hover:from-[#1d5ecc] hover:to-[#256cf0] active:scale-[0.98] text-white font-black text-xs sm:text-sm border-2 border-white/80 shadow-[0_3px_12px_rgba(37,108,240,0.5)] flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <Settings className="w-4 h-4 text-sky-200" />
            <span>SETTINGS</span>
            {showSettingsPanel ? (
              <ChevronUp className="w-4 h-4 text-sky-200" />
            ) : (
              <ChevronDown className="w-4 h-4 text-sky-200" />
            )}
          </button>

          {/* 3. Quit Match Button */}
          <button
            onClick={handleQuit}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#e11d48] via-[#f43f5e] to-[#e11d48] hover:from-[#be123c] hover:to-[#e11d48] active:scale-[0.98] text-white font-black text-xs sm:text-sm border-2 border-white/80 shadow-[0_3px_12px_rgba(225,29,72,0.5)] flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <LogOut className="w-4 h-4 text-rose-100" />
            <span>QUIT MATCH</span>
          </button>
        </div>
      </div>
    </div>
  );
};
