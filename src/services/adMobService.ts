import {
  AdMob,
  RewardAdOptions,
  RewardAdPluginEvents,
  AdMobRewardItem,
  AdmobConsentStatus,
  AdmobConsentInfo,
} from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

export interface AdMobConfig {
  appIdAndroid: string;
  rewardedAdUnitIdAndroid: string;
  interstitialAdUnitIdAndroid: string;
  bannerAdUnitIdAndroid: string;
  isTesting: boolean;
}

export interface AdMobValidationResult {
  isValid: boolean;
  isProduction: boolean;
  isTesting: boolean;
  errors: string[];
  warnings: string[];
}

// Official Google Sample/Test Ad IDs for development & CI verification
export const GOOGLE_SAMPLE_IDS = {
  appIdAndroid: 'ca-app-pub-3940256099942544~3347511713',
  rewardedAdUnitIdAndroid: 'ca-app-pub-3940256099942544/5224354917',
  interstitialAdUnitIdAndroid: 'ca-app-pub-3940256099942544/1033173712',
  bannerAdUnitIdAndroid: 'ca-app-pub-3940256099942544/6300978111',
};

/**
 * Validates format of an AdMob App ID (Must use '~' delimiter)
 * Format: ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY
 */
export function isValidAdMobAppId(id: string): boolean {
  return /^ca-app-pub-\d+~\d+$/.test(id.trim());
}

/**
 * Validates format of an AdMob Ad Unit ID (Must use '/' delimiter)
 * Format: ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY
 */
export function isValidAdMobAdUnitId(id: string): boolean {
  return /^ca-app-pub-\d+\/\d+$/.test(id.trim());
}

/**
 * Checks if a given ID matches Google's public sample test IDs
 */
export function isSampleId(id: string): boolean {
  const trimmed = id.trim();
  return (
    trimmed === GOOGLE_SAMPLE_IDS.appIdAndroid ||
    trimmed === GOOGLE_SAMPLE_IDS.rewardedAdUnitIdAndroid ||
    trimmed === GOOGLE_SAMPLE_IDS.interstitialAdUnitIdAndroid ||
    trimmed === GOOGLE_SAMPLE_IDS.bannerAdUnitIdAndroid ||
    trimmed.startsWith('ca-app-pub-3940256099942544')
  );
}

/**
 * Resolves active AdMob configuration from environment variables or falls back to sample test IDs in dev.
 */
export function getResolvedAdMobConfig(): AdMobConfig {
  const envAppId = (import.meta.env.VITE_ADMOB_APP_ID as string | undefined)?.trim();
  const envRewardedId = (import.meta.env.VITE_ADMOB_REWARDED_ID as string | undefined)?.trim();
  const envInterstitialId = (import.meta.env.VITE_ADMOB_INTERSTITIAL_ID as string | undefined)?.trim();
  const envBannerId = (import.meta.env.VITE_ADMOB_BANNER_ID as string | undefined)?.trim();
  const envIsTesting = import.meta.env.VITE_ADMOB_IS_TESTING;

  const isProd = import.meta.env.PROD;

  const isTesting = envIsTesting !== undefined
    ? envIsTesting === 'true' || envIsTesting === true
    : !isProd;

  return {
    appIdAndroid: envAppId || GOOGLE_SAMPLE_IDS.appIdAndroid,
    rewardedAdUnitIdAndroid: envRewardedId || GOOGLE_SAMPLE_IDS.rewardedAdUnitIdAndroid,
    interstitialAdUnitIdAndroid: envInterstitialId || GOOGLE_SAMPLE_IDS.interstitialAdUnitIdAndroid,
    bannerAdUnitIdAndroid: envBannerId || GOOGLE_SAMPLE_IDS.bannerAdUnitIdAndroid,
    isTesting,
  };
}

/**
 * Validates whether the active AdMob configuration is production-ready.
 * Fails with clear actionable errors if production builds use sample IDs or miss required unit IDs.
 */
export function validateProductionAdMobConfig(config = getResolvedAdMobConfig()): AdMobValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const isProduction = import.meta.env.PROD;

  // 1. App ID format check
  if (!isValidAdMobAppId(config.appIdAndroid)) {
    errors.push(
      `Invalid AdMob App ID format: "${config.appIdAndroid}". App ID must match ca-app-pub-XXXXXXXX~YYYYYYYY (using '~' separator).`
    );
  }

  // 2. Rewarded Unit format check
  if (!isValidAdMobAdUnitId(config.rewardedAdUnitIdAndroid)) {
    errors.push(
      `Invalid Rewarded Ad Unit ID format: "${config.rewardedAdUnitIdAndroid}". Ad Unit ID must match ca-app-pub-XXXXXXXX/YYYYYYYY (using '/' separator).`
    );
  }

  // 3. Interstitial Unit format check (if configured)
  if (config.interstitialAdUnitIdAndroid && !isValidAdMobAdUnitId(config.interstitialAdUnitIdAndroid)) {
    errors.push(
      `Invalid Interstitial Ad Unit ID format: "${config.interstitialAdUnitIdAndroid}". Ad Unit ID must match ca-app-pub-XXXXXXXX/YYYYYYYY.`
    );
  }

  // 4. Banner Unit format check (if configured)
  if (config.bannerAdUnitIdAndroid && !isValidAdMobAdUnitId(config.bannerAdUnitIdAndroid)) {
    errors.push(
      `Invalid Banner Ad Unit ID format: "${config.bannerAdUnitIdAndroid}". Ad Unit ID must match ca-app-pub-XXXXXXXX/YYYYYYYY.`
    );
  }

  // 5. Strict Production Checks
  if (isProduction || !config.isTesting) {
    if (isSampleId(config.appIdAndroid)) {
      errors.push(
        'Production Release Blocker: AdMob App ID is set to Google sample test ID. Provide real production App ID via VITE_ADMOB_APP_ID.'
      );
    }
    if (isSampleId(config.rewardedAdUnitIdAndroid)) {
      errors.push(
        'Production Release Blocker: Rewarded Ad Unit ID is set to Google sample test ID. Provide real production Unit ID via VITE_ADMOB_REWARDED_ID.'
      );
    }
    if (config.isTesting && isProduction) {
      warnings.push(
        'AdMob isTesting is enabled in a production build. Test ads will be served instead of live production ads.'
      );
    }
  } else {
    warnings.push('Running in Development/Test mode with Google sample AdMob IDs.');
  }

  return {
    isValid: errors.length === 0,
    isProduction,
    isTesting: config.isTesting,
    errors,
    warnings,
  };
}

class AdMobService {
  private isInitialized: boolean = false;
  private config: AdMobConfig = getResolvedAdMobConfig();
  private isAdLoading: boolean = false;
  private isAdShowing: boolean = false;
  private consentInfo: AdmobConsentInfo | null = null;

  constructor() {
    this.init();
  }

  public getConfig(): Readonly<AdMobConfig> {
    return this.config;
  }

  public getConsentInfo(): AdmobConsentInfo | null {
    return this.consentInfo;
  }

  /**
   * Initialize Google Mobile Ads SDK on native Android with UMP consent checks
   */
  public async init(): Promise<boolean> {
    if (this.isInitialized) return true;

    if (!Capacitor.isNativePlatform()) {
      this.isInitialized = true;
      console.log('[AdMob] Web environment detected. Visual high-fidelity simulation active.');
      return true;
    }

    try {
      // 1. Request UMP Consent Information on native platform
      await this.requestConsent();

      // 2. Initialize AdMob SDK
      await AdMob.initialize({
        initializeForTesting: this.config.isTesting,
        testingDevices: this.config.isTesting ? ['EMULATOR'] : undefined,
      });

      this.isInitialized = true;
      console.log('[AdMob] Initialized Google Mobile Ads SDK successfully on Android.');
      return true;
    } catch (err) {
      console.warn('[AdMob] Native initialization failed; falling back to simulation modal:', err);
      this.isInitialized = true;
      return false;
    }
  }

  /**
   * Request Google UMP (User Messaging Platform) Consent
   */
  public async requestConsent(): Promise<AdmobConsentInfo | null> {
    if (!Capacitor.isNativePlatform()) {
      this.consentInfo = {
        status: AdmobConsentStatus.NOT_REQUIRED,
        canRequestAds: true,
        privacyOptionsRequirementStatus: 'NOT_REQUIRED' as any,
      };
      return this.consentInfo;
    }

    try {
      const consent = await AdMob.requestConsentInfo();
      this.consentInfo = consent;

      if (consent.status === AdmobConsentStatus.REQUIRED && consent.isConsentFormAvailable) {
        const formResult = await AdMob.showConsentForm();
        this.consentInfo = formResult;
      }

      return this.consentInfo;
    } catch (err) {
      console.warn('[AdMob] UMP consent request error:', err);
      return null;
    }
  }

  /**
   * Show GDPR / Privacy Options Form from Settings
   */
  public async showPrivacyOptionsForm(): Promise<{ success: boolean; message: string }> {
    if (!Capacitor.isNativePlatform()) {
      return {
        success: true,
        message: 'Ad privacy choices managed through Google UMP on mobile devices.',
      };
    }

    try {
      await AdMob.showPrivacyOptionsForm();
      return { success: true, message: 'Privacy options updated.' };
    } catch (err: any) {
      console.warn('[AdMob] Failed to open privacy options form:', err);
      return {
        success: false,
        message: err?.message || 'Privacy options form is only available when required by regional regulations.',
      };
    }
  }

  public isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Shows a rewarded video ad.
   * Ensures:
   * 1. Ad is loaded and prepared before display.
   * 2. Rewards are granted ONLY after RewardAdPluginEvents.Rewarded is dispatched.
   * 3. Prevents duplicate requests or rapid tap re-entrancy.
   * 4. Safe fallback to web visual modal when running outside native Android.
   */
  public async showRewardedAd(
    onRewardEarned: (reward: AdMobRewardItem) => void,
    onAdDismissed?: () => void
  ): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return false; // Trigger web AdMob visual modal
    }

    if (this.isAdLoading || this.isAdShowing) {
      console.warn('[AdMob] Ad is already loading or currently displaying. Ignoring duplicate tap.');
      return false;
    }

    this.isAdLoading = true;
    let rewardGranted = false;

    try {
      const options: RewardAdOptions = {
        adId: this.config.rewardedAdUnitIdAndroid,
        isTesting: this.config.isTesting,
      };

      await AdMob.prepareRewardVideoAd(options);
      this.isAdLoading = false;
      this.isAdShowing = true;

      const rewardSub = await AdMob.addListener(
        RewardAdPluginEvents.Rewarded,
        (reward: AdMobRewardItem) => {
          rewardGranted = true;
          onRewardEarned(reward);
          rewardSub.remove();
        }
      );

      const dismissSub = await AdMob.addListener(
        RewardAdPluginEvents.Dismissed,
        () => {
          this.isAdShowing = false;
          onAdDismissed?.();
          dismissSub.remove();
          if (!rewardGranted) {
            console.log('[AdMob] Ad dismissed before reward conditions were completed.');
          }
        }
      );

      const failedSub = await AdMob.addListener(
        RewardAdPluginEvents.FailedToShow,
        (err) => {
          this.isAdShowing = false;
          console.warn('[AdMob] Failed to show reward video ad:', err);
          failedSub.remove();
          onAdDismissed?.();
        }
      );

      await AdMob.showRewardVideoAd();
      return true;
    } catch (err) {
      this.isAdLoading = false;
      this.isAdShowing = false;
      console.warn('[AdMob] Native rewarded ad preparation/show error:', err);
      return false;
    }
  }
}

export const adMobService = new AdMobService();
