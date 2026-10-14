/**
 * Authoritative Player Progression Service for Color Clash
 * Manages persistent match statistics, win/loss history, rolling performance window,
 * trophy ratings, skill MMR, sector unlocks, and adaptive difficulty calibration.
 */

import { PlayerProfile } from '../types';
import { sectorManager } from './sectorManager';

export interface MatchResultRecord {
  updatedProfile: PlayerProfile;
  trophyDelta: number;
  newSectorUnlocked: boolean;
  unlockedSectorName?: string;
  isFirstClear: boolean;
  firstClearReward?: {
    coins: number;
    gems: number;
    label: string;
  };
}

export const playerProgressionService = {
  /**
   * Records authoritative match outcome and adjusts progression metrics
   */
  recordMatchResult(
    outcome: 'win' | 'loss',
    sectorId: number,
    currentProfile: PlayerProfile
  ): MatchResultRecord {
    const isWin = outcome === 'win';
    const isProtected = this.isBeginnerProtectionActive(currentProfile);

    // 1. Calculate Trophy Delta
    let trophyDelta = 0;
    if (isWin) {
      // Base +30 trophies on win
      trophyDelta = 30;
    } else {
      if (isProtected) {
        // Beginner protection active: 0 trophies at risk!
        trophyDelta = 0;
      } else {
        // -10 on loss, but cannot drop below 0
        trophyDelta = Math.max(-10, -currentProfile.trophies);
      }
    }

    const newTrophies = Math.max(0, currentProfile.trophies + trophyDelta);

    // 2. Rolling Battle History (last 10 matches)
    const recent = [...(currentProfile.recentResults || [])];
    recent.push(outcome);
    const rollingHistory = recent.slice(-10);

    // 3. Adaptive Difficulty Offset Calculation (Rolling Performance Window)
    // Check consecutive streaks in recent matches:
    let difficultyAdjustment = 0;
    const lastThree = rollingHistory.slice(-3);
    if (lastThree.length === 3 && lastThree.every((r) => r === 'loss')) {
      // 3 consecutive losses: lower offline AI difficulty by -1 tier
      difficultyAdjustment = -1;
    } else if (lastThree.length === 3 && lastThree.every((r) => r === 'win')) {
      // 3 consecutive wins: gradually raise offline AI challenge by +1 tier
      difficultyAdjustment = 1;
    }

    // 4. Update Matches, Wins & Losses
    const matchesPlayed = (currentProfile.matchesPlayed || 0) + 1;
    const wins = (currentProfile.wins || 0) + (isWin ? 1 : 0);
    const losses = (currentProfile.losses || 0) + (isWin ? 0 : 1);

    // 5. Skill Rating (Elo MMR Approximation)
    const currentMmr = currentProfile.skillRating || 350;
    const mmrDelta = isWin ? 25 : -15;
    const skillRating = Math.max(100, Math.min(2000, currentMmr + mmrDelta));

    // 6. Check Sector Unlocks
    const previousHighest = currentProfile.highestSectorUnlocked || 1;
    let highestSectorUnlocked = previousHighest;
    let newSectorUnlocked = false;
    let unlockedSectorName: string | undefined = undefined;

    const allSectors = sectorManager.getAllSectors();
    allSectors.forEach((sec) => {
      if (newTrophies >= sec.requiredTrophies && sec.sectorId > highestSectorUnlocked) {
        highestSectorUnlocked = sec.sectorId;
        newSectorUnlocked = true;
        unlockedSectorName = sec.name;
      }
    });

    // 7. Track First Clear of this Sector
    const cleared = new Set(currentProfile.clearedSectors || []);
    let isFirstClear = false;
    let firstClearReward: { coins: number; gems: number; label: string } | undefined = undefined;

    if (isWin && !cleared.has(sectorId)) {
      cleared.add(sectorId);
      isFirstClear = true;
      const sector = sectorManager.getSectorById(sectorId);
      if (sector.rewards.firstClearBonus) {
        firstClearReward = sector.rewards.firstClearBonus;
      }
    }

    const updatedProfile: PlayerProfile = {
      ...currentProfile,
      trophies: newTrophies,
      matchesPlayed,
      wins,
      losses,
      recentResults: rollingHistory,
      skillRating,
      highestSectorUnlocked,
      difficultyAdjustment,
      clearedSectors: Array.from(cleared),
    };

    return {
      updatedProfile,
      trophyDelta,
      newSectorUnlocked,
      unlockedSectorName,
      isFirstClear,
      firstClearReward,
    };
  },

  /**
   * Computes the player's recent win rate percentage across rolling window
   */
  getRecentWinRate(profile: PlayerProfile): number {
    const history = profile.recentResults || [];
    if (history.length === 0) return 50;
    const winCount = history.filter((r) => r === 'win').length;
    return Math.round((winCount / history.length) * 100);
  },

  /**
   * Evaluates if beginner protection applies to the player
   */
  isBeginnerProtectionActive(profile: PlayerProfile): boolean {
    const matches = profile.matchesPlayed || 0;
    const trophies = profile.trophies || 0;
    // Active for the first 3 matches or under 20 trophies
    return matches < 3 || trophies < 20;
  },
};
