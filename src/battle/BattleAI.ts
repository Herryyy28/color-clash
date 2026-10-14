/**
 * Authoritative Battle AI for Color Clash
 * Plays by the exact same rules as the player:
 * - Checks real AI energy before each move via EnergyManager
 * - Spends energy atomically
 * - Deploys cards on valid legal Red territory cells
 * - Dynamically counters player units and captures lanes
 */

import { Card, CardType } from '../types';
import { ALL_CARDS } from '../cardsData';
import { EnergyManager } from './EnergyManager';
import { ArenaGrid, GRID_COLS, GRID_ROWS } from './ArenaGrid';
import { UnitRuntime, ProjectileRuntime } from './BattleTypes';
import { TerritoryManager } from './TerritoryManager';
import { sounds } from '../audio';

export interface AIDecisionResult {
  deployed: boolean;
  cardId?: CardType;
  x?: number;
  y?: number;
  isSpecialProjectile?: boolean;
}

export class BattleAI {
  private energyManager: EnergyManager;
  private arenaGrid: ArenaGrid;
  private territoryManager: TerritoryManager;
  private aiDeck: Card[] = [];
  private aiHand: Card[] = [];
  private aiNextCard!: Card;
  private decisionTimer: number = 0;
  private decisionInterval: number = 1.6; // Seconds between strategic evaluations

  constructor(energyManager: EnergyManager, arenaGrid: ArenaGrid, territoryManager: TerritoryManager) {
    this.energyManager = energyManager;
    this.arenaGrid = arenaGrid;
    this.territoryManager = territoryManager;
    this.initAIDeck();
  }

  public initAIDeck() {
    this.aiDeck = [ALL_CARDS.blaster, ALL_CARDS.cannon, ALL_CARDS.saw, ALL_CARDS.mortar, ALL_CARDS.roller];
    this.aiHand = this.aiDeck.slice(0, 4);
    this.aiNextCard = ALL_CARDS.roller;
    this.decisionTimer = 0.8;
  }

  public setDifficultyInterval(intervalSec: number) {
    this.decisionInterval = Math.max(0.8, intervalSec);
  }

  /**
   * Evaluates legal gameplay moves and executes valid deployments
   */
  public update(
    deltaSec: number,
    units: UnitRuntime[],
    projectiles: ProjectileRuntime[]
  ): AIDecisionResult {
    this.decisionTimer -= deltaSec;
    if (this.decisionTimer > 0) {
      return { deployed: false };
    }

    this.decisionTimer = this.decisionInterval;

    // 1. Filter affordable cards from current AI hand
    const affordableCards = this.aiHand.filter((c) =>
      this.energyManager.canAfford('red', c.cost)
    );

    if (affordableCards.length === 0) {
      return { deployed: false }; // Insufficient energy
    }

    // 2. Strategic decision: prioritize counter or lane push
    // Count player units near red base (y < 13)
    const threateningUnits = units.filter((u) => u.team === 'blue' && !u.isDead && u.y < 14);

    let chosenCard: Card;
    let spawnX = Math.floor(Math.random() * (GRID_COLS - 4)) + 2;
    let spawnY = Math.floor(Math.random() * 6) + 2; // Red half (y: 2-7)

    if (threateningUnits.length > 0) {
      // Prioritize defense unit: Cannon or Blaster near the threat
      const defenderCard = affordableCards.find((c) => c.id === 'cannon' || c.id === 'blaster');
      chosenCard = defenderCard || affordableCards[0];
      const threat = threateningUnits[0];
      spawnX = Math.max(1, Math.min(GRID_COLS - 2, Math.round(threat.x)));
      spawnY = Math.max(2, Math.min(8, Math.round(threat.y - 3)));
    } else {
      // Offensive lane push: Saw, Roller, or Blaster
      chosenCard = affordableCards[Math.floor(Math.random() * affordableCards.length)];
    }

    // Special card handling
    const isSpecialLane = ['saw', 'laser'].includes(chosenCard.id);

    // 3. Validate deployment legality
    if (!this.arenaGrid.isValidDeploymentCell('red', spawnX, spawnY, isSpecialLane)) {
      // Fallback to safe red home quadrant
      spawnX = 4 + Math.floor(Math.random() * (GRID_COLS - 8));
      spawnY = 3 + Math.floor(Math.random() * 4);
    }

    // 4. Consume energy authoritatively via EnergyManager
    const spent = this.energyManager.spendEnergy('red', chosenCard.cost);
    if (!spent) {
      return { deployed: false };
    }

    // 5. Rotate AI Hand
    const handIdx = this.aiHand.findIndex((c) => c.id === chosenCard.id);
    if (handIdx !== -1) {
      const oldNext = this.aiNextCard;
      this.aiHand[handIdx] = oldNext;
      this.aiNextCard = chosenCard;
    }

    // 6. Spawn entity
    if (chosenCard.id === 'saw') {
      sounds.playSawBlade();
      this.territoryManager.paintRadial(spawnX, spawnY, 2.0, 'red');

      projectiles.push({
        id: `ai_saw_${Date.now()}`,
        team: 'red',
        type: 'saw',
        x: spawnX,
        y: spawnY,
        vx: 0,
        vy: 0.38, // travels straight down towards blue base
        startX: spawnX,
        startY: spawnY,
        targetX: spawnX,
        targetY: GRID_ROWS - 1,
        paintRadius: 2.2,
        damage: chosenCard.damage,
        life: 180,
        maxLife: 180,
        rotation: 0,
      });

      return {
        deployed: true,
        cardId: chosenCard.id,
        x: spawnX,
        y: spawnY,
        isSpecialProjectile: true,
      };
    } else {
      sounds.playCardDeploy();
      units.push({
        id: `ai_unit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        team: 'red',
        cardId: chosenCard.id,
        x: spawnX,
        y: spawnY,
        hp: chosenCard.hp,
        maxHp: chosenCard.hp,
        shieldHp: chosenCard.passive?.shieldValue ?? 0,
        maxShieldHp: chosenCard.passive?.shieldValue ?? 0,
        speedMultiplier: chosenCard.passive?.speedFactor ?? 1.0,
        level: 1,
        angle: Math.PI / 2, // Facing downwards towards player
        shootCooldown: chosenCard.fireRate,
        barrelRecoil: 0,
        totalShotsFired: 0,
        targetUnitId: null,
        passive: chosenCard.passive,
        isDead: false,
      });

      return {
        deployed: true,
        cardId: chosenCard.id,
        x: spawnX,
        y: spawnY,
        isSpecialProjectile: false,
      };
    }
  }
}
