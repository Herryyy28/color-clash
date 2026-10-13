import React, { useState } from 'react';
import { X, Copy, Check, Terminal, FolderTree, Code2, Cpu, Download, Sparkles, Smartphone, Layers } from 'lucide-react';

interface UnityRoadmapModalProps {
  onClose: () => void;
}

export const UnityRoadmapModal: React.FC<UnityRoadmapModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'architecture' | 'scripts' | 'roadmap'>('prompt');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const MASTER_PROMPT = `MASTER EXECUTION PROMPT — COLOR CLASH 3D ANDROID GAME
ROLE: Senior Unity Game Developer, 3D Gameplay Engineer, Multiplayer Specialist, Mobile Optimization Expert.

Build a production-quality 3D Android game inspired by red-versus-blue territory-capture card battles in Unity 6 LTS with URP.
1. TECHNOLOGY REQUIREMENTS:
- Unity 6 LTS (6.3 LTS), C# clean architecture
- Universal Render Pipeline (URP), Shader Graph for territory coloring
- Unity Input System for mobile touch & drag controls
- TextMeshPro & uGUI for responsive HUD
- ScriptableObjects for cards, units, and arena configs
- Photon Fusion 2 for server-authoritative multiplayer
- Android Build Support: APK for testing, AAB for Google Play

2. CORE GAMEPLAY MECHANICS:
- 3D Arena Grid: 20x30 cells, 50% Red vs 50% Blue territory split
- Drag-and-drop Card Hand with energy cost and deployment validity
- Buzz Saw: Trajectory raycast, rolls through arena inking swath & shredding units
- Heavy Cannon: Ballistic paint mortar splattering circular territory
- Blaster & Gatling: Rapid directional paint projectiles
- AI Opponent: Tactical evaluation based on threat and territory percentage
- Match Timer (3:00) with real-time territory percentage bar

3. ARCHITECTURE:
- Core -> Gameplay -> AI -> Networking -> Presentation -> UI
- Single authoritative battle simulation for both local AI and online matches.`;

  const SCRIPTABLE_OBJECT_CS = `// Assets/_Game/Scripts/Gameplay/Cards/CardData.cs
using UnityEngine;

namespace ColorClash.Gameplay.Cards
{
    public enum UnitArchetype { Blaster, Cannon, BuzzSaw, Mortar, Gatling, Laser }
    public enum TargetPreference { Ground, UnitsOnly, Any }

    [CreateAssetMenu(fileName = "NewCard", menuName = "ColorClash/Card Data")]
    public class CardData : ScriptableObject
    {
        [Header("General Info")]
        public string cardId;
        public string cardName;
        [TextArea] public string description;
        public Sprite cardIcon;
        public int energyCost = 3;

        [Header("Combat Stats")]
        public UnitArchetype archetype;
        public float maxHealth = 200f;
        public float damage = 50f;
        public float attackRange = 12f;
        public float fireRate = 1.0f; // Seconds between attacks
        public float paintRadius = 2.5f; // Territory splash radius in tiles

        [Header("Visual Prefabs")]
        public GameObject unitPrefab;
        public GameObject projectilePrefab;
        public GameObject impactVfxPrefab;
    }
}`;

  const TERRITORY_GRID_CS = `// Assets/_Game/Scripts/Gameplay/Territory/TerritoryGrid.cs
using UnityEngine;
using System;

namespace ColorClash.Gameplay.Territory
{
    public enum TeamOwner { Neutral = 0, Blue = 1, Red = 2 }

    public class TerritoryGrid : MonoBehaviour
    {
        public const int COLS = 20;
        public const int ROWS = 30;

        private TeamOwner[,] _grid = new TeamOwner[ROWS, COLS];
        public event Action<float, float> OnTerritoryRatioChanged; // (bluePercent, redPercent)

        public void InitializeGrid()
        {
            for (int r = 0; r < ROWS; r++)
            {
                for (int c = 0; c < COLS; c++)
                {
                    _grid[r, c] = (r < ROWS / 2) ? TeamOwner.Red : TeamOwner.Blue;
                }
            }
            RecalculateTerritory();
        }

        public void SplatArea(Vector2 gridPos, float radius, TeamOwner team)
        {
            int rMin = Mathf.Max(0, Mathf.FloorToInt(gridPos.y - radius));
            int rMax = Mathf.Min(ROWS - 1, Mathf.CeilToInt(gridPos.y + radius));
            int cMin = Mathf.Max(0, Mathf.FloorToInt(gridPos.x - radius));
            int cMax = Mathf.Min(COLS - 1, Mathf.CeilToInt(gridPos.x + radius));

            for (int r = rMin; r <= rMax; r++)
            {
                for (int c = cMin; c <= cMax; c++)
                {
                    if (Vector2.Distance(new Vector2(c, r), gridPos) <= radius)
                    {
                        _grid[r, c] = team;
                    }
                }
            }
            RecalculateTerritory();
        }

        public bool IsValidPlacement(int col, int row, TeamOwner team)
        {
            if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return false;
            return _grid[row, col] == team;
        }

        private void RecalculateTerritory()
        {
            int blueCount = 0;
            int total = ROWS * COLS;
            for (int r = 0; r < ROWS; r++)
            {
                for (int c = 0; c < COLS; c++)
                {
                    if (_grid[r, c] == TeamOwner.Blue) blueCount++;
                }
            }
            float bluePercent = (float)blueCount / total * 100f;
            float redPercent = 100f - bluePercent;
            OnTerritoryRatioChanged?.Invoke(bluePercent, redPercent);
        }
    }
}`;

  const FOLDER_TREE = `Assets/
├── _Game/
│   ├── Art/
│   │   ├── Materials/ (URP Shaders & Textures)
│   │   ├── Models/ (Low-poly Units, Arenas)
│   │   ├── Animations/ (Locomotion & Attacks)
│   │   ├── VFX/ (Paint Splatters, Sparks, Rings)
│   │   └── Audio/ (Procedural Booms, Hum, Sfx)
│   ├── Data/
│   │   ├── Cards/ (CardData ScriptableObjects)
│   │   ├── Units/ (UnitData ScriptableObjects)
│   │   └── Arenas/ (Grid & Map Layouts)
│   ├── Prefabs/
│   │   ├── Units/ (Heavy Cannon, BuzzSaw, Blaster)
│   │   ├── Projectiles/ (Cannonballs, Saws, Pellets)
│   │   └── UI/ (CardHand, EnergyBar, Emotes)
│   ├── Scenes/
│   │   ├── Bootstrap.unity
│   │   ├── MainMenu.unity
│   │   ├── BattleArena3D.unity
│   │   └── Results.unity
│   └── Scripts/
│       ├── Core/ (State Machine, GameLoop)
│       ├── Gameplay/ (Cards, Combat, Territory, Units)
│       ├── AI/ (Tactical Evaluator & Decision Tree)
│       ├── Networking/ (Photon Fusion 2 Integration)
│       └── Presentation/ (VFX, Camera Framing, Shaders)
└── Settings/ (URP Asset, Input Actions)`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-sky-500/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white leading-tight">
                  Unity 6 LTS Android Game Blueprint
                </h2>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/40">
                  PRODUCTION READY
                </span>
              </div>
              <p className="text-xs text-sky-300 font-medium">
                Color Clash 3D • Architecture, C# Scripts &amp; Master Agent Prompt
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-5 pt-2.5 gap-2 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('prompt')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'prompt'
                ? 'border-sky-400 text-sky-400 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Master Agent Prompt
          </button>
          <button
            onClick={() => setActiveTab('scripts')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'scripts'
                ? 'border-sky-400 text-sky-400 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Core C# Scripts
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'border-sky-400 text-sky-400 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            Folder Architecture
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'roadmap'
                ? 'border-sky-400 text-sky-400 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            5-Phase Roadmap
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-300 text-sm flex-1">
          {/* TAB 1: Master Prompt */}
          {activeTab === 'prompt' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    Master Execution Prompt for Coding Agents
                  </h3>
                  <p className="text-xs text-slate-400">
                    Paste this into Claude Code, Antigravity, or Cursor to execute your complete Unity project.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(MASTER_PROMPT, 'prompt')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs shadow-md transition active:scale-95 cursor-pointer"
                >
                  {copiedKey === 'prompt' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'prompt' ? 'Copied!' : 'Copy Master Prompt'}
                </button>
              </div>

              <div className="relative bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-sky-300 overflow-x-auto max-h-[50vh] leading-relaxed select-all">
                <pre>{MASTER_PROMPT}</pre>
              </div>
            </div>
          )}

          {/* TAB 2: Core C# Scripts */}
          {activeTab === 'scripts' && (
            <div className="space-y-4">
              {/* CardData.cs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 font-mono">
                    1. CardData.cs (ScriptableObject Definition)
                  </span>
                  <button
                    onClick={() => copyToClipboard(SCRIPTABLE_OBJECT_CS, 'card_data')}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 transition"
                  >
                    {copiedKey === 'card_data' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 max-h-48 overflow-y-auto">
                  <pre>{SCRIPTABLE_OBJECT_CS}</pre>
                </div>
              </div>

              {/* TerritoryGrid.cs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 font-mono">
                    2. TerritoryGrid.cs (Voxel Splat &amp; Percentage Tracker)
                  </span>
                  <button
                    onClick={() => copyToClipboard(TERRITORY_GRID_CS, 'territory')}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 transition"
                  >
                    {copiedKey === 'territory' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 max-h-48 overflow-y-auto">
                  <pre>{TERRITORY_GRID_CS}</pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Folder Structure */}
          {activeTab === 'architecture' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    Unity Project Feature-Based Folder Tree
                  </h3>
                  <p className="text-xs text-slate-400">
                    Clean separation between Art, Data, Prefabs, Scenes, and Scripts.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(FOLDER_TREE, 'folders')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                >
                  {copiedKey === 'folders' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Tree
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-emerald-400 max-h-[50vh] overflow-y-auto">
                <pre>{FOLDER_TREE}</pre>
              </div>
            </div>
          )}

          {/* TAB 4: 5-Phase Roadmap */}
          {activeTab === 'roadmap' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-black text-xs flex items-center justify-center">1</span>
                    <span className="font-bold text-white text-xs">Phase 1: Foundation &amp; Vertical Slice</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Unity 6 LTS setup, URP 3D arena grid (20x30), touch input &amp; camera framing, 1 working unit and territory splat rule.
                  </p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-slate-950 font-black text-xs flex items-center justify-center">2</span>
                    <span className="font-bold text-white text-xs">Phase 2: Offline Battle &amp; AI</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Energy bar (0-10), card hand cycling, Buzz Saw trajectory, Heavy Cannon, AI opponent evaluating threat priorities.
                  </p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-slate-950 font-black text-xs flex items-center justify-center">3</span>
                    <span className="font-bold text-white text-xs">Phase 3: 3D Polish &amp; Game Feel</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Unit locomotion, attack recoil, animated territory color wave, camera shake, sound effects, particle object pooling.
                  </p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-purple-500 text-slate-950 font-black text-xs flex items-center justify-center">4</span>
                    <span className="font-bold text-white text-xs">Phase 4: Photon Fusion 2 Online</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Authoritative server validation, matchmaking, simultaneous commands, state sync, disconnection &amp; reconnect resilience.
                  </p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 md:col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">5</span>
                    <span className="font-bold text-white text-xs">Phase 5: Android Build &amp; Google Play Release</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Profile 60 FPS on Android devices, PlayFab accounts &amp; progression, signed AAB build for Google Play store submission.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Smartphone className="w-4 h-4 text-sky-400" />
            <span>Target: Android Mobile • 60 FPS</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs shadow-md cursor-pointer transition active:scale-95"
          >
            Return to Live Arena
          </button>
        </div>
      </div>
    </div>
  );
};
