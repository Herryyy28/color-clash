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
  onFightStart: () => void;
}

export const VersusIntroModal: React.FC<VersusIntroModalProps> = ({
  isOpen,
  playerName,
  playerAvatarId,
  playerTrophies,
  currentLevel,
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
    <div className="fixed inset-0 z-50 bg-[#070b16]/95 backdrop-blur-md flex flex-col items-center justify-between p-4 select-none overflow-hidden animate-in fade-in duration-200">
      {/* Background Cinematic Energy Rays */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-600/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-red-600/20 to-transparent pointer-events-none" />

      {/* Top Sector Indicator */}
      <div className="w-full flex items-center justify-between pt-2 z-10">
        <div className="bg-[#0c2a6b] border-2 border-sky-300/50 px-3 py-1 rounded-full text-xs font-black text-sky-200 shadow flex items-center gap-1.5">
          <span>Sector {currentLevel.level}:</span>
          <span className="text-white drop-shadow">{currentLevel.name}</span>
        </div>
        <button
          onClick={() => {
            sounds.playClick();
            onFightStart();
          }}
          className="flex items-center gap-1 bg-[#133785] hover:bg-[#1a4db8] text-white px-3 py-1 rounded-full text-[11px] font-black border-2 border-white/40 cursor-pointer active:scale-95 shadow"
        >
          <FastForward className="w-3.5 h-3.5" /> Skip
        </button>
      </div>

      {/* Central Versus Face-Off Stage */}
      <div className="w-full flex-1 flex flex-col justify-center items-center gap-6 my-auto z-10 max-w-sm">
        {/* Blue Player Card (Sliding in from top-left) */}
        <div className="w-full bg-gradient-to-r from-[#1746b8] via-[#11358d] to-[#0e2c77] border-2 border-sky-300 rounded-3xl p-3.5 shadow-[0_0_30px_rgba(56,189,248,0.5)] flex items-center justify-between animate-in slide-in-from-left duration-500">
          <div className="flex items-center gap-3">
            {/* Player Avatar */}
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-b from-[#1e88e5] to-[#1565c0] border-2 border-white shadow-xl flex items-center justify-center p-1">
              {renderAvatarSvg(playerAvatarId, 'w-12 h-12')}
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 text-[10px] font-black px-1.5 py-0.2 rounded-full border border-white shadow">
                YOU
              </div>
            </div>

            {/* Player Details */}
            <div className="flex flex-col text-left">
              <span className="text-base font-black text-white tracking-wide drop-shadow">
                {playerName}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-black text-amber-300 bg-[#0a235c] px-2 py-0.5 rounded-lg border border-amber-400/40 flex items-center gap-1 shadow">
                  <Trophy className="w-3 h-3 text-amber-400 fill-amber-400" />
                  {playerTrophies}
                </span>
                <span className="text-[10px] font-black text-orange-300 bg-[#592b0c] px-2 py-0.5 rounded-lg border border-orange-400/50 flex items-center gap-1 shadow">
                  <Flame className="w-3 h-3 fill-current" /> 3 Win Streak
                </span>
              </div>
            </div>
          </div>

          <div className="text-2xl font-black text-sky-300 opacity-90 drop-shadow">
            BLUE
          </div>
        </div>

        {/* Central "VS" Emblem with Shockwave Ring */}
        <div className="relative flex items-center justify-center my-2">
          {/* Animated pulsing outer halo */}
          <div className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-sky-400 via-yellow-300 to-rose-500 blur-xl opacity-70 animate-ping duration-1000 pointer-events-none" />

          {/* Central VS Badge */}
          <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-red-600 border-4 border-white shadow-2xl flex items-center justify-center transform rotate-6 hover:rotate-0 transition">
            <span className="text-2xl font-black text-white italic tracking-tighter drop-shadow-[0_2px_4px_rgba(10,30,80,0.6)]">
              VS
            </span>
          </div>
        </div>

        {/* Red Opponent Card (Sliding in from bottom-right) */}
        <div className="w-full bg-gradient-to-r from-[#7a1224] via-[#590d1a] to-[#7f1d1d] border-2 border-rose-400 rounded-3xl p-3.5 shadow-[0_0_30px_rgba(244,63,94,0.5)] flex items-center justify-between animate-in slide-in-from-right duration-500">
          <div className="text-2xl font-black text-rose-300 opacity-90 drop-shadow">
            RED
          </div>

          <div className="flex items-center gap-3">
            {/* Opponent Details */}
            <div className="flex flex-col text-right">
              <span className="text-base font-black text-white tracking-wide drop-shadow">
                {currentLevel.opponentName}
              </span>
              <div className="flex items-center gap-2 mt-1 justify-end">
                <span className="text-[10px] font-black text-rose-200 bg-[#540c17] px-2 py-0.5 rounded-lg border border-red-400/50 flex items-center gap-1 shadow">
                  <Flame className="w-3 h-3 fill-current" /> 2 Streak
                </span>
                <span className="text-xs font-black text-amber-300 bg-[#0a235c] px-2 py-0.5 rounded-lg border border-amber-400/40 flex items-center gap-1 shadow">
                  <Trophy className="w-3 h-3 text-amber-400 fill-amber-400" />
                  {currentLevel.opponentTrophies}
                </span>
              </div>
            </div>

            {/* Opponent Avatar */}
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-b from-[#e53935] to-[#c62828] border-2 border-white shadow-xl flex items-center justify-center p-1">
              {renderAvatarSvg('red_trainer', 'w-12 h-12')}
              <div className="absolute -bottom-1 -left-1 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full border border-white shadow">
                AI
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Countdown Flare Bar at Bottom */}
      <div className="w-full flex flex-col items-center pb-4 z-10">
        <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 tracking-wider animate-bounce drop-shadow">
          {countdown > 0 ? countdown : 'FIGHT!'}
        </div>
        <span className="text-xs font-black text-blue-100 mt-1">
          Prepare your battle deck...
        </span>
      </div>
    </div>
  );
};
