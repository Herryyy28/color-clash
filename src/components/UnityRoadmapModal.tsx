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

  const MASTER_PROMPT = `MASTER EXECUTION PROMPT — COLOR CLASH 3D ANDROID GAME (43-SEC REFERENCE SPECIFICATION)
ROLE: Senior Unity Game Developer, 3D Gameplay Engineer, Mobile UI/UX Reconstruction Specialist, and Mobile Optimization Expert.

Build a production-quality 3D Android game matching the exact Color Clash video reference (Unity 6 LTS + URP + C#).

1. TECHNOLOGY REQUIREMENTS:
- Unity 6 LTS (6.3 LTS), C# clean architecture, URP (Universal Render Pipeline)
- Shader Graph for real-time territory cell splatting (Red vs. Blue 50% split)
- TextMeshPro & uGUI for portrait HUD with Canvas Scaler (Match Width/Height)
- ScriptableObjects for cards, units, passive abilities, and avatar definitions
- Android Touch & Drag-and-Drop Card Hand system with valid territory raycast
- Sandbox IAP system for VIP / No-Ads purchase simulation (₹180 pricing)

2. CORE SCREEN & FLOW RECONSTRUCTION (FROM 43-SECOND CLIP):
- 0–2s NO ADS VIP POPUP: Golden VIP banner, ₹180 price button, 350% value tag, background dimming, working "Not now" & close dismiss, and sandbox purchase flow.
- 3–7s HOME & VS SCREENS: Blue home UI, currencies, Battle button, and cinematic Versus Face-off intro with player avatar, name, trophy count, streak, glowing VS badge, and 3-second animated countdown into battle.
- 8–14s PORTRAIT BATTLE ARENA: White-bordered tile grid, 50% territory balance bar, player & opponent profile avatars, countdown timer, 10-pip segmented energy bar, 4-card hand with 'Next Card' slot.
- 15–18s & 31–36s AVATAR SELECTION OVERLAY: Purple-header overlay with avatar grid, locked options, unlock costs (coins/gems/VIP), and name-editing field. Battle continues visibly behind the dimmed overlay.
- 19–43s LIVE BATTLE LOGIC: Unit deployment, energy deduction, laser attack lanes, irregular captured shapes, unit progression level badges ("Lv. 3"), and active passive ability indicators.

3. ARCHITECTURE:
- Core (GameManager, SoundManager, ProfileData)
- UI (NoAdsVipModalController, VersusIntroSequence, AvatarSelectionOverlay, DeckHUD, HeaderHUD)
- Gameplay (TerritoryGrid, UnitController, ProjectileSystem, PassiveAbilities)
- Data (CardData, AvatarData, LevelConfig)`;

  const NO_ADS_VIP_CS = `// Assets/_Game/Scripts/UI/Modals/NoAdsVipModalController.cs
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System;

namespace ColorClash.UI.Modals
{
    public class NoAdsVipModalController : MonoBehaviour
    {
        [Header("UI Bindings")]
        [SerializeField] private Button _purchaseButton;
        [SerializeField] private Button _closeButton;
        [SerializeField] private Button _notNowButton;
        [SerializeField] private TextMeshProUGUI _priceLabel; // "₹180"
        [SerializeField] private GameObject _vipActiveBadge;
        [SerializeField] private CanvasGroup _dimmedBackground;

        public event Action OnVipPurchased;

        public void Initialize(bool isVipActive)
        {
            _priceLabel.text = "₹180";
            _purchaseButton.interactable = !isVipActive;
            _vipActiveBadge.SetActive(isVipActive);

            _purchaseButton.onClick.AddListener(OnPurchaseClicked);
            _closeButton.onClick.AddListener(CloseModal);
            _notNowButton.onClick.AddListener(CloseModal);
        }

        private void OnPurchaseClicked()
        {
            // Unity IAP Sandbox Integration (Google Play Billing simulation)
            Debug.Log("[IAP Sandbox] Simulating ₹180 VIP Purchase...");
            OnVipPurchased?.Invoke();
            CloseModal();
        }

        public void CloseModal()
        {
            gameObject.SetActive(false);
        }
    }
}`;

  const VERSUS_INTRO_CS = `// Assets/_Game/Scripts/UI/Sequences/VersusIntroSequence.cs
using System.Collections;
using UnityEngine;
using TMPro;
using UnityEngine.UI;
using System;

namespace ColorClash.UI.Sequences
{
    public class VersusIntroSequence : MonoBehaviour
    {
        [Header("Player Details")]
        [SerializeField] private Image _playerAvatar;
        [SerializeField] private TextMeshProUGUI _playerNameText;
        [SerializeField] private TextMeshProUGUI _playerTrophiesText;

        [Header("Opponent Details")]
        [SerializeField] private Image _opponentAvatar;
        [SerializeField] private TextMeshProUGUI _opponentNameText;
        [SerializeField] private TextMeshProUGUI _opponentTrophiesText;

        [Header("Center VS & Countdown")]
        [SerializeField] private RectTransform _vsEmblem;
        [SerializeField] private TextMeshProUGUI _countdownText;
        [SerializeField] private Button _skipButton;

        public event Action OnIntroCompleted;

        public void PlaySequence(string playerName, Sprite playerSprite, int playerTrophies,
                                 string opponentName, Sprite opponentSprite, int opponentTrophies)
        {
            gameObject.SetActive(true);
            _playerNameText.text = playerName;
            _playerAvatar.sprite = playerSprite;
            _playerTrophiesText.text = playerTrophies.ToString();

            _opponentNameText.text = opponentName;
            _opponentAvatar.sprite = opponentSprite;
            _opponentTrophiesText.text = opponentTrophies.ToString();

            _skipButton.onClick.AddListener(StopAndStartBattle);
            StartCoroutine(CountdownRoutine());
        }

        private IEnumerator CountdownRoutine()
        {
            _countdownText.text = "3";
            yield return new WaitForSeconds(0.7f);
            _countdownText.text = "2";
            yield return new WaitForSeconds(0.7f);
            _countdownText.text = "1";
            yield return new WaitForSeconds(0.6f);
            _countdownText.text = "FIGHT!";
            yield return new WaitForSeconds(0.5f);
            StopAndStartBattle();
        }

        private void StopAndStartBattle()
        {
            StopAllCoroutines();
            gameObject.SetActive(false);
            OnIntroCompleted?.Invoke();
        }
    }
}`;

  const AVATAR_OVERLAY_CS = `// Assets/_Game/Scripts/UI/Overlays/AvatarSelectionOverlay.cs
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System;

namespace ColorClash.UI.Overlays
{
    public class AvatarSelectionOverlay : MonoBehaviour
    {
        [SerializeField] private TMP_InputField _nameInputField;
        [SerializeField] private Button _saveNameButton;
        [SerializeField] private Transform _avatarGridContent;
        [SerializeField] private CanvasGroup _backgroundDimmer;

        public event Action<string> OnAvatarSelected;
        public event Action<string> OnPlayerNameChanged;

        public void Open(string currentName, string currentAvatarId, bool isBattleActive)
        {
            gameObject.SetActive(true);
            _nameInputField.text = currentName;
            // Keeps live battle running visibly behind dimmed overlay
            _backgroundDimmer.alpha = isBattleActive ? 0.75f : 0.95f;
            _saveNameButton.onClick.AddListener(() => OnPlayerNameChanged?.Invoke(_nameInputField.text));
        }

        public void Close()
        {
            gameObject.SetActive(false);
        }
    }
}`;

  const SCRIPTABLE_OBJECT_CS = `// Assets/_Game/Scripts/Gameplay/Cards/CardData.cs
using UnityEngine;

namespace ColorClash.Gameplay.Cards
{
    public enum UnitArchetype { Blaster, Cannon, BuzzSaw, Mortar, Gatling, Laser, PaintTank }
    public enum PassiveAbilityType { None, SpeedBoost, Shielding, TerritorySurge, RapidOvercharge }

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

        [Header("Passive Ability")]
        public PassiveAbilityType passiveType = PassiveAbilityType.None;
        public float passiveShieldValue = 0f; // Absorb damage (e.g. Cannon 80f)
        public float passiveSpeedFactor = 1.0f; // Speed boost (e.g. Blaster 1.3f)

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
    <div className="fixed inset-0 z-50 bg-[#071940]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-[#143c8c] via-[#0f2e6e] to-[#0a235c] border-2 border-sky-400 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-blue-400/40 bg-[#0a235c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white leading-tight drop-shadow">
                  Unity 6 LTS Android Game Blueprint
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-400/40">
                  PRODUCTION READY
                </span>
              </div>
              <p className="text-xs text-sky-200 font-medium">
                Color Clash 3D • Architecture, C# Scripts &amp; Master Agent Prompt
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1b4cb8] hover:bg-[#2563eb] text-white flex items-center justify-center border-2 border-white/60 transition cursor-pointer shadow active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-blue-400/40 bg-[#081d4a] px-5 pt-2.5 gap-2 text-xs font-bold overflow-x-auto">
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

              <div className="relative bg-[#081d47] p-4 rounded-2xl border border-blue-400/30 font-mono text-xs text-sky-300 overflow-x-auto max-h-[50vh] leading-relaxed select-all shadow-inner">
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
                    className="flex items-center gap-1 text-xs text-blue-200 hover:text-white px-2 py-1 rounded bg-[#133785] border border-blue-300/30 transition shadow"
                  >
                    {copiedKey === 'card_data' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <div className="bg-[#081d47] p-3 rounded-xl border border-blue-400/30 font-mono text-xs text-blue-100 max-h-48 overflow-y-auto shadow-inner">
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
                    className="flex items-center gap-1 text-xs text-blue-200 hover:text-white px-2 py-1 rounded bg-[#133785] border border-blue-300/30 transition shadow"
                  >
                    {copiedKey === 'territory' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <div className="bg-[#081d47] p-3 rounded-xl border border-blue-400/30 font-mono text-xs text-blue-100 max-h-48 overflow-y-auto shadow-inner">
                  <pre>{TERRITORY_GRID_CS}</pre>
                </div>
              </div>

              {/* NoAdsVipModalController.cs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-yellow-300 font-mono">
                    3. NoAdsVipModalController.cs (₹180 IAP Sandbox &amp; VIP Perks)
                  </span>
                  <button
                    onClick={() => copyToClipboard(NO_ADS_VIP_CS, 'no_ads')}
                    className="flex items-center gap-1 text-xs text-blue-200 hover:text-white px-2 py-1 rounded bg-[#133785] border border-blue-300/30 transition shadow"
                  >
                    {copiedKey === 'no_ads' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <div className="bg-[#081d47] p-3 rounded-xl border border-blue-400/30 font-mono text-xs text-blue-100 max-h-48 overflow-y-auto shadow-inner">
                  <pre>{NO_ADS_VIP_CS}</pre>
                </div>
              </div>

              {/* VersusIntroSequence.cs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-300 font-mono">
                    4. VersusIntroSequence.cs (Cinematic VS Countdown &amp; Face-Off)
                  </span>
                  <button
                    onClick={() => copyToClipboard(VERSUS_INTRO_CS, 'versus')}
                    className="flex items-center gap-1 text-xs text-blue-200 hover:text-white px-2 py-1 rounded bg-[#133785] border border-blue-300/30 transition shadow"
                  >
                    {copiedKey === 'versus' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <div className="bg-[#081d47] p-3 rounded-xl border border-blue-400/30 font-mono text-xs text-blue-100 max-h-48 overflow-y-auto shadow-inner">
                  <pre>{VERSUS_INTRO_CS}</pre>
                </div>
              </div>

              {/* AvatarSelectionOverlay.cs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 font-mono">
                    5. AvatarSelectionOverlay.cs (Live Battle Dimming &amp; Name Editing)
                  </span>
                  <button
                    onClick={() => copyToClipboard(AVATAR_OVERLAY_CS, 'avatar_overlay')}
                    className="flex items-center gap-1 text-xs text-blue-200 hover:text-white px-2 py-1 rounded bg-[#133785] border border-blue-300/30 transition shadow"
                  >
                    {copiedKey === 'avatar_overlay' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <div className="bg-[#081d47] p-3 rounded-xl border border-blue-400/30 font-mono text-xs text-blue-100 max-h-48 overflow-y-auto shadow-inner">
                  <pre>{AVATAR_OVERLAY_CS}</pre>
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#133785] hover:bg-[#1a4db8] text-white text-xs font-bold transition cursor-pointer border border-blue-300/30 shadow"
                >
                  {copiedKey === 'folders' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Tree
                </button>
              </div>

              <div className="bg-[#081d47] p-4 rounded-2xl border border-blue-400/30 font-mono text-xs text-emerald-300 max-h-[50vh] overflow-y-auto shadow-inner">
                <pre>{FOLDER_TREE}</pre>
              </div>
            </div>
          )}

          {/* TAB 4: 5-Phase Roadmap */}
          {activeTab === 'roadmap' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[#081d47] p-3.5 rounded-2xl border border-blue-400/30 shadow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-sky-400 text-blue-950 font-black text-xs flex items-center justify-center shadow">1</span>
                    <span className="font-bold text-white text-xs">Phase 1: Foundation &amp; Vertical Slice</span>
                  </div>
                  <p className="text-xs text-blue-200">
                    Unity 6 LTS setup, URP 3D arena grid (20x30), touch input &amp; camera framing, 1 working unit and territory splat rule.
                  </p>
                </div>

                <div className="bg-[#081d47] p-3.5 rounded-2xl border border-blue-400/30 shadow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-blue-400 text-blue-950 font-black text-xs flex items-center justify-center shadow">2</span>
                    <span className="font-bold text-white text-xs">Phase 2: Offline Battle &amp; AI</span>
                  </div>
                  <p className="text-xs text-blue-200">
                    Energy bar (0-10), card hand cycling, Buzz Saw trajectory, Heavy Cannon, AI opponent evaluating threat priorities.
                  </p>
                </div>

                <div className="bg-[#081d47] p-3.5 rounded-2xl border border-blue-400/30 shadow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-indigo-400 text-blue-950 font-black text-xs flex items-center justify-center shadow">3</span>
                    <span className="font-bold text-white text-xs">Phase 3: 3D Polish &amp; Game Feel</span>
                  </div>
                  <p className="text-xs text-blue-200">
                    Unit locomotion, attack recoil, animated territory color wave, camera shake, sound effects, particle object pooling.
                  </p>
                </div>

                <div className="bg-[#081d47] p-3.5 rounded-2xl border border-blue-400/30 shadow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-purple-400 text-blue-950 font-black text-xs flex items-center justify-center shadow">4</span>
                    <span className="font-bold text-white text-xs">Phase 4: Photon Fusion 2 Online</span>
                  </div>
                  <p className="text-xs text-blue-200">
                    Authoritative server validation, matchmaking, simultaneous commands, state sync, disconnection &amp; reconnect resilience.
                  </p>
                </div>

                <div className="bg-[#081d47] p-3.5 rounded-2xl border border-blue-400/30 shadow md:col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-400 text-teal-950 font-black text-xs flex items-center justify-center shadow">5</span>
                    <span className="font-bold text-white text-xs">Phase 5: Android Build &amp; Google Play Release</span>
                  </div>
                  <p className="text-xs text-blue-200">
                    Profile 60 FPS on Android devices, PlayFab accounts &amp; progression, signed AAB build for Google Play store submission.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-blue-400/30 bg-[#081d47] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-blue-200">
            <Smartphone className="w-4 h-4 text-sky-400" />
            <span>Target: Android Mobile • 60 FPS</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-400 hover:bg-sky-300 text-blue-950 font-black text-xs shadow-md cursor-pointer transition active:scale-95"
          >
            Return to Live Arena
          </button>
        </div>
      </div>
    </div>
  );
};
