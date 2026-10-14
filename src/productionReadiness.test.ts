import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveService, FREE_SPIN_COOLDOWN_MS } from './saveService';
import {
  isValidAdMobAppId,
  isValidAdMobAdUnitId,
  isSampleId,
  validateProductionAdMobConfig,
  GOOGLE_SAMPLE_IDS,
} from './services/adMobService';
import { resolveBackAction, BackNavState } from './App';

describe('Phase 1: Daily Free Spin Persistence & Cooldown', () => {
  const ONE_HOUR = 3600 * 1000;
  const TWENTY_FOUR_HOURS = FREE_SPIN_COOLDOWN_MS;

  it('grants a free spin when no prior timestamp exists', () => {
    const status = saveService.calculateFreeSpinStatus(undefined);
    expect(status.canSpin).toBe(true);
    expect(status.remainingMs).toBe(0);
  });

  it('denies a free spin when cooldown is active (< 24 hours)', () => {
    const fourHoursAgo = Date.now() - 4 * ONE_HOUR;
    const status = saveService.calculateFreeSpinStatus(fourHoursAgo);
    expect(status.canSpin).toBe(false);
    expect(status.remainingMs).toBeGreaterThan(0);
    expect(status.remainingMs).toBeLessThanOrEqual(20 * ONE_HOUR);
  });

  it('grants a free spin when cooldown has expired (>= 24 hours)', () => {
    const twentyFiveHoursAgo = Date.now() - 25 * ONE_HOUR;
    const status = saveService.calculateFreeSpinStatus(twentyFiveHoursAgo);
    expect(status.canSpin).toBe(true);
    expect(status.remainingMs).toBe(0);
  });

  it('safely handles malformed and NaN timestamps', () => {
    const nanStatus = saveService.calculateFreeSpinStatus(NaN);
    expect(nanStatus.canSpin).toBe(true);
    expect(nanStatus.remainingMs).toBe(0);

    const negativeStatus = saveService.calculateFreeSpinStatus(-99999);
    expect(negativeStatus.canSpin).toBe(true);
    expect(negativeStatus.remainingMs).toBe(0);
  });

  it('safely handles future timestamps (clock tampering)', () => {
    // 2 days in future
    const futureTimestamp = Date.now() + 2 * TWENTY_FOUR_HOURS;
    const status = saveService.calculateFreeSpinStatus(futureTimestamp);
    // Future timestamp is safely sanitized to now, so cooldown begins from now
    expect(status.canSpin).toBe(false);
    expect(status.remainingMs).toBeLessThanOrEqual(TWENTY_FOUR_HOURS);
  });

  it('persists spin consumption and preserves existing player progress and coins', () => {
    const initialCoins = 1500;
    saveService.save({
      playerProfile: {
        name: 'Commander Hero',
        avatarId: 'commander',
        level: 3,
        exp: 250,
        maxExp: 500,
        trophies: 420,
        coins: initialCoins,
        gems: 50,
        cubes: 100,
      },
      hasFreeSpin: true,
      lastSpinTimestamp: undefined,
    });

    const loaded = saveService.load();
    expect(loaded.playerProfile.coins).toBe(initialCoins);
    expect(loaded.hasFreeSpin).toBe(true);

    // Consume free spin
    const now = Date.now();
    saveService.save({
      hasFreeSpin: false,
      lastSpinTimestamp: now,
    });

    const updated = saveService.load();
    expect(updated.hasFreeSpin).toBe(false);
    expect(updated.lastSpinTimestamp).toBe(now);
    expect(updated.playerProfile.coins).toBe(initialCoins);
  });
});

describe('Phase 2: Production AdMob Configuration & Validation', () => {
  it('correctly validates AdMob App ID format with ~ separator', () => {
    expect(isValidAdMobAppId('ca-app-pub-3940256099942544~3347511713')).toBe(true);
    expect(isValidAdMobAppId('ca-app-pub-1234567890123456~1234567890')).toBe(true);

    // Invalid delimiters
    expect(isValidAdMobAppId('ca-app-pub-1234567890123456/1234567890')).toBe(false);
    expect(isValidAdMobAppId('invalid-app-id')).toBe(false);
    expect(isValidAdMobAppId('')).toBe(false);
  });

  it('correctly validates AdMob Ad Unit ID format with / separator', () => {
    expect(isValidAdMobAdUnitId('ca-app-pub-3940256099942544/5224354917')).toBe(true);
    expect(isValidAdMobAdUnitId('ca-app-pub-1234567890123456/9876543210')).toBe(true);

    // Invalid delimiters
    expect(isValidAdMobAdUnitId('ca-app-pub-1234567890123456~9876543210')).toBe(false);
    expect(isValidAdMobAdUnitId('invalid-unit-id')).toBe(false);
    expect(isValidAdMobAdUnitId('')).toBe(false);
  });

  it('detects Google sample and test IDs', () => {
    expect(isSampleId(GOOGLE_SAMPLE_IDS.appIdAndroid)).toBe(true);
    expect(isSampleId(GOOGLE_SAMPLE_IDS.rewardedAdUnitIdAndroid)).toBe(true);
    expect(isSampleId('ca-app-pub-9999999999999999~1111111111')).toBe(false);
  });

  it('fails production validation when sample IDs are used in production release', () => {
    const prodConfigWithSampleIds = {
      appIdAndroid: GOOGLE_SAMPLE_IDS.appIdAndroid,
      rewardedAdUnitIdAndroid: GOOGLE_SAMPLE_IDS.rewardedAdUnitIdAndroid,
      interstitialAdUnitIdAndroid: GOOGLE_SAMPLE_IDS.interstitialAdUnitIdAndroid,
      bannerAdUnitIdAndroid: GOOGLE_SAMPLE_IDS.bannerAdUnitIdAndroid,
      isTesting: false, // Production release intent
    };

    const result = validateProductionAdMobConfig(prodConfigWithSampleIds);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.includes('Production Release Blocker'))).toBe(true);
  });

  it('passes validation when valid production credentials are supplied', () => {
    const validProdConfig = {
      appIdAndroid: 'ca-app-pub-8765432109876543~1234567890',
      rewardedAdUnitIdAndroid: 'ca-app-pub-8765432109876543/2345678901',
      interstitialAdUnitIdAndroid: 'ca-app-pub-8765432109876543/3456789012',
      bannerAdUnitIdAndroid: 'ca-app-pub-8765432109876543/4567890123',
      isTesting: false,
    };

    const result = validateProductionAdMobConfig(validProdConfig);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});

describe('Phase 4: Android Native Back Button Modal Priority Stack', () => {
  const baseState: BackNavState = {
    showRewardedAdModal: false,
    hasCoinAnimation: false,
    isShortfallOpen: false,
    showDailyRewardModal: false,
    showLedgerModal: false,
    showEconomyModal: false,
    showDebugPanel: false,
    showSectorModal: false,
    showAvatarModal: false,
    showNoAdsModal: false,
    showUnityModal: false,
    showTechModal: false,
    showVersusModal: false,
    gameState: 'menu',
    isPaused: false,
    currentTab: 'battle',
  };

  it('ignores back button when active rewarded ad modal is open to protect reward flow', () => {
    const action = resolveBackAction({
      ...baseState,
      showRewardedAdModal: true,
      showDailyRewardModal: true, // Multiple modals should not be affected
    });
    expect(action).toBe('ignore_ad');
  });

  it('prioritizes coin animation dismissal before modals', () => {
    const action = resolveBackAction({
      ...baseState,
      hasCoinAnimation: true,
      showSectorModal: true,
    });
    expect(action).toBe('close_coin_animation');
  });

  it('closes coin shortfall before other background overlays', () => {
    const action = resolveBackAction({
      ...baseState,
      isShortfallOpen: true,
      showDailyRewardModal: true,
    });
    expect(action).toBe('close_shortfall');
  });

  it('closes topmost modal one-by-one following strict hierarchy', () => {
    expect(resolveBackAction({ ...baseState, showDailyRewardModal: true })).toBe('close_daily_reward');
    expect(resolveBackAction({ ...baseState, showLedgerModal: true })).toBe('close_ledger');
    expect(resolveBackAction({ ...baseState, showEconomyModal: true })).toBe('close_economy');
    expect(resolveBackAction({ ...baseState, showDebugPanel: true })).toBe('close_debug');
    expect(resolveBackAction({ ...baseState, showSectorModal: true })).toBe('close_sector');
    expect(resolveBackAction({ ...baseState, showAvatarModal: true })).toBe('close_avatar');
    expect(resolveBackAction({ ...baseState, showNoAdsModal: true })).toBe('close_no_ads');
    expect(resolveBackAction({ ...baseState, showUnityModal: true })).toBe('close_unity');
    expect(resolveBackAction({ ...baseState, showTechModal: true })).toBe('close_tech');
    expect(resolveBackAction({ ...baseState, showVersusModal: true })).toBe('close_versus');
  });

  it('unpauses battle if already paused', () => {
    const action = resolveBackAction({
      ...baseState,
      gameState: 'playing',
      isPaused: true,
    });
    expect(action).toBe('unpause_battle');
  });

  it('pauses battle if active battle is in progress', () => {
    const action = resolveBackAction({
      ...baseState,
      gameState: 'playing',
      isPaused: false,
    });
    expect(action).toBe('pause_battle');
  });

  it('returns to home menu from victory or defeat screen', () => {
    expect(resolveBackAction({ ...baseState, gameState: 'victory' })).toBe('return_to_home');
    expect(resolveBackAction({ ...baseState, gameState: 'defeat' })).toBe('return_to_home');
  });

  it('switches to battle home tab if on another sub-tab', () => {
    expect(resolveBackAction({ ...baseState, currentTab: 'cards' })).toBe('switch_to_battle_tab');
    expect(resolveBackAction({ ...baseState, currentTab: 'shop' })).toBe('switch_to_battle_tab');
    expect(resolveBackAction({ ...baseState, currentTab: 'spin' })).toBe('switch_to_battle_tab');
    expect(resolveBackAction({ ...baseState, currentTab: 'settings' })).toBe('switch_to_battle_tab');
  });

  it('exits application only when on root home screen with no overlays open', () => {
    const action = resolveBackAction(baseState);
    expect(action).toBe('exit_app');
  });
});
