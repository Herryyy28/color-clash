import React from 'react';
import { AlertCircle, Play, ShoppingBag, X } from 'lucide-react';
import { sounds } from '../audio';

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
    <div className="fixed inset-0 z-50 bg-[#071940]/85 backdrop-blur-md flex items-center justify-center p-3 select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1c55bc] via-[#143e99] to-[#0c2a6b] p-5 border-2 border-amber-300 shadow-[0_0_40px_rgba(245,158,11,0.5)] flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#0a235c] border border-blue-300/40 text-blue-200 hover:text-white flex items-center justify-center cursor-pointer active:scale-95"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border-2 border-amber-300 flex items-center justify-center text-3xl mb-3 shadow">
          🪙
        </div>

        <h3 className="text-lg font-black text-white">Not Enough Coins!</h3>
        <p className="text-xs text-blue-100 font-medium mt-1">
          You need more gold to complete <strong className="text-yellow-300">{itemTitle}</strong>.
        </p>

        {/* Shortfall Breakdown Card */}
        <div className="w-full bg-[#081d47] border border-blue-400/40 rounded-2xl p-3 my-4 flex flex-col gap-2 text-xs">
          <div className="flex justify-between text-blue-200 font-bold">
            <span>Required Price:</span>
            <strong className="text-white flex items-center gap-1">🪙 {requiredCoins}</strong>
          </div>
          <div className="flex justify-between text-blue-200 font-bold">
            <span>Your Current Balance:</span>
            <strong className="text-yellow-300 flex items-center gap-1">🪙 {currentCoins}</strong>
          </div>
          <div className="pt-2 border-t border-blue-400/30 flex justify-between font-black text-rose-300">
            <span>Shortfall:</span>
            <span className="bg-rose-950/80 border border-rose-400 px-2 py-0.5 rounded-lg">
              -{shortfall} Coins
            </span>
          </div>
        </div>

        {/* Action Options */}
        <div className="w-full flex flex-col gap-2">
          {/* Watch Ad option */}
          <button
            onClick={() => {
              sounds.playClick();
              onWatchAdForCoins();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow border-2 border-white cursor-pointer active:scale-95 transition"
          >
            <Play className="w-4 h-4 fill-current" />
            Watch Ad for +100 Coins
          </button>

          {/* Go to shop option */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenShop();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#143e99] hover:bg-[#1a4db8] text-sky-200 hover:text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-sky-300/40 shadow cursor-pointer active:scale-95 transition"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Visit Shop & Offers
          </button>
        </div>
      </div>
    </div>
  );
};
