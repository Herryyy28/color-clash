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
  onReturnHome?: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  level,
  timeBonus,
  rewardCubes,
  rewardCoins,
  onNextLevel,
  onReplayLevel,
  onReturnHome,
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
    <div className="fixed inset-0 z-50 bg-[#071940]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#1844a8] via-[#123687] to-[#0a235c] rounded-3xl p-6 border-2 border-sky-300 shadow-[0_0_50px_rgba(14,165,233,0.5)] flex flex-col items-center text-center animate-in zoom-in-90 duration-300">
        {/* Crown and Shield Wings Emblem from Video */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className="absolute -top-3 text-amber-400 animate-bounce">
            👑
          </div>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-500 flex items-center justify-center shadow-2xl border-2 border-white rotate-45 transform">
            <Shield className="w-10 h-10 text-white fill-white/30 -rotate-45" />
          </div>
        </div>

        {/* VICTORY Title */}
        <h1 className="text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-white to-sky-200 drop-shadow mt-2">
          VICTORY
        </h1>
        <p className="text-xs font-black text-sky-200 uppercase tracking-widest mt-1">
          Sector {level} Conquered!
        </p>

        {/* 3 Stars */}
        <div className="flex gap-2 my-4">
          <Star className="w-8 h-8 text-amber-400 fill-amber-400 drop-shadow" />
          <Star className="w-9 h-9 text-amber-400 fill-amber-400 drop-shadow -translate-y-1.5" />
          <Star className="w-8 h-8 text-amber-400 fill-amber-400 drop-shadow" />
        </div>

        {/* Time Bonus & Reward Box */}
        <div className="w-full bg-[#0c2a6b] rounded-2xl p-4 border-2 border-blue-400/40 mb-5 flex flex-col gap-3 shadow">
          <div className="flex justify-between items-center text-xs font-black text-blue-200 border-b border-blue-400/30 pb-2">
            <span>TIME BONUS</span>
            <span className="text-yellow-300 font-extrabold text-sm">+{timeBonus}s</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Color Cubes Reward */}
            <div className="bg-[#133785] rounded-xl p-2.5 flex flex-col items-center border border-sky-300/40 shadow">
              <div className="w-9 h-9 rounded-lg bg-sky-500 flex items-center justify-center text-lg shadow mb-1 border border-white">
                🧊
              </div>
              <span className="text-base font-black text-white">+{rewardCubes}</span>
              <span className="text-[10px] font-black text-sky-200">Power Cubes</span>
            </div>

            {/* Gold Coins Reward */}
            <div className="bg-[#133785] rounded-xl p-2.5 flex flex-col items-center border border-yellow-300/40 shadow">
              <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-lg shadow mb-1 border border-white">
                🪙
              </div>
              <span className="text-base font-black text-white">+{rewardCoins}</span>
              <span className="text-[10px] font-black text-yellow-300">Coins</span>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={onNextLevel}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-black text-lg tracking-wider shadow-[0_8px_20px_rgba(245,158,11,0.5)] border-2 border-white cursor-pointer transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            CONTINUE
          </button>

          <div className="flex gap-2 w-full">
            {onReturnHome && (
              <button
                onClick={onReturnHome}
                className="flex-1 py-2 rounded-xl bg-[#133785] hover:bg-[#1a4db8] text-xs font-black text-white transition cursor-pointer border border-blue-300/40 shadow"
              >
                🏠 Home Menu
              </button>
            )}
            <button
              onClick={onReplayLevel}
              className="flex-1 py-2 rounded-xl bg-[#133785] hover:bg-[#1a4db8] text-xs font-black text-blue-200 hover:text-white transition cursor-pointer border border-blue-300/40 shadow"
            >
              Replay Sector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
