/**
 * Centralized Economy Configuration for Color Clash
 * Defines rewards, placement IDs, pacing, formulas, and daily calendar
 */

export interface PlacementConfig {
  id: string;
  name: string;
  rewardCoins: number;
  multiplier?: number;
  cooldownSeconds: number;
  dailyCap: number;
  description: string;
}

export interface EconomyConfigType {
  // Rewarded Ad Configuration
  rewardedAds: {
    enabled: boolean;
    sdkInitialized: boolean;
    adUnitId: string;
    appKey: string;
    isTestMode: boolean;
    defaultCoinReward: number;
    placements: {
      homeReward: PlacementConfig;
      battleDouble: PlacementConfig;
      dailyBonus: PlacementConfig;
      shopFree: PlacementConfig;
      shortfallAid: PlacementConfig;
    };
  };

  // Match Rewards
  battle: {
    winBaseCoins: number;
    winCoinsPerLevel: number;
    winTrophies: number;
    defeatBaseCoins: number;
    defeatCoinsPerLevel: number;
    drawCoins: number;
    cleanSweepTerritoryThreshold: number; // e.g. 75%
    cleanSweepBonusCoins: number;
    speedBonusMaxCoins: number;
  };

  // 7-Day Daily Streak Schedule
  dailyStreak: Array<{
    day: number;
    coins: number;
    gems: number;
    chestTier?: 'wooden' | 'silver' | 'gold' | 'magical';
    label: string;
  }>;

  // Avatar coin prices
  avatarPrices: Record<string, number>;
}

export const DEFAULT_ECONOMY_CONFIG: EconomyConfigType = {
  rewardedAds: {
    enabled: true,
    sdkInitialized: true,
    adUnitId: 'color_clash_rewarded_main',
    appKey: '1b89ef94',
    isTestMode: true,
    defaultCoinReward: 100,
    placements: {
      homeReward: {
        id: 'placement_home_reward',
        name: 'Watch Ad — Collect Coins',
        rewardCoins: 100,
        cooldownSeconds: 15,
        dailyCap: 12,
        description: 'Watch video ad from Home screen to earn instant coins',
      },
      battleDouble: {
        id: 'placement_battle_double',
        name: 'Double Battle Coins',
        rewardCoins: 0, // dynamic: matches earned battle coins
        multiplier: 2.0,
        cooldownSeconds: 0,
        dailyCap: 25,
        description: 'Watch video ad on victory screen to double your battle gold',
      },
      dailyBonus: {
        id: 'placement_daily_bonus',
        name: 'Daily Streak Bonus',
        rewardCoins: 150,
        cooldownSeconds: 30,
        dailyCap: 5,
        description: 'Watch bonus video ad on daily reward claim for +150 coins',
      },
      shopFree: {
        id: 'placement_shop_free',
        name: 'Shop Free Coin Vault',
        rewardCoins: 100,
        cooldownSeconds: 20,
        dailyCap: 8,
        description: 'Watch ad in the Shop to collect 100 free coins',
      },
      shortfallAid: {
        id: 'placement_shortfall_aid',
        name: 'Quick Coin Boost',
        rewardCoins: 100,
        cooldownSeconds: 10,
        dailyCap: 15,
        description: 'Short on coins for card upgrade or avatar? Watch an ad to top up',
      },
    },
  },

  battle: {
    winBaseCoins: 80,
    winCoinsPerLevel: 25,
    winTrophies: 15,
    defeatBaseCoins: 25,
    defeatCoinsPerLevel: 10,
    drawCoins: 35,
    cleanSweepTerritoryThreshold: 75, // 75% territory or higher
    cleanSweepBonusCoins: 35,
    speedBonusMaxCoins: 30,
  },

  dailyStreak: [
    { day: 1, coins: 100, gems: 0, label: 'Day 1' },
    { day: 2, coins: 150, gems: 5, label: 'Day 2' },
    { day: 3, coins: 200, gems: 10, label: 'Day 3' },
    { day: 4, coins: 250, gems: 10, label: 'Day 4' },
    { day: 5, coins: 350, gems: 15, chestTier: 'wooden', label: 'Day 5' },
    { day: 6, coins: 500, gems: 20, chestTier: 'silver', label: 'Day 6' },
    { day: 7, coins: 1000, gems: 35, chestTier: 'gold', label: 'Day 7 Mega Jackpot' },
  ],

  avatarPrices: {
    ninja_warrior: 300,
    horned_viking: 450,
  },
};

const CONFIG_STORAGE_KEY = 'color_clash_economy_config_v1';

export const economyConfigService = {
  get(): EconomyConfigType {
    try {
      const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (!raw) return DEFAULT_ECONOMY_CONFIG;
      return { ...DEFAULT_ECONOMY_CONFIG, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_ECONOMY_CONFIG;
    }
  },

  update(partial: Partial<EconomyConfigType>): EconomyConfigType {
    try {
      const current = this.get();
      const updated = { ...current, ...partial };
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return DEFAULT_ECONOMY_CONFIG;
    }
  },

  reset(): EconomyConfigType {
    try {
      localStorage.removeItem(CONFIG_STORAGE_KEY);
    } catch {}
    return DEFAULT_ECONOMY_CONFIG;
  },
};
