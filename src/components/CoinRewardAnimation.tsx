import React, { useEffect, useState, useRef, useCallback } from 'react';
import { sounds } from '../audio';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface CoinRewardAnimationProps {
  amount: number;
  reason?: string;
  onComplete?: () => void;
}

export const CoinRewardAnimation: React.FC<CoinRewardAnimationProps> = ({
  amount,
  reason = 'Reward Collected!',
  onComplete,
}) => {
  const [coins, setCoins] = useState<Array<{ id: number; x: number; y: number; delay: number; scale: number }>>([]);
  const [displayedAmount, setDisplayedAmount] = useState(0);
  const [isDismissing, setIsDismissing] = useState(false);

  // Stable reference to avoid re-triggering effect on parent re-renders
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const hasFinishedRef = useRef(false);

  const handleDismiss = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setIsDismissing(true);
    sounds.playCoinGain();

    // Short exit fade before unmounting
    setTimeout(() => {
      onCompleteRef.current?.();
    }, 220);
  }, []);

  useEffect(() => {
    sounds.playRewardClaim();

    // Generate 16 flying coins bursting outwards
    const particleCount = 16;
    const newCoins = Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 180,
      y: (Math.random() - 0.5) * 160 - 20,
      delay: i * 25,
      scale: 0.85 + Math.random() * 0.45,
    }));
    setCoins(newCoins);

    // Number roll up animation (snappy 500ms)
    const duration = 500;
    const steps = 15;
    const stepTime = duration / steps;
    let step = 0;

    const rollTimer = setInterval(() => {
      step++;
      const current = Math.min(amount, Math.round((step / steps) * amount));
      setDisplayedAmount(current);
      if (step >= steps) {
        clearInterval(rollTimer);
      }
    }, stepTime);

    // Guaranteed auto-complete timer (1.8s) that is immune to parent re-render cancellations
    const autoDoneTimer = setTimeout(() => {
      handleDismiss();
    }, 1800);

    return () => {
      clearInterval(rollTimer);
      clearTimeout(autoDoneTimer);
    };
  }, [amount, handleDismiss]);

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 z-50 flex items-center justify-center select-none bg-black/45 backdrop-blur-[2px] transition-opacity duration-200 cursor-pointer ${
        isDismissing ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Central Celebratory Banner */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
        className="relative flex flex-col items-center animate-in zoom-in-75 duration-300 font-body px-4"
      >
        {/* Glow halo behind central coin */}
        <div className="absolute w-36 h-36 rounded-full bg-yellow-400/25 blur-2xl animate-pulse pointer-events-none" />

        {/* Central Giant Coin Emblem */}
        <div className="relative w-22 h-22 rounded-full bg-gradient-to-tr from-yellow-300 via-amber-400 to-yellow-500 border-4 border-white shadow-[0_0_50px_rgba(250,204,21,0.9)] flex items-center justify-center text-5xl animate-bounce z-10">
          🪙
        </div>

        {/* Flying coins bursting outward then floating */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {coins.map((c) => (
            <div
              key={c.id}
              className="absolute text-2xl transition-all duration-700 ease-out"
              style={{
                transform: `translate(${c.x}px, ${c.y - 40}px) scale(${c.scale})`,
                opacity: 0.95,
                animation: `floatUp 1.2s ease-out forwards ${c.delay}ms`,
              }}
            >
              🪙
            </div>
          ))}
        </div>

        {/* Reward Modal Card with Lilita One and Nunito Tabular Figures */}
        <div className="relative z-10 mt-5 bg-[#0a235c] border-2 border-yellow-300 px-7 py-4 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-center flex flex-col items-center min-w-[220px]">
          <span className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 drop-shadow game-counter flex items-center gap-1.5">
            +{displayedAmount} <span className="font-display text-2xl text-yellow-300">Coins</span>
          </span>

          <span className="block font-display text-xs uppercase tracking-wider text-sky-200 mt-1 drop-shadow">
            {reason}
          </span>

          {/* Chunky 3D Collect Button (Click to dismiss immediately) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="btn-game-yellow mt-3.5 px-6 py-2 rounded-xl font-display text-xs tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" /> COLLECT
          </button>
        </div>

        <span className="text-[11px] text-blue-200/80 font-semibold mt-2.5 drop-shadow pointer-events-none">
          Tap anywhere to collect
        </span>
      </div>
    </div>
  );
};
