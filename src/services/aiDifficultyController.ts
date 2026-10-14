/**
 * Authoritative AI Difficulty Controller for Color Clash
 * Configures tactical behavior, decision intervals, threat awareness,
 * card pool eligibility, and beginner protection rules.
 *
 * Rules:
 * - Plays strictly by legal game rules (real energy cost, valid territory placement).
 * - Avoids unfair stat buffs; difficulty is modulated purely through tactical depth,
 *   decision cadence, reaction times, and deck composition.
 */

import { AIDifficultyLevel, CardType, Card } from '../types';
import { ALL_CARDS } from '../cardsData';

export interface AIBehaviorConfig {
  difficulty: AIDifficultyLevel;
  decisionIntervalMs: number;
  initialEnergy: number;
  allowedCards: Card[];
  cardLevel: number;
  mistakeRate: number; // 0.0 to 1.0 probability of picking a non-optimal lane
  threatReactionDistance: number; // grid Y threshold for red defense
  canUseSawLanePierce: boolean; // beginner protection disables saw wipe
  canUseMortarSiege: boolean; // beginner protection disables mortar bombardment
  energyReserve: number; // AI waits until energy >= this threshold
  description: string;
}

export const aiDifficultyController = {
  /**
   * Generates a calibrated AI behavior profile based on difficulty tier and adaptive offset
   */
  getBehaviorConfig(
    difficulty: AIDifficultyLevel,
    adaptiveOffset: number = 0 // -1 (easier after losses), +1 (harder after win streak)
  ): AIBehaviorConfig {
    const tiers: AIDifficultyLevel[] = ['beginner', 'easy', 'normal', 'hard', 'expert'];
    let tierIndex = tiers.indexOf(difficulty);

    // Apply bounded adaptive offset
    if (adaptiveOffset !== 0) {
      tierIndex = Math.max(0, Math.min(tiers.length - 1, tierIndex + adaptiveOffset));
    }
    const effectiveDifficulty = tiers[tierIndex];

    switch (effectiveDifficulty) {
      case 'beginner':
        return {
          difficulty: 'beginner',
          decisionIntervalMs: 4800, // Calm, generous 4.8s between AI plays
          initialEnergy: 3, // Player starts with energy advantage
          allowedCards: [ALL_CARDS.blaster, ALL_CARDS.cannon, ALL_CARDS.roller],
          cardLevel: 1,
          mistakeRate: 0.35, // 35% chance to deploy on peaceful outer flank
          threatReactionDistance: 7, // Only reacts if blue is deep in red half
          canUseSawLanePierce: false, // Beginner protection: NO saw wipe!
          canUseMortarSiege: false, // Beginner protection: NO mortar bombardment!
          energyReserve: 3,
          description: 'Gentle beginner pacing. Basic units, slow cadence, no surprise lane wipes.',
        };

      case 'easy':
        return {
          difficulty: 'easy',
          decisionIntervalMs: 3600,
          initialEnergy: 4,
          allowedCards: [ALL_CARDS.blaster, ALL_CARDS.cannon, ALL_CARDS.gatling, ALL_CARDS.roller],
          cardLevel: 1,
          mistakeRate: 0.22,
          threatReactionDistance: 9,
          canUseSawLanePierce: false,
          canUseMortarSiege: false,
          energyReserve: 4,
          description: 'Basic threat awareness and steady unit deployments.',
        };

      case 'normal':
        return {
          difficulty: 'normal',
          decisionIntervalMs: 2700,
          initialEnergy: 5,
          allowedCards: [ALL_CARDS.blaster, ALL_CARDS.cannon, ALL_CARDS.gatling, ALL_CARDS.saw, ALL_CARDS.roller],
          cardLevel: 1,
          mistakeRate: 0.12,
          threatReactionDistance: 12,
          canUseSawLanePierce: true,
          canUseMortarSiege: false,
          energyReserve: 4,
          description: 'Balanced tactical play, threat response, and lane pushes.',
        };

      case 'hard':
        return {
          difficulty: 'hard',
          decisionIntervalMs: 2000,
          initialEnergy: 6,
          allowedCards: [ALL_CARDS.blaster, ALL_CARDS.cannon, ALL_CARDS.mortar, ALL_CARDS.gatling, ALL_CARDS.saw, ALL_CARDS.laser],
          cardLevel: 2,
          mistakeRate: 0.04,
          threatReactionDistance: 14,
          canUseSawLanePierce: true,
          canUseMortarSiege: true,
          energyReserve: 5,
          description: 'Aggressive resource management, lane piercing, and tactical counters.',
        };

      case 'expert':
      default:
        return {
          difficulty: 'expert',
          decisionIntervalMs: 1400,
          initialEnergy: 7,
          allowedCards: Object.values(ALL_CARDS),
          cardLevel: 3,
          mistakeRate: 0.0,
          threatReactionDistance: 16,
          canUseSawLanePierce: true,
          canUseMortarSiege: true,
          energyReserve: 4,
          description: 'Pinnacle grandmaster AI with rapid reflexes, optimal counters, and siege pressure.',
        };
    }
  },

  /**
   * Evaluates AI tactical decision: chooses best legal card and spawn coordinates
   */
  pickTacticalDeployment(
    config: AIBehaviorConfig,
    currentEnergy: number,
    units: Array<{ team: string; x: number; y: number; hp: number }>,
    cols: number,
    rows: number
  ): { card: Card; spawnX: number; spawnY: number } | null {
    // 1. Filter affordable cards
    const affordable = config.allowedCards.filter((c) => c.cost <= currentEnergy);
    if (affordable.length === 0) return null;

    // 2. Identify threats near Red territory (y < config.threatReactionDistance)
    const threateningBlue = units.filter((u) => u.team === 'blue' && u.hp > 0 && u.y < config.threatReactionDistance);

    const isMistake = Math.random() < config.mistakeRate;
    let chosenCard: Card;
    let spawnX = Math.floor(Math.random() * (cols - 4)) + 2;
    let spawnY = Math.floor(Math.random() * 5) + 2; // Red half (y: 2-6)

    if (threateningBlue.length > 0 && !isMistake) {
      // Tactical Defense: choose cannon or blaster to repel threat
      const defender = affordable.find((c) => c.id === 'cannon' || c.id === 'blaster');
      chosenCard = defender || affordable[0];
      const target = threateningBlue[0];
      spawnX = Math.max(1, Math.min(cols - 2, Math.round(target.x + (Math.random() - 0.5) * 2)));
      spawnY = Math.max(2, Math.min(6, Math.round(target.y - 2)));
    } else {
      // Offensive Push or Lane Control
      // Filter out Saw or Mortar if disabled for this tier
      const eligible = affordable.filter((c) => {
        if (c.id === 'saw' && !config.canUseSawLanePierce) return false;
        if (c.id === 'mortar' && !config.canUseMortarSiege) return false;
        return true;
      });

      const pool = eligible.length > 0 ? eligible : affordable;
      chosenCard = pool[Math.floor(Math.random() * pool.length)];

      if (chosenCard.id === 'saw') {
        spawnY = 2; // Saws launch from back rank straight down
      }
    }

    return { card: chosenCard, spawnX, spawnY };
  },
};
