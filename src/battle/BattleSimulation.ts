/**
 * Authoritative Battle Simulation Orchestrator for Color Clash
 * Single Source of Truth for Battle State, Territory, Energy, Units, Combat,
 * Movement, Timer, and AI.
 */

import {
  BattlePhase,
  BattleSnapshot,
  UnitRuntime,
  ProjectileRuntime,
  ParticleEffect,
  FloatingNotification,
  BattleEventLog,
} from './BattleTypes';
import { ArenaGrid } from './ArenaGrid';
import { TerritoryManager } from './TerritoryManager';
import { EnergyManager } from './EnergyManager';
import { CardBattleManager } from './CardBattleManager';
import { MovementSystem } from './MovementSystem';
import { CombatSystem } from './CombatSystem';
import { BattleTimer } from './BattleTimer';
import { BattleAI } from './BattleAI';
import { Card, CardType, LevelConfig, Team } from '../types';
import { ALL_CARDS } from '../cardsData';
import { currencyService } from '../services/currencyService';
import { economyConfigService } from '../services/economyConfig';
import { sounds } from '../audio';

export type BattleSnapshotListener = (snapshot: BattleSnapshot) => void;
export type BattleEventListener = (event: BattleEventLog) => void;

export class BattleSimulation {
  private phase: BattlePhase = 'Initializing';
  private arenaGrid: ArenaGrid;
  private territoryManager: TerritoryManager;
  private energyManager: EnergyManager;
  private cardBattleManager: CardBattleManager;
  private movementSystem: MovementSystem;
  private combatSystem: CombatSystem;
  private battleTimer: BattleTimer;
  private battleAI: BattleAI;

  private units: UnitRuntime[] = [];
  private projectiles: ProjectileRuntime[] = [];
  private particles: ParticleEffect[] = [];
  private floatingTexts: FloatingNotification[] = [];

  private currentLevel: LevelConfig | null = null;
  private countdownTimer: number = 3;
  private winner: Team | 'draw' | null = null;
  private matchResultClaimId: string | null = null;
  private rewardCoins: number = 0;

  private snapshotListeners: Set<BattleSnapshotListener> = new Set();
  private eventListeners: Set<BattleEventListener> = new Set();

  constructor(defaultDeck: Card[] = [ALL_CARDS.blaster, ALL_CARDS.cannon, ALL_CARDS.gatling, ALL_CARDS.saw]) {
    this.arenaGrid = new ArenaGrid();
    this.territoryManager = new TerritoryManager(this.arenaGrid);
    this.energyManager = new EnergyManager(5.0, 10.0);
    this.cardBattleManager = new CardBattleManager(defaultDeck, this.energyManager, this.arenaGrid);
    this.movementSystem = new MovementSystem(this.arenaGrid, this.territoryManager);
    this.combatSystem = new CombatSystem(this.territoryManager);
    this.battleTimer = new BattleTimer(180);
    this.battleAI = new BattleAI(this.energyManager, this.arenaGrid, this.territoryManager);
  }

  // -------------------------------------------------------------
  // Subscriptions & Snapshots
  // -------------------------------------------------------------
  public onSnapshot(listener: BattleSnapshotListener): () => void {
    this.snapshotListeners.add(listener);
    listener(this.getSnapshot());
    return () => this.snapshotListeners.delete(listener);
  }

  public onEvent(listener: BattleEventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  private emitEvent(event: BattleEventLog) {
    this.eventListeners.forEach((fn) => fn(event));
  }

  public getSnapshot(): BattleSnapshot {
    const score = this.territoryManager.getScore();
    return {
      phase: this.phase,
      matchTimeRemaining: this.battleTimer.getTimeRemaining(),
      bluePercent: score.bluePercent,
      redPercent: score.redPercent,
      blueOwnedTiles: score.blueTiles,
      redOwnedTiles: score.redTiles,
      totalTiles: score.totalTiles,
      blueEnergy: this.energyManager.getEnergy('blue'),
      redEnergy: this.energyManager.getEnergy('red'),
      maxEnergy: this.energyManager.getMaxEnergy(),
      playerHand: this.cardBattleManager.getHand(),
      nextCard: this.cardBattleManager.getNextCard(),
      units: [...this.units],
      projectiles: [...this.projectiles],
      particles: [...this.particles],
      floatingTexts: [...this.floatingTexts],
      winner: this.winner,
      matchResultClaimId: this.matchResultClaimId,
      rewardCoins: this.rewardCoins,
    };
  }

  // -------------------------------------------------------------
  // Match Lifecycle
  // -------------------------------------------------------------
  public startMatch(level: LevelConfig, playerDeck: Card[]) {
    this.currentLevel = level;
    this.phase = 'Countdown';
    this.countdownTimer = 3.0;
    this.winner = null;
    this.matchResultClaimId = null;
    this.rewardCoins = 0;

    // Reset systems
    this.arenaGrid.resetGrid();
    this.territoryManager.recalculateTotals();
    this.energyManager.reset(5.0);
    this.cardBattleManager.initDeck(playerDeck);
    this.battleTimer.reset(180);
    this.battleAI.initAIDeck();
    this.battleAI.setDifficultyInterval(level.opponentAiInterval ? level.opponentAiInterval / 1000 : 1.6);

    this.units = [];
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];

    // Pre-spawn enemy defensive units from level config if configured
    if (level.initialEnemyUnits && level.initialEnemyUnits.length > 0) {
      level.initialEnemyUnits.forEach((cfg) => {
        const cData = ALL_CARDS[cfg.cardId];
        if (cData) {
          this.units.push({
            id: `enemy_init_${cfg.cardId}_${Math.random()}`,
            team: 'red',
            cardId: cfg.cardId,
            x: cfg.x,
            y: cfg.y,
            hp: cData.hp,
            maxHp: cData.hp,
            shieldHp: cData.passive?.shieldValue ?? 0,
            maxShieldHp: cData.passive?.shieldValue ?? 0,
            speedMultiplier: cData.passive?.speedFactor ?? 1.0,
            level: level.level,
            angle: Math.PI / 2,
            shootCooldown: cData.fireRate,
            barrelRecoil: 0,
            totalShotsFired: 0,
            targetUnitId: null,
            passive: cData.passive,
            isDead: false,
          });
        }
      });
    }

    this.emitEvent({
      id: `match_start_${Date.now()}`,
      type: 'match_event',
      text: `Sector ${level.level}: ${level.name}`,
      subtext: 'Clash begins!',
      team: 'neutral',
      timestamp: Date.now(),
      icon: '⚔️',
    });

    this.notifySnapshot();
  }

  public setPaused(paused: boolean) {
    this.battleTimer.setPaused(paused);
    this.notifySnapshot();
  }

  // -------------------------------------------------------------
  // Player Card Deployment
  // -------------------------------------------------------------
  public deployPlayerCard(cardId: CardType, gridX: number, gridY: number): boolean {
    if (this.phase !== 'Playing') {
      return false;
    }

    const deployResult = this.cardBattleManager.validateAndDeploy(cardId, 'blue', gridX, gridY);
    if (!deployResult.success || !deployResult.card) {
      return false;
    }

    const card = deployResult.card;

    // Special projectile cards (Buzzsaw, Laser)
    if (card.id === 'saw') {
      sounds.playSawBlade();
      this.territoryManager.paintRadial(gridX, gridY, 2.0, 'blue');
      this.projectiles.push({
        id: `blue_saw_${Date.now()}`,
        team: 'blue',
        type: 'saw',
        x: gridX,
        y: gridY,
        vx: 0,
        vy: -0.38, // Shoots straight up towards red territory
        startX: gridX,
        startY: gridY,
        targetX: gridX,
        targetY: 0,
        paintRadius: 2.2,
        damage: card.damage,
        life: 180,
        maxLife: 180,
        rotation: -Math.PI / 2,
      });

      this.emitEvent({
        id: `saw_${Date.now()}`,
        type: 'saw_launch',
        text: 'Blue Buzzsaw Launched!',
        subtext: 'Linear lane pierce',
        team: 'blue',
        timestamp: Date.now(),
        icon: '🪚',
      });
    } else {
      sounds.playCardDeploy();
      this.units.push({
        id: `blue_unit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        team: 'blue',
        cardId: card.id,
        x: gridX,
        y: gridY,
        hp: card.hp,
        maxHp: card.hp,
        shieldHp: card.passive?.shieldValue ?? 0,
        maxShieldHp: card.passive?.shieldValue ?? 0,
        speedMultiplier: card.passive?.speedFactor ?? 1.0,
        level: card.level,
        angle: -Math.PI / 2, // Facing upwards towards enemy base
        shootCooldown: card.fireRate,
        barrelRecoil: 0,
        totalShotsFired: 0,
        targetUnitId: null,
        passive: card.passive,
        isDead: false,
      });
    }

    this.notifySnapshot();
    return true;
  }

  // -------------------------------------------------------------
  // Authoritative Fixed 60Hz Tick
  // -------------------------------------------------------------
  public tick(deltaSec: number = 0.0166) {
    if (this.battleTimer.getIsPaused()) return;

    if (this.phase === 'Countdown') {
      this.countdownTimer -= deltaSec;
      if (this.countdownTimer <= 0) {
        this.phase = 'Playing';
        sounds.playFightStart();
      }
      this.notifySnapshot();
      return;
    }

    if (this.phase !== 'Playing') return;

    // 1. Regenerate Energy (Only during Playing phase!)
    this.energyManager.update(deltaSec, true);

    // 2. Update Match Timer
    const timeRanOut = this.battleTimer.update(deltaSec);

    // 3. Update Units Movement (Rollers)
    this.movementSystem.updateUnitsMovement(this.units, deltaSec);

    // 4. Update Combat, Aiming & Projectiles
    const combatEvents = this.combatSystem.updateUnitCombat(this.units, this.projectiles, deltaSec);
    const projectileEvents = this.combatSystem.updateProjectiles(this.projectiles, this.units);

    // Process particles & battle events
    [...combatEvents.events, ...projectileEvents.events].forEach((evt) => this.emitEvent(evt));
    this.particles = [
      ...this.particles,
      ...combatEvents.newParticles,
      ...projectileEvents.newParticles,
    ];
    this.floatingTexts = [
      ...this.floatingTexts,
      ...combatEvents.newFloatingTexts,
      ...projectileEvents.newFloatingTexts,
    ];

    // Clean up expired particles & floating text
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].x += this.particles[i].vx;
      this.particles[i].y += this.particles[i].vy;
      this.particles[i].life--;
      this.particles[i].alpha = this.particles[i].life / this.particles[i].maxLife;
      if (this.particles[i].life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      this.floatingTexts[i].y -= 0.02;
      this.floatingTexts[i].life--;
      this.floatingTexts[i].alpha = this.floatingTexts[i].life / this.floatingTexts[i].maxLife;
      if (this.floatingTexts[i].life <= 0) this.floatingTexts.splice(i, 1);
    }

    // 5. Update Battle AI (AI deploys with real energy & legal rules)
    this.battleAI.update(deltaSec, this.units, this.projectiles);

    // 6. Check Win / Loss / Overtime Conditions
    const score = this.territoryManager.getScore();

    // Instant Dominance (99% or higher)
    if (score.bluePercent >= 99) {
      this.resolveMatch('victory');
      return;
    } else if (score.redPercent >= 99) {
      this.resolveMatch('defeat');
      return;
    }

    // Time expired resolution
    if (timeRanOut) {
      if (score.bluePercent > score.redPercent) {
        this.resolveMatch('victory');
      } else if (score.redPercent > score.bluePercent) {
        this.resolveMatch('defeat');
      } else {
        // Sudden-death Golden Goal Overtime (+30 seconds!)
        this.battleTimer.addOvertime(30);
        this.emitEvent({
          id: `ot_${Date.now()}`,
          type: 'match_event',
          text: 'Sudden Death Overtime',
          subtext: '+30s Golden Goal',
          team: 'neutral',
          timestamp: Date.now(),
          icon: '⏱️',
        });
      }
    }

    this.notifySnapshot();
  }

  // -------------------------------------------------------------
  // Authoritative Match Resolution & Reward Generation
  // -------------------------------------------------------------
  private resolveMatch(result: 'victory' | 'defeat' | 'draw') {
    if (this.phase === 'Victory' || this.phase === 'Defeat' || this.phase === 'Draw') return;

    this.phase = result === 'victory' ? 'Victory' : result === 'defeat' ? 'Defeat' : 'Draw';
    this.winner = result === 'victory' ? 'blue' : result === 'defeat' ? 'red' : 'draw';

    const config = economyConfigService.get();
    const rules = config.battle;
    const score = this.territoryManager.getScore();
    const levelIndex = this.currentLevel?.level || 1;
    const timeBonus = this.battleTimer.getTimeRemaining();

    let coinsGranted = 0;
    if (result === 'victory') {
      sounds.playVictory();
      const base = rules.winBaseCoins + levelIndex * rules.winCoinsPerLevel;
      const speedBonus = Math.min(rules.speedBonusMaxCoins, Math.round(timeBonus * 0.15));
      const cleanSweep = score.bluePercent >= rules.cleanSweepTerritoryThreshold ? rules.cleanSweepBonusCoins : 0;
      coinsGranted = base + speedBonus + cleanSweep;

      const claimId = currencyService.generateClaimId(`match_win_lvl_${levelIndex}`);
      this.matchResultClaimId = claimId;
      this.rewardCoins = coinsGranted;

      // Authoritative credit to wallet
      currencyService.creditCoins(
        coinsGranted,
        'reward_battle',
        claimId,
        `Sector ${levelIndex} Victory (+${speedBonus}s speed bonus)`,
        'battle_victory'
      );
    } else {
      sounds.playDefeat();
      coinsGranted = rules.defeatBaseCoins + levelIndex * rules.defeatCoinsPerLevel;
      const claimId = currencyService.generateClaimId(`match_defeat_lvl_${levelIndex}`);
      this.matchResultClaimId = claimId;
      this.rewardCoins = coinsGranted;

      currencyService.creditCoins(
        coinsGranted,
        'reward_battle',
        claimId,
        `Sector ${levelIndex} Participation Reward`,
        'battle_defeat'
      );
    }

    this.notifySnapshot();
  }

  private notifySnapshot() {
    const snap = this.getSnapshot();
    this.snapshotListeners.forEach((fn) => fn(snap));
  }

  // Getters for subsystems
  public getArenaGrid(): ArenaGrid {
    return this.arenaGrid;
  }
  public getTerritoryManager(): TerritoryManager {
    return this.territoryManager;
  }
  public getEnergyManager(): EnergyManager {
    return this.energyManager;
  }
}

export const battleSimulation = new BattleSimulation();
