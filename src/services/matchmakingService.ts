/**
 * Authoritative Fair Matchmaking Service for Color Clash
 * Evaluates candidate pool, calculates multi-factor fairness scores,
 * enforces sector eligibility, beginner protection constraints,
 * and calibrates tactical AI parameters for the matched opponent.
 */

import { PlayerProfile, CardType, AIDifficultyLevel } from '../types';
import { sectorManager, SectorConfig } from './sectorManager';
import { aiDifficultyController, AIBehaviorConfig } from './aiDifficultyController';
import { playerProgressionService } from './playerProgressionService';

export interface OpponentMatchup {
  name: string;
  title: string;
  avatarId: string;
  trophies: number;
  rating: number; // Deck power
  deckCardIds: CardType[];
  cardLevel: number;
  difficultyTier: AIDifficultyLevel;
  difficultyLabel: string;
  difficultyColor: string;
  aiConfig: AIBehaviorConfig;
  isBeginnerProtected: boolean;
  matchmakingReason: string;
  potentialTrophyGain: number;
  potentialTrophyLoss: number;
  fairnessScore: number;
  isFairMatch: boolean;
}

export interface MatchmakingCandidate {
  id: string;
  name: string;
  title: string;
  avatarId: string;
  sectorId: number;
  baseTrophies: number;
  deckPower: number;
  skillMmr: number;
  cardLevel: number;
  deckCardIds: CardType[];
  difficulty: AIDifficultyLevel;
}

export interface MatchmakingWeights {
  mmrDiffWeight: number;
  deckPowerDiffWeight: number;
  cardLevelDiffWeight: number;
  recentPerformanceWeight: number;
}

export const DEFAULT_MATCHMAKING_WEIGHTS: MatchmakingWeights = {
  mmrDiffWeight: 0.35,
  deckPowerDiffWeight: 0.35,
  cardLevelDiffWeight: 0.15,
  recentPerformanceWeight: 0.15,
};

export const OPPONENT_CANDIDATE_POOL: MatchmakingCandidate[] = [
  // Sector 1: Training Grounds (Beginner, Rec Power 200)
  {
    id: 's1_pip',
    name: 'Scout Cadet Pip',
    title: 'Novice Recruit',
    avatarId: 'red_trainer',
    sectorId: 1,
    baseTrophies: 5,
    deckPower: 195,
    skillMmr: 300,
    cardLevel: 1,
    deckCardIds: ['blaster', 'roller', 'cannon'],
    difficulty: 'beginner',
  },
  {
    id: 's1_barnaby',
    name: 'Squire Barnaby',
    title: 'Apprentice Knight',
    avatarId: 'commander',
    sectorId: 1,
    baseTrophies: 10,
    deckPower: 210,
    skillMmr: 320,
    cardLevel: 1,
    deckCardIds: ['blaster', 'cannon', 'roller'],
    difficulty: 'beginner',
  },
  {
    id: 's1_leo',
    name: 'Guard Trainee Leo',
    title: 'Castle Gate Guard',
    avatarId: 'warrior',
    sectorId: 1,
    baseTrophies: 15,
    deckPower: 220,
    skillMmr: 340,
    cardLevel: 1,
    deckCardIds: ['cannon', 'blaster', 'roller'],
    difficulty: 'beginner',
  },

  // Sector 2: Forest Arena (Easy, Rec Power 320)
  {
    id: 's2_crimson',
    name: 'Baron Von Crimson',
    title: 'Frontier Sentry',
    avatarId: 'red_trainer',
    sectorId: 2,
    baseTrophies: 28,
    deckPower: 310,
    skillMmr: 400,
    cardLevel: 1,
    deckCardIds: ['blaster', 'cannon', 'gatling', 'roller'],
    difficulty: 'easy',
  },
  {
    id: 's2_sylva',
    name: 'Ranger Sylva',
    title: 'Woodland Scout',
    avatarId: 'archer',
    sectorId: 2,
    baseTrophies: 38,
    deckPower: 335,
    skillMmr: 430,
    cardLevel: 1,
    deckCardIds: ['blaster', 'gatling', 'roller', 'cannon'],
    difficulty: 'easy',
  },
  {
    id: 's2_bram',
    name: 'Sentry Bram',
    title: 'River Watcher',
    avatarId: 'warrior',
    sectorId: 2,
    baseTrophies: 48,
    deckPower: 350,
    skillMmr: 460,
    cardLevel: 1,
    deckCardIds: ['cannon', 'gatling', 'roller', 'blaster'],
    difficulty: 'easy',
  },

  // Sector 3: Royal Outpost (Normal, Rec Power 450)
  {
    id: 's3_ironbark',
    name: 'Sergeant Ironbark',
    title: 'Garrison Commander',
    avatarId: 'red_trainer',
    sectorId: 3,
    baseTrophies: 70,
    deckPower: 440,
    skillMmr: 520,
    cardLevel: 1,
    deckCardIds: ['blaster', 'cannon', 'gatling', 'saw', 'roller'],
    difficulty: 'normal',
  },
  {
    id: 's3_valerius',
    name: 'Captain Valerius',
    title: 'Royal Musketeer',
    avatarId: 'warrior',
    sectorId: 3,
    baseTrophies: 85,
    deckPower: 470,
    skillMmr: 560,
    cardLevel: 1,
    deckCardIds: ['cannon', 'gatling', 'saw', 'blaster', 'roller'],
    difficulty: 'normal',
  },
  {
    id: 's3_flint',
    name: 'Timber Warden Flint',
    title: 'Ballista Operator',
    avatarId: 'mage',
    sectorId: 3,
    baseTrophies: 98,
    deckPower: 495,
    skillMmr: 590,
    cardLevel: 1,
    deckCardIds: ['gatling', 'saw', 'cannon', 'roller', 'blaster'],
    difficulty: 'normal',
  },

  // Sector 4: Crystal Fortress (Hard, Rec Power 600)
  {
    id: 's4_general',
    name: 'General Crimson',
    title: 'Imperial Vanguard',
    avatarId: 'red_trainer',
    sectorId: 4,
    baseTrophies: 135,
    deckPower: 590,
    skillMmr: 680,
    cardLevel: 2,
    deckCardIds: ['blaster', 'cannon', 'mortar', 'laser', 'saw'],
    difficulty: 'hard',
  },
  {
    id: 's4_caelum',
    name: 'Arch-Mage Caelum',
    title: 'Crystal Sentinel',
    avatarId: 'mage',
    sectorId: 4,
    baseTrophies: 155,
    deckPower: 625,
    skillMmr: 720,
    cardLevel: 2,
    deckCardIds: ['laser', 'mortar', 'cannon', 'gatling', 'saw'],
    difficulty: 'hard',
  },
  {
    id: 's4_vane',
    name: 'Commander Vane',
    title: 'Fortress Shieldbearer',
    avatarId: 'warrior',
    sectorId: 4,
    baseTrophies: 175,
    deckPower: 650,
    skillMmr: 750,
    cardLevel: 2,
    deckCardIds: ['cannon', 'laser', 'mortar', 'roller', 'saw'],
    difficulty: 'hard',
  },

  // Sector 5: Champion's Citadel (Expert, Rec Power 750)
  {
    id: 's5_emperor',
    name: 'Emperor of Red',
    title: 'Realm Sovereign',
    avatarId: 'red_trainer',
    sectorId: 5,
    baseTrophies: 220,
    deckPower: 740,
    skillMmr: 850,
    cardLevel: 2,
    deckCardIds: ['blaster', 'cannon', 'mortar', 'laser', 'saw', 'roller'],
    difficulty: 'expert',
  },
  {
    id: 's5_ignis',
    name: 'Warlord Ignis',
    title: 'Volcano Overlord',
    avatarId: 'warrior',
    sectorId: 5,
    baseTrophies: 245,
    deckPower: 775,
    skillMmr: 890,
    cardLevel: 2,
    deckCardIds: ['mortar', 'laser', 'saw', 'cannon', 'gatling', 'roller'],
    difficulty: 'expert',
  },
  {
    id: 's5_kira',
    name: 'Dragon Knight Kira',
    title: 'Inferno Champion',
    avatarId: 'valkyrie',
    sectorId: 5,
    baseTrophies: 270,
    deckPower: 805,
    skillMmr: 930,
    cardLevel: 2,
    deckCardIds: ['laser', 'saw', 'mortar', 'cannon', 'roller', 'gatling'],
    difficulty: 'expert',
  },

  // Sector 6: Sovereign Throne (Grandmaster, Rec Power 900)
  {
    id: 's6_grand',
    name: 'Grand Sovereign Ignis',
    title: 'Grandmaster Champion',
    avatarId: 'red_trainer',
    sectorId: 6,
    baseTrophies: 340,
    deckPower: 895,
    skillMmr: 1050,
    cardLevel: 3,
    deckCardIds: ['blaster', 'cannon', 'mortar', 'laser', 'saw', 'roller', 'gatling'],
    difficulty: 'expert',
  },
  {
    id: 's6_malakor',
    name: 'Empress Malakor',
    title: 'Apex Conqueror',
    avatarId: 'valkyrie',
    sectorId: 6,
    baseTrophies: 380,
    deckPower: 930,
    skillMmr: 1120,
    cardLevel: 3,
    deckCardIds: ['laser', 'mortar', 'saw', 'gatling', 'cannon', 'roller', 'blaster'],
    difficulty: 'expert',
  },
  {
    id: 's6_roland',
    name: 'Arch-Champion Roland',
    title: 'Eternal Legend',
    avatarId: 'warrior',
    sectorId: 6,
    baseTrophies: 420,
    deckPower: 960,
    skillMmr: 1200,
    cardLevel: 3,
    deckCardIds: ['mortar', 'laser', 'saw', 'roller', 'cannon', 'gatling', 'blaster'],
    difficulty: 'expert',
  },
];

export const matchmakingService = {
  /**
   * Evaluates fairness mismatch between a candidate and the player (lower is fairer)
   */
  scoreCandidate(
    candidate: MatchmakingCandidate,
    playerProfile: PlayerProfile,
    playerDeckStrength: number,
    sector: SectorConfig,
    weights: MatchmakingWeights = DEFAULT_MATCHMAKING_WEIGHTS
  ): number {
    const playerMmr = playerProfile.skillRating || 350;

    // 1. Normalized MMR difference (scaled against 400 pts)
    const mmrDiff = Math.abs(candidate.skillMmr - playerMmr) / 400;

    // 2. Normalized Deck Power difference (scaled against 300 pts)
    const powerDiff = Math.abs(candidate.deckPower - playerDeckStrength) / 300;

    // 3. Card level mismatch penalty
    const levelDiff = Math.abs(candidate.cardLevel - 1) / 3;

    // 4. Recent performance adjustment:
    // If player is on a losing streak (difficultyAdjustment < 0), penalize candidates stronger than player
    let performancePenalty = 0;
    const adj = playerProfile.difficultyAdjustment || 0;
    if (adj < 0 && candidate.deckPower > playerDeckStrength) {
      performancePenalty = 0.35 * Math.abs(adj);
    } else if (adj > 0 && candidate.deckPower < playerDeckStrength) {
      performancePenalty = 0.25 * adj;
    }

    const totalScore =
      mmrDiff * weights.mmrDiffWeight +
      powerDiff * weights.deckPowerDiffWeight +
      levelDiff * weights.cardLevelDiffWeight +
      performancePenalty * weights.recentPerformanceWeight;

    return Number(totalScore.toFixed(3));
  },

  /**
   * Generates a fair, calibrated opponent matchup for the chosen sector
   */
  findMatchup(
    sectorId: number,
    playerProfile: PlayerProfile,
    playerDeckStrength: number,
    weights: MatchmakingWeights = DEFAULT_MATCHMAKING_WEIGHTS
  ): OpponentMatchup {
    const sector = sectorManager.getSectorById(sectorId);
    const isBeginnerProtected = playerProgressionService.isBeginnerProtectionActive(playerProfile);

    // 1. Determine effective AI difficulty tier
    let effectiveDifficulty: AIDifficultyLevel = sector.difficulty;
    if (isBeginnerProtected) {
      // Beginner protection hard-caps to beginner difficulty
      effectiveDifficulty = 'beginner';
    } else {
      // Apply adaptive performance adjustment (-1 easier after loss streak, +1 harder after win streak)
      const offset = playerProfile.difficultyAdjustment || 0;
      const tiers: AIDifficultyLevel[] = ['beginner', 'easy', 'normal', 'hard', 'expert'];
      const currentIndex = tiers.indexOf(sector.difficulty);
      const clampedIndex = Math.max(0, Math.min(tiers.length - 1, currentIndex + offset));
      effectiveDifficulty = tiers[clampedIndex];
    }

    // 2. Filter Candidate Pool
    let eligibleCandidates = OPPONENT_CANDIDATE_POOL.filter((c) => c.sectorId === sectorId);

    // If beginner protection is active, strictly exclude high-tier or overpowered opponents
    if (isBeginnerProtected) {
      eligibleCandidates = eligibleCandidates.filter(
        (c) => c.cardLevel <= 1 && c.deckPower <= 250 && c.difficulty === 'beginner'
      );
    }

    // Safe fallback if filtering leaves no candidates
    if (eligibleCandidates.length === 0) {
      eligibleCandidates = [
        {
          id: `fallback_${sector.sectorId}`,
          name: sector.opponentProfile.name,
          title: sector.opponentProfile.title,
          avatarId: sector.opponentProfile.avatarId || 'red_trainer',
          sectorId: sector.sectorId,
          baseTrophies: sector.opponentTrophies,
          deckPower: sector.recommendedStrength,
          skillMmr: playerProfile.skillRating || 350,
          cardLevel: isBeginnerProtected ? 1 : sector.opponentProfile.cardLevel || 1,
          deckCardIds: sector.opponentProfile.deckCardIds,
          difficulty: effectiveDifficulty,
        },
      ];
    }

    // 3. Score all eligible candidates
    const scoredCandidates = eligibleCandidates.map((cand) => ({
      candidate: cand,
      score: this.scoreCandidate(cand, playerProfile, playerDeckStrength, sector, weights),
    }));

    // Sort ascending by fairness score (lowest mismatch score = fairest)
    scoredCandidates.sort((a, b) => a.score - b.score);

    // Controlled selection: pick the fairest candidate (or pick between top candidates)
    const selected = scoredCandidates[0].candidate;
    const fairnessScore = scoredCandidates[0].score;

    // 4. Fetch calibrated AI behavior configuration
    const aiConfig = aiDifficultyController.getBehaviorConfig(effectiveDifficulty, 0);

    // 5. Opponent trophies calibrated around player's current progression
    const baseTrophies = isBeginnerProtected ? selected.baseTrophies : Math.max(selected.baseTrophies, playerProfile.trophies - 5);
    const opponentTrophies = Math.max(5, baseTrophies);

    // 6. Card level and deck composition
    const cardLevel = isBeginnerProtected ? 1 : selected.cardLevel;
    const deckCardIds: CardType[] = selected.deckCardIds.slice(0, 4);

    // 7. Generate transparent matchmaking rationale
    let matchmakingReason = `Matched against ${selected.name} in ${sector.name}`;
    if (isBeginnerProtected) {
      matchmakingReason = `Beginner Protection active — Gentle cadet training match (0 trophies at risk)`;
    } else if (playerProfile.difficultyAdjustment === -1) {
      matchmakingReason = `Adaptive Ease active — Opponent cadence relaxed for balance`;
    } else if (playerProfile.difficultyAdjustment === 1) {
      matchmakingReason = `Win streak detected — Opponent challenge elevated`;
    } else {
      matchmakingReason = `Fair matchmaking calibrated to your deck power & trophies`;
    }

    // Trophy risk and reward
    const potentialTrophyGain = 30;
    const potentialTrophyLoss = isBeginnerProtected ? 0 : 10;
    const isFairMatch = Math.abs(selected.deckPower - playerDeckStrength) <= 150;

    return {
      name: selected.name,
      title: selected.title,
      avatarId: selected.avatarId || 'red_trainer',
      trophies: opponentTrophies,
      rating: selected.deckPower,
      deckCardIds,
      cardLevel,
      difficultyTier: effectiveDifficulty,
      difficultyLabel: effectiveDifficulty.toUpperCase(),
      difficultyColor: sector.difficultyColor,
      aiConfig,
      isBeginnerProtected,
      matchmakingReason,
      potentialTrophyGain,
      potentialTrophyLoss,
      fairnessScore,
      isFairMatch,
    };
  },
};
