import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Star, Shield, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import { sounds } from '../audio';

interface VictoryModalProps {
  level: number;
  timeBonus: number;
  rewardCubes: number;
  rewardCoins: number;
  transactionClaimId?: string;
  hasDoubledReward?: boolean;
  onDoubleRewardAd?: () => void;
  onNextLevel: () => void;
  onReplayLevel: () => void;
  onReturnHome?: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  level,
  timeBonus,
  rewardCubes,
  rewardCoins,
  transactionClaimId,
  hasDoubledReward = false,
  onDoubleRewardAd,
  onNextLevel,
  onReplayLevel,
  onReturnHome,
}) => {
  // Animated counter for displayed coins
  const [displayedCoins, setDisplayedCoins] = useState(0);

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

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });

    // Smooth coin roll-up animation
    const steps = 15;
    const duration = 600;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const current = Math.min(rewardCoins, Math.round((step / steps) * rewardCoins));
      setDisplayedCoins(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [rewardCoins]);

  return (
    <div className="fixed inset-0 z-50 bg-[#071940]/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#1844a8] via-[#123687] to-[#0a235c] rounded-3xl p-5 border-2 border-sky-300 shadow-[0_0_50px_rgba(14,165,233,0.5)] flex flex-col items-center text-center animate-in zoom-in-90 duration-300">
        {/* Crown and Shield Wings Emblem */}
        <div className="relative mb-2 flex items-center justify-center">
          <div className="absolute -top-3 text-amber-400 animate-bounce">
            👑
          </div>
          <div className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-500 flex items-center justify-center shadow-2xl border-2 border-white rotate-45 transform">
            <Shield className="w-9 h-9 text-white fill-white/30 -rotate-45" />
          </div>
        </div>

        {/* VICTORY Title */}
        <h1 className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-white to-sky-200 drop-shadow mt-1">
          VICTORY
        </h1>
        <p className="text-[11px] font-black text-sky-200 uppercase tracking-widest mt-0.5">
          Sector {level} Conquered!
        </p>

        {/* 3 Stars */}
        <div className="flex gap-2 my-2.5">
          <Star className="w-7 h-7 text-amber-400 fill-amber-400 drop-shadow" />
          <Star className="w-8 h-8 text-amber-400 fill-amber-400 drop-shadow -translate-y-1" />
          <Star className="w-7 h-7 text-amber-400 fill-amber-400 drop-shadow" />
        </div>

        {/* Time Bonus & Reward Box */}
        <div className="w-full bg-[#0c2a6b] rounded-2xl p-3 border-2 border-blue-400/40 mb-3 flex flex-col gap-2 shadow">
          <div className="flex justify-between items-center text-[11px] font-black text-blue-200 border-b border-blue-400/30 pb-1.5">
            <span>TIME BONUS</span>
            <span className="text-yellow-300 font-extrabold text-xs">+{timeBonus}s</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {/* Color Cubes Reward */}
            <div className="bg-[#133785] rounded-xl p-2 flex flex-col items-center border border-sky-300/40 shadow">
              <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-base shadow mb-1 border border-white">
                🧊
              </div>
              <span className="text-sm font-black text-white">+{rewardCubes}</span>
              <span className="text-[9px] font-black text-sky-200">Power Cubes</span>
            </div>

            {/* Gold Coins Reward (Authoritative verified amount) */}
            <div className="bg-[#133785] rounded-xl p-2 flex flex-col items-center border border-yellow-300/40 shadow">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-base shadow mb-1 border border-white">
                🪙
              </div>
              <span className="text-sm font-black text-yellow-300">+{displayedCoins}</span>
              <span className="text-[9px] font-black text-yellow-300">Gold Coins</span>
            </div>
          </div>

          {transactionClaimId && (
            <div className="text-[9px] font-mono text-sky-300/80 text-center truncate pt-1 border-t border-blue-400/20">
              Verified Nonce: {transactionClaimId.substring(0, 18)}...
            </div>
          )}
        </div>

        {/* Rewarded Video Ad: 2X Battle Coins Action Button (Master Prompt Requirement 5) */}
        {onDoubleRewardAd && (
          <div className="w-full mb-3">
            {hasDoubledReward ? (
              <div className="w-full py-2 px-3 rounded-xl bg-emerald-900/60 border border-emerald-400 text-emerald-200 font-black text-xs flex items-center justify-center gap-1.5 shadow">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Coins Doubled With Rewarded Ad! (+{rewardCoins / 2} Bonus)
              </div>
            ) : (
              <button
                onClick={() => {
                  sounds.playClick();
                  onDoubleRewardAd();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-amber-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-white shadow-[0_4px_16px_rgba(245,158,11,0.5)] cursor-pointer active:scale-95 transition animate-pulse"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Watch Ad — Double Coins (+{rewardCoins} 🪙)
              </button>
            )}
          </div>
        )}

        {/* Continue & Navigation Buttons */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={onNextLevel}
            className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 hover:from-sky-300 hover:to-blue-400 text-white font-black text-base tracking-wider shadow-[0_6px_20px_rgba(14,165,233,0.5)] border-2 border-white cursor-pointer transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
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
