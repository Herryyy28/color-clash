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
    <div className="fixed inset-0 z-50 bg-[#17345D]/90 backdrop-blur-md flex items-center justify-center p-3 safe-pt safe-pb select-none overflow-y-auto">
      <div className="relative w-full max-w-sm max-h-[calc(100dvh-var(--safe-top)-var(--safe-bottom)-24px)] overflow-y-auto scroll-touch bg-gradient-to-b from-[#1769D2] via-[#124d9c] to-[#17345D] rounded-3xl p-4 sm:p-5 border-2 border-b-4 border-[#FFC83D] border-b-[#b38615] shadow-[0_0_50px_rgba(255,200,61,0.5)] flex flex-col items-center text-center animate-in zoom-in-90 duration-300">
        {/* Crown and Shield Wings Emblem */}
        <div className="relative mb-2 flex items-center justify-center shrink-0">
          <div className="absolute -top-3 text-[#FFC83D] text-2xl animate-bounce">
            👑
          </div>
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-[#FFC83D] to-[#b38615] flex items-center justify-center shadow-2xl border-2 border-white rotate-45 transform">
            <Shield className="w-8 h-8 sm:w-9 sm:h-9 text-[#17345D] fill-[#17345D]/30 -rotate-45" />
          </div>
        </div>

        {/* VICTORY Title */}
        <h1 className="text-3xl sm:text-4xl font-display tracking-wider text-[#FFC83D] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] mt-1">
          VICTORY!
        </h1>
        <p className="text-xs font-display text-[#F7E7BE] uppercase tracking-widest mt-0.5">
          Kingdom Sector {level} Conquered
        </p>

        {/* 3 Stars */}
        <div className="flex gap-2 my-2 shrink-0">
          <Star className="w-6 h-6 sm:w-7 sm:h-7 text-[#FFC83D] fill-[#FFC83D] drop-shadow" />
          <Star className="w-7 h-7 sm:w-8 sm:h-8 text-[#FFC83D] fill-[#FFC83D] drop-shadow -translate-y-1" />
          <Star className="w-6 h-6 sm:w-7 sm:h-7 text-[#FFC83D] fill-[#FFC83D] drop-shadow" />
        </div>

        {/* Time Bonus & Reward Box */}
        <div className="w-full bg-[#17345D] rounded-2xl p-2.5 sm:p-3 border-2 border-[#FFC83D]/50 mb-2.5 flex flex-col gap-2 shadow-inner shrink-0">
          <div className="flex justify-between items-center text-[11px] font-display text-[#F7E7BE] border-b border-[#FFC83D]/30 pb-1.5">
            <span>TIME BONUS</span>
            <span className="text-[#FFC83D] game-counter font-black text-xs">+{timeBonus}s</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-0.5">
            {/* Color Cubes Reward */}
            <div className="bg-[#1769D2]/40 rounded-xl p-2 flex flex-col items-center border border-[#FFC83D]/30 shadow">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#1769D2] flex items-center justify-center text-sm sm:text-base shadow mb-1 border border-white">
                🧊
              </div>
              <span className="text-base font-black game-counter text-white">+{rewardCubes}</span>
              <span className="text-[10px] font-display text-[#F7E7BE] uppercase">Power Cubes</span>
            </div>

            {/* Gold Coins Reward */}
            <div className="bg-[#1769D2]/40 rounded-xl p-2 flex flex-col items-center border border-[#FFC83D]/30 shadow">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#FFC83D] text-[#17345D] flex items-center justify-center text-sm sm:text-base shadow mb-1 border border-white">
                🪙
              </div>
              <span className="text-base font-black game-counter text-[#FFC83D]">+{displayedCoins}</span>
              <span className="text-[10px] font-display text-[#FFC83D] uppercase">Gold Coins</span>
            </div>
          </div>

          {transactionClaimId && (
            <div className="text-[9px] font-mono text-[#F7E7BE]/70 text-center truncate pt-1 border-t border-white/10">
              Verified Nonce: {transactionClaimId.substring(0, 18)}...
            </div>
          )}
        </div>

        {/* Rewarded Video Ad: 2X Battle Coins Action Button */}
        {onDoubleRewardAd && (
          <div className="w-full mb-2.5 shrink-0">
            {hasDoubledReward ? (
              <div className="w-full py-2.5 px-3 rounded-xl bg-[#79B957]/30 border-2 border-[#79B957] text-[#79B957] font-display text-xs flex items-center justify-center gap-1.5 shadow min-h-[44px]">
                <CheckCircle2 className="w-4 h-4 text-[#79B957]" />
                Coins Doubled With Rewarded Ad! (+{rewardCoins / 2} Bonus)
              </div>
            ) : (
              <button
                onClick={() => {
                  sounds.playClick();
                  onDoubleRewardAd();
                }}
                className="w-full py-2.5 px-4 rounded-xl btn-arena-green text-white font-display text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer transition animate-pulse min-h-[44px]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Watch Ad — Double Coins (+{rewardCoins} 🪙)
              </button>
            )}
          </div>
        )}

        {/* Continue & Navigation Buttons */}
        <div className="w-full flex flex-col gap-2 shrink-0">
          <button
            onClick={onNextLevel}
            className="w-full py-3 px-6 rounded-2xl btn-royal-gold text-[#17345D] font-display text-base tracking-wider shadow-xl cursor-pointer transition flex items-center justify-center gap-2 min-h-[46px]"
          >
            <Play className="w-4 h-4 fill-current text-[#17345D]" />
            CONTINUE
          </button>

          <div className="flex gap-2 w-full">
            {onReturnHome && (
              <button
                onClick={onReturnHome}
                className="flex-1 py-2.5 rounded-xl btn-royal-blue text-xs font-display text-white transition cursor-pointer shadow min-h-[44px] flex items-center justify-center"
              >
                🏠 Home Menu
              </button>
            )}
            <button
              onClick={onReplayLevel}
              className="flex-1 py-2.5 rounded-xl btn-royal-blue text-xs font-display text-[#F7E7BE] transition cursor-pointer shadow min-h-[44px] flex items-center justify-center"
            >
              Replay Sector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
