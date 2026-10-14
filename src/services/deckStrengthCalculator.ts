/**
 * Authoritative Deck Strength Calculator for Color Clash
 * Evaluates player & opponent decks using multi-factor analysis:
 * - Card levels and base stat scaling
 * - Energy curve optimality (average elixir cost balance)
 * - Tactical role diversity (ranged, splash/siege, pressure/lane)
 * - Passive ability synergies
 *
 * Output is normalized to a documented rating range: [100, 1000].
 */

import { Card, CardType, CardInventoryItem } from '../types';

export interface DeckStrengthAnalysis {
  totalRating: number;
  averageLevel: number;
  averageCost: number;
  roleCoverage: {
    hasRanged: boolean;
    hasSiege: boolean;
    hasPressure: boolean;
    hasDefense: boolean;
  };
  tierLabel: 'Novice' | 'Adept' | 'Veteran' | 'Elite' | 'Champion';
}

export const deckStrengthCalculator = {
  /**
   * Calculates the comprehensive battle rating for an active 4-card deck
   */
  calculate(
    deck: Card[],
    inventory?: Record<CardType, CardInventoryItem>
  ): DeckStrengthAnalysis {
    if (!deck || deck.length === 0) {
      return {
        totalRating: 150,
        averageLevel: 1,
        averageCost: 3.5,
        roleCoverage: { hasRanged: false, hasSiege: false, hasPressure: false, hasDefense: false },
        tierLabel: 'Novice',
      };
    }

    let levelSum = 0;
    let costSum = 0;
    let baseCardPoints = 0;

    let hasRanged = false;
    let hasSiege = false;
    let hasPressure = false;
    let hasDefense = false;

    deck.forEach((card) => {
      // Determine effective level from inventory or card object
      const effectiveLevel = inventory?.[card.id]?.level || card.level || 1;
      levelSum += effectiveLevel;
      costSum += card.cost;

      // Card level base points: 45 pts at lvl 1, +35 pts per level
      const cardBase = 45 + (effectiveLevel - 1) * 35;
      baseCardPoints += cardBase;

      // Identify tactical roles
      if (card.id === 'blaster' || card.id === 'gatling') hasRanged = true;
      if (card.id === 'cannon' || card.id === 'mortar') hasSiege = true;
      if (card.id === 'saw' || card.id === 'roller' || card.id === 'laser') hasPressure = true;
      if (card.id === 'cannon' || card.passive?.type === 'shielding') hasDefense = true;
    });

    const cardCount = deck.length;
    const averageLevel = Number((levelSum / cardCount).toFixed(1));
    const averageCost = Number((costSum / cardCount).toFixed(2));

    // 1. Base rating from cards (typically 180 to 500)
    let score = baseCardPoints;

    // 2. Elixir curve optimality bonus:
    // Optimal battle deck average cost is between 3.2 and 4.2
    if (averageCost >= 3.2 && averageCost <= 4.2) {
      score += 40; // Sweet spot balance
    } else if (averageCost > 4.6) {
      score -= 30; // Heavy, sluggish deck
    } else if (averageCost < 2.8) {
      score -= 20; // Too fragile
    }

    // 3. Tactical role synergy bonus
    let rolesCovered = 0;
    if (hasRanged) rolesCovered++;
    if (hasSiege) rolesCovered++;
    if (hasPressure) rolesCovered++;
    if (hasDefense) rolesCovered++;
    score += rolesCovered * 15; // Up to +60 points for diverse deck

    // 4. Passive abilities diversity bonus
    const uniquePassives = new Set(deck.map((c) => c.passive?.type).filter(Boolean));
    score += uniquePassives.size * 10; // Up to +30 points

    // 5. Normalize score strictly to [100, 1000]
    const clampedRating = Math.max(100, Math.min(1000, Math.round(score)));

    // Categorize tier
    let tierLabel: DeckStrengthAnalysis['tierLabel'] = 'Novice';
    if (clampedRating >= 750) tierLabel = 'Champion';
    else if (clampedRating >= 580) tierLabel = 'Elite';
    else if (clampedRating >= 420) tierLabel = 'Veteran';
    else if (clampedRating >= 280) tierLabel = 'Adept';

    return {
      totalRating: clampedRating,
      averageLevel,
      averageCost,
      roleCoverage: {
        hasRanged,
        hasSiege,
        hasPressure,
        hasDefense,
      },
      tierLabel,
    };
  },
};
