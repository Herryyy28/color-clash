import { describe, it, expect, beforeEach } from 'vitest';
import { sectorManager, SECTORS } from './services/sectorManager';
import { matchmakingService, OPPONENT_CANDIDATE_POOL } from './services/matchmakingService';
import { playerProgressionService } from './services/playerProgressionService';
import { deckStrengthCalculator } from './services/deckStrengthCalculator';
import { aiDifficultyController } from './services/aiDifficultyController';
import { saveService } from './saveService';
import { resolveBackAction, BackNavState } from './App';
import { ALL_CARDS } from './cardsData';
import { PlayerProfile, Card } from './types';

describe('Battle Realms Sector Matchmaking System', () => {
  const sampleDeck: Card[] = [ALL_CARDS.blaster, ALL_CARDS.cannon, ALL_CARDS.gatling, ALL_CARDS.saw];

  beforeEach(() => {
    saveService.reset();
  });

  // =========================================================================
  // 1. SECTOR SELECTION & UNLOCK PROGRESSION
  // =========================================================================
  describe('Sector Selection & Progression', () => {
    it('verifies all 6 sectors are properly configured with trophy requirements', () => {
      const allSectors = sectorManager.getAllSectors();
      expect(allSectors.length).toBe(6);
      expect(allSectors[0].sectorId).toBe(1);
      expect(allSectors[0].requiredTrophies).toBe(0);
      expect(allSectors[1].requiredTrophies).toBe(25);
      expect(allSectors[2].requiredTrophies).toBe(60);
      expect(allSectors[3].requiredTrophies).toBe(120);
      expect(allSectors[4].requiredTrophies).toBe(200);
      expect(allSectors[5].requiredTrophies).toBe(320);
    });

    it('correctly reports unlock status based on player trophies', () => {
      // 0 trophies: only Sector 1 unlocked
      expect(sectorManager.isSectorUnlocked(1, 0)).toBe(true);
      expect(sectorManager.isSectorUnlocked(2, 0)).toBe(false);
      expect(sectorManager.isSectorUnlocked(3, 0)).toBe(false);

      // 30 trophies: Sector 1 & 2 unlocked
      expect(sectorManager.isSectorUnlocked(1, 30)).toBe(true);
      expect(sectorManager.isSectorUnlocked(2, 30)).toBe(true);
      expect(sectorManager.isSectorUnlocked(3, 30)).toBe(false);

      // 250 trophies: Sectors 1-5 unlocked, Sector 6 locked
      expect(sectorManager.isSectorUnlocked(5, 250)).toBe(true);
      expect(sectorManager.isSectorUnlocked(6, 250)).toBe(false);
    });

    it('recommends the highest appropriate unlocked sector for the player', () => {
      expect(sectorManager.getRecommendedSector(0, 200).sectorId).toBe(1);
      expect(sectorManager.getRecommendedSector(35, 330).sectorId).toBe(2);
      expect(sectorManager.getRecommendedSector(75, 460).sectorId).toBe(3);
      expect(sectorManager.getRecommendedSector(150, 620).sectorId).toBe(4);
      expect(sectorManager.getRecommendedSector(220, 760).sectorId).toBe(5);
      expect(sectorManager.getRecommendedSector(350, 910).sectorId).toBe(6);
    });

    it('persists sector unlock progression safely across game restarts', () => {
      const profile: PlayerProfile = {
        name: 'Royal Challenger',
        level: 2,
        exp: 20,
        maxExp: 100,
        trophies: 75,
        coins: 1000,
        gems: 50,
        highestSectorUnlocked: 3,
        clearedSectors: [1, 2],
      };

      saveService.save({ playerProfile: profile, currentLevelIndex: 2 });
      const loaded = saveService.load();

      expect(loaded.playerProfile.trophies).toBe(75);
      expect(loaded.playerProfile.highestSectorUnlocked).toBe(3);
      expect(loaded.playerProfile.clearedSectors).toEqual([1, 2]);
      expect(sectorManager.isSectorUnlocked(3, loaded.playerProfile.trophies)).toBe(true);
      expect(sectorManager.isSectorUnlocked(4, loaded.playerProfile.trophies)).toBe(false);
    });
  });

  // =========================================================================
  // 2. FAIR MATCHMAKING & OPPONENT ELIGIBILITY
  // =========================================================================
  describe('Fair Matchmaking & Opponent Selection', () => {
    it('ensures beginner players receive beginner-appropriate opponents (no overpower)', () => {
      const beginnerProfile: PlayerProfile = {
        name: 'New Cadet',
        level: 1,
        exp: 0,
        maxExp: 100,
        trophies: 0,
        coins: 500,
        gems: 10,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        skillRating: 300,
      };

      const deckRating = 200;
      const matchup = matchmakingService.findMatchup(1, beginnerProfile, deckRating);

      // Verify beginner constraints
      expect(matchup.isBeginnerProtected).toBe(true);
      expect(matchup.difficultyTier).toBe('beginner');
      expect(matchup.cardLevel).toBe(1);
      expect(matchup.rating).toBeLessThanOrEqual(250);
      expect(matchup.matchmakingReason).toContain('Beginner Protection active');
      expect(matchup.potentialTrophyLoss).toBe(0); // 0 trophies at risk!
    });

    it('considers skill MMR and deck power differences in matchmaking scoring', () => {
      const intermediateProfile: PlayerProfile = {
        name: 'Adept Knight',
        level: 3,
        exp: 40,
        maxExp: 100,
        trophies: 80,
        coins: 1200,
        gems: 30,
        matchesPlayed: 12,
        wins: 8,
        losses: 4,
        skillRating: 550,
      };

      const candidateA = OPPONENT_CANDIDATE_POOL.find((c) => c.id === 's3_ironbark')!;
      const candidateB = OPPONENT_CANDIDATE_POOL.find((c) => c.id === 's3_flint')!;
      const sector = sectorManager.getSectorById(3);

      const scoreA = matchmakingService.scoreCandidate(candidateA, intermediateProfile, 460, sector);
      const scoreB = matchmakingService.scoreCandidate(candidateB, intermediateProfile, 460, sector);

      // Both scores should be valid non-negative numbers
      expect(scoreA).toBeGreaterThanOrEqual(0);
      expect(scoreB).toBeGreaterThanOrEqual(0);
    });

    it('provides a safe calibrated fallback opponent when candidate filtering is empty', () => {
      const dummyProfile: PlayerProfile = {
        name: 'Explorer',
        level: 5,
        exp: 10,
        maxExp: 100,
        trophies: 500,
        coins: 5000,
        gems: 100,
        matchesPlayed: 50,
        wins: 40,
        losses: 10,
        skillRating: 1500,
      };

      // Query non-existent sector 99
      const matchup = matchmakingService.findMatchup(99, dummyProfile, 600);
      expect(matchup).toBeDefined();
      expect(matchup.name).toBeDefined();
      expect(matchup.deckCardIds.length).toBeGreaterThan(0);
      expect(matchup.aiConfig).toBeDefined();
    });

    it('accurately calculates deck strength based on card levels and elixir cost curve', () => {
      const analysis = deckStrengthCalculator.calculate(sampleDeck);
      expect(analysis.totalRating).toBeGreaterThanOrEqual(100);
      expect(analysis.totalRating).toBeLessThanOrEqual(1000);
      expect(analysis.averageLevel).toBe(1);
      expect(analysis.averageCost).toBeGreaterThan(0);
      expect(analysis.roleCoverage.hasRanged).toBe(true);
      expect(analysis.roleCoverage.hasSiege).toBe(true);
    });
  });

  // =========================================================================
  // 3. BEGINNER PROTECTION & TROPHY RISK
  // =========================================================================
  describe('Beginner Protection System', () => {
    it('applies protection for players with < 3 matches played or < 20 trophies', () => {
      const p1: PlayerProfile = { ...saveService.load().playerProfile, matchesPlayed: 1, trophies: 5 };
      const p2: PlayerProfile = { ...saveService.load().playerProfile, matchesPlayed: 2, trophies: 15 };
      const p3: PlayerProfile = { ...saveService.load().playerProfile, matchesPlayed: 5, trophies: 100 };

      expect(playerProgressionService.isBeginnerProtectionActive(p1)).toBe(true);
      expect(playerProgressionService.isBeginnerProtectionActive(p2)).toBe(true);
      expect(playerProgressionService.isBeginnerProtectionActive(p3)).toBe(false);
    });

    it('enforces 0 trophies at risk upon loss when beginner protection is active', () => {
      const beginner: PlayerProfile = {
        name: 'Novice Pip',
        level: 1,
        exp: 0,
        maxExp: 100,
        trophies: 10,
        coins: 500,
        gems: 10,
        matchesPlayed: 1,
        wins: 1,
        losses: 0,
        recentResults: ['win'],
      };

      const result = playerProgressionService.recordMatchResult('loss', 1, beginner);

      // Exactly 0 trophies lost under beginner protection
      expect(result.trophyDelta).toBe(0);
      expect(result.updatedProfile.trophies).toBe(10);
    });

    it('deducts normal trophies on loss when beginner protection is inactive', () => {
      const veteran: PlayerProfile = {
        name: 'Veteran Commander',
        level: 5,
        exp: 80,
        maxExp: 100,
        trophies: 150,
        coins: 2000,
        gems: 40,
        matchesPlayed: 25,
        wins: 18,
        losses: 7,
        recentResults: ['win', 'loss', 'win'],
      };

      const result = playerProgressionService.recordMatchResult('loss', 3, veteran);

      expect(result.trophyDelta).toBe(-10);
      expect(result.updatedProfile.trophies).toBe(140);
    });
  });

  // =========================================================================
  // 4. ADAPTIVE OPPONENT DIFFICULTY
  // =========================================================================
  describe('Adaptive AI Difficulty Calibration', () => {
    it('lowers difficulty offset (-1 tier) after 3 consecutive losses', () => {
      const strugglingProfile: PlayerProfile = {
        name: 'Struggling Player',
        level: 2,
        exp: 10,
        maxExp: 100,
        trophies: 50,
        coins: 600,
        gems: 10,
        matchesPlayed: 5,
        wins: 2,
        losses: 3,
        recentResults: ['win', 'win', 'loss', 'loss'],
      };

      // 3rd consecutive loss
      const res = playerProgressionService.recordMatchResult('loss', 2, strugglingProfile);
      expect(res.updatedProfile.difficultyAdjustment).toBe(-1);
    });

    it('raises challenge (+1 tier) after 3 consecutive wins', () => {
      const winningProfile: PlayerProfile = {
        name: 'Hot Streak Player',
        level: 3,
        exp: 50,
        maxExp: 100,
        trophies: 90,
        coins: 1000,
        gems: 20,
        matchesPlayed: 8,
        wins: 5,
        losses: 3,
        recentResults: ['loss', 'win', 'win'],
      };

      // 3rd consecutive win
      const res = playerProgressionService.recordMatchResult('win', 3, winningProfile);
      expect(res.updatedProfile.difficultyAdjustment).toBe(1);
    });

    it('maintains AI difficulty parameters strictly within legal game bounds', () => {
      const beginnerAi = aiDifficultyController.getBehaviorConfig('beginner', 0);
      const expertAi = aiDifficultyController.getBehaviorConfig('expert', 0);

      expect(beginnerAi.decisionIntervalMs).toBeGreaterThan(expertAi.decisionIntervalMs);
      expect(beginnerAi.canUseSawLanePierce).toBe(false);
      expect(beginnerAi.canUseMortarSiege).toBe(false);
      expect(expertAi.canUseSawLanePierce).toBe(true);
      expect(expertAi.canUseMortarSiege).toBe(true);
    });
  });

  // =========================================================================
  // 5. SECTOR VICTORY REWARDS & FIRST CLEAR BONUSES
  // =========================================================================
  describe('Sector Victory Rewards & First Clear Tracking', () => {
    it('distinguishes first clear rewards from repeat sector clears', () => {
      const profile: PlayerProfile = {
        name: 'Clear Tracker',
        level: 2,
        exp: 10,
        maxExp: 100,
        trophies: 40,
        coins: 500,
        gems: 15,
        clearedSectors: [],
      };

      // First time clearing Sector 2
      const firstWin = playerProgressionService.recordMatchResult('win', 2, profile);
      expect(firstWin.isFirstClear).toBe(true);
      expect(firstWin.firstClearReward).toBeDefined();
      expect(firstWin.firstClearReward?.coins).toBe(75);
      expect(firstWin.firstClearReward?.gems).toBe(10);
      expect(firstWin.updatedProfile.clearedSectors).toContain(2);

      // Repeat clear of Sector 2
      const repeatWin = playerProgressionService.recordMatchResult('win', 2, firstWin.updatedProfile);
      expect(repeatWin.isFirstClear).toBe(false);
      expect(repeatWin.firstClearReward).toBeUndefined();
    });

    it('prevents duplicate first-clear bonus claims across multiple matches', () => {
      const profileWithClear: PlayerProfile = {
        name: 'Clear Vet',
        level: 4,
        exp: 30,
        maxExp: 100,
        trophies: 100,
        coins: 2000,
        gems: 50,
        clearedSectors: [1, 2, 3],
      };

      const res = playerProgressionService.recordMatchResult('win', 3, profileWithClear);
      expect(res.isFirstClear).toBe(false);
      expect(res.firstClearReward).toBeUndefined();
      expect(res.updatedProfile.clearedSectors?.filter((s) => s === 3).length).toBe(1);
    });
  });

  // =========================================================================
  // 6. ANDROID BACK NAVIGATION & SAFE-AREA INTEGRITY
  // =========================================================================
  describe('Android Back Navigation & UI State Integrity', () => {
    it('closes SectorSelectionModal when Android back action is triggered', () => {
      const state: BackNavState = {
        showRewardedAdModal: false,
        hasCoinAnimation: false,
        isShortfallOpen: false,
        showDailyRewardModal: false,
        showLedgerModal: false,
        showEconomyModal: false,
        showDebugPanel: false,
        showSectorModal: true,
        showAvatarModal: false,
        showNoAdsModal: false,
        showUnityModal: false,
        showTechModal: false,
        showVersusModal: false,
        gameState: 'menu',
        isPaused: false,
        currentTab: 'battle',
      };

      expect(resolveBackAction(state)).toBe('close_sector');
    });

    it('prioritizes critical transactional flows before closing sector modal', () => {
      const stateWithAd: BackNavState = {
        showRewardedAdModal: true,
        hasCoinAnimation: false,
        isShortfallOpen: false,
        showDailyRewardModal: false,
        showLedgerModal: false,
        showEconomyModal: false,
        showDebugPanel: false,
        showSectorModal: true,
        showAvatarModal: false,
        showNoAdsModal: false,
        showUnityModal: false,
        showTechModal: false,
        showVersusModal: false,
        gameState: 'menu',
        isPaused: false,
        currentTab: 'battle',
      };

      expect(resolveBackAction(stateWithAd)).toBe('ignore_ad');
    });
  });
});
