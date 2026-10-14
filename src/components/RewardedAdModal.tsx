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
    <div className="fixed inset-0 z-50 bg-[#071940]/90 backdrop-blur-md flex items-center justify-center p-3 select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1e5ecc] via-[#1646a8] to-[#0c2a6b] p-0.5 border-2 border-sky-300 shadow-[0_0_50px_rgba(30,94,204,0.6)] overflow-hidden flex flex-col">
        {/* Ad Header Banner */}
        <div className="w-full bg-[#123687] px-3.5 py-2.5 flex items-center justify-between border-b border-sky-300/40">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-200">
                Unity LevelPlay Mediation
              </span>
              <span className="text-xs font-black text-white flex items-center gap-1">
                Rewarded Video Ad <span className="text-[9px] text-yellow-300 font-extrabold bg-amber-500/30 px-1 rounded">TEST</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-7 h-7 rounded-full bg-[#1a449e] border border-sky-300/50 flex items-center justify-center text-sky-200 hover:text-white transition active:scale-95"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleAttemptClose}
              className="w-7 h-7 rounded-full bg-[#1a449e] border border-sky-300/50 flex items-center justify-center text-sky-200 hover:text-white transition active:scale-95"
              title="Close Ad"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Screen Area */}
        <div className="relative w-full h-72 bg-gradient-to-br from-[#123687] via-[#0d2a6d] to-[#081d4a] flex flex-col items-center justify-center p-4 overflow-hidden border-b border-sky-300/30">
          {/* Animated Background Rings */}
          <div className="absolute w-60 h-60 rounded-full border border-sky-400/20 animate-ping pointer-events-none" />
          <div className="absolute w-44 h-44 rounded-full border-2 border-dashed border-sky-300/30 animate-spin pointer-events-none" style={{ animationDuration: '20s' }} />

          {/* Ad Creative Artwork */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 p-0.5 shadow-2xl border-2 border-white flex items-center justify-center transform hover:rotate-6 transition">
              <span className="text-4xl animate-bounce">🪙</span>
            </div>

            <h3 className="text-lg font-black text-white mt-3 drop-shadow flex items-center gap-1.5">
              Color Clash Gold Vault <Sparkles className="w-4 h-4 text-yellow-300" />
            </h3>
            <p className="text-xs text-sky-200 font-bold max-w-xs mt-1">
              Watch the full sponsor clip to claim your reward of <strong className="text-yellow-300">+{rewardAmount} Coins</strong>!
            </p>

            {/* Countdown / Reward Status Badge */}
            <div className="mt-4 flex items-center gap-2 bg-[#092257]/80 border-2 border-sky-300 px-3.5 py-1.5 rounded-full shadow-lg">
              {rewardGranted ? (
                <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> REWARD VERIFIED!
                </span>
              ) : (
                <span className="text-xs font-black text-yellow-300 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 fill-current" /> Reward in {timeLeft}s
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar at bottom of screen */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#0a1e4a]">
            <div
              className="h-full bg-gradient-to-r from-sky-400 via-amber-400 to-emerald-400 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Ad Metadata & State Bar */}
        <div className="p-3.5 bg-[#0f2f75] flex flex-col gap-2">
          {/* Status Message or Error */}
          {errorMessage ? (
            <div className="bg-rose-900/60 border border-rose-400 rounded-xl p-2 text-rose-200 text-xs font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          ) : rewardGranted ? (
            <div className="bg-emerald-900/60 border border-emerald-400 rounded-xl p-2 text-emerald-200 text-xs font-black text-center animate-in zoom-in-95">
              🎉 Claim recorded! +{rewardAmount} Coins credited to wallet!
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px] text-sky-200 font-bold">
              <span>Placement: <strong className="text-white">{placementId}</strong></span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-300" /> Idempotent Nonce
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
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-teal-950 font-black text-xs uppercase tracking-wider shadow border border-white cursor-pointer active:scale-95 transition"
            >
              Collect & Continue
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleAttemptClose}
                className="flex-1 py-2 rounded-xl bg-[#143d99] hover:bg-[#1a4db8] text-sky-200 hover:text-white text-xs font-bold border border-sky-400/40 cursor-pointer active:scale-95 transition"
              >
                Skip Video
              </button>
              <div className="flex-1 py-2 rounded-xl bg-[#0a235c] border border-yellow-400/40 text-yellow-300 text-xs font-black flex items-center justify-center gap-1">
                <span>🪙</span> +{rewardAmount} Reward
              </div>
            </div>
          )}
        </div>

        {/* Skip Early Confirmation Sub-Modal */}
        {showSkipWarning && (
          <div className="absolute inset-0 z-30 bg-[#071940]/95 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-[#1848b3] to-[#0c2a6b] p-4 rounded-2xl border-2 border-amber-400 text-center flex flex-col items-center shadow-2xl animate-in zoom-in-95">
              <AlertTriangle className="w-10 h-10 text-amber-400 mb-2 animate-bounce" />
              <h4 className="text-sm font-black text-white">Forfeit Reward?</h4>
              <p className="text-xs text-blue-100 mt-1 font-medium">
                You must watch until the end to collect your <strong className="text-yellow-300">+{rewardAmount} Coins</strong>. If you leave now, no reward will be granted!
              </p>
              <div className="flex gap-2 mt-4 w-full">
                <button
                  onClick={handleResumeWatching}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-teal-950 font-black text-xs uppercase cursor-pointer active:scale-95 shadow border border-white"
                >
                  Keep Watching
                </button>
                <button
                  onClick={handleConfirmForfeit}
                  className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase cursor-pointer active:scale-95 shadow border border-rose-300"
                >
                  Forfeit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
