import React, { useState } from 'react';
import { sounds } from '../audio';
import { Volume2, VolumeX, Music, Smartphone, Zap, RefreshCw, Cpu, Layers, Info, CheckCircle2 } from 'lucide-react';

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
  const [bgmMuted, setBgmMuted] = useState(false);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [highFpsMode, setHighFpsMode] = useState(true);

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto p-3.5 select-none bg-gradient-to-b from-[#1448b8] via-[#0f3894] to-[#0a296e] text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-blue-400/30 shrink-0">
        <div>
          <h1 className="text-lg font-black text-white drop-shadow">Settings & Audio</h1>
          <span className="text-[11px] text-blue-100 font-bold">
            System preferences & engine configuration
          </span>
        </div>
      </div>

      {/* Audio & Haptic Toggles */}
      <div className="mt-3 bg-[#0c2a6b] rounded-2xl p-3 border-2 border-blue-400/40 flex flex-col gap-2.5 shadow">
        <h2 className="text-xs font-black text-yellow-300 uppercase tracking-wider drop-shadow">
          Audio & Feedback
        </h2>

        {/* Sound FX */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#133785] border border-blue-300/40 flex items-center justify-center text-sky-300 shadow">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-white">Sound Effects (SFX)</span>
              <span className="text-[10px] text-blue-200 font-medium">Web Audio dynamic synthesizer</span>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onToggleMute();
            }}
            className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center shadow ${
              !isMuted ? 'bg-sky-400 justify-end' : 'bg-[#133785] justify-start border border-blue-300/40'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* Music */}
        <div className="flex items-center justify-between py-1 border-t border-blue-400/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#133785] border border-blue-300/40 flex items-center justify-center text-emerald-300 shadow">
              <Music className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-white">Battle Music</span>
              <span className="text-[10px] text-blue-200 font-medium">Adaptive arcade soundtrack</span>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              setBgmMuted(!bgmMuted);
            }}
            className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center shadow ${
              !bgmMuted ? 'bg-emerald-400 justify-end' : 'bg-[#133785] justify-start border border-blue-300/40'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* Haptics */}
        <div className="flex items-center justify-between py-1 border-t border-blue-400/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#133785] border border-blue-300/40 flex items-center justify-center text-amber-300 shadow">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-white">Haptic Vibration</span>
              <span className="text-[10px] text-blue-200 font-medium">Touch & impact feedback</span>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              setVibrationEnabled(!vibrationEnabled);
            }}
            className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center shadow ${
              vibrationEnabled ? 'bg-amber-400 justify-end' : 'bg-[#133785] justify-start border border-blue-300/40'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* 60 FPS Performance */}
        <div className="flex items-center justify-between py-1 border-t border-blue-400/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#133785] border border-blue-300/40 flex items-center justify-center text-rose-300 shadow">
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-white">High Frame Rate (60 FPS)</span>
              <span className="text-[10px] text-blue-200 font-medium">Hardware accelerated rendering</span>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              setHighFpsMode(!highFpsMode);
            }}
            className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center shadow ${
              highFpsMode ? 'bg-sky-400 justify-end' : 'bg-[#133785] justify-start border border-blue-300/40'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </div>

      {/* Developer & Engine Blueprints */}
      <div className="mt-3 bg-[#0c2a6b] rounded-2xl p-3 border-2 border-blue-400/40 flex flex-col gap-2 shadow">
        <h2 className="text-xs font-black text-yellow-300 uppercase tracking-wider drop-shadow">
          Engine & Architecture
        </h2>

        <button
          onClick={() => {
            sounds.playClick();
            onOpenUnityModal();
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-[#143c8c] hover:bg-[#1b4cb8] border-2 border-sky-300/40 text-left flex items-center justify-between text-xs font-black text-sky-200 cursor-pointer active:scale-98 transition shadow"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-300" />
            <span>Unity 6 LTS (URP) Master Blueprint</span>
          </div>
          <span className="text-blue-200">→</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            onOpenTechModal();
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-[#143c8c] hover:bg-[#1b4cb8] border-2 border-emerald-300/40 text-left flex items-center justify-between text-xs font-black text-emerald-200 cursor-pointer active:scale-98 transition shadow"
        >
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-300" />
            <span>Unity vs Godot vs Web Comparison</span>
          </div>
          <span className="text-blue-200">→</span>
        </button>
      </div>

      {/* Tutorial & Match Reset */}
      <div className="mt-3 bg-[#0c2a6b] rounded-2xl p-3 border-2 border-blue-400/40 flex items-center justify-between shadow">
        <div className="flex flex-col">
          <span className="text-xs font-black text-white">Replay In-Game Tutorial</span>
          <span className="text-[10px] text-blue-200 font-medium">Show Robot Commander speech tips</span>
        </div>
        <button
          onClick={() => {
            sounds.playClick();
            onResetTutorial();
          }}
          className="py-1.5 px-3 rounded-xl bg-[#133785] hover:bg-[#1a4db8] text-white font-black text-xs border border-blue-300/40 cursor-pointer active:scale-95 transition flex items-center gap-1 shadow"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      <div className="mt-auto pt-4 text-center text-blue-200 text-[10px] leading-relaxed">
        <p className="font-black text-white">Color Clash — Tactical Territory Battle Arena</p>
        <p>Built with React, Canvas 60 FPS Engine, and URP Alignment</p>
        <p className="text-blue-300 mt-0.5 font-medium">Version 2.4.0 (Build 2026.10)</p>
      </div>
    </div>
  );
};
