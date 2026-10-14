import React, { useEffect, useState } from 'react';
import { sounds } from '../audio';

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
  const [coins, setCoins] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const [displayedAmount, setDisplayedAmount] = useState(0);

  useEffect(() => {
    sounds.playRewardClaim();

    // Generate 12 flying coin particles
    const particleCount = 12;
    const newCoins = Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 140, // random burst radius
      y: (Math.random() - 0.5) * 140,
      delay: i * 40,
    }));
    setCoins(newCoins);

    // Number roll up animation
    const duration = 1000;
    const steps = 20;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const current = Math.min(amount, Math.round((step / steps) * amount));
      setDisplayedAmount(current);
      if (step >= steps) {
        clearInterval(timer);
      }
    }, stepTime);

    // Auto complete callback
    const doneTimer = setTimeout(() => {
      onComplete?.();
    }, 1800);

    return () => {
      clearInterval(timer);
      clearTimeout(doneTimer);
    };
  }, [amount, onComplete]);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center select-none">
      {/* Central Celebratory Banner */}
      <div className="relative flex flex-col items-center animate-in zoom-in-75 duration-300">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-300 via-amber-400 to-yellow-500 border-4 border-white shadow-[0_0_40px_rgba(250,204,21,0.8)] flex items-center justify-center text-4xl animate-bounce">
          🪙
        </div>

        {/* Flying coins bursting outward then floating */}
        <div className="absolute inset-0 flex items-center justify-center">
          {coins.map((c) => (
            <div
              key={c.id}
              className="absolute text-2xl transition-all duration-700 ease-out"
              style={{
                transform: `translate(${c.x}px, ${c.y - 40}px) scale(1.1)`,
                opacity: 0.9,
                animation: `floatUp 1.2s ease-out forwards ${c.delay}ms`,
              }}
            >
              🪙
            </div>
          ))}
        </div>

        <div className="mt-4 bg-[#0a235c]/95 border-2 border-yellow-300 px-6 py-2.5 rounded-2xl shadow-2xl text-center">
          <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 drop-shadow">
            +{displayedAmount} Coins
          </span>
          <span className="block text-[11px] font-black uppercase tracking-wider text-sky-200 mt-0.5">
            {reason}
          </span>
        </div>
      </div>
    </div>
  );
};
