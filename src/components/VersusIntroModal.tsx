import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Swords, FastForward } from 'lucide-react';
import { LevelConfig } from '../types';
import { renderAvatarSvg } from './AvatarSelectionModal';
import { sounds } from '../audio';

interface VersusIntroModalProps {
  isOpen: boolean;
  playerName: string;
  playerAvatarId: string;
  playerTrophies: number;
  currentLevel: LevelConfig;
  opponentTitle?: string;
  opponentAvatarId?: string;
  opponentDifficultyLabel?: string;
  onFightStart: () => void;
}

export const VersusIntroModal: React.FC<VersusIntroModalProps> = ({
  isOpen,
  playerName,
  playerAvatarId,
  playerTrophies,
  currentLevel,
  opponentTitle,
  opponentAvatarId,
  opponentDifficultyLabel,
  onFightStart,
}) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(3);
      return;
    }

    sounds.playBattleHorns();

    const timer1 = setTimeout(() => {
      setCountdown(2);
      sounds.playClick();
    }, 700);

    const timer2 = setTimeout(() => {
      setCountdown(1);
      sounds.playClick();
    }, 1400);

    const timer3 = setTimeout(() => {
      setCountdown(0); // "FIGHT!"
      sounds.playCardDrop();
    }, 2000);

    const timer4 = setTimeout(() => {
      onFightStart();
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isOpen, onFightStart]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#17345D]/95 backdrop-blur-md flex flex-col items-center justify-between px-4 pt-[max(12px,env(safe-area-inset-top,0px))] pb-[max(12px,env(safe-area-inset-bottom,0px))] select-none overflow-hidden animate-in fade-in duration-200">
      {/* Background Cinematic Energy Rays */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#FFC83D_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#1769D2]/30 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#F04452]/30 to-transparent pointer-events-none" />

      {/* Top Sector Indicator */}
      <div className="w-full max-w-sm flex items-center justify-between pt-1 z-10 shrink-0">
        <div className="bg-[#17345D] border-2 border-[#FFC83D] px-3.5 py-1.5 rounded-full text-xs font-display text-[#F7E7BE] shadow-lg flex items-center gap-1.5">
          <span className="text-[#FFC83D]">Sector {currentLevel.level}:</span>
          <span className="text-white drop-shadow truncate max-w-[130px] sm:max-w-none">{currentLevel.name}</span>
        </div>
        <button
          onClick={() => {
            sounds.playClick();
            onFightStart();
          }}
          className="flex items-center gap-1 btn-royal-blue text-white px-3.5 py-2 rounded-full text-xs font-display cursor-pointer shadow-md min-h-[44px] min-w-[70px] justify-center"
        >
          <FastForward className="w-4 h-4 text-[#FFC83D]" /> Skip
        </button>
      </div>

      {/* Central Versus Face-Off Stage */}
      <div className="w-full flex-1 flex flex-col justify-center items-center gap-3 sm:gap-6 my-auto z-10 max-w-sm">
        {/* Blue Player Card (Sliding in from top-left) */}
        <div className="w-full bg-gradient-to-r from-[#1769D2] via-[#124d9c] to-[#17345D] border-2 border-b-4 border-[#FFC83D] border-b-[#b38615] rounded-3xl p-3 sm:p-3.5 shadow-[0_0_30px_rgba(23,105,210,0.6)] flex items-center justify-between animate-in slide-in-from-left duration-500">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Player Avatar */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-[#1769D2] to-[#17345D] border-2 border-[#FFC83D] shadow-xl flex items-center justify-center p-1 shrink-0">
              {renderAvatarSvg(playerAvatarId, 'w-10 h-10 sm:w-12 sm:h-12')}
              <div className="absolute -bottom-1 -right-1 bg-[#FFC83D] text-[#17345D] text-[10px] font-display px-1.5 py-0.2 rounded-full border border-white shadow">
                YOU
              </div>
            </div>

            {/* Player Details */}
            <div className="flex flex-col text-left min-w-0">
              <span className="text-base sm:text-lg font-display text-white tracking-wide drop-shadow truncate max-w-[140px]">
                {playerName}
              </span>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                <span className="text-xs game-counter font-extrabold text-[#FFC83D] bg-[#17345D] px-2 py-0.5 rounded-lg border border-[#FFC83D]/50 flex items-center gap-1 shadow shrink-0">
                  <Trophy className="w-3.5 h-3.5 text-[#FFC83D] fill-[#FFC83D]" />
                  {playerTrophies}
                </span>
                <span className="text-[10px] game-counter font-extrabold text-orange-300 bg-[#592b0c] px-1.5 py-0.5 rounded-lg border border-orange-400/50 flex items-center gap-0.5 shadow truncate">
                  <Flame className="w-3 h-3 fill-current shrink-0" /> 3 Streak
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col text-right ml-2 shrink-0">
            <span className="text-xs font-display text-[#FFC83D] uppercase tracking-widest">
              Kingdom
            </span>
            <span className="text-xl sm:text-2xl font-display text-white drop-shadow">
              BLUE
            </span>
          </div>
        </div>

        {/* Central "VS" Emblem with Crossed Swords and Crest */}
        <div className="relative flex items-center justify-center my-1 sm:my-2">
          {/* Animated pulsing outer halo */}
          <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-[#FFC83D] via-amber-400 to-[#F04452] blur-xl opacity-70 animate-ping duration-1000 pointer-events-none" />

          {/* Central VS Badge */}
          <div className="relative z-10 w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-[#FFC83D] via-[#ffe382] to-[#FFC83D] border-4 border-white shadow-[0_8px_25px_rgba(0,0,0,0.7)] flex flex-col items-center justify-center transform rotate-3 hover:rotate-0 transition">
            <Swords className="w-5 h-5 text-[#17345D] drop-shadow mb-[-2px]" />
            <span className="text-lg sm:text-xl font-display text-[#17345D] italic tracking-tighter drop-shadow">
              VS
            </span>
          </div>
        </div>

        {/* Red Opponent Card (Sliding in from bottom-right) */}
        <div className="w-full bg-gradient-to-r from-[#F04452] via-[#bd2936] to-[#7f1d1d] border-2 border-b-4 border-[#FFC83D] border-b-[#b38615] rounded-3xl p-3 sm:p-3.5 shadow-[0_0_30px_rgba(240,68,82,0.6)] flex items-center justify-between animate-in slide-in-from-right duration-500">
          <div className="flex flex-col text-left mr-2 shrink-0">
            <span className="text-xs font-display text-[#FFC83D] uppercase tracking-widest">
              Empire
            </span>
            <span className="text-xl sm:text-2xl font-display text-white drop-shadow">
              RED
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Opponent Details */}
            <div className="flex flex-col text-right min-w-0">
              <span className="text-base sm:text-lg font-display text-white tracking-wide drop-shadow truncate max-w-[140px]">
                {currentLevel.opponentName}
              </span>
              <span className="text-[10px] text-rose-200/90 truncate max-w-[140px]">
                {opponentTitle || 'Empire Champion'}
              </span>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-1 justify-end">
                {opponentDifficultyLabel && (
                  <span className="text-[9px] font-display uppercase font-black text-rose-200 bg-[#540c17] px-1.5 py-0.5 rounded-lg border border-red-400/50 flex items-center gap-0.5 shadow truncate">
                    {opponentDifficultyLabel}
                  </span>
                )}
                <span className="text-xs game-counter font-extrabold text-[#FFC83D] bg-[#17345D] px-2 py-0.5 rounded-lg border border-[#FFC83D]/40 flex items-center gap-1 shadow shrink-0">
                  <Trophy className="w-3.5 h-3.5 text-[#FFC83D] fill-[#FFC83D]" />
                  {currentLevel.opponentTrophies}
                </span>
              </div>
            </div>

            {/* Opponent Avatar */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-[#F04452] to-[#7f1d1d] border-2 border-[#FFC83D] shadow-xl flex items-center justify-center p-1 shrink-0">
              {renderAvatarSvg(opponentAvatarId || 'red_trainer', 'w-10 h-10 sm:w-12 sm:h-12')}
              <div className="absolute -bottom-1 -left-1 bg-[#F04452] text-white text-[10px] font-display px-1.5 py-0.2 rounded-full border border-white shadow">
                AI
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Countdown Flare Bar at Bottom */}
      <div className="w-full flex flex-col items-center pb-2 z-10 shrink-0">
        <div className="text-4xl sm:text-5xl font-display text-transparent bg-clip-text bg-gradient-to-r from-[#FFC83D] via-yellow-200 to-[#FFC83D] tracking-wider animate-bounce drop-shadow-[0_2px_10px_rgba(255,200,61,0.6)]">
          {countdown > 0 ? countdown : 'BATTLE!'}
        </div>
        <span className="text-xs font-body font-bold text-[#F7E7BE] mt-0.5">
          Conquer the arena for the Royal Crown!
        </span>
      </div>
    </div>
  );
};
