import React, { useState } from 'react';
import { X, CheckCircle, Cpu, Layers, Sparkles, Smartphone, Globe, ShieldCheck } from 'lucide-react';

interface TechStackGuideModalProps {
  onClose: () => void;
}

export const TechStackGuideModal: React.FC<TechStackGuideModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'recommendation' | 'comparison' | 'architecture'>('recommendation');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-indigo-500/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white leading-tight">
                Game Engine Tech Recommendation
              </h2>
              <p className="text-xs text-indigo-300 font-medium">
                Analysis for Color Clash: Unity vs. Godot 4 vs. WebGL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('recommendation')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer ${
              activeTab === 'recommendation'
                ? 'border-indigo-400 text-indigo-400 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🏆 Top Pick & Verdict
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer ${
              activeTab === 'comparison'
                ? 'border-indigo-400 text-indigo-400 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚖️ Engine Comparison
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer ${
              activeTab === 'architecture'
                ? 'border-indigo-400 text-indigo-400 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📐 Core Architecture
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-300 text-sm">
          {activeTab === 'recommendation' && (
            <div className="space-y-4">
              {/* Unity Banner */}
              <div className="bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-500/40 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-500 text-slate-950 text-[11px] font-black px-2 py-0.5 rounded-full">
                      #1 RECOMMENDED FOR MOBILE APP STORES
                    </span>
                    <span className="text-white font-extrabold text-base">Unity 6 / 2022 LTS (C#)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The original commercial game (Playakor / Voodoo / Tarboosh) is built in <strong>Unity</strong>. For publishing to Google Play & Apple App Store with ad networks (AppLovin MAX, ironSource), in-app purchases, and mobile shader optimization, Unity is the industry standard.
                  </p>
                </div>
              </div>

              {/* Godot 4 Banner */}
              <div className="bg-gradient-to-r from-teal-950/60 to-emerald-950/60 border border-teal-500/40 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-teal-400 text-slate-950 text-[11px] font-black px-2 py-0.5 rounded-full">
                      BEST FOR INDIE & ZERO-ROYALTY
                    </span>
                    <span className="text-white font-extrabold text-base">Godot 4.3 (GDScript / C#)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    If you are building independently without a large publisher, <strong>Godot 4</strong> is phenomenal. It has a tiny build footprint (&lt;25MB APK), zero licensing fees, lightning-fast boot times, and its 2D/3D tile shaders make fluid territory coloring trivial.
                  </p>
                </div>
              </div>

              {/* Web / Canvas Banner */}
              <div className="bg-gradient-to-r from-purple-950/60 to-pink-950/60 border border-purple-500/40 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-purple-400 text-slate-950 text-[11px] font-black px-2 py-0.5 rounded-full">
                      CURRENT IMPLEMENTATION (INSTANT PLAY)
                    </span>
                    <span className="text-white font-extrabold text-base">HTML5 Canvas / WebGL (TypeScript)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    What you are playing right now! Zero installation, 60 FPS performance on iOS Safari and Android Chrome, perfect for web portals (Poki, CrazyGames) and viral social sharing.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-bold text-sky-400 flex items-center gap-1.5 mb-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-sky-400" />
                    When to Choose Unity
                  </h4>
                  <ul className="text-xs space-y-1 text-slate-300 list-disc list-inside">
                    <li>Publishing on Google Play & App Store</li>
                    <li>Hypercasual monetization (AppLovin, Unity Ads)</li>
                    <li>URP Shader Graph for liquid paint physics</li>
                    <li>Team already experienced with C#</li>
                  </ul>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-bold text-teal-400 flex items-center gap-1.5 mb-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
                    When to Choose Godot 4
                  </h4>
                  <ul className="text-xs space-y-1 text-slate-300 list-disc list-inside">
                    <li>100% Free & open source (no revenue cuts)</li>
                    <li>Faster iteration & lighter IDE (no 30GB installs)</li>
                    <li>Under 25 MB install size on low-end phones</li>
                    <li>Rapid prototyping with GDScript</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comparison' && (
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 bg-slate-950/60">
                      <th className="p-2.5">Feature</th>
                      <th className="p-2.5 text-blue-400">Unity (URP)</th>
                      <th className="p-2.5 text-teal-400">Godot 4.3</th>
                      <th className="p-2.5 text-purple-400">HTML5 Canvas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="p-2.5 font-bold text-white">Rendering / Graphics</td>
                      <td className="p-2.5">URP Shader Graph (Voxel/Toon)</td>
                      <td className="p-2.5">Vulkan Mobile / Custom Shaders</td>
                      <td className="p-2.5">2D/WebGL Canvas 60 FPS</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">Mobile APK Size</td>
                      <td className="p-2.5 text-amber-400">~45 MB - 75 MB</td>
                      <td className="p-2.5 text-emerald-400">~15 MB - 25 MB</td>
                      <td className="p-2.5 text-emerald-400">&lt; 1 MB (Instant web)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">Monetization SDKs</td>
                      <td className="p-2.5 text-emerald-400">Industry leader (all SDKs)</td>
                      <td className="p-2.5 text-amber-400">Community plugins</td>
                      <td className="p-2.5 text-blue-400">AdSense / Poki SDK</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">Grid Splat Technique</td>
                      <td className="p-2.5">Dynamic RenderTexture / Blit</td>
                      <td className="p-2.5">SubViewport / TileMapLayer</td>
                      <td className="p-2.5">2D Array Bitmask + Path Splat</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">License & Cost</td>
                      <td className="p-2.5 text-amber-400">Free tier + runtime fee rules</td>
                      <td className="p-2.5 text-emerald-400">100% Free / MIT License</td>
                      <td className="p-2.5 text-emerald-400">100% Open Source</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-indigo-300">
                Core Game Mechanics Architecture for Color Clash:
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="font-black text-sky-400 block mb-1">1. Territory Voxel Grid Engine</span>
                  <p className="text-slate-300">
                    A discrete 2D grid buffer (e.g. 20×30 cells). Each cell stores an owner (<code className="text-sky-300">Blue</code>, <code className="text-rose-300">Red</code>, or <code className="text-slate-300">Neutral</code>). Territory percentage is calculated as <code className="text-emerald-400">blueTiles / totalTiles * 100</code> on every frame.
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="font-black text-amber-400 block mb-1">2. Buzz Saw Continuous Raymarching</span>
                  <p className="text-slate-300">
                    The Buzz Saw travels with velocity vector <code className="text-amber-300">(vx, vy)</code>. In every physics step, it checks bounding box collisions with enemy turrets, and paints all grid tiles within radius <code className="text-amber-300">R = 2.2</code> to the player's color continuously.
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="font-black text-rose-400 block mb-1">3. Bot Trainer Decision Tree (AI)</span>
                  <p className="text-slate-300">
                    The enemy AI evaluates: (a) Does player have a turret close to mid-line? (Deploy counter-turret or saw down that lane); (b) Is Red territory below 45%? (Deploy defensive Heavy Cannon); (c) Has enough energy? (Deploy paint mortar into deepest player cluster).
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="font-black text-emerald-400 block mb-1">4. Ink Splat Particle & Juice Engine</span>
                  <p className="text-slate-300">
                    Procedural audio synthesis (synthesizing sine/triangle pitches with exponential decay) + radial particle splatter bursts + subtle camera screenshake provide tactile arcade satisfaction.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Playable demo built with TypeScript &amp; 60fps HTML5 Canvas Engine.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer transition active:scale-95"
          >
            Back to Arena
          </button>
        </div>
      </div>
    </div>
  );
};
