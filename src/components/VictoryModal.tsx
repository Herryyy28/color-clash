import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Star, Shield, Play } from 'lucide-react';
import { sounds } from '../audio';

interface VictoryModalProps {
  level: number;
  timeBonus: number;
  rewardCubes: number;
  rewardCoins: number;
  onNextLevel: () => void;
  onReplayLevel: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  level,
  timeBonus,
  rewardCubes,
  rewardCoins,
  onNextLevel,
  onReplayLevel,
}) => {
  useEffect(() => {
    sounds.playVictory();

    // Trigger celebratory blue & gold confetti blast
    const count = 200;
    const defaults = {
      origin: { y: 0.6 },
      colors: ['#0080ff', '#38bdf8', '#3b82f6', '#f59e0b', '#ffffff'],
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-indigo-950 rounded-3xl p-6 border-2 border-sky-400 shadow-[0_0_50px_rgba(14,165,233,0.4)] flex flex-col items-center text-center animate-in zoom-in-90 duration-300">
        {/* Crown and Shield Wings Emblem from Video */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className="absolute -top-3 text-amber-400 animate-bounce">
            👑
          </div>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-400 flex items-center justify-center shadow-2xl border-2 border-white/80 rotate-45 transform">
            <Shield className="w-10 h-10 text-white fill-white/30 -rotate-45" />
          </div>
        </div>

        {/* VICTORY Title */}
        <h1 className="text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-white to-blue-200 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] mt-2">
          VICTORY
        </h1>
        <p className="text-xs font-bold text-sky-400 uppercase tracking-widest mt-1">
          Sector {level} Conquered!
        </p>

        {/* 3 Stars */}
        <div className="flex gap-2 my-4">
          <Star className="w-8 h-8 text-amber-400 fill-amber-400 drop-shadow" />
          <Star className="w-9 h-9 text-amber-400 fill-amber-400 drop-shadow -translate-y-1.5" />
          <Star className="w-8 h-8 text-amber-400 fill-amber-400 drop-shadow" />
        </div>

        {/* Time Bonus & Reward Box */}
        <div className="w-full bg-slate-900/90 rounded-2xl p-4 border border-slate-700/80 mb-5 flex flex-col gap-3">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 border-b border-slate-800 pb-2">
            <span>TIME BONUS</span>
            <span className="text-sky-400 font-extrabold text-sm">+{timeBonus}s</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Color Cubes Reward */}
            <div className="bg-slate-800/80 rounded-xl p-2.5 flex flex-col items-center border border-sky-500/30">
              <div className="w-9 h-9 rounded-lg bg-sky-500 flex items-center justify-center text-lg shadow-inner mb-1 border border-sky-300">
                🧊
              </div>
              <span className="text-base font-black text-white">+{rewardCubes}</span>
              <span className="text-[10px] font-bold text-sky-400">Power Cubes</span>
            </div>

            {/* Gold Coins Reward */}
            <div className="bg-slate-800/80 rounded-xl p-2.5 flex flex-col items-center border border-amber-500/30">
              <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-lg shadow-inner mb-1 border border-amber-300">
                🪙
              </div>
              <span className="text-base font-black text-white">+{rewardCoins}</span>
              <span className="text-[10px] font-bold text-amber-400">Coins</span>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={onNextLevel}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-slate-950 font-black text-lg tracking-wider shadow-[0_8px_20px_rgba(14,165,233,0.5)] border-2 border-white cursor-pointer transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            CONTINUE
          </button>

          <button
            onClick={onReplayLevel}
            className="py-2 text-xs font-bold text-slate-400 hover:text-white transition"
          >
            Replay Sector
          </button>
        </div>
      </div>
    </div>
  );
};
