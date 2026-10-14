import React, { useState } from 'react';
import { sounds } from '../audio';
import { adMobService, validateProductionAdMobConfig } from '../services/adMobService';
import {
  Volume2,
  VolumeX,
  Music,
  Smartphone,
  Zap,
  RefreshCw,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface SettingsViewProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenUnityModal: () => void;
  onOpenTechModal: () => void;
  onResetTutorial: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isMuted,
  onToggleMute,
  onOpenUnityModal,
  onOpenTechModal,
  onResetTutorial,
}) => {
  const [bgmMuted, setBgmMuted] = useState(() => sounds.isBgmMuted());
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [highFpsMode, setHighFpsMode] = useState(true);
  const [privacyMessage, setPrivacyMessage] = useState<string | null>(null);

  const adConfigValidation = validateProductionAdMobConfig();

  const handleOpenPrivacyOptions = async () => {
    sounds.playClick();
    const result = await adMobService.showPrivacyOptionsForm();
    setPrivacyMessage(result.message);
    setTimeout(() => setPrivacyMessage(null), 4000);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto scroll-touch p-3 sm:p-4 pb-14 select-none bg-gradient-to-b from-[#1769D2] via-[#124d9c] to-[#17345D] text-white font-body">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b-2 border-[#FFC83D]/40 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-display text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] tracking-wider">
            ROYAL SETTINGS
          </h1>
          <span className="text-[11px] text-[#F7E7BE] font-bold">
            Sound, vibration & battle performance
          </span>
        </div>
      </div>

      {/* Audio & Haptic Toggles */}
      <div className="mt-3 bg-[#17345D] rounded-2xl p-3 border-2 border-b-4 border-[#FFC83D] border-b-[#b38615] flex flex-col gap-2.5 shadow-xl">
        <h2 className="text-xs font-display text-[#FFC83D] uppercase tracking-wider drop-shadow">
          Audio & Feedback
        </h2>

        {/* Sound FX */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1769D2] border border-[#FFC83D]/40 flex items-center justify-center text-[#FFC83D] shadow">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-extrabold text-white">Sound Effects (SFX)</span>
              <span className="text-[10px] text-[#F7E7BE]/80 font-semibold">Web Audio dynamic battle sfx</span>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onToggleMute();
            }}
            className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center shadow ${
              !isMuted ? 'bg-[#79B957] justify-end border border-white' : 'bg-[#17345D] justify-start border border-white/30'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* Music */}
        <div className="flex items-center justify-between py-1 border-t border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1769D2] border border-[#FFC83D]/40 flex items-center justify-center text-[#79B957] shadow">
              <Music className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-extrabold text-white">Battle Music (BGM)</span>
              <span className="text-[10px] text-[#F7E7BE]/80 font-semibold">Royal Kingdom ambient loop</span>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              const nextMuted = sounds.toggleBgmMute();
              setBgmMuted(nextMuted);
              if (!nextMuted) {
                sounds.startBgm();
              }
            }}
            className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center shadow ${
              !bgmMuted ? 'bg-[#79B957] justify-end border border-white' : 'bg-[#17345D] justify-start border border-white/30'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* Haptics */}
        <div className="flex items-center justify-between py-1 border-t border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1769D2] border border-[#FFC83D]/40 flex items-center justify-center text-[#FFC83D] shadow">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-extrabold text-white">Haptic Vibration</span>
              <span className="text-[10px] text-[#F7E7BE]/80 font-semibold">Tactile feedback on impacts</span>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              setVibrationEnabled(!vibrationEnabled);
            }}
            className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center shadow ${
              vibrationEnabled ? 'bg-[#FFC83D] justify-end border border-white' : 'bg-[#17345D] justify-start border border-white/30'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-[#17345D] shadow-md" />
          </button>
        </div>

        {/* 60 FPS Performance */}
        <div className="flex items-center justify-between py-1 border-t border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1769D2] border border-[#FFC83D]/40 flex items-center justify-center text-rose-300 shadow">
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-extrabold text-white">High Frame Rate (60 FPS)</span>
              <span className="text-[10px] text-[#F7E7BE]/80 font-semibold">Smooth battle rendering</span>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              setHighFpsMode(!highFpsMode);
            }}
            className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center shadow ${
              highFpsMode ? 'bg-[#79B957] justify-end border border-white' : 'bg-[#17345D] justify-start border border-white/30'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </div>

      {/* Google AdMob & UMP Privacy Options */}
      <div className="mt-3 bg-[#17345D] rounded-2xl p-3 border-2 border-[#FFC83D]/50 flex flex-col gap-2 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#79B957]" />
            <span className="text-xs font-display text-[#FFC83D] tracking-wide">
              PRIVACY & AD CONSENT (UMP)
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#1769D2] text-[#F7E7BE] border border-[#FFC83D]/30">
            {adConfigValidation.isTesting ? 'Test Mode' : 'Production'}
          </span>
        </div>

        <p className="text-[10px] text-[#F7E7BE]/90 font-medium leading-tight">
          Review or change your consent preferences for personalized ads and GDPR/EEA/UK privacy options.
        </p>

        {privacyMessage && (
          <div className="p-2 rounded-xl bg-[#1769D2]/70 border border-[#FFC83D]/50 text-[11px] text-[#F7E7BE] font-bold">
            {privacyMessage}
          </div>
        )}

        <button
          onClick={handleOpenPrivacyOptions}
          className="btn-royal-blue py-1.5 px-3 rounded-xl font-display text-xs tracking-wider cursor-pointer flex items-center justify-center gap-1.5 shadow mt-1 text-white"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#FFC83D]" />
          UPDATE AD PRIVACY CHOICES
        </button>
      </div>

      {/* Tutorial & Match Reset */}
      <div className="mt-3 bg-[#17345D] rounded-2xl p-3 border-2 border-[#FFC83D]/50 flex items-center justify-between shadow-lg">
        <div className="flex flex-col">
          <span className="text-xs font-extrabold text-white">Replay In-Game Tutorial</span>
          <span className="text-[10px] text-[#F7E7BE]/80 font-semibold">Show Commander tips and speech guides</span>
        </div>
        <button
          onClick={() => {
            sounds.playClick();
            onResetTutorial();
          }}
          className="btn-royal-gold py-1.5 px-3 rounded-xl font-display text-xs tracking-wider cursor-pointer flex items-center gap-1 shadow text-[#17345D]"
        >
          <RefreshCw className="w-3.5 h-3.5" /> RESET
        </button>
      </div>

      <div className="mt-auto pt-6 text-center text-[#F7E7BE] text-[10px] leading-relaxed">
        <p className="font-display text-[#FFC83D] tracking-wide text-xs">COLOR CLASH — ROYAL FANTASY ARENA</p>
        <p className="font-semibold text-white/80">Inspired by Royal Fantasy Card Battlers & Fast-Paced Arena Battles</p>
        <p className="text-[#FFC83D] mt-0.5 font-bold game-counter">Version 2.5.0 (Royal Arena Edition)</p>
      </div>
    </div>
  );
};
