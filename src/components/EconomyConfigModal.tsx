import React, { useState } from 'react';
import { X, Settings, Sliders, Code2, Copy, Check, RotateCcw, Save, Smartphone, ShieldCheck } from 'lucide-react';
import { economyConfigService, EconomyConfigType } from '../services/economyConfig';
import { currencyService } from '../services/currencyService';
import { sounds } from '../audio';

interface EconomyConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const EconomyConfigModal: React.FC<EconomyConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'unity_cs'>('config');
  const [config, setConfig] = useState<EconomyConfigType>(economyConfigService.get());
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    sounds.playClick();
    economyConfigService.update(config);
    setSaveMessage('Economy configuration updated successfully!');
    onConfigUpdated();
    setTimeout(() => setSaveMessage(null), 2500);
  };

  const handleResetDefaults = () => {
    sounds.playClick();
    const defaults = economyConfigService.reset();
    setConfig(defaults);
    setSaveMessage('Reset to factory default values');
    onConfigUpdated();
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(label);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  // -------------------------------------------------------------
  // Production-Ready Unity C# Scripts
  // -------------------------------------------------------------
  const UNITY_CURRENCY_SERVICE_CS = `// Assets/Scripts/Economy/CurrencyService.cs
using System;
using System.Collections.Generic;
using UnityEngine;

namespace ColorClash.Economy
{
    [Serializable]
    public class WalletTransaction
    {
        public string id;
        public string claimId;
        public long timestamp;
        public string currency;
        public string type;
        public int amount;
        public int balanceBefore;
        public int balanceAfter;
        public string description;
        public string placementId;
    }

    [Serializable]
    public class WalletSaveData
    {
        public int coins = 650;
        public int gems = 95;
        public int totalCoinsEarned = 650;
        public int totalCoinsSpent = 0;
        public List<string> processedClaimIds = new List<string>();
        public List<WalletTransaction> transactions = new List<WalletTransaction>();
    }

    public class CurrencyService : MonoBehaviour
    {
        public static CurrencyService Instance { get; private set; }

        public event Action<int, int> OnBalanceChanged; // (coins, gems)
        public event Action<WalletTransaction> OnTransactionCompleted;

        [SerializeField] private WalletSaveData wallet = new WalletSaveData();
        private const string SAVE_KEY = "ColorClash_AuthoritativeWallet_v1";

        public int Coins => wallet.coins;
        public int Gems => wallet.gems;

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
                LoadWallet();
            }
            else
            {
                Destroy(gameObject);
            }
        }

        public bool IsClaimProcessed(string claimId)
        {
            return wallet.processedClaimIds.Contains(claimId);
        }

        public bool CreditCoins(int amount, string type, string claimId, string description, string placementId = "")
        {
            if (amount <= 0 || IsClaimProcessed(claimId))
            {
                Debug.LogWarning($"[CurrencyService] Duplicate or invalid claim rejected: {claimId}");
                return false;
            }

            int before = wallet.coins;
            int after = before + amount;

            var tx = new WalletTransaction
            {
                id = Guid.NewGuid().ToString(),
                claimId = claimId,
                timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                currency = "coins",
                type = type,
                amount = amount,
                balanceBefore = before,
                balanceAfter = after,
                description = description,
                placementId = placementId
            };

            wallet.coins = after;
            wallet.totalCoinsEarned += amount;
            wallet.processedClaimIds.Add(claimId);
            wallet.transactions.Insert(0, tx);

            SaveWallet();
            OnBalanceChanged?.Invoke(wallet.coins, wallet.gems);
            OnTransactionCompleted?.Invoke(tx);
            return true;
        }

        public bool SpendCoins(int cost, string type, string description, out int shortfall)
        {
            if (wallet.coins < cost)
            {
                shortfall = cost - wallet.coins;
                return false;
            }

            shortfall = 0;
            int before = wallet.coins;
            int after = before - cost;

            var tx = new WalletTransaction
            {
                id = Guid.NewGuid().ToString(),
                claimId = "spend_" + Guid.NewGuid().ToString(),
                timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                currency = "coins",
                type = type,
                amount = -cost,
                balanceBefore = before,
                balanceAfter = after,
                description = description
            };

            wallet.coins = after;
            wallet.totalCoinsSpent += cost;
            wallet.transactions.Insert(0, tx);

            SaveWallet();
            OnBalanceChanged?.Invoke(wallet.coins, wallet.gems);
            OnTransactionCompleted?.Invoke(tx);
            return true;
        }

        private void SaveWallet()
        {
            string json = JsonUtility.ToJson(wallet);
            PlayerPrefs.SetString(SAVE_KEY, json);
            PlayerPrefs.Save();
        }

        private void LoadWallet()
        {
            if (PlayerPrefs.HasKey(SAVE_KEY))
            {
                string json = PlayerPrefs.GetString(SAVE_KEY);
                wallet = JsonUtility.FromJson<WalletSaveData>(json);
            }
        }
    }
}`;

  const UNITY_LEVELPLAY_CONTROLLER_CS = `// Assets/Scripts/Ads/LevelPlayMediationController.cs
using System;
using UnityEngine;
using ColorClash.Economy;

namespace ColorClash.Ads
{
    public class LevelPlayMediationController : MonoBehaviour
    {
        public static LevelPlayMediationController Instance { get; private set; }

        [Header("LevelPlay App Configuration")]
        [SerializeField] private string appKey = "1b89ef94";
        [SerializeField] private string defaultRewardedPlacement = "rewarded_home_coins";

        public event Action<string> OnAdAvailable;
        public event Action<string, string> OnAdUnavailable;
        public event Action<string> OnAdOpened;
        public event Action<string, int> OnRewardEarned; // (placement, rewardCoins)
        public event Action<string, bool> OnAdClosed;

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
                InitializeSDK();
            }
            else
            {
                Destroy(gameObject);
            }
        }

        private void InitializeSDK()
        {
            Debug.Log("[LevelPlay] Registering rewarded ad callbacks & initializing IronSource mediation...");
            IronSource.Agent.init(appKey, IronSourceAdUnits.REWARDED_VIDEO);
            IronSource.Agent.validateIntegration();

            // Register IronSource Events
            IronSourceRewardedVideoEvents.onAdAvailableEvent += HandleAdAvailable;
            IronSourceRewardedVideoEvents.onAdUnavailableEvent += HandleAdUnavailable;
            IronSourceRewardedVideoEvents.onAdOpenedEvent += HandleAdOpened;
            IronSourceRewardedVideoEvents.onAdRewardedEvent += HandleAdRewarded;
            IronSourceRewardedVideoEvents.onAdClosedEvent += HandleAdClosed;
        }

        public bool IsAdReady()
        {
            return IronSource.Agent.isRewardedVideoAvailable();
        }

        public void ShowRewardedAd(string placementName, int rewardCoins)
        {
            if (!IsAdReady())
            {
                Debug.LogWarning("[LevelPlay] Rewarded ad not ready, requesting load...");
                IronSource.Agent.loadRewardedVideo();
                return;
            }

            Debug.Log($"[LevelPlay] Showing rewarded ad placement: {placementName}");
            IronSource.Agent.showRewardedVideo(placementName);
        }

        private void HandleAdAvailable(IronSourceAdInfo info) => OnAdAvailable?.Invoke(info.placement);
        private void HandleAdUnavailable() => OnAdUnavailable?.Invoke("", "Ad not available");
        private void HandleAdOpened(IronSourceAdInfo info) => OnAdOpened?.Invoke(info.placement);

        private void HandleAdRewarded(IronSourcePlacement placement, IronSourceAdInfo info)
        {
            string claimId = "unity_ad_" + Guid.NewGuid().ToString();
            int amount = placement.getRewardAmount();
            CurrencyService.Instance.CreditCoins(amount, "reward_ad", claimId, "Unity LevelPlay Video Reward", placement.getPlacementName());
            OnRewardEarned?.Invoke(placement.getPlacementName(), amount);
        }

        private void HandleAdClosed(IronSourceAdInfo info)
        {
            OnAdClosed?.Invoke(info.placement, true);
        }
    }
}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#071940]/85 backdrop-blur-md flex items-center justify-center p-3 safe-pt safe-pb select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xl rounded-3xl bg-gradient-to-b from-[#1b50ba] via-[#143e99] to-[#0c2a6b] p-0.5 border-2 border-sky-300 shadow-[0_0_50px_rgba(27,80,186,0.6)] overflow-hidden flex flex-col max-h-[calc(100dvh-var(--safe-top)-var(--safe-bottom)-20px)]">
        {/* Header */}
        <div className="w-full bg-[#123687] px-4 py-3 flex items-center justify-between border-b border-sky-300/40 shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-yellow-300" />
            <div className="flex flex-col">
              <h3 className="text-sm font-black text-white uppercase tracking-wider leading-none">
                Economy Config & Unity C# Engine
              </h3>
              <span className="text-[10px] text-sky-200 font-bold mt-0.5">
                Centralized rewards, LevelPlay placements & C# scripts
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-[#1b4cb8] text-white flex items-center justify-center border border-white/60 cursor-pointer active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-4 py-2 bg-[#0c2a6b] flex gap-2 border-b border-blue-400/30 shrink-0">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition flex items-center gap-1.5 ${
              activeTab === 'config'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 shadow'
                : 'bg-[#123687] text-sky-200 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Live Economy Config
          </button>
          <button
            onClick={() => setActiveTab('unity_cs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition flex items-center gap-1.5 ${
              activeTab === 'unity_cs'
                ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-blue-950 shadow'
                : 'bg-[#123687] text-sky-200 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" /> Unity C# Scripts
          </button>
        </div>

        {/* Save message */}
        {saveMessage && (
          <div className="mx-4 mt-2 p-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-teal-950 text-xs font-black text-center shadow animate-in fade-in">
            {saveMessage}
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 text-xs">
          {activeTab === 'config' ? (
            <>
              {/* Rewarded Ad Placement Config */}
              <div className="bg-[#0b245e] border border-blue-400/40 rounded-2xl p-3 shadow-inner">
                <h4 className="text-xs font-black text-yellow-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Rewarded Video Ad Rewards</span>
                  <span className="text-[10px] text-sky-300">LevelPlay Mediation</span>
                </h4>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-sky-200 block mb-1">
                      Home Ad Coins (Default)
                    </label>
                    <input
                      type="number"
                      value={config.rewardedAds.placements.homeReward.rewardCoins}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          rewardedAds: {
                            ...config.rewardedAds,
                            placements: {
                              ...config.rewardedAds.placements,
                              homeReward: {
                                ...config.rewardedAds.placements.homeReward,
                                rewardCoins: Number(e.target.value),
                              },
                            },
                          },
                        })
                      }
                      className="w-full bg-[#133785] text-white font-black px-2.5 py-1.5 rounded-lg border border-sky-300/50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-sky-200 block mb-1">
                      Daily Bonus Ad Coins
                    </label>
                    <input
                      type="number"
                      value={config.rewardedAds.placements.dailyBonus.rewardCoins}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          rewardedAds: {
                            ...config.rewardedAds,
                            placements: {
                              ...config.rewardedAds.placements,
                              dailyBonus: {
                                ...config.rewardedAds.placements.dailyBonus,
                                rewardCoins: Number(e.target.value),
                              },
                            },
                          },
                        })
                      }
                      className="w-full bg-[#133785] text-white font-black px-2.5 py-1.5 rounded-lg border border-sky-300/50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-sky-200 block mb-1">
                      Daily Watch Cap
                    </label>
                    <input
                      type="number"
                      value={config.rewardedAds.placements.homeReward.dailyCap}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          rewardedAds: {
                            ...config.rewardedAds,
                            placements: {
                              ...config.rewardedAds.placements,
                              homeReward: {
                                ...config.rewardedAds.placements.homeReward,
                                dailyCap: Number(e.target.value),
                              },
                            },
                          },
                        })
                      }
                      className="w-full bg-[#133785] text-white font-black px-2.5 py-1.5 rounded-lg border border-sky-300/50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-sky-200 block mb-1">
                      Ad Cooldown (seconds)
                    </label>
                    <input
                      type="number"
                      value={config.rewardedAds.placements.homeReward.cooldownSeconds}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          rewardedAds: {
                            ...config.rewardedAds,
                            placements: {
                              ...config.rewardedAds.placements,
                              homeReward: {
                                ...config.rewardedAds.placements.homeReward,
                                cooldownSeconds: Number(e.target.value),
                              },
                            },
                          },
                        })
                      }
                      className="w-full bg-[#133785] text-white font-black px-2.5 py-1.5 rounded-lg border border-sky-300/50"
                    />
                  </div>
                </div>
              </div>

              {/* Battle Reward Rules */}
              <div className="bg-[#0b245e] border border-blue-400/40 rounded-2xl p-3 shadow-inner">
                <h4 className="text-xs font-black text-yellow-300 uppercase tracking-wider mb-2">
                  Battle Outcome Currency Rules
                </h4>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-sky-200 block mb-1">
                      Win Base Coins
                    </label>
                    <input
                      type="number"
                      value={config.battle.winBaseCoins}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          battle: { ...config.battle, winBaseCoins: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-[#133785] text-white font-black px-2 py-1 rounded-lg border border-sky-300/50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-sky-200 block mb-1">
                      Defeat Coins
                    </label>
                    <input
                      type="number"
                      value={config.battle.defeatBaseCoins}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          battle: { ...config.battle, defeatBaseCoins: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-[#133785] text-white font-black px-2 py-1 rounded-lg border border-sky-300/50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-sky-200 block mb-1">
                      Clean Sweep Bonus
                    </label>
                    <input
                      type="number"
                      value={config.battle.cleanSweepBonusCoins}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          battle: { ...config.battle, cleanSweepBonusCoins: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-[#133785] text-white font-black px-2 py-1 rounded-lg border border-sky-300/50"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 text-amber-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow border border-white cursor-pointer active:scale-95 transition"
                >
                  <Save className="w-4 h-4" /> Save Economy Rules
                </button>
                <button
                  onClick={handleResetDefaults}
                  className="py-2.5 px-3 rounded-xl bg-[#092257] hover:bg-[#133785] text-sky-200 hover:text-white font-bold text-xs flex items-center gap-1 border border-blue-400/40 cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Unity C# Scripts Viewer */}
              <div className="flex flex-col gap-3">
                <div className="bg-[#092257] p-2.5 rounded-xl border border-sky-300/40 text-blue-100 text-[11px] leading-relaxed">
                  <span className="font-black text-white block mb-0.5">🎮 Ready for Direct Unity Drop-in:</span>
                  Copy these C# scripts directly into your Unity project (<code className="text-yellow-300 font-mono">Assets/Scripts/Economy/</code> and <code className="text-yellow-300 font-mono">Assets/Scripts/Ads/</code>). They work seamlessly with Unity LevelPlay (IronSource) SDK.
                </div>

                {/* Script 1: CurrencyService.cs */}
                <div className="bg-[#081e4a] rounded-xl border border-blue-400/50 overflow-hidden shadow">
                  <div className="bg-[#123687] px-3 py-2 flex items-center justify-between border-b border-blue-400/30">
                    <span className="font-mono text-yellow-300 font-bold text-[11px]">
                      CurrencyService.cs (Wallet & Idempotency)
                    </span>
                    <button
                      onClick={() => copyToClipboard(UNITY_CURRENCY_SERVICE_CS, 'CurrencyService.cs')}
                      className="flex items-center gap-1 bg-[#1a4db8] hover:bg-sky-500 text-white px-2 py-0.5 rounded text-[10px] font-black cursor-pointer active:scale-95"
                    >
                      {copiedFile === 'CurrencyService.cs' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-300" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy C#
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 text-[10px] font-mono text-blue-100 overflow-x-auto max-h-44 bg-[#06173b]">
                    {UNITY_CURRENCY_SERVICE_CS}
                  </pre>
                </div>

                {/* Script 2: LevelPlayMediationController.cs */}
                <div className="bg-[#081e4a] rounded-xl border border-blue-400/50 overflow-hidden shadow">
                  <div className="bg-[#123687] px-3 py-2 flex items-center justify-between border-b border-blue-400/30">
                    <span className="font-mono text-yellow-300 font-bold text-[11px]">
                      LevelPlayMediationController.cs (Ads SDK)
                    </span>
                    <button
                      onClick={() => copyToClipboard(UNITY_LEVELPLAY_CONTROLLER_CS, 'LevelPlayMediationController.cs')}
                      className="flex items-center gap-1 bg-[#1a4db8] hover:bg-sky-500 text-white px-2 py-0.5 rounded text-[10px] font-black cursor-pointer active:scale-95"
                    >
                      {copiedFile === 'LevelPlayMediationController.cs' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-300" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy C#
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 text-[10px] font-mono text-blue-100 overflow-x-auto max-h-44 bg-[#06173b]">
                    {UNITY_LEVELPLAY_CONTROLLER_CS}
                  </pre>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
