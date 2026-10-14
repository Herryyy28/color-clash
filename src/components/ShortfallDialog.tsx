import React from 'react';
import { AlertCircle, Play, ShoppingBag, X } from 'lucide-react';
import { sounds } from '../audio';
import { ResponsiveModal } from './ResponsiveModal';

interface ShortfallDialogProps {
  isOpen: boolean;
  itemTitle: string;
  requiredCoins: number;
  currentCoins: number;
  onClose: () => void;
  onWatchAdForCoins: () => void;
  onOpenShop: () => void;
}

export const ShortfallDialog: React.FC<ShortfallDialogProps> = ({
  isOpen,
  itemTitle,
  requiredCoins,
  currentCoins,
  onClose,
  onWatchAdForCoins,
  onOpenShop,
}) => {
  if (!isOpen) return null;

  const shortfall = Math.max(0, requiredCoins - currentCoins);

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Not Enough Coins!"
      subtitle="Complete your purchase"
      icon={<span className="text-xl">🪙</span>}
      borderGlowColor="border-amber-300 shadow-[0_0_40px_rgba(245,158,11,0.5)]"
      maxWidthClass="max-w-sm"
    >
      <div className="flex flex-col items-center text-center font-body">
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border-2 border-amber-300 flex items-center justify-center text-3xl mb-3 shadow">
          🪙
        </div>

        <h3 className="text-xl font-display text-white tracking-wider">NEED MORE GOLD!</h3>
        <p className="text-xs text-blue-100 font-semibold mt-1">
          You need more gold to complete <strong className="text-yellow-300 font-bold">{itemTitle}</strong>.
        </p>

        {/* Shortfall Breakdown Card */}
        <div className="w-full bg-[#081d47] border border-blue-400/40 rounded-2xl p-3 my-3.5 flex flex-col gap-2 text-xs">
          <div className="flex justify-between text-blue-200 font-semibold">
            <span>Required Price:</span>
            <strong className="text-white flex items-center gap-1 game-counter font-extrabold">🪙 {requiredCoins}</strong>
          </div>
          <div className="flex justify-between text-blue-200 font-semibold">
            <span>Your Current Balance:</span>
            <strong className="text-yellow-300 flex items-center gap-1 game-counter font-extrabold">🪙 {currentCoins}</strong>
          </div>
          <div className="pt-2 border-t border-blue-400/30 flex justify-between font-extrabold text-rose-300">
            <span>Shortfall:</span>
            <span className="bg-rose-950/80 border border-rose-400 px-2 py-0.5 rounded-lg game-counter font-extrabold">
              -{shortfall} Coins
            </span>
          </div>
        </div>

        {/* Action Options */}
        <div className="w-full flex flex-col gap-2">
          {/* Watch Ad option */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onWatchAdForCoins();
            }}
            className="btn-game-yellow w-full py-3 px-4 rounded-xl font-display text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow min-h-[44px]"
          >
            <Play className="w-4 h-4 fill-current" />
            WATCH AD FOR +100 COINS
          </button>

          {/* Go to shop option */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenShop();
            }}
            className="btn-game-blue w-full py-2.5 px-4 rounded-xl font-display text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow min-h-[44px]"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            VISIT SHOP &amp; OFFERS
          </button>
        </div>
      </div>
    </ResponsiveModal>
  );
};
