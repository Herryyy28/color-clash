import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../audio';
import { SpinReward } from '../types';
import { Sparkles, Trophy, Gift, ArrowDown, Check, Coins, Gem, Play, Video, Clock } from 'lucide-react';
import { ResponsiveModal } from './ResponsiveModal';
import { FREE_SPIN_COOLDOWN_MS, saveService } from '../saveService';

interface DailySpinViewProps {
  playerCoins: number;
  playerGems: number;
  hasFreeSpin: boolean;
  lastSpinTimestamp?: number;
  bonusSpinAvailable?: boolean;
  onClaimReward: (reward: SpinReward) => void;
  onOpenRewardedAd?: (placementId: string) => void;
  onConsumeBonusSpin?: () => void;
  onFreeSpinUnlocked?: () => void;
}

const REWARDS: SpinReward[] = [
  { id: '1', type: 'coins', amount: 50, label: '50 Coins', icon: '🪙', color: '#f59e0b' },
  { id: '2', type: 'gems', amount: 10, label: '10 Gems', icon: '💎', color: '#10b981' },
  { id: '3', type: 'cards', amount: 5, label: '5 Blasters', icon: '🏹', color: '#0ea5e9' },
  { id: '4', type: 'coins', amount: 120, label: '120 Coins', icon: '🪙', color: '#eab308' },
  { id: '5', type: 'chest', amount: 1, label: 'Silver Crate', icon: '🥈', color: '#8b5cf6' },
  { id: '6', type: 'coins', amount: 250, label: '250 Coins', icon: '🪙', color: '#f97316' },
  { id: '7', type: 'gems', amount: 25, label: '25 Gems', icon: '💎', color: '#06b6d4' },
  { id: '8', type: 'cards', amount: 4, label: '4 Mortars', icon: '🧪', color: '#ec4899' },
];

export const DailySpinView: React.FC<DailySpinViewProps> = ({
  playerCoins,
  playerGems,
  hasFreeSpin,
  lastSpinTimestamp,
  bonusSpinAvailable = false,
  onClaimReward,
  onOpenRewardedAd,
  onConsumeBonusSpin,
  onFreeSpinUnlocked,
}) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonReward, setWonReward] = useState<SpinReward | null>(null);
  const [remainingCooldownMs, setRemainingCooldownMs] = useState<number>(() => {
    const status = saveService.calculateFreeSpinStatus(lastSpinTimestamp);
    return status.remainingMs;
  });

  const currentRotationRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const isClaimingRef = useRef(false);

  // 1-second interval to update remaining cooldown live
  useEffect(() => {
    if (hasFreeSpin || !lastSpinTimestamp) {
      setRemainingCooldownMs(0);
      return;
    }

    const interval = setInterval(() => {
      const status = saveService.calculateFreeSpinStatus(lastSpinTimestamp);
      setRemainingCooldownMs(status.remainingMs);
      if (status.hasFreeSpin) {
        onFreeSpinUnlocked?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hasFreeSpin, lastSpinTimestamp, onFreeSpinUnlocked]);

  const formatCountdown = (ms: number): string => {
    if (ms <= 0) return '00:00:00';
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const canSpinNow = hasFreeSpin || bonusSpinAvailable;

  // Spin wheel logic
  const handleSpin = () => {
    if (isSpinning) return;
    if (!canSpinNow) {
      if (onOpenRewardedAd) {
        sounds.playClick();
        onOpenRewardedAd('placement_spin_wheel');
      }
      return;
    }

    setIsSpinning(true);
    setWonReward(null);

    // Pick winning index
    const winningIndex = Math.floor(Math.random() * REWARDS.length);
    const sliceAngle = 360 / REWARDS.length;

    // Target rotation to align wedge center with top needle
    const extraSpins = 5 + Math.floor(Math.random() * 3); // 5-7 full turns
    const wedgeCenter = winningIndex * sliceAngle + sliceAngle / 2;
    const targetRotation = currentRotationRef.current + extraSpins * 360 + (360 - wedgeCenter);

    const startTime = performance.now();
    const duration = 3800; // 3.8s
    const startRot = currentRotationRef.current;
    let lastTickAngle = startRot;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Quintic ease-out for realistic wheel deceleration
      const ease = 1 - Math.pow(1 - t, 4.5);
      const current = startRot + (targetRotation - startRot) * ease;

      // Tick sound every 30 degrees
      if (Math.abs(current - lastTickAngle) >= 30) {
        sounds.playSpinTick();
        lastTickAngle = current;
      }

      setRotation(current);
      currentRotationRef.current = current;

      if (t < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const reward = REWARDS[winningIndex];
        setWonReward(reward);
        sounds.playRewardClaim();
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const numSlices = REWARDS.length;
  const sliceAngle = 360 / numSlices;
  const radius = 140;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-3 sm:p-4 pb-14 select-none bg-gradient-to-b from-[#1769D2] via-[#124d9c] to-[#17345D] text-white overflow-y-auto scroll-touch">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between pb-2.5 border-b-2 border-[#FFC83D]/40 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-display text-white flex items-center gap-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            Royal Lucky Wheel <Gift className="w-5 h-5 text-[#FFC83D]" />
          </h1>
          <span className="text-[11px] text-[#F7E7BE] font-body font-bold">
            {hasFreeSpin
              ? '1 Free Daily Spin Available!'
              : bonusSpinAvailable
              ? 'Bonus Ad Spin Ready!'
              : 'Watch AdMob Ad to Spin Again!'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#17345D] border-2 border-[#FFC83D] px-2.5 py-1 rounded-xl text-xs game-counter font-black text-[#FFC83D] shadow-md">
            <span>🪙</span> {playerCoins}
          </div>
          <div className="flex items-center gap-1 bg-[#17345D] border-2 border-[#79B957] px-2.5 py-1 rounded-xl text-xs game-counter font-black text-[#79B957] shadow-md">
            <span>💎</span> {playerGems}
          </div>
        </div>
      </div>

      {/* Wheel Container */}
      <div className="relative my-auto flex flex-col items-center justify-center shrink-0 py-3">
        {/* Top Indicator Arrow Needle */}
        <div className="z-20 -mb-3 flex flex-col items-center drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]">
          <div className="w-7 h-8 bg-gradient-to-b from-[#FFC83D] to-[#b38615] clip-triangle flex items-center justify-center shadow-xl border-x-2 border-t-2 border-white [clip-path:polygon(50%_100%,0%_0%,100%_0%)]" />
        </div>

        {/* Outer Wheel Glow Rim */}
        <div className="relative w-[min(265px,74vw,35vh)] h-[min(265px,74vw,35vh)] rounded-full p-2.5 bg-gradient-to-tr from-[#FFC83D] via-[#17345D] to-[#FFC83D] shadow-[0_0_35px_rgba(255,200,61,0.4)] border-4 border-[#FFC83D] flex items-center justify-center">
          {/* SVG Rotating Slices */}
          <svg
            className="w-full h-full rounded-full"
            viewBox="-150 -150 300 300"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            {REWARDS.map((reward, i) => {
              const startAngle = (i * sliceAngle - 90) * (Math.PI / 180);
              const endAngle = ((i + 1) * sliceAngle - 90) * (Math.PI / 180);

              const x1 = radius * Math.cos(startAngle);
              const y1 = radius * Math.sin(startAngle);
              const x2 = radius * Math.cos(endAngle);
              const y2 = radius * Math.sin(endAngle);

              const pathData = `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
              const midAngle = (i * sliceAngle + sliceAngle / 2 - 90) * (Math.PI / 180);
              const textRadius = radius * 0.65;
              const textX = textRadius * Math.cos(midAngle);
              const textY = textRadius * Math.sin(midAngle);

              return (
                <g key={reward.id}>
                  <path
                    d={pathData}
                    fill={i % 2 === 0 ? '#1769D2' : '#17345D'}
                    stroke="#FFC83D"
                    strokeWidth="2"
                  />
                  {/* Text and Icon */}
                  <g
                    transform={`translate(${textX}, ${textY}) rotate(${i * sliceAngle + sliceAngle / 2})`}
                  >
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#ffffff"
                      fontSize="15"
                      fontWeight="bold"
                    >
                      {reward.icon}
                    </text>
                    <text
                      y="16"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#FFC83D"
                      fontSize="10"
                      fontWeight="900"
                    >
                      {reward.label.split(' ')[0]}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Center Hub Button */}
          <button
            disabled={isSpinning}
            onClick={() => {
              if (canSpinNow) {
                handleSpin();
              } else if (onOpenRewardedAd) {
                sounds.playClick();
                onOpenRewardedAd('placement_spin_wheel');
              }
            }}
            className="absolute z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-[#FFC83D] via-[#ffe382] to-[#FFC83D] text-[#17345D] font-display text-base tracking-wider shadow-[0_4px_15px_rgba(255,200,61,0.8)] border-4 border-white flex flex-col items-center justify-center cursor-pointer active:scale-90 transition disabled:opacity-80"
          >
            <span>{isSpinning ? '...' : canSpinNow ? 'SPIN' : 'WATCH'}</span>
            <span className="text-[9px] font-display text-[#17345D]/80">
              {canSpinNow ? (hasFreeSpin ? 'FREE' : 'READY!') : '▶ AD'}
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Spin CTA & Information */}
      <div className="w-full flex flex-col items-center shrink-0 mb-2">
        {hasFreeSpin ? (
          /* State 1: One Free Daily Spin Available */
          <>
            <button
              disabled={isSpinning}
              onClick={handleSpin}
              className="w-full max-w-xs py-3.5 px-6 rounded-2xl btn-royal-gold text-[#17345D] font-display text-base tracking-wide shadow-xl cursor-pointer transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Gift className="w-5 h-5 text-[#17345D]" />
              {isSpinning ? 'SPINNING WHEEL...' : 'FREE ROYAL SPIN'}
            </button>
            <span className="text-[11px] font-body font-bold text-[#F7E7BE] mt-2">
              ✨ 1 Free Daily Spin Available Today!
            </span>
          </>
        ) : bonusSpinAvailable ? (
          /* State 2: Ad Completed, Spin Unlocked */
          <>
            <button
              disabled={isSpinning}
              onClick={handleSpin}
              className="w-full max-w-xs py-3.5 px-6 rounded-2xl btn-arena-green text-white font-display text-base tracking-wide shadow-xl cursor-pointer transition flex items-center justify-center gap-2 animate-bounce"
            >
              <Sparkles className="w-5 h-5 text-[#FFC83D]" />
              {isSpinning ? 'SPINNING WHEEL...' : 'SPIN UNLOCKED! TAP TO SPIN'}
            </button>
            <span className="text-[11px] font-body font-bold text-[#79B957] mt-2">
              🎉 AdMob Reward Verified! Extra Spin Ready!
            </span>
          </>
        ) : (
          /* State 3: Free Spin Used -> Watch Ad to Spin */
          <>
            <button
              disabled={isSpinning}
              onClick={() => {
                sounds.playClick();
                if (onOpenRewardedAd) {
                  onOpenRewardedAd('placement_spin_wheel');
                }
              }}
              className="w-full max-w-xs py-3.5 px-6 rounded-2xl btn-royal-gold text-[#17345D] font-display text-base tracking-wide shadow-xl cursor-pointer transition flex items-center justify-center gap-2 animate-pulse"
            >
              <Play className="w-5 h-5 fill-current text-[#17345D]" />
              <span>WATCH AD TO SPIN</span>
            </button>
            <div className="flex flex-col items-center gap-1 mt-2">
              <span className="text-[11px] font-body font-bold text-[#F7E7BE]">
                Daily free spin claimed. Watch short AdMob video to spin again!
              </span>
              <div className="flex items-center gap-1.5 bg-[#0f2444] border border-[#FFC83D]/40 px-3 py-1 rounded-full text-xs font-display text-[#F7E7BE] shadow">
                <Clock className="w-3.5 h-3.5 text-[#FFC83D]" />
                <span>Next Free Spin in: <strong className="text-white game-counter font-extrabold">{formatCountdown(remainingCooldownMs)}</strong></span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Won Reward Popup with idempotent claim lock */}
      {wonReward && (
        <ResponsiveModal
          isOpen={true}
          onClose={() => {
            if (isClaimingRef.current) return;
            isClaimingRef.current = true;
            const reward = wonReward;
            setWonReward(null);
            onClaimReward(reward);
            if (!hasFreeSpin && bonusSpinAvailable) {
              onConsumeBonusSpin?.();
            }
            setTimeout(() => { isClaimingRef.current = false; }, 400);
          }}
          title="Victory Spoils!"
          subtitle={`You Won ${wonReward.label}!`}
          icon={<span className="text-2xl">{wonReward.icon}</span>}
          borderGlowColor="border-[#FFC83D] shadow-[0_0_50px_rgba(255,200,61,0.6)]"
          maxWidthClass="max-w-xs"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#FFC83D] to-[#d49911] flex items-center justify-center text-4xl shadow-xl border-2 border-white mb-2 animate-bounce">
              {wonReward.icon}
            </div>
            <h2 className="text-xl font-display text-[#17345D] mt-1 drop-shadow">
              {wonReward.label}
            </h2>
            <p className="text-xs text-[#17345D]/80 mt-1 font-body font-bold">
              Reward added to your Royal Treasury.
            </p>

            <button
              onClick={() => {
                if (isClaimingRef.current) return;
                isClaimingRef.current = true;
                sounds.playClick();
                const reward = wonReward;
                setWonReward(null);
                onClaimReward(reward);
                if (!hasFreeSpin && bonusSpinAvailable) {
                  onConsumeBonusSpin?.();
                }
                setTimeout(() => { isClaimingRef.current = false; }, 400);
              }}
              className="mt-4 w-full py-3.5 rounded-2xl btn-arena-green text-white font-display text-sm uppercase tracking-wider shadow-lg cursor-pointer transition"
            >
              CLAIM BOUNTY
            </button>
          </div>
        </ResponsiveModal>
      )}
    </div>
  );
};

