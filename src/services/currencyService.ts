/**
 * Authoritative Currency & Economy Service for Color Clash
 * Manages player coin & gem balances, idempotent reward transactions,
 * audit history ledger, pending rewards, and reactive UI subscriptions.
 */

import { economyConfigService, DEFAULT_ECONOMY_CONFIG, EconomyConfigType } from './economyConfig';

export type TransactionType =
  | 'reward_ad'
  | 'reward_battle'
  | 'reward_battle_double'
  | 'reward_daily_streak'
  | 'reward_daily_ad_bonus'
  | 'reward_spin'
  | 'reward_chest'
  | 'spend_card_upgrade'
  | 'spend_avatar_unlock'
  | 'spend_chest_purchase'
  | 'spend_coin_purchase'
  | 'free_gift_daily'
  | 'admin_grant';

export interface WalletTransaction {
  id: string; // Unique transaction UUID
  claimId: string; // Idempotency claim identifier
  timestamp: number;
  currency: 'coins' | 'gems';
  type: TransactionType;
  amount: number; // positive for credit, negative for debit
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  placementId?: string;
  metadata?: Record<string, unknown>;
  status: 'completed' | 'failed' | 'rolled_back';
}

export interface PendingReward {
  claimId: string;
  placementId: string;
  expectedCoins: number;
  expectedGems?: number;
  timestamp: number;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface DailyStreakState {
  currentStreak: number;
  lastClaimDate: string | null; // 'YYYY-MM-DD'
  lastClaimTimestamp: number | null;
  claimedDays: number[]; // e.g. [1, 2]
}

export interface WalletState {
  coins: number;
  gems: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  totalGemsEarned: number;
  totalGemsSpent: number;
  lastSyncedAt: number;
  dailyStreak: DailyStreakState;
  transactions: WalletTransaction[];
  pendingRewards: Record<string, PendingReward>;
  processedClaimIds: string[]; // for fast idempotency lookup
  adWatchHistory: Record<string, { count: number; lastWatchTime: number }>; // date string -> count
}

const WALLET_STORAGE_KEY = 'color_clash_wallet_v2';
const LEGACY_SAVE_KEY = 'color_clash_save_v1';

export type WalletListener = (state: WalletState) => void;

class CurrencyService {
  private state: WalletState;
  private listeners: Set<WalletListener> = new Set();
  private isProcessing: boolean = false;

  constructor() {
    this.state = this.loadFromStorage();
  }

  // -------------------------------------------------------------
  // Persistence & Initialization
  // -------------------------------------------------------------
  private getDefaultWalletState(): WalletState {
    return {
      coins: 650,
      gems: 95,
      totalCoinsEarned: 650,
      totalCoinsSpent: 0,
      totalGemsEarned: 95,
      totalGemsSpent: 0,
      lastSyncedAt: Date.now(),
      dailyStreak: {
        currentStreak: 0,
        lastClaimDate: null,
        lastClaimTimestamp: null,
        claimedDays: [],
      },
      transactions: [],
      pendingRewards: {},
      processedClaimIds: [],
      adWatchHistory: {},
    };
  }

  private loadFromStorage(): WalletState {
    try {
      if (typeof localStorage === 'undefined') {
        return this.getDefaultWalletState();
      }
      const raw = localStorage.getItem(WALLET_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          coins: typeof parsed.coins === 'number' ? Math.max(0, parsed.coins) : 650,
          gems: typeof parsed.gems === 'number' ? Math.max(0, parsed.gems) : 95,
          totalCoinsEarned: parsed.totalCoinsEarned || 650,
          totalCoinsSpent: parsed.totalCoinsSpent || 0,
          totalGemsEarned: parsed.totalGemsEarned || 95,
          totalGemsSpent: parsed.totalGemsSpent || 0,
          lastSyncedAt: parsed.lastSyncedAt || Date.now(),
          dailyStreak: parsed.dailyStreak || {
            currentStreak: 0,
            lastClaimDate: null,
            lastClaimTimestamp: null,
            claimedDays: [],
          },
          transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
          pendingRewards: parsed.pendingRewards || {},
          processedClaimIds: Array.isArray(parsed.processedClaimIds)
            ? parsed.processedClaimIds
            : [],
          adWatchHistory: parsed.adWatchHistory || {},
        };
      }

      // Check legacy save migration
      const legacyRaw = localStorage.getItem(LEGACY_SAVE_KEY);
      let initialCoins = 650;
      let initialGems = 95;
      if (legacyRaw) {
        try {
          const legacy = JSON.parse(legacyRaw);
          if (legacy.playerProfile) {
            initialCoins = legacy.playerProfile.coins ?? 650;
            initialGems = legacy.playerProfile.gems ?? 95;
          }
        } catch {}
      }

      return {
        coins: initialCoins,
        gems: initialGems,
        totalCoinsEarned: initialCoins,
        totalCoinsSpent: 0,
        totalGemsEarned: initialGems,
        totalGemsSpent: 0,
        lastSyncedAt: Date.now(),
        dailyStreak: {
          currentStreak: 0,
          lastClaimDate: null,
          lastClaimTimestamp: null,
          claimedDays: [],
        },
        transactions: [
          {
            id: 'tx_init_wallet',
            claimId: 'init_claim_0',
            timestamp: Date.now(),
            currency: 'coins',
            type: 'admin_grant',
            amount: initialCoins,
            balanceBefore: 0,
            balanceAfter: initialCoins,
            description: 'Starting Wallet Allocation',
            status: 'completed',
          },
        ],
        pendingRewards: {},
        processedClaimIds: ['init_claim_0'],
        adWatchHistory: {},
      };
    } catch (e) {
      console.warn('[CurrencyService] Failed to load wallet, using defaults', e);
      return {
        coins: 650,
        gems: 95,
        totalCoinsEarned: 650,
        totalCoinsSpent: 0,
        totalGemsEarned: 95,
        totalGemsSpent: 0,
        lastSyncedAt: Date.now(),
        dailyStreak: {
          currentStreak: 0,
          lastClaimDate: null,
          lastClaimTimestamp: null,
          claimedDays: [],
        },
        transactions: [],
        pendingRewards: {},
        processedClaimIds: [],
        adWatchHistory: {},
      };
    }
  }

  private saveToStorage() {
    try {
      if (typeof localStorage === 'undefined') return;
      this.state.lastSyncedAt = Date.now();
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(this.state));

      // Also sync back to legacy save for backwards compatibility with any remaining code
      const legacyRaw = localStorage.getItem(LEGACY_SAVE_KEY);
      if (legacyRaw) {
        try {
          const parsed = JSON.parse(legacyRaw);
          if (parsed.playerProfile) {
            parsed.playerProfile.coins = this.state.coins;
            parsed.playerProfile.gems = this.state.gems;
            localStorage.setItem(LEGACY_SAVE_KEY, JSON.stringify(parsed));
          }
        } catch {}
      }
    } catch (e) {
      console.error('[CurrencyService] Failed to save wallet to localStorage', e);
    }
  }

  // -------------------------------------------------------------
  // Reactive Subscriptions
  // -------------------------------------------------------------
  public subscribe(listener: WalletListener): () => void {
    this.listeners.add(listener);
    // Emit immediate current state
    listener(this.getWalletState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const snapshot = this.getWalletState();
    this.listeners.forEach((fn) => {
      try {
        fn(snapshot);
      } catch (err) {
        console.error('[CurrencyService] Listener notification error', err);
      }
    });
  }

  public getWalletState(): WalletState {
    return {
      ...this.state,
      transactions: [...this.state.transactions],
      processedClaimIds: [...this.state.processedClaimIds],
      pendingRewards: { ...this.state.pendingRewards },
    };
  }

  public getCoins(): number {
    return this.state.coins;
  }

  public getGems(): number {
    return this.state.gems;
  }

  public canAffordCoins(amount: number): boolean {
    return this.state.coins >= amount;
  }

  public canAffordGems(amount: number): boolean {
    return this.state.gems >= amount;
  }

  public getCoinShortfall(cost: number): number {
    return Math.max(0, cost - this.state.coins);
  }

  // -------------------------------------------------------------
  // Idempotency Verification
  // -------------------------------------------------------------
  public isClaimProcessed(claimId: string): boolean {
    return this.state.processedClaimIds.includes(claimId);
  }

  public generateClaimId(prefix: string = 'claim'): string {
    const randomHex = Math.random().toString(36).substring(2, 9);
    return `${prefix}_${Date.now()}_${randomHex}`;
  }

  // -------------------------------------------------------------
  // Pending Transactions (Recovery Mechanism)
  // -------------------------------------------------------------
  public registerPendingReward(pending: PendingReward): boolean {
    if (this.isClaimProcessed(pending.claimId)) {
      console.warn(`[CurrencyService] Claim ${pending.claimId} already processed`);
      return false;
    }
    this.state.pendingRewards[pending.claimId] = pending;
    this.saveToStorage();
    this.notifyListeners();
    return true;
  }

  public clearPendingReward(claimId: string) {
    if (this.state.pendingRewards[claimId]) {
      delete this.state.pendingRewards[claimId];
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  // -------------------------------------------------------------
  // AUTHORITATIVE CURRENCY CREDITS (Idempotent)
  // -------------------------------------------------------------
  public creditCoins(
    amount: number,
    type: TransactionType,
    claimId: string,
    description: string,
    placementId?: string,
    metadata?: Record<string, unknown>
  ): { success: boolean; transaction?: WalletTransaction; error?: string } {
    if (amount <= 0) {
      return { success: false, error: 'Credit amount must be greater than zero' };
    }

    // IDEMPOTENCY CHECK:
    if (this.isClaimProcessed(claimId)) {
      const existing = this.state.transactions.find((t) => t.claimId === claimId);
      console.warn(`[CurrencyService] Idempotency duplicate blocked: Claim ${claimId} already credited`, existing);
      return {
        success: false,
        error: `Reward claim ${claimId} has already been processed and granted`,
        transaction: existing,
      };
    }

    const balanceBefore = this.state.coins;
    const balanceAfter = balanceBefore + amount;

    const tx: WalletTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      claimId,
      timestamp: Date.now(),
      currency: 'coins',
      type,
      amount,
      balanceBefore,
      balanceAfter,
      description,
      placementId,
      metadata,
      status: 'completed',
    };

    // Update state atomically
    this.state.coins = balanceAfter;
    this.state.totalCoinsEarned += amount;
    this.state.processedClaimIds.push(claimId);
    // Keep max 150 transactions for ledger performance
    this.state.transactions = [tx, ...this.state.transactions.slice(0, 149)];

    // Clear pending reward if present
    if (this.state.pendingRewards[claimId]) {
      delete this.state.pendingRewards[claimId];
    }

    // Record ad watch history if ad
    if (type.startsWith('reward_ad') || type === 'reward_battle_double' || type === 'reward_daily_ad_bonus') {
      const todayStr = new Date().toISOString().split('T')[0];
      const existingToday = this.state.adWatchHistory[todayStr] || { count: 0, lastWatchTime: 0 };
      this.state.adWatchHistory[todayStr] = {
        count: existingToday.count + 1,
        lastWatchTime: Date.now(),
      };
    }

    this.saveToStorage();
    this.notifyListeners();

    return { success: true, transaction: tx };
  }

  public creditGems(
    amount: number,
    type: TransactionType,
    claimId: string,
    description: string,
    metadata?: Record<string, unknown>
  ): { success: boolean; transaction?: WalletTransaction; error?: string } {
    if (amount <= 0) return { success: false, error: 'Amount must be > 0' };

    if (this.isClaimProcessed(claimId)) {
      const existing = this.state.transactions.find((t) => t.claimId === claimId);
      return { success: false, error: 'Claim already processed', transaction: existing };
    }

    const balanceBefore = this.state.gems;
    const balanceAfter = balanceBefore + amount;

    const tx: WalletTransaction = {
      id: `tx_gem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      claimId,
      timestamp: Date.now(),
      currency: 'gems',
      type,
      amount,
      balanceBefore,
      balanceAfter,
      description,
      metadata,
      status: 'completed',
    };

    this.state.gems = balanceAfter;
    this.state.totalGemsEarned += amount;
    this.state.processedClaimIds.push(claimId);
    this.state.transactions = [tx, ...this.state.transactions.slice(0, 149)];

    this.saveToStorage();
    this.notifyListeners();

    return { success: true, transaction: tx };
  }

  // -------------------------------------------------------------
  // AUTHORITATIVE CURRENCY SPENDS (Atomic & Protected)
  // -------------------------------------------------------------
  public spendCoins(
    cost: number,
    type: TransactionType,
    description: string,
    itemId?: string,
    metadata?: Record<string, unknown>
  ): { success: boolean; transaction?: WalletTransaction; shortfall: number; error?: string } {
    if (cost < 0) {
      return { success: false, shortfall: 0, error: 'Cost cannot be negative' };
    }
    if (cost === 0) {
      return { success: true, shortfall: 0 };
    }

    if (this.state.coins < cost) {
      const shortfall = cost - this.state.coins;
      return {
        success: false,
        shortfall,
        error: `Insufficient coins. Short by ${shortfall} coins.`,
      };
    }

    const balanceBefore = this.state.coins;
    const balanceAfter = balanceBefore - cost;

    const claimId = this.generateClaimId('spend');
    const tx: WalletTransaction = {
      id: `tx_spend_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      claimId,
      timestamp: Date.now(),
      currency: 'coins',
      type,
      amount: -cost,
      balanceBefore,
      balanceAfter,
      description,
      metadata: { ...metadata, itemId },
      status: 'completed',
    };

    this.state.coins = balanceAfter;
    this.state.totalCoinsSpent += cost;
    this.state.processedClaimIds.push(claimId);
    this.state.transactions = [tx, ...this.state.transactions.slice(0, 149)];

    this.saveToStorage();
    this.notifyListeners();

    return { success: true, transaction: tx, shortfall: 0 };
  }

  public spendGems(
    cost: number,
    type: TransactionType,
    description: string,
    itemId?: string,
    metadata?: Record<string, unknown>
  ): { success: boolean; transaction?: WalletTransaction; shortfall: number; error?: string } {
    if (cost <= 0) return { success: true, shortfall: 0 };

    if (this.state.gems < cost) {
      const shortfall = cost - this.state.gems;
      return {
        success: false,
        shortfall,
        error: `Insufficient gems. Short by ${shortfall} gems.`,
      };
    }

    const balanceBefore = this.state.gems;
    const balanceAfter = balanceBefore - cost;

    const claimId = this.generateClaimId('spend_gem');
    const tx: WalletTransaction = {
      id: `tx_spend_gem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      claimId,
      timestamp: Date.now(),
      currency: 'gems',
      type,
      amount: -cost,
      balanceBefore,
      balanceAfter,
      description,
      metadata: { ...metadata, itemId },
      status: 'completed',
    };

    this.state.gems = balanceAfter;
    this.state.totalGemsSpent += cost;
    this.state.processedClaimIds.push(claimId);
    this.state.transactions = [tx, ...this.state.transactions.slice(0, 149)];

    this.saveToStorage();
    this.notifyListeners();

    return { success: true, transaction: tx, shortfall: 0 };
  }

  // -------------------------------------------------------------
  // DAILY REWARDS & STREAK LOGIC
  // -------------------------------------------------------------
  public getDailyStreakInfo(): {
    currentStreak: number;
    canClaimToday: boolean;
    nextDayIndex: number; // 1-7
    hoursUntilNextClaim: number;
    timeRemainingSeconds: number;
    schedule: EconomyConfigType['dailyStreak'];
  } {
    const config = economyConfigService.get();
    const streakState = this.state.dailyStreak;
    const todayStr = new Date().toISOString().split('T')[0];

    const lastClaim = streakState.lastClaimTimestamp;
    let canClaim = true;
    let timeRemainingSeconds = 0;

    if (lastClaim) {
      // 20 hours cooldown for smooth daily rhythm
      const COOLDOWN_MS = 20 * 60 * 60 * 1000;
      const elapsed = Date.now() - lastClaim;
      if (elapsed < COOLDOWN_MS) {
        canClaim = false;
        timeRemainingSeconds = Math.max(0, Math.ceil((COOLDOWN_MS - elapsed) / 1000));
      }
    }

    // If more than 48 hours elapsed, streak resets to 1
    let effectiveStreak = streakState.currentStreak;
    if (lastClaim && Date.now() - lastClaim > 48 * 60 * 60 * 1000) {
      effectiveStreak = 0;
    }

    const nextDayIndex = (effectiveStreak % 7) + 1;

    return {
      currentStreak: effectiveStreak,
      canClaimToday: canClaim,
      nextDayIndex,
      hoursUntilNextClaim: Math.ceil(timeRemainingSeconds / 3600),
      timeRemainingSeconds,
      schedule: config.dailyStreak,
    };
  }

  public claimDailyStreakReward(): {
    success: boolean;
    rewardCoins: number;
    rewardGems: number;
    dayClaimed: number;
    error?: string;
  } {
    const info = this.getDailyStreakInfo();
    if (!info.canClaimToday) {
      return {
        success: false,
        rewardCoins: 0,
        rewardGems: 0,
        dayClaimed: info.nextDayIndex,
        error: `Daily reward on cooldown. Available in ${Math.ceil(info.timeRemainingSeconds / 60)} minutes.`,
      };
    }

    const config = economyConfigService.get();
    const dayConfig = config.dailyStreak.find((s) => s.day === info.nextDayIndex) || config.dailyStreak[0];
    const claimId = this.generateClaimId(`daily_day_${dayConfig.day}`);

    const creditCoinsResult = this.creditCoins(
      dayConfig.coins,
      'reward_daily_streak',
      claimId,
      `Daily Streak Day ${dayConfig.day} Reward`,
      'daily_streak_calendar'
    );

    if (dayConfig.gems > 0) {
      this.creditGems(
        dayConfig.gems,
        'reward_daily_streak',
        `${claimId}_gems`,
        `Daily Streak Day ${dayConfig.day} Gems`
      );
    }

    if (creditCoinsResult.success) {
      const todayStr = new Date().toISOString().split('T')[0];
      const newStreak = info.nextDayIndex;
      this.state.dailyStreak = {
        currentStreak: newStreak >= 7 ? 0 : newStreak,
        lastClaimDate: todayStr,
        lastClaimTimestamp: Date.now(),
        claimedDays: [...this.state.dailyStreak.claimedDays, info.nextDayIndex],
      };
      this.saveToStorage();
      this.notifyListeners();

      return {
        success: true,
        rewardCoins: dayConfig.coins,
        rewardGems: dayConfig.gems,
        dayClaimed: dayConfig.day,
      };
    }

    return {
      success: false,
      rewardCoins: 0,
      rewardGems: 0,
      dayClaimed: dayConfig.day,
      error: creditCoinsResult.error,
    };
  }

  // -------------------------------------------------------------
  // AD PACING & CAP CHECKS
  // -------------------------------------------------------------
  public checkAdPlacementEligibility(placementId: string): {
    eligible: boolean;
    reason?: string;
    cooldownRemainingSeconds: number;
    dailyCount: number;
    dailyCap: number;
  } {
    const config = economyConfigService.get();
    const placement = Object.values(config.rewardedAds.placements).find((p) => p.id === placementId) ||
      config.rewardedAds.placements.homeReward;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayHistory = this.state.adWatchHistory[todayStr] || { count: 0, lastWatchTime: 0 };

    if (todayHistory.count >= placement.dailyCap) {
      return {
        eligible: false,
        reason: `Daily ad limit reached (${placement.dailyCap}/${placement.dailyCap}). Check back tomorrow!`,
        cooldownRemainingSeconds: 0,
        dailyCount: todayHistory.count,
        dailyCap: placement.dailyCap,
      };
    }

    if (placement.cooldownSeconds > 0 && todayHistory.lastWatchTime > 0) {
      const elapsed = (Date.now() - todayHistory.lastWatchTime) / 1000;
      if (elapsed < placement.cooldownSeconds) {
        const remaining = Math.ceil(placement.cooldownSeconds - elapsed);
        return {
          eligible: false,
          reason: `Ad cooldown active. Available in ${remaining}s`,
          cooldownRemainingSeconds: remaining,
          dailyCount: todayHistory.count,
          dailyCap: placement.dailyCap,
        };
      }
    }

    return {
      eligible: true,
      cooldownRemainingSeconds: 0,
      dailyCount: todayHistory.count,
      dailyCap: placement.dailyCap,
    };
  }

  // -------------------------------------------------------------
  // CLEAR / RESET FOR DEBUGGING
  // -------------------------------------------------------------
  public resetWallet(coins: number = 650, gems: number = 95) {
    this.state = {
      coins,
      gems,
      totalCoinsEarned: coins,
      totalCoinsSpent: 0,
      totalGemsEarned: gems,
      totalGemsSpent: 0,
      lastSyncedAt: Date.now(),
      dailyStreak: {
        currentStreak: 0,
        lastClaimDate: null,
        lastClaimTimestamp: null,
        claimedDays: [],
      },
      transactions: [
        {
          id: `tx_reset_${Date.now()}`,
          claimId: this.generateClaimId('reset'),
          timestamp: Date.now(),
          currency: 'coins',
          type: 'admin_grant',
          amount: coins,
          balanceBefore: 0,
          balanceAfter: coins,
          description: 'Wallet Reset to Base Balance',
          status: 'completed',
        },
      ],
      pendingRewards: {},
      processedClaimIds: [],
      adWatchHistory: {},
    };
    this.saveToStorage();
    this.notifyListeners();
  }
}

export const currencyService = new CurrencyService();
