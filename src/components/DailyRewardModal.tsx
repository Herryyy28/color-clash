import React, { useState, useEffect } from 'react';
import { Calendar, Gift, Sparkles, Check, Clock, Play } from 'lucide-react';
import { currencyService } from '../services/currencyService';
import { sounds } from '../audio';
import confetti from 'canvas-confetti';
import { ResponsiveModal } from './ResponsiveModal';

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWatchBonusAd: () => void;
  onRewardClaimed: (coins: number) => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  isOpen,
  onClose,
  onWatchBonusAd,
  onRewardClaimed,
}) => {
  const [streakInfo, setStreakInfo] = useState(currencyService.getDailyStreakInfo());
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStreakInfo(currencyService.getDailyStreakInfo());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClaimToday = () => {
    sounds.playClick();
    const result = currencyService.claimDailyStreakReward();
    if (result.success) {
      sounds.playRewardClaim();
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#38bdf8', '#ffffff'],
      });
      setStreakInfo(currencyService.getDailyStreakInfo());
      setFeedback(`Claimed Day ${result.dayClaimed}: +${result.rewardCoins} Coins!`);
      onRewardClaimed(result.rewardCoins);
      setTimeout(() => setFeedback(null), 2500);
    } else {
      setFeedback(result.error || 'Reward currently on cooldown');
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="7-Day Daily Rewards"
      subtitle="Log in daily to claim escalating gold vaults"
      icon={<span className="text-xl">🎁</span>}
      maxWidthClass="max-w-sm"
    >
      <div className="flex flex-col gap-3">
          {feedback && (
            <div className="p-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 text-xs font-black text-center shadow animate-in fade-in border border-white">
              {feedback}
            </div>
          )}

          {/* 7-Day Grid */}
          <div className="grid grid-cols-4 gap-2">
            {streakInfo.schedule.slice(0, 6).map((item: { day: number; coins: number; gems: number; chestTier?: 'wooden' | 'silver' | 'gold' | 'magical'; label: string }) => {
              const isClaimed = item.day <= streakInfo.currentStreak && !streakInfo.canClaimToday;
              const isToday = item.day === streakInfo.nextDayIndex && streakInfo.canClaimToday;
              const isUpcoming = !isClaimed && !isToday;

              return (
                <div
                  key={item.day}
                  className={`relative rounded-xl p-2 flex flex-col items-center justify-between border-2 transition ${
                    isToday
                      ? 'bg-gradient-to-b from-amber-400/30 to-yellow-500/20 border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.5)] scale-105'
                      : isClaimed
                      ? 'bg-[#081e4a] border-emerald-400/50 opacity-80'
                      : 'bg-[#0c2a6b] border-blue-400/40 opacity-70'
                  }`}
                >
                  {isClaimed && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}

                  <span className="text-[9px] font-black uppercase text-sky-200">
                    Day {item.day}
                  </span>

                  <span className="text-xl my-1">
                    {item.chestTier === 'wooden' ? '📦' : item.chestTier === 'silver' ? '🥈' : '🪙'}
                  </span>

                  <span className="text-[10px] font-black text-yellow-300">
                    +{item.coins}
                  </span>
                </div>
              );
            })}

            {/* Day 7 Mega Jackpot Card spans 2 cols */}
            <div
              className={`col-span-2 relative rounded-xl p-2 flex items-center justify-between border-2 transition ${
                streakInfo.nextDayIndex === 7 && streakInfo.canClaimToday
                  ? 'bg-gradient-to-r from-amber-400/30 via-yellow-500/30 to-fuchsia-500/20 border-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.7)]'
                  : streakInfo.currentStreak >= 7
                  ? 'bg-[#081e4a] border-emerald-400/50 opacity-80'
                  : 'bg-[#0c2a6b] border-yellow-400/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-bounce">✨</span>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase text-yellow-300">
                    Day 7 Jackpot
                  </span>
                  <span className="text-xs font-black text-white">
                    +1,000 Coins + 35 Gems
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-2 flex flex-col gap-2">
            {streakInfo.canClaimToday ? (
              <button
                onClick={handleClaimToday}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-amber-950 font-black text-xs uppercase tracking-wider shadow border-2 border-white cursor-pointer active:scale-95 transition flex items-center justify-center gap-2 animate-pulse"
              >
                <Gift className="w-4 h-4 fill-current" />
                Claim Day {streakInfo.nextDayIndex} Reward
              </button>
            ) : (
              <div className="w-full py-2.5 px-3 rounded-xl bg-[#092257] border border-blue-400/40 text-blue-200 text-xs font-black flex items-center justify-center gap-2 shadow">
                <Clock className="w-3.5 h-3.5 text-sky-300" />
                Next claim in {Math.ceil(streakInfo.timeRemainingSeconds / 3600)}h {Math.ceil((streakInfo.timeRemainingSeconds % 3600) / 60)}m
              </div>
            )}

            {/* Optional Rewarded Ad Bonus Claim */}
            <button
              onClick={() => {
                sounds.playClick();
                onWatchBonusAd();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#143e99] hover:bg-[#1a4db8] text-white font-black text-xs uppercase tracking-wider shadow border border-sky-300/40 cursor-pointer active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current text-yellow-300" />
              Watch Ad for +150 Bonus Coins
            </button>
          </div>
        </div>
      </ResponsiveModal>
  );
};
