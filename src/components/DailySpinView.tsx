import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../audio';
import { SpinReward } from '../types';
import { Sparkles, Trophy, Gift, ArrowDown, Check, Coins, Gem } from 'lucide-react';

interface DailySpinViewProps {
  playerCoins: number;
  playerGems: number;
  hasFreeSpin: boolean;
  onClaimReward: (reward: SpinReward) => void;
}

const REWARDS: SpinReward[] = [
  { id: '1', type: 'coins', amount: 50, label: '50 Coins', icon: '🪙', color: '#f59e0b' },
  { id: '2', type: 'gems', amount: 10, label: '10 Gems', icon: '💎', color: '#10b981' },
  { id: '3', type: 'cards', amount: 5, label: '5 Blasters', icon: '🔫', color: '#0ea5e9' },
  { id: '4', type: 'coins', amount: 120, label: '120 Coins', icon: '🪙', color: '#eab308' },
  { id: '5', type: 'chest', amount: 1, label: 'Silver Crate', icon: '🥈', color: '#8b5cf6' },
  { id: '6', type: 'coins', amount: 250, label: '250 Coins', icon: '🪙', color: '#f97316' },
  { id: '7', type: 'gems', amount: 25, label: '25 Gems', icon: '💎', color: '#06b6d4' },
  { id: '8', type: 'cards', amount: 4, label: '4 Mortars', icon: '🚀', color: '#ec4899' },
];

export const DailySpinView: React.FC<DailySpinViewProps> = ({
  playerCoins,
  playerGems,
  hasFreeSpin,
  onClaimReward,
}) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonReward, setWonReward] = useState<SpinReward | null>(null);
  const [canSpin, setCanSpin] = useState(hasFreeSpin);

  const currentRotationRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Spin wheel logic
  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWonReward(null);

    // Pick winning index
    const winningIndex = Math.floor(Math.random() * REWARDS.length);
    const sliceAngle = 360 / REWARDS.length;

    // The arrow is at top (270 deg in SVG / 0 deg at top).
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

      // Tick sound every 45 degrees
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
    <div className="w-full h-full flex flex-col items-center justify-between p-3.5 select-none bg-gradient-to-b from-[#1448b8] via-[#0f3894] to-[#0a296e] text-white overflow-hidden">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between pb-2 border-b border-blue-400/30 shrink-0">
        <div>
          <h1 className="text-lg font-black text-white flex items-center gap-1.5 drop-shadow">
            Lucky Spin <Gift className="w-4 h-4 text-amber-400" />
          </h1>
          <span className="text-[11px] text-blue-100 font-bold">
            Spin daily for coins, gems & cards!
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#0c2a6b] border border-yellow-400/40 px-2 py-0.5 rounded-xl text-xs font-black text-yellow-300 shadow">
            <span>🪙</span> {playerCoins}
          </div>
          <div className="flex items-center gap-1 bg-[#0c2a6b] border border-emerald-400/40 px-2 py-0.5 rounded-xl text-xs font-black text-emerald-300 shadow">
            <span>💎</span> {playerGems}
          </div>
        </div>
      </div>

      {/* Wheel Container */}
      <div className="relative my-auto flex flex-col items-center justify-center">
        {/* Top Indicator Arrow Needle */}
        <div className="z-20 -mb-4 flex flex-col items-center drop-shadow-[0_4px_8px_rgba(10,30,80,0.6)]">
          <div className="w-6 h-7 bg-gradient-to-b from-amber-300 to-amber-500 clip-triangle flex items-center justify-center shadow-lg border-x-2 border-t-2 border-white [clip-path:polygon(50%_100%,0%_0%,100%_0%)]" />
        </div>

        {/* Outer Wheel Glow Rim */}
        <div className="relative w-72 h-72 rounded-full p-2 bg-gradient-to-tr from-amber-400 via-sky-400 to-indigo-500 shadow-[0_0_40px_rgba(56,189,248,0.5)] border-4 border-white flex items-center justify-center">
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
                    fill={i % 2 === 0 ? '#1e4db8' : '#143b92'}
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                  />
                  {/* Text and Icon */}
                  <g
                    transform={`translate(${textX}, ${textY}) rotate(${i * sliceAngle + sliceAngle / 2})`}
                  >
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#ffffff"
                      fontSize="14"
                      fontWeight="bold"
                    >
                      {reward.icon}
                    </text>
                    <text
                      y="16"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={reward.color}
                      fontSize="9"
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
            onClick={handleSpin}
            className="absolute z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-amber-950 font-black text-sm tracking-wider shadow-[0_4px_15px_rgba(245,158,11,0.8)] border-4 border-white flex flex-col items-center justify-center cursor-pointer active:scale-90 transition disabled:opacity-80"
          >
            <span>{isSpinning ? '...' : 'SPIN'}</span>
            <span className="text-[9px] font-black text-amber-950/80">FREE</span>
          </button>
        </div>
      </div>

      {/* Bottom Spin CTA & Information */}
      <div className="w-full flex flex-col items-center shrink-0 mb-2">
        <button
          disabled={isSpinning}
          onClick={handleSpin}
          className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-amber-950 font-black text-base tracking-wide shadow-lg border-2 border-white cursor-pointer active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Gift className="w-5 h-5" />
          {isSpinning ? 'SPINNING...' : 'FREE DAILY SPIN'}
        </button>
        <span className="text-[10px] font-bold text-blue-200 mt-1.5">
          Resets daily. All prizes credited instantly!
        </span>
      </div>

      {/* Won Reward Popup */}
      {wonReward && (
        <div className="fixed inset-0 z-50 bg-[#071940]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-xs bg-gradient-to-b from-[#1844a8] via-[#123687] to-[#0a235c] rounded-3xl p-6 border-2 border-amber-300 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-4xl shadow-xl border-2 border-white mb-2 animate-bounce">
              {wonReward.icon}
            </div>
            <span className="text-xs font-black text-yellow-300 uppercase tracking-widest">
              Congratulations!
            </span>
            <h2 className="text-2xl font-black text-white mt-1 drop-shadow">
              You Won {wonReward.label}!
            </h2>
            <p className="text-xs text-blue-100 mt-1 font-medium">
              Reward added to your inventory.
            </p>

            <button
              onClick={() => {
                sounds.playClick();
                onClaimReward(wonReward);
                setWonReward(null);
              }}
              className="mt-4 w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 text-teal-950 font-black text-sm uppercase tracking-wider shadow border-2 border-white cursor-pointer active:scale-95"
            >
              CLAIM REWARD
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
