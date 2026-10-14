/**
 * Rewarded Ad Mediation Service
 * Emulates the Unity LevelPlay (IronSource) Mediation SDK lifecycle.
 * Handles independent callback ordering, decoupled close & reward events,
 * session state machine, and error handling.
 */

import { economyConfigService } from './economyConfig';
import { currencyService } from './currencyService';

export type AdSessionState =
  | 'Idle'
  | 'Loading'
  | 'Ready'
  | 'Showing'
  | 'RewardPending'
  | 'RewardGranted'
  | 'LoadFailed'
  | 'DisplayFailed'
  | 'ClosedWithoutReward'
  | 'RewardGrantedAfterClose'
  | 'NetworkUnavailable'
  | 'SDKInitializationFailed'
  | 'DuplicateCallback';

export interface AdRewardData {
  placementId: string;
  placementName: string;
  amount: number;
  currency: string;
  claimId: string;
  sessionId: string;
}

export interface AdMediationCallbacks {
  onAdAvailable?: (placementId: string) => void;
  onAdUnavailable?: (placementId: string, error?: string) => void;
  onAdOpened?: (placementId: string, sessionId: string) => void;
  onAdShowFailed?: (placementId: string, error: string) => void;
  onAdRewarded?: (reward: AdRewardData) => void;
  onAdClosed?: (placementId: string, sessionId: string, rewarded: boolean) => void;
  onStateChange?: (state: AdSessionState, error?: string) => void;
}

export interface ActiveAdSession {
  sessionId: string;
  placementId: string;
  rewardCoins: number;
  claimId: string;
  state: AdSessionState;
  startTime: number;
  rewardEarned: boolean;
  adClosed: boolean;
  error?: string;
}

class AdMediationService {
  private isInitialized: boolean = false;
  private isNetworkOnline: boolean = true;
  private currentSession: ActiveAdSession | null = null;
  private registeredListeners: Set<AdMediationCallbacks> = new Set();
  private adReadyCache: Map<string, boolean> = new Map();
  private simulateFailNextLoad: boolean = false;
  private simulateFailNextShow: boolean = false;

  constructor() {
    this.initSDK();
  }

  // -------------------------------------------------------------
  // SDK Lifecycle & Initialization
  // -------------------------------------------------------------
  public initSDK(): Promise<boolean> {
    return new Promise((resolve) => {
      const config = economyConfigService.get();
      if (!config.rewardedAds.enabled) {
        this.isInitialized = false;
        resolve(false);
        return;
      }

      // Emulate SDK init handshake
      setTimeout(() => {
        this.isInitialized = true;
        // Pre-warm default placements
        Object.values(config.rewardedAds.placements).forEach((p) => {
          this.adReadyCache.set(p.id, true);
        });
        resolve(true);
      }, 200);
    });
  }

  public isSdkReady(): boolean {
    return this.isInitialized && this.isNetworkOnline;
  }

  public setNetworkOnline(online: boolean) {
    this.isNetworkOnline = online;
    if (!online && this.currentSession?.state === 'Loading') {
      this.transitionState('NetworkUnavailable', 'No internet connection detected');
    }
  }

  public getNetworkOnline(): boolean {
    return this.isNetworkOnline;
  }

  public setSimulateFailLoad(fail: boolean) {
    this.simulateFailNextLoad = fail;
  }

  public setSimulateFailShow(fail: boolean) {
    this.simulateFailNextShow = fail;
  }

  public getCurrentSession(): ActiveAdSession | null {
    return this.currentSession;
  }

  // -------------------------------------------------------------
  // Listeners & Event Registration
  // -------------------------------------------------------------
  public addCallbacks(callbacks: AdMediationCallbacks): () => void {
    this.registeredListeners.add(callbacks);
    return () => {
      this.registeredListeners.delete(callbacks);
    };
  }

  private transitionState(newState: AdSessionState, error?: string) {
    if (this.currentSession) {
      this.currentSession.state = newState;
      if (error) this.currentSession.error = error;
    }
    this.registeredListeners.forEach((l) => l.onStateChange?.(newState, error));
  }

  // -------------------------------------------------------------
  // Ad Availability & Readiness
  // -------------------------------------------------------------
  public isAdReady(placementId: string): boolean {
    if (!this.isSdkReady()) return false;
    const config = economyConfigService.get();
    if (!config.rewardedAds.enabled) return false;
    return this.adReadyCache.get(placementId) ?? true;
  }

  public loadRewardedAd(placementId: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.isSdkReady()) {
        this.transitionState('SDKInitializationFailed', 'Ad mediation SDK not initialized');
        resolve(false);
        return;
      }

      if (!this.isNetworkOnline) {
        this.transitionState('NetworkUnavailable', 'Network is offline');
        resolve(false);
        return;
      }

      this.transitionState('Loading');

      setTimeout(() => {
        if (this.simulateFailNextLoad) {
          this.simulateFailNextLoad = false;
          this.adReadyCache.set(placementId, false);
          this.transitionState('LoadFailed', 'Ad network failed to fill video placement');
          this.registeredListeners.forEach((l) =>
            l.onAdUnavailable?.(placementId, 'Ad network fill error')
          );
          resolve(false);
          return;
        }

        this.adReadyCache.set(placementId, true);
        this.transitionState('Ready');
        this.registeredListeners.forEach((l) => l.onAdAvailable?.(placementId));
        resolve(true);
      }, 400);
    });
  }

  // -------------------------------------------------------------
  // Show Rewarded Ad (Per-Session State Machine)
  // -------------------------------------------------------------
  public showRewardedAd(
    placementId: string,
    customRewardCoins?: number
  ): {
    canShow: boolean;
    error?: string;
    session?: ActiveAdSession;
  } {
    // 1. Prevent concurrent ads
    if (this.currentSession && ['Showing', 'RewardPending', 'Loading'].includes(this.currentSession.state)) {
      this.transitionState('DuplicateCallback', 'An ad session is already in progress');
      return { canShow: false, error: 'Ad is already in progress. Please wait.' };
    }

    // 2. Validate eligibility & pacing
    const eligibility = currencyService.checkAdPlacementEligibility(placementId);
    if (!eligibility.eligible) {
      return { canShow: false, error: eligibility.reason };
    }

    // 3. Verify SDK & Network
    if (!this.isNetworkOnline) {
      this.transitionState('NetworkUnavailable', 'Network connection unavailable');
      return { canShow: false, error: 'No internet connection. Please check your network and try again.' };
    }

    if (!this.isSdkReady()) {
      this.transitionState('SDKInitializationFailed', 'Mediation SDK initialization error');
      return { canShow: false, error: 'Ad provider is still initializing. Please retry in a moment.' };
    }

    // 4. Determine reward amount
    const config = economyConfigService.get();
    const placement =
      Object.values(config.rewardedAds.placements).find((p) => p.id === placementId) ||
      config.rewardedAds.placements.homeReward;

    const rewardCoins =
      typeof customRewardCoins === 'number' && customRewardCoins > 0
        ? customRewardCoins
        : placement.rewardCoins || config.rewardedAds.defaultCoinReward;

    // 5. Generate secure session & unique claim identifier
    const sessionId = `ad_sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const claimId = currencyService.generateClaimId(`ad_${placementId}`);

    // Register pending reward for crash / abort recovery
    currencyService.registerPendingReward({
      claimId,
      placementId,
      expectedCoins: rewardCoins,
      timestamp: Date.now(),
      description: `${placement.name} (${rewardCoins} Coins)`,
    });

    const session: ActiveAdSession = {
      sessionId,
      placementId,
      rewardCoins,
      claimId,
      state: 'Showing',
      startTime: Date.now(),
      rewardEarned: false,
      adClosed: false,
    };

    this.currentSession = session;

    // Check simulated failure
    if (this.simulateFailNextShow) {
      this.simulateFailNextShow = false;
      this.transitionState('DisplayFailed', 'LevelPlay adapter failed to render full screen video');
      this.registeredListeners.forEach((l) =>
        l.onAdShowFailed?.(placementId, 'Display presentation error')
      );
      currencyService.clearPendingReward(claimId);
      this.currentSession = null;
      return { canShow: false, error: 'Failed to display video. Please try again.' };
    }

    this.transitionState('Showing');
    this.registeredListeners.forEach((l) => l.onAdOpened?.(placementId, sessionId));

    return { canShow: true, session };
  }

  // -------------------------------------------------------------
  // Ad Event Callbacks (Decoupled Order Handling)
  // -------------------------------------------------------------

  /**
   * Called when player watches full video ad to completion
   */
  public handleAdRewardEarned(): { success: boolean; reward?: AdRewardData; error?: string } {
    if (!this.currentSession) {
      console.warn('[AdMediationService] Reward received without active ad session');
      return { success: false, error: 'No active ad session' };
    }

    // Prevent duplicate reward callback within same session
    if (this.currentSession.rewardEarned) {
      console.warn('[AdMediationService] Duplicate reward callback ignored for session', this.currentSession.sessionId);
      this.transitionState('DuplicateCallback', 'Duplicate reward callback ignored');
      return { success: false, error: 'Reward already claimed for this session' };
    }

    this.currentSession.rewardEarned = true;

    // Check if ad was already closed before reward callback arrived (RewardGrantedAfterClose)
    const isAfterClose = this.currentSession.adClosed;
    const nextState: AdSessionState = isAfterClose ? 'RewardGrantedAfterClose' : 'RewardGranted';
    this.transitionState(nextState);

    const rewardData: AdRewardData = {
      placementId: this.currentSession.placementId,
      placementName: this.currentSession.placementId,
      amount: this.currentSession.rewardCoins,
      currency: 'coins',
      claimId: this.currentSession.claimId,
      sessionId: this.currentSession.sessionId,
    };

    // Authoritatively grant reward via currencyService exactly once
    const creditResult = currencyService.creditCoins(
      this.currentSession.rewardCoins,
      this.currentSession.placementId === 'placement_battle_double'
        ? 'reward_battle_double'
        : this.currentSession.placementId === 'placement_daily_bonus'
        ? 'reward_daily_ad_bonus'
        : 'reward_ad',
      this.currentSession.claimId,
      `Rewarded Video Ad: +${this.currentSession.rewardCoins} Coins`,
      this.currentSession.placementId,
      { sessionId: this.currentSession.sessionId, arrivedAfterClose: isAfterClose }
    );

    if (creditResult.success) {
      this.registeredListeners.forEach((l) => l.onAdRewarded?.(rewardData));
      return { success: true, reward: rewardData };
    } else {
      return { success: false, error: creditResult.error };
    }
  }

  /**
   * Called when player closes or dismisses the video ad window
   */
  public handleAdClosed(userSkippedEarly: boolean = false) {
    if (!this.currentSession) return;

    this.currentSession.adClosed = true;
    const session = this.currentSession;

    if (userSkippedEarly && !session.rewardEarned) {
      // User closed video before completion -> No reward earned
      this.transitionState('ClosedWithoutReward', 'Video skipped early before reaching reward milestone');
      currencyService.clearPendingReward(session.claimId);
    }

    this.registeredListeners.forEach((l) =>
      l.onAdClosed?.(session.placementId, session.sessionId, session.rewardEarned)
    );

    // After brief cooldown, return to idle
    setTimeout(() => {
      this.currentSession = null;
      this.transitionState('Idle');
    }, 300);
  }
}

export const adMediationService = new AdMediationService();
