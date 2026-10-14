/**
 * Types for Color Clash game
 */

export type Team = 'blue' | 'red';

export interface Tile {
  team: Team | 'neutral';
  paintValue: number; // 0 to 1 intensity
  lastPaintedAt: number;
}

export type CardType = 'blaster' | 'cannon' | 'saw' | 'mortar' | 'gatling' | 'laser' | 'roller';

export type PassiveAbilityType = 'speed_boost' | 'shielding' | 'rapid_overcharge' | 'territory_surge';

export interface PassiveAbility {
  type: PassiveAbilityType;
  name: string;
  icon: string;
  description: string;
  shieldValue?: number; // for shielding structures
  speedFactor?: number; // for speed boost
}

export interface Card {
  id: CardType;
  name: string;
  cost: number;
  description: string;
  icon: string;
  damage: number;
  fireRate: number; // seconds between shots
  range: number; // grid units
  paintRadius: number; // tile radius of paint
  hp: number;
  level: number;
  color: string;
  passive?: PassiveAbility;
}

export interface Unit {
  id: string;
  team: Team;
  cardId: CardType;
  x: number; // grid coordinate X
  y: number; // grid coordinate Y
  hp: number;
  maxHp: number;
  shieldHp: number;
  maxShieldHp: number;
  speedMultiplier: number;
  level: number;
  angle: number; // radians
  shootCooldown: number;
  barrelRecoil: number; // 0 to 1 for visual kickback
  totalShotsFired: number;
  passive?: PassiveAbility;
  shieldFlashTimer?: number;
}

export interface Projectile {
  id: string;
  team: Team;
  type: 'bullet' | 'cannonball' | 'mortar' | 'saw' | 'laser_beam';
  x: number; // grid X
  y: number; // grid Y
  vx: number;
  vy: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  arcProgress?: number; // 0 to 1 for parabolic mortar
  paintRadius: number;
  damage: number;
  life: number;
  maxLife: number;
  rotation: number;
  width?: number;
}

export interface Particle {
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

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface Emote {
  id: string;
  emoji: string;
  team: Team;
  x: number;
  y: number;
  createdAt: number;
}

export interface LevelConfig {
  level: number;
  name: string;
  opponentName: string;
  opponentTrophies: number;
  opponentAiInterval: number; // ms between enemy plays
  initialEnemyUnits?: Array<{ cardId: CardType; x: number; y: number }>;
  tutorialTip?: string;
  rewardCubes: number;
  rewardCoins: number;
}

export type NavTab = 'battle' | 'cards' | 'shop' | 'spin' | 'settings';

export interface ChestSlot {
  id: string;
  name: string;
  tier: 'wooden' | 'silver' | 'gold' | 'magical';
  unlockDurationSeconds: number;
  unlockStartedAt: number | null; // timestamp or null if locked
  isOpened: boolean;
  coinsReward: number;
  gemsReward: number;
  cardsReward: number;
}

export interface CardInventoryItem {
  id: CardType;
  level: number;
  cards: number;
  cardsRequired: number;
  upgradeCost: number;
}

export interface SpinReward {
  id: string;
  type: 'coins' | 'gems' | 'cards' | 'chest';
  amount: number;
  label: string;
  icon: string;
  color: string;
}

export type AIDifficultyLevel = 'beginner' | 'easy' | 'normal' | 'hard' | 'expert';

export interface SectorConfig extends LevelConfig {
  sectorId: number;
  subtitle: string;
  description: string;
  requiredTrophies: number;
  difficulty: AIDifficultyLevel;
  difficultyLabel: string;
  difficultyColor: string;
  recommendedStrength: number;
  arenaTheme: {
    name: string;
    primaryColor: string;
    accentColor: string;
    bannerGradient: string;
    icon: string;
  };
  opponentProfile: {
    name: string;
    title: string;
    avatarId: string;
    trophies: number;
    deckCardIds: CardType[];
    cardLevel: number;
  };
  rewards: {
    coins: number;
    cubes: number;
    chestTier: 'wooden' | 'silver' | 'gold' | 'magical';
    chestName: string;
    firstClearBonus?: {
      coins: number;
      gems: number;
      label: string;
    };
  };
}

export interface PlayerProfile {
  name: string;
  avatarId?: string;
  isVip?: boolean;
  level: number;
  exp: number;
  maxExp: number;
  trophies: number;
  coins: number;
  gems: number;
  cubes?: number;
  matchesPlayed?: number;
  wins?: number;
  losses?: number;
  recentResults?: ('win' | 'loss')[];
  skillRating?: number;
  highestSectorUnlocked?: number;
  difficultyAdjustment?: number;
  clearedSectors?: number[];
}

export type BattleEventType =
  | 'turret_destroyed'
  | 'territory_captured'
  | 'saw_launch'
  | 'special_deploy'
  | 'match_event';

export interface BattleEvent {
  id: string;
  type: BattleEventType;
  text: string;
  subtext?: string;
  team: Team | 'neutral';
  timestamp: number;
  icon?: string;
}

