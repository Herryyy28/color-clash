/**
 * Authoritative Battle Simulation Types & Contracts for Color Clash
 */

import { CardType, Team, PassiveAbility, Card } from '../types';

export type BattlePhase =
  | 'Initializing'
  | 'Countdown'
  | 'Playing'
  | 'Resolving'
  | 'Victory'
  | 'Defeat'
  | 'Draw'
  | 'Results';

export interface GridCoord {
  x: number;
  y: number;
}

export interface TileState {
  id: string;
  x: number;
  y: number;
  owner: Team;
  paintIntensity: number; // 0.0 to 1.0
  lastPaintedAt: number;
}

export interface UnitRuntime {
  id: string;
  team: Team;
  cardId: CardType;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  shieldHp: number;
  maxShieldHp: number;
  speedMultiplier: number;
  level: number;
  angle: number; // radians
  shootCooldown: number;
  barrelRecoil: number; // 0 to 1
  totalShotsFired: number;
  targetUnitId: string | null;
  passive?: PassiveAbility;
  isDead: boolean;
}

export interface ProjectileRuntime {
  id: string;
  team: Team;
  type: 'bullet' | 'cannonball' | 'mortar' | 'saw' | 'laser_beam';
  x: number;
  y: number;
  vx: number;
  vy: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  paintRadius: number;
  damage: number;
  life: number;
  maxLife: number;
  rotation: number;
  width?: number;
}

export interface ParticleEffect {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  shape: 'circle' | 'square' | 'ring';
}

export interface FloatingNotification {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface BattleSnapshot {
  phase: BattlePhase;
  matchTimeRemaining: number;
  bluePercent: number;
  redPercent: number;
  blueOwnedTiles: number;
  redOwnedTiles: number;
  totalTiles: number;
  blueEnergy: number;
  redEnergy: number;
  maxEnergy: number;
  playerHand: Card[];
  nextCard: Card;
  units: UnitRuntime[];
  projectiles: ProjectileRuntime[];
  particles: ParticleEffect[];
  floatingTexts: FloatingNotification[];
  winner: Team | 'draw' | null;
  matchResultClaimId: string | null;
  rewardCoins: number;
}

export interface BattleDeployCommand {
  cardId: CardType;
  team: Team;
  targetX: number;
  targetY: number;
  timestamp: number;
}

export interface BattleEventLog {
  id: string;
  type: 'turret_destroyed' | 'territory_captured' | 'saw_launch' | 'special_deploy' | 'match_event';
  text: string;
  subtext?: string;
  team: Team | 'neutral';
  timestamp: number;
  icon?: string;
}
