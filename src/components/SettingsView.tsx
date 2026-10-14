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
    <div className="w-full h-full flex flex-col overflow-y-auto p-3.5 select-none bg-gradient-to-b from-[#0c1322] via-[#091122] to-[#070b14] text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-lg font-black text-white">Settings & Audio</h1>
          <span className="text-[11px] text-slate-400">
            System preferences & engine configuration
          </span>
        </div>
      </div>

      {/* Audio & Haptic Toggles */}
      <div className="mt-3 bg-slate-900/80 rounded-2xl p-3 border border-slate-800 flex flex-col gap-2.5">
        <h2 className="text-xs font-black text-sky-400 uppercase tracking-wider">
          Audio & Feedback
        </h2>

        {/* Sound FX */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-sky-400">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-white">Sound Effects (SFX)</span>
              <span className="text-[10px] text-slate-400">Web Audio dynamic synthesizer</span>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onToggleMute();
            }}
            className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
              !isMuted ? 'bg-sky-500 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* Music */}
        <div className="flex items-center justify-between py-1 border-t border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400">
              <Music className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-white">Battle Music</span>
              <span className="text-[10px] text-slate-400">Adaptive arcade soundtrack</span>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              setBgmMuted(!bgmMuted);
            }}
            className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
              !bgmMuted ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* Haptics */}
        <div className="flex items-center justify-between py-1 border-t border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-white">Haptic Vibration</span>
              <span className="text-[10px] text-slate-400">Touch & impact feedback</span>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              setVibrationEnabled(!vibrationEnabled);
            }}
            className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
              vibrationEnabled ? 'bg-amber-500 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* 60 FPS Performance */}
        <div className="flex items-center justify-between py-1 border-t border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-rose-400">
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-white">High Frame Rate (60 FPS)</span>
              <span className="text-[10px] text-slate-400">Hardware accelerated rendering</span>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              setHighFpsMode(!highFpsMode);
            }}
            className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
              highFpsMode ? 'bg-sky-500 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </div>

      {/* Developer & Engine Blueprints */}
      <div className="mt-3 bg-slate-900/80 rounded-2xl p-3 border border-slate-800 flex flex-col gap-2">
        <h2 className="text-xs font-black text-sky-400 uppercase tracking-wider">
          Engine & Architecture
        </h2>

        <button
          onClick={() => {
            sounds.playClick();
            onOpenUnityModal();
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-900/60 to-blue-900/60 border border-sky-500/40 hover:border-sky-400 text-left flex items-center justify-between text-xs font-black text-sky-300 cursor-pointer active:scale-98 transition shadow"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Unity 6 LTS (URP) Master Blueprint</span>
          </div>
          <span className="text-slate-400">→</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            onOpenTechModal();
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-900/60 to-teal-900/60 border border-emerald-500/40 hover:border-emerald-400 text-left flex items-center justify-between text-xs font-black text-emerald-300 cursor-pointer active:scale-98 transition shadow"
        >
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Unity vs Godot vs Web Comparison</span>
          </div>
          <span className="text-slate-400">→</span>
        </button>
      </div>

      {/* Tutorial & Match Reset */}
      <div className="mt-3 bg-slate-900/80 rounded-2xl p-3 border border-slate-800 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-black text-white">Replay In-Game Tutorial</span>
          <span className="text-[10px] text-slate-400">Show Robot Commander speech tips</span>
        </div>
        <button
          onClick={() => {
            sounds.playClick();
            onResetTutorial();
          }}
          className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 cursor-pointer active:scale-95 transition flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* App Info Footer */}
      <div className="mt-auto pt-4 text-center text-slate-500 text-[10px] leading-relaxed">
        <p className="font-bold">Color Clash — Tactical Territory Battle Arena</p>
        <p>Built with React, Canvas 60 FPS Engine, and URP Alignment</p>
        <p className="text-slate-600 mt-0.5">Version 2.4.0 (Build 2026.10)</p>
      </div>
    </div>
  );
};
