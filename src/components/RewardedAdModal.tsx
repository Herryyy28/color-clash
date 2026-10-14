import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Volume2, VolumeX, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles, RefreshCw, Smartphone } from 'lucide-react';
import { adMediationService, ActiveAdSession, AdSessionState } from '../services/adMediationService';
import { sounds } from '../audio';
import confetti from 'canvas-confetti';

interface RewardedAdModalProps {
  isOpen: boolean;
  placementId: string;
  customRewardCoins?: number;
  onClose: () => void;
  onRewardClaimed: (coinsEarned: number) => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  placementId,
  customRewardCoins,
  onClose,
  onRewardClaimed,
}) => {
  const [session, setSession] = useState<ActiveAdSession | null>(null);
  const [adState, setAdState] = useState<AdSessionState>('Idle');
  const [progress, setProgress] = useState(0); // 0 to 100
  const [timeLeft, setTimeLeft] = useState(5); // 5 seconds ad
  const [isMuted, setIsMuted] = useState(false);
  const [showSkipWarning, setShowSkipWarning] = useState(false);
  const [rewardGranted, setRewardGranted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const durationSeconds = 5; // snappy 5 seconds for great game feel
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize ad session when opened
  useEffect(() => {
    if (!isOpen) {
      setSession(null);
      setProgress(0);
      setTimeLeft(durationSeconds);
      setShowSkipWarning(false);
      setRewardGranted(false);
      setErrorMessage(null);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Subscribe to mediation callbacks
    const unsubscribe = adMediationService.addCallbacks({
      onStateChange: (state, error) => {
        setAdState(state);
        if (error) setErrorMessage(error);
      },
    });

    // Request ad display from mediation service
    const launchResult = adMediationService.showRewardedAd(placementId, customRewardCoins);

    if (!launchResult.canShow || !launchResult.session) {
      setErrorMessage(launchResult.error || 'Failed to initialize ad placement');
      setAdState('DisplayFailed');
      return () => unsubscribe();
    }

    setSession(launchResult.session);
    setAdState('Showing');
    setTimeLeft(durationSeconds);
    setProgress(0);

    // Run interactive ad timer
    const intervalMs = 100;
    const totalSteps = (durationSeconds * 1000) / intervalMs;
    let step = 0;

    timerRef.current = setInterval(() => {
      step++;
      const currentProgress = Math.min(100, Math.round((step / totalSteps) * 100));
      setProgress(currentProgress);
      const remaining = Math.max(0, Math.ceil(durationSeconds - (step * intervalMs) / 1000));
      setTimeLeft(remaining);

      if (step >= totalSteps) {
        if (timerRef.current) clearInterval(timerRef.current);
        // Video finished completely! Authoritatively earn reward
        handleVideoFinished();
      }
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      unsubscribe();
    };
  }, [isOpen, placementId, customRewardCoins]);

  // Video reached 100% completion
  const handleVideoFinished = () => {
    sounds.playRewardClaim();
    const result = adMediationService.handleAdRewardEarned();
    if (result.success && result.reward) {
      setRewardGranted(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#38bdf8', '#fbbf24', '#ffffff', '#3b82f6'],
      });
      onRewardClaimed(result.reward.amount);

      // Auto dismiss after displaying success banner
      setTimeout(() => {
        adMediationService.handleAdClosed(false);
        onClose();
      }, 1400);
    } else {
      setErrorMessage(result.error || 'Failed to verify reward transaction');
    }
  };

  // User taps Close / Skip button early
  const handleAttemptClose = () => {
    if (rewardGranted) {
      adMediationService.handleAdClosed(false);
      onClose();
      return;
    }

    if (progress >= 100) {
      adMediationService.handleAdClosed(false);
      onClose();
      return;
    }

    // Pause timer and show forfeit confirmation
    if (timerRef.current) clearInterval(timerRef.current);
    setShowSkipWarning(true);
  };

  // User confirms they want to forfeit the reward
  const handleConfirmForfeit = () => {
    setShowSkipWarning(false);
    adMediationService.handleAdClosed(true); // closed without reward
    onClose();
  };

  // User cancels skip and continues watching
  const handleResumeWatching = () => {
    setShowSkipWarning(false);
    // Resume countdown
    const intervalMs = 100;
    const remainingTime = (timeLeft * 1000);
    const stepsNeeded = remainingTime / intervalMs;
    let step = 0;

    timerRef.current = setInterval(() => {
      step++;
      const currentProgress = Math.min(100, Math.round(progress + (step / stepsNeeded) * (100 - progress)));
      setProgress(currentProgress);
      const remaining = Math.max(0, Math.ceil(timeLeft - (step * intervalMs) / 1000));
      setTimeLeft(remaining);

      if (currentProgress >= 100) {
        if (timerRef.current) clearInterval(timerRef.current);
        handleVideoFinished();
      }
    }, intervalMs);
  };

  if (!isOpen) return null;

  const rewardAmount = session?.rewardCoins || customRewardCoins || 100;

  return (
    <div className="fixed inset-0 z-50 bg-[#071940]/90 backdrop-blur-md flex items-center justify-center p-3 safe-pt safe-pb select-none overflow-y-auto font-body">
      <div className="relative w-full max-w-sm max-h-[calc(100dvh-var(--safe-top)-var(--safe-bottom)-24px)] overflow-y-auto scroll-touch rounded-3xl bg-[#0f2142] p-0.5 border-2 border-b-4 border-[#FFC83D] border-b-[#b38615] shadow-[0_0_50px_rgba(255,200,61,0.5)] flex flex-col">
        {/* Google AdMob Top Bar */}
        <div className="w-full bg-[#17345D] px-3.5 py-2 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            {/* Google AdMob Logo Icon */}
            <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center shadow-sm p-0.5">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#4285F4" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="#EA4335" strokeWidth="2.5" />
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black text-white tracking-wide">
                  Google AdMob
                </span>
                <span className="text-[8px] bg-[#FFC83D] text-[#17345D] font-black px-1.5 py-0.2 rounded-sm uppercase tracking-wider">
                  Ad · 1 of 1
                </span>
              </div>
              <span className="text-[9px] text-[#F7E7BE]/80 font-mono">
                ca-app-pub-3940256099942544
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-7 h-7 rounded-full bg-[#1769D2]/40 border border-white/30 flex items-center justify-center text-white hover:text-[#FFC83D] transition active:scale-95"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleAttemptClose}
              className="w-7 h-7 rounded-full bg-[#1769D2]/40 border border-white/30 flex items-center justify-center text-white hover:text-[#F04452] transition active:scale-95"
              title="Close Ad"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Video Screen Area */}
        <div className="relative w-full h-60 sm:h-72 bg-gradient-to-br from-[#17345D] via-[#0e2448] to-[#071329] flex flex-col items-center justify-center p-4 overflow-hidden border-b border-white/10 shrink-0">
          {/* Animated Background Atmosphere */}
          <div className="absolute w-60 h-60 rounded-full border border-[#FFC83D]/20 animate-ping pointer-events-none" />
          <div className="absolute w-44 h-44 rounded-full border-2 border-dashed border-[#1769D2]/30 animate-spin pointer-events-none" style={{ animationDuration: '25s' }} />

          {/* Ad Creative Artwork */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#FFC83D] via-[#ffe382] to-[#FFC83D] p-1 shadow-2xl border-2 border-white flex items-center justify-center transform hover:rotate-3 transition animate-bounce">
              <span className="text-3xl sm:text-4xl">👑</span>
            </div>

            <h3 className="text-base sm:text-lg font-display text-white mt-2.5 drop-shadow flex items-center gap-1.5 tracking-wider">
              ROYAL CLASH ARENA <Sparkles className="w-4 h-4 text-[#FFC83D]" />
            </h3>
            <p className="text-[11px] sm:text-xs text-[#F7E7BE] font-semibold max-w-xs mt-1">
              Watch this sponsored AdMob video clip to claim your reward!
            </p>

            {/* Countdown / Reward Status Badge */}
            <div className="mt-3 sm:mt-4 flex items-center gap-2 bg-[#17345D] border-2 border-[#FFC83D] px-3.5 py-1.5 rounded-full shadow-lg">
              {rewardGranted ? (
                <span className="text-xs font-display text-[#79B957] flex items-center gap-1.5 tracking-wide font-black">
                  <CheckCircle2 className="w-4 h-4 text-[#79B957]" /> REWARD GRANTED!
                </span>
              ) : (
                <span className="text-xs font-display text-[#FFC83D] flex items-center gap-1.5 tracking-wide font-black">
                  <Play className="w-3.5 h-3.5 fill-current text-[#FFC83D]" />
                  REWARD IN <span className="game-counter font-black text-white bg-[#1769D2] px-1.5 py-0.2 rounded">{timeLeft}s</span>
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar at bottom of screen */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#17345D]">
            <div
              className="h-full bg-gradient-to-r from-[#FFC83D] via-[#79B957] to-[#FFC83D] transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* AdMob Play Store Install Banner Card */}
        <div className="p-3 bg-[#17345D] flex items-center justify-between gap-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1769D2] to-[#79B957] flex items-center justify-center text-xl shadow border border-white shrink-0">
              ⚔️
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-display text-white truncate">
                Royal Kingdom War
              </span>
              <span className="text-[10px] text-[#FFC83D] font-bold flex items-center gap-1">
                ⭐⭐⭐⭐⭐ 4.9 <span className="text-[#F7E7BE]/70">· Free</span>
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              window.open('https://play.google.com/store', '_blank');
            }}
            className="py-1.5 px-3.5 rounded-xl btn-arena-green text-white font-display text-xs uppercase tracking-wider shadow shrink-0 cursor-pointer"
          >
            INSTALL
          </button>
        </div>

        {/* Ad Metadata & State Bar */}
        <div className="p-3 bg-[#0d1e38] flex flex-col gap-2 shrink-0">
          {/* Status Message or Error */}
          {errorMessage ? (
            <div className="bg-[#F04452]/20 border border-[#F04452] rounded-xl p-2 text-rose-200 text-xs font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#F04452]" />
              <span>{errorMessage}</span>
            </div>
          ) : rewardGranted ? (
            <div className="bg-[#79B957]/30 border border-[#79B957] rounded-xl p-2 text-[#79B957] text-xs font-display text-center animate-in zoom-in-95 tracking-wide font-black">
              🎉 AD COMPLETED! REWARD UNLOCKED &amp; VERIFIED!
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px] text-[#F7E7BE]/80 font-semibold">
              <span>Placement: <strong className="text-white font-bold">{placementId}</strong></span>
              <span className="flex items-center gap-1 text-[#79B957]">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified AdMob Nonce
              </span>
            </div>
          )}

          {/* Bottom Action Button */}
          {rewardGranted ? (
            <button
              onClick={() => {
                adMediationService.handleAdClosed(false);
                onClose();
              }}
              className="btn-royal-gold text-[#17345D] w-full py-2.5 rounded-xl font-display text-sm tracking-wider cursor-pointer shadow min-h-[44px]"
            >
              COLLECT REWARD &amp; CONTINUE
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleAttemptClose}
                className="btn-royal-blue flex-1 py-2.5 rounded-xl font-display text-xs tracking-wider cursor-pointer shadow min-h-[44px]"
              >
                SKIP AD
              </button>
              <div className="flex-1 py-2.5 rounded-xl bg-[#17345D] border border-[#FFC83D]/50 text-[#FFC83D] text-xs font-display flex items-center justify-center gap-1 min-h-[44px] tracking-wide">
                <span>🪙</span> +<span className="game-counter font-black">{rewardAmount}</span> REWARD
              </div>
            </div>
          )}
        </div>

        {/* AdMob Skip Early Confirmation Sub-Modal */}
        {showSkipWarning && (
          <div className="absolute inset-0 z-30 bg-[#071940]/95 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#17345D] p-4 rounded-2xl border-2 border-[#FFC83D] text-center flex flex-col items-center shadow-2xl animate-in zoom-in-95 max-w-xs">
              <AlertTriangle className="w-10 h-10 text-[#FFC83D] mb-2 animate-bounce" />
              <h4 className="text-base font-display text-white tracking-wider">CLOSE VIDEO AD?</h4>
              <p className="text-xs text-[#F7E7BE] mt-1 font-semibold">
                You must watch until the timer reaches zero to claim your reward. If you exit now, your reward will be forfeited!
              </p>
              <div className="flex gap-2 mt-4 w-full">
                <button
                  onClick={handleResumeWatching}
                  className="btn-royal-gold text-[#17345D] flex-1 py-2 px-3 rounded-xl font-display text-xs tracking-wider cursor-pointer shadow"
                >
                  RESUME AD
                </button>
                <button
                  onClick={handleConfirmForfeit}
                  className="btn-battle-red text-white py-2 px-3 rounded-xl font-display text-xs tracking-wider cursor-pointer shadow"
                >
                  FORFEIT
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
