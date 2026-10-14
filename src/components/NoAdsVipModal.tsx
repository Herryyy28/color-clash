import React, { useState } from 'react';
import { X, Crown, Sparkles, Check, ShieldCheck, Zap, Coins, Gem, Ban } from 'lucide-react';
import { sounds } from '../audio';
import confetti from 'canvas-confetti';

interface NoAdsVipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivateVip: () => void;
  isVipActive: boolean;
}

export const NoAdsVipModal: React.FC<NoAdsVipModalProps> = ({
  isOpen,
  onClose,
  onActivateVip,
  isVipActive,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSandboxPurchase = () => {
    sounds.playClick();
    setIsProcessing(true);

    // Sandbox purchase flow as specified in prompt guidelines:
    // Never simulate an untrusted real-money transaction, provide sandbox simulation
    setTimeout(() => {
      setIsProcessing(false);
      setPurchaseSuccess(true);
      onActivateVip();
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.4 } });
      setTimeout(() => {
        setPurchaseSuccess(false);
        onClose();
      }, 1600);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#071940]/85 backdrop-blur-md flex items-center justify-center p-3 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#f59e0b] via-[#d97706] to-[#1d4ed8] p-0.5 shadow-[0_0_50px_rgba(245,158,11,0.5)] border-2 border-yellow-300 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Glow ambient background effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-yellow-300/30 blur-3xl pointer-events-none" />

        {/* Inner Content Card */}
        <div className="w-full bg-gradient-to-b from-[#13388a] via-[#0e2a6d] to-[#0a1e4f] rounded-[22px] p-5 flex flex-col items-center text-center relative overflow-hidden">
          {/* Close 'X' Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#1b4cb8] hover:bg-[#2563eb] text-white flex items-center justify-center border-2 border-white/60 cursor-pointer active:scale-95 transition shadow"
          >
            <X className="w-4 h-4" />
          </button>

          {/* 350% Value Ribbon */}
          <div className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white font-black text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow-lg border-2 border-white flex items-center gap-1 -mt-1 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> 350% VALUE OFFER!
          </div>

          {/* Big Golden VIP Crown Emblem */}
          <div className="relative my-3 flex items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 p-1 shadow-[0_0_30px_rgba(250,204,21,0.7)] flex items-center justify-center border-2 border-white">
              <Crown className="w-12 h-12 text-amber-950 fill-amber-950" />
            </div>
            {/* No Ads badge tag */}
            <div className="absolute -bottom-2 bg-rose-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full border-2 border-white shadow flex items-center gap-1">
              <Ban className="w-3 h-3" /> NO ADS
            </div>
          </div>

          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-300 tracking-tight mt-1 drop-shadow">
            VIP MEMBERSHIP
          </h2>
          <p className="text-xs text-blue-100 mt-0.5 font-bold">
            Remove all ads forever & unlock exclusive benefits!
          </p>

          {/* Feature Perks Grid */}
          <div className="w-full bg-[#0a235c] border-2 border-yellow-400/50 rounded-2xl p-3 my-3.5 text-left flex flex-col gap-2 shadow">
            <div className="flex items-center gap-2.5 text-xs text-white">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
              </div>
              <span><strong>100% Ad-Free</strong> permanent uninterrupted battles</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-white">
              <div className="w-6 h-6 rounded-lg bg-yellow-500/20 border border-yellow-400/50 flex items-center justify-center shrink-0">
                <Crown className="w-4 h-4 text-yellow-300" />
              </div>
              <span>Unlock <strong>Golden Crown King Avatar</strong></span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-white">
              <div className="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-400/50 flex items-center justify-center shrink-0">
                <Gem className="w-4 h-4 text-sky-300" />
              </div>
              <span>Instant bonus: <strong>+200 Gems & 1,500 Coins</strong></span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-white">
              <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-400/50 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-purple-300" />
              </div>
              <span><strong>Chest Speedup:</strong> 2x faster unlock progress</span>
            </div>
          </div>

          {/* ₹180 Price Button (Sandbox Purchase Flow) */}
          {purchaseSuccess ? (
            <div className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-black text-base flex items-center justify-center gap-2 shadow-lg border-2 border-emerald-300 animate-in zoom-in-95">
              <Check className="w-5 h-5" /> VIP UNLOCKED!
            </div>
          ) : isVipActive ? (
            <div className="w-full py-3 rounded-2xl bg-[#0c2a6b] border-2 border-amber-400/60 text-amber-300 font-black text-xs flex items-center justify-center gap-1.5 shadow">
              <Crown className="w-4 h-4" /> VIP ACTIVE ON THIS ACCOUNT
            </div>
          ) : (
            <button
              disabled={isProcessing}
              onClick={handleSandboxPurchase}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-black text-lg tracking-wide shadow-[0_8px_25px_rgba(245,158,11,0.6)] border-2 border-white cursor-pointer active:scale-95 transition flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              <div className="absolute inset-0 w-1/2 h-full bg-white/30 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin text-xl">⏳</span> Processing...
                </span>
              ) : (
                <>
                  <span>₹180</span>
                  <span className="text-xs font-black bg-[#0c2a6b] text-yellow-300 border border-yellow-300/40 px-2 py-0.5 rounded-full shadow">
                    ONE-TIME
                  </span>
                </>
              )}
            </button>
          )}

          {/* Sandbox purchase disclaimer & "Not now" button */}
          <div className="mt-2.5 flex flex-col items-center gap-1">
            <span className="text-[10px] text-blue-200">
              * Sandbox purchase flow for development simulation.
            </span>
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="text-xs font-black text-blue-200 hover:text-white underline cursor-pointer mt-1"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
