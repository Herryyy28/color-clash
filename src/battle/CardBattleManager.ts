/**
 * Authoritative Card Battle Manager for Color Clash
 * Manages 4-card active hand, 1 next-card preview, deployment validation,
 * energy spending, and deterministic deck cycling.
 */

import { Card, CardType, Team } from '../types';
import { ALL_CARDS } from '../cardsData';
import { EnergyManager } from './EnergyManager';
import { ArenaGrid } from './ArenaGrid';

export interface CardDeployResult {
  success: boolean;
  card?: Card;
  error?: string;
  isSpecialLaneCard?: boolean;
}

export class CardBattleManager {
  private activeDeck: Card[] = [];
  private hand: Card[] = [];
  private nextCard!: Card;
  private deckCycleQueue: Card[] = [];
  private energyManager: EnergyManager;
  private arenaGrid: ArenaGrid;

  constructor(deck: Card[], energyManager: EnergyManager, arenaGrid: ArenaGrid) {
    this.energyManager = energyManager;
    this.arenaGrid = arenaGrid;
    this.initDeck(deck);
  }

  public initDeck(deck: Card[]) {
    this.activeDeck = deck.length >= 4 ? [...deck] : [ALL_CARDS.blaster, ALL_CARDS.cannon, ALL_CARDS.gatling, ALL_CARDS.saw];
    // Hand has first 4 cards
    this.hand = this.activeDeck.slice(0, 4);
    // Extra cards form the draw queue
    const extraCards = Object.values(ALL_CARDS).filter(
      (c) => !this.hand.some((h) => h.id === c.id)
    );
    this.deckCycleQueue = extraCards.length > 0 ? extraCards : [ALL_CARDS.mortar, ALL_CARDS.laser, ALL_CARDS.roller];
    this.nextCard = this.deckCycleQueue[0] || ALL_CARDS.roller;
  }

  public getHand(): Card[] {
    return this.hand;
  }

  public getNextCard(): Card {
    return this.nextCard;
  }

  public validateAndDeploy(
    cardId: CardType,
    team: Team,
    gridX: number,
    gridY: number
  ): CardDeployResult {
    // 1. Verify card is in hand
    const cardIndex = this.hand.findIndex((c) => c.id === cardId);
    if (cardIndex === -1) {
      return { success: false, error: 'Card not in active hand' };
    }

    const card = this.hand[cardIndex];

    // 2. Verify energy affordability
    if (!this.energyManager.canAfford(team, card.cost)) {
      return { success: false, error: `Insufficient energy (Cost: ${card.cost})` };
    }

    // 3. Special lane cards (saw, laser, mortar) have relaxed deployment rules
    const isSpecialLane = ['saw', 'laser', 'mortar'].includes(card.id);

    // 4. Verify deployment zone legality
    if (!this.arenaGrid.isValidDeploymentCell(team, gridX, gridY, isSpecialLane)) {
      return { success: false, error: 'Invalid deployment territory' };
    }

    // 5. Atomic energy consumption ONLY after full validation
    const spent = this.energyManager.spendEnergy(team, card.cost);
    if (!spent) {
      return { success: false, error: 'Failed to spend energy' };
    }

    // 6. Rotate Hand: played card moves out, nextCard enters hand, new nextCard drawn
    const oldNext = this.nextCard;
    const nextHand = [...this.hand];
    nextHand[cardIndex] = oldNext;
    this.hand = nextHand;

    // Advance cycle queue
    const remainingQueue = this.deckCycleQueue.filter((c) => c.id !== oldNext.id);
    remainingQueue.push(card); // recycle played card to tail of queue
    this.deckCycleQueue = remainingQueue;
    this.nextCard = this.deckCycleQueue[0] || ALL_CARDS.blaster;

    return {
      success: true,
      card,
      isSpecialLaneCard: isSpecialLane,
    };
  }
}
