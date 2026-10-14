import React, { useState } from 'react';
import { Crown, Sparkles, Check, ShieldCheck, Zap, Coins, Gem, Ban } from 'lucide-react';
import { sounds } from '../audio';
import confetti from 'canvas-confetti';
import { ResponsiveModal } from './ResponsiveModal';

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
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidthClass="max-w-sm"
      showCloseButton={false}
      borderGlowColor="border-2 border-b-4 border-[#FFC83D] border-b-[#b38615] shadow-[0_0_50px_rgba(255,200,61,0.6)]"
    >
      <div className="relative flex flex-col items-center text-center font-body">
        {/* Close 'X' Button */}
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-0 right-0 w-8 h-8 rounded-full bg-[#17345D] hover:bg-slate-700 text-[#FFC83D] flex items-center justify-center border-2 border-[#FFC83D] cursor-pointer active:scale-95 transition shadow-lg z-10 font-black"
        >
          ✕
        </button>

        {/* 350% Value Ribbon */}
        <div className="bg-gradient-to-r from-[#F04452] via-[#FFC83D] to-[#F04452] text-[#17345D] font-display text-xs px-4 py-1 rounded-full uppercase tracking-wider shadow-lg border-2 border-white flex items-center gap-1 -mt-1 animate-pulse font-black">
          <Sparkles className="w-3.5 h-3.5" /> 350% VALUE ROYAL PASS!
        </div>

        {/* Big Golden VIP Crown Emblem */}
        <div className="relative my-3 flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#FFC83D] via-[#ffe382] to-[#FFC83D] p-1 shadow-[0_0_30px_rgba(255,200,61,0.7)] flex items-center justify-center border-4 border-white">
            <Crown className="w-12 h-12 text-[#17345D] fill-[#17345D]" />
          </div>
          {/* No Ads badge tag */}
          <div className="absolute -bottom-2 bg-[#F04452] text-white font-display text-[11px] px-2.5 py-0.5 rounded-full border-2 border-white shadow-md flex items-center gap-1 tracking-wider">
            <Ban className="w-3 h-3" /> NO ADS
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-display text-[#FFC83D] tracking-wider mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
          ROYAL VIP PASS
        </h2>
        <p className="text-xs text-[#F7E7BE] mt-0.5 font-bold">
          Remove all ads forever &amp; unlock sovereign perks!
        </p>

        {/* Feature Perks Grid */}
        <div className="w-full bg-[#17345D] border-2 border-[#FFC83D]/60 rounded-2xl p-3 my-3.5 text-left flex flex-col gap-2 shadow-inner">
          <div className="flex items-center gap-2.5 text-xs text-white">
            <div className="w-6 h-6 rounded-lg bg-[#79B957]/20 border border-[#79B957] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#79B957]" />
            </div>
            <span><strong className="font-extrabold text-[#79B957]">100% Ad-Free</strong> permanent uninterrupted battles</span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-white">
            <div className="w-6 h-6 rounded-lg bg-[#FFC83D]/20 border border-[#FFC83D] flex items-center justify-center shrink-0">
              <Crown className="w-4 h-4 text-[#FFC83D]" />
            </div>
            <span>Unlock <strong className="font-extrabold text-[#FFC83D]">Golden Sovereign King Avatar</strong></span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-white">
            <div className="w-6 h-6 rounded-lg bg-[#1769D2]/30 border border-[#1769D2] flex items-center justify-center shrink-0">
              <Gem className="w-4 h-4 text-[#79B957]" />
            </div>
            <span>Instant bonus: <strong className="font-extrabold text-[#FFC83D] game-counter">+200 Gems &amp; 1,500 Coins</strong></span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-white">
            <div className="w-6 h-6 rounded-lg bg-[#FFC83D]/20 border border-[#FFC83D] flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-[#FFC83D]" />
            </div>
            <span><strong className="font-extrabold text-[#F7E7BE]">Chest Speedup:</strong> 2x faster unlock progression</span>
          </div>
        </div>

        {/* Price Button */}
        {purchaseSuccess ? (
          <div className="w-full py-3.5 rounded-2xl bg-[#79B957] text-white font-display text-base flex items-center justify-center gap-2 shadow-lg border-2 border-white animate-in zoom-in-95 tracking-wider font-black">
            <Check className="w-5 h-5" /> ROYAL VIP UNLOCKED!
          </div>
        ) : isVipActive ? (
          <div className="w-full py-3 rounded-2xl bg-[#17345D] border-2 border-[#FFC83D] text-[#FFC83D] font-display text-xs flex items-center justify-center gap-1.5 shadow tracking-wider font-black">
            <Crown className="w-4 h-4" /> VIP ACTIVE ON THIS ACCOUNT
          </div>
        ) : (
          <button
            disabled={isProcessing}
            onClick={handleSandboxPurchase}
            className="btn-royal-gold text-[#17345D] w-full py-3.5 px-6 rounded-2xl font-display text-lg tracking-wider cursor-pointer shadow-xl flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin text-xl">⏳</span> PROCESSING...
              </span>
            ) : (
              <>
                <span className="game-counter font-black text-xl">₹180</span>
                <span className="text-[10px] font-display bg-[#17345D] text-[#FFC83D] border border-[#FFC83D] px-2 py-0.5 rounded-full shadow tracking-wider">
                  ONE-TIME ROYAL GRANT
                </span>
              </>
            )}
          </button>
        )}

        {/* Sandbox purchase disclaimer & "Not now" button */}
        <div className="mt-2.5 flex flex-col items-center gap-1">
          <span className="text-[10px] text-[#F7E7BE]/80 font-medium">
            * Sandbox purchase flow for development simulation.
          </span>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="text-xs font-display tracking-wider text-[#F7E7BE] hover:text-white underline cursor-pointer mt-1"
          >
            NOT NOW
          </button>
        </div>
      </div>
    </ResponsiveModal>
  );
};
