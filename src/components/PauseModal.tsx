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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 safe-pt safe-pb bg-[#17345D]/85 backdrop-blur-md select-none overflow-y-auto animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="w-full max-w-sm max-h-[calc(100dvh-var(--safe-top)-var(--safe-bottom)-24px)] overflow-y-auto scroll-touch rounded-3xl bg-gradient-to-b from-[#1769D2] via-[#124d9c] to-[#17345D] border-2 border-b-4 border-[#FFC83D] border-b-[#b38615] shadow-[0_12px_40px_rgba(255,200,61,0.5)] p-4 sm:p-5 flex flex-col items-center gap-3 text-white animate-in zoom-in-95 duration-200">
        {/* Header Ribbon / Title */}
        <div className="flex flex-col items-center shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-[#FFC83D] border-2 border-white flex items-center justify-center shadow-lg mb-1">
            <span className="text-2xl drop-shadow select-none">⏸️</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display text-white tracking-wider uppercase drop-shadow">
            Match Paused
          </h2>
          <span className="text-xs font-bold text-[#F7E7BE] -mt-0.5">
            Sector {currentLevel.level} • {currentLevel.name}
          </span>
        </div>

        {/* Live Match Snapshot Pill */}
        <div className="w-full bg-[#17345D] border-2 border-[#FFC83D]/50 rounded-2xl p-2.5 sm:p-3 shadow-inner flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between text-xs font-black">
            <span className="text-[#F7E7BE] flex items-center gap-1 font-body">
              <Timer className="w-3.5 h-3.5 text-[#FFC83D]" /> Time Left:
            </span>
            <span className="text-[#FFC83D] bg-[#1769D2]/40 px-2.5 py-0.5 rounded-full border border-[#FFC83D]/40 game-counter font-black">
              {formatTime(timeRemaining)}
            </span>
          </div>

          {/* Territory Mini Bar */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-black game-counter">
              <span className="text-white">Royal Blue: {bluePercent}%</span>
              <span className="text-[#F04452]">Empire Red: {redPercent}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-[#0a1e3a] border border-[#FFC83D]/40 p-0.5 flex overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#1769D2] to-[#257ef5] rounded-l-full transition-all"
                style={{ width: `${bluePercent}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-[#e11d48] to-[#F04452] rounded-r-full transition-all"
                style={{ width: `${redPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Inline Quick Settings Panel (Expandable) */}
        {showSettingsPanel && (
          <div className="w-full bg-[#17345D] rounded-2xl p-3 border-2 border-[#FFC83D]/40 flex flex-col gap-2.5 shadow-inner animate-in fade-in slide-in-from-top-2 duration-200 shrink-0">
            <div className="flex items-center justify-between border-b border-[#FFC83D]/30 pb-1.5">
              <span className="text-xs font-display text-[#FFC83D] uppercase tracking-wide">
                Match Audio & Settings
              </span>
              <span className="text-[10px] text-[#F7E7BE] font-bold">Preferences</span>
            </div>

            {/* Sound FX Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#1769D2] border border-[#FFC83D]/40 flex items-center justify-center text-[#FFC83D]">
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white leading-tight">Sound Effects</span>
                  <span className="text-[9px] text-[#F7E7BE]/80">Battle audio & combat</span>
                </div>
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  onToggleMute();
                }}
                className={`w-12 h-7 rounded-full transition-colors p-1 cursor-pointer flex items-center shadow border border-white/30 ${
                  !isMuted ? 'bg-[#79B957] justify-end' : 'bg-[#17345D] justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* BGM Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#1769D2] border border-[#FFC83D]/40 flex items-center justify-center text-[#79B957]">
                  <span className="text-xs select-none">🎵</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white leading-tight">Fanfare Music</span>
                  <span className="text-[9px] text-[#F7E7BE]/80">Arena battle fanfare</span>
                </div>
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  setBgmMuted((m) => !m);
                }}
                className={`w-12 h-7 rounded-full transition-colors p-1 cursor-pointer flex items-center shadow border border-white/30 ${
                  !bgmMuted ? 'bg-[#79B957] justify-end' : 'bg-[#17345D] justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Haptic Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#1769D2] border border-[#FFC83D]/40 flex items-center justify-center text-[#FFC83D]">
                  <span className="text-xs select-none">📳</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white leading-tight">Haptic Vibration</span>
                  <span className="text-[9px] text-[#F7E7BE]/80">Tactile impact</span>
                </div>
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  setHapticEnabled((h) => !h);
                }}
                className={`w-12 h-7 rounded-full transition-colors p-1 cursor-pointer flex items-center shadow border border-white/30 ${
                  hapticEnabled ? 'bg-[#FFC83D] justify-end' : 'bg-[#17345D] justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-[#17345D] shadow-md" />
              </button>
            </div>

            {onOpenSettingsTab && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenSettingsTab();
                }}
                className="w-full py-1.5 text-center text-[11px] font-black text-[#FFC83D] hover:text-white underline cursor-pointer"
              >
                Go to Game Settings →
              </button>
            )}
          </div>
        )}

        {/* Action Buttons Stack */}
        <div className="w-full flex flex-col gap-2 pt-1 shrink-0">
          {/* 1. Resume Button (Primary) */}
          <button
            onClick={handleResume}
            className="w-full py-3 px-4 rounded-2xl btn-royal-gold text-[#17345D] font-display text-base border-2 border-white shadow-xl flex items-center justify-center gap-2 cursor-pointer transition min-h-[46px]"
          >
            <Play className="w-5 h-5 fill-[#17345D] text-[#17345D]" />
            <span>RESUME BATTLE</span>
          </button>

          {/* 2. Settings Button */}
          <button
            onClick={handleToggleSettings}
            className="w-full py-2.5 px-4 rounded-2xl btn-royal-blue text-white font-display text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition min-h-[44px]"
          >
            <Settings className="w-4 h-4 text-[#FFC83D]" />
            <span>SETTINGS</span>
            {showSettingsPanel ? (
              <ChevronUp className="w-4 h-4 text-[#FFC83D]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#FFC83D]" />
            )}
          </button>

          {/* 3. Quit Match Button */}
          <button
            onClick={handleQuit}
            className="w-full py-2.5 px-4 rounded-2xl btn-battle-red text-white font-display text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition min-h-[44px]"
          >
            <LogOut className="w-4 h-4 text-white" />
            <span>SURRENDER MATCH</span>
          </button>
        </div>
      </div>
    </div>
  );
};
