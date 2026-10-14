/**
 * Authoritative Sector & Realm Progression Manager for Color Clash
 * Defines all battle realms, trophy requirements, difficulty tiers,
 * arena theme palettes, opponent AI decks, and sector rewards.
 */

import { SectorConfig, CardType } from '../types';
export type { SectorConfig };

export const SECTORS: SectorConfig[] = [
  {
    level: 1,
    sectorId: 1,
    name: 'Training Grounds',
    subtitle: 'Greenfield Outpost',
    description: 'A peaceful sunlit training meadow where aspiring commanders learn unit deployment and territory capture.',
    requiredTrophies: 0,
    difficulty: 'beginner',
    difficultyLabel: 'Beginner',
    difficultyColor: '#79B957',
    recommendedStrength: 200,
    opponentName: 'Scout Cadet Pip',
    opponentTrophies: 5,
    opponentAiInterval: 5000,
    arenaTheme: {
      name: 'Emerald Meadow',
      primaryColor: '#79B957',
      accentColor: '#FFC83D',
      bannerGradient: 'from-[#79B957] via-[#5e9e3c] to-[#17345D]',
      icon: '🌱',
    },
    opponentProfile: {
      name: 'Scout Cadet Pip',
      title: 'Novice Recruit',
      avatarId: 'red_trainer',
      trophies: 5,
      deckCardIds: ['blaster', 'roller', 'cannon'],
      cardLevel: 1,
    },
    rewards: {
      coins: 35,
      cubes: 1000,
      chestTier: 'wooden',
      chestName: 'Wooden Supply Chest',
      firstClearBonus: {
        coins: 50,
        gems: 5,
        label: 'Sector 1 First Clear Bonus',
      },
    },
    rewardCoins: 35,
    rewardCubes: 1000,
    initialEnemyUnits: [], // Beginner protection: zero pre-spawned cannons bombarding newcomers!
    tutorialTip: 'Welcome Commander! Paint the flagstones BLUE by deploying units! Hold the majority territory to claim the Crown.',
  },
  {
    level: 2,
    sectorId: 2,
    name: 'Forest Arena',
    subtitle: 'Stonebridge Crossing',
    description: 'A fortified stone crossing over rapid river waters guarded by Crimson patrol squads.',
    requiredTrophies: 25,
    difficulty: 'easy',
    difficultyLabel: 'Easy',
    difficultyColor: '#38bdf8',
    recommendedStrength: 320,
    opponentName: 'Baron Von Crimson',
    opponentTrophies: 28,
    opponentAiInterval: 3800,
    arenaTheme: {
      name: 'Cobblestone River',
      primaryColor: '#0284c7',
      accentColor: '#38bdf8',
      bannerGradient: 'from-[#0284c7] via-[#1769D2] to-[#17345D]',
      icon: '🌉',
    },
    opponentProfile: {
      name: 'Baron Von Crimson',
      title: 'Frontier Sentry',
      avatarId: 'red_trainer',
      trophies: 28,
      deckCardIds: ['blaster', 'cannon', 'gatling', 'roller'],
      cardLevel: 1,
    },
    rewards: {
      coins: 55,
      cubes: 1400,
      chestTier: 'silver',
      chestName: 'Silver Knight Chest',
      firstClearBonus: {
        coins: 75,
        gems: 10,
        label: 'Sector 2 First Clear Bonus',
      },
    },
    rewardCoins: 55,
    rewardCubes: 1400,
    initialEnemyUnits: [
      { cardId: 'cannon', x: 13, y: 3 },
    ],
    tutorialTip: 'Enemy defenses sighted! Use your Whirlwind Blade to slice across lanes and ink distant territory.',
  },
  {
    level: 3,
    sectorId: 3,
    name: 'Royal Outpost',
    subtitle: 'Whispering Woods',
    description: 'Deep woodland fortress where Crimson archers and catapults hold the royal frontier.',
    requiredTrophies: 60,
    difficulty: 'normal',
    difficultyLabel: 'Normal',
    difficultyColor: '#f59e0b',
    recommendedStrength: 450,
    opponentName: 'Sergeant Ironbark',
    opponentTrophies: 70,
    opponentAiInterval: 3000,
    arenaTheme: {
      name: 'Autumn Glade',
      primaryColor: '#d97706',
      accentColor: '#fbbf24',
      bannerGradient: 'from-[#d97706] via-[#b45309] to-[#17345D]',
      icon: '🌲',
    },
    opponentProfile: {
      name: 'Sergeant Ironbark',
      title: 'Garrison Commander',
      avatarId: 'red_trainer',
      trophies: 70,
      deckCardIds: ['blaster', 'cannon', 'gatling', 'saw', 'roller'],
      cardLevel: 1,
    },
    rewards: {
      coins: 85,
      cubes: 1900,
      chestTier: 'gold',
      chestName: 'Royal Gold Chest',
      firstClearBonus: {
        coins: 120,
        gems: 15,
        label: 'Sector 3 First Clear Bonus',
      },
    },
    rewardCoins: 85,
    rewardCubes: 1900,
    initialEnemyUnits: [
      { cardId: 'gatling', x: 4, y: 4 },
      { cardId: 'cannon', x: 11, y: 4 },
    ],
    tutorialTip: 'Deploy Alchemist Trebuchet to lob paint flasks over barricades into hostile red territory.',
  },
  {
    level: 4,
    sectorId: 4,
    name: 'Crystal Fortress',
    subtitle: 'Castle Ramparts',
    description: 'Imposing mountain bastions reinforced by arcane leyline crystals and heavy artillery.',
    requiredTrophies: 120,
    difficulty: 'hard',
    difficultyLabel: 'Hard',
    difficultyColor: '#ec4899',
    recommendedStrength: 600,
    opponentName: 'General Crimson',
    opponentTrophies: 135,
    opponentAiInterval: 2400,
    arenaTheme: {
      name: 'Arcane Bastion',
      primaryColor: '#db2777',
      accentColor: '#f472b6',
      bannerGradient: 'from-[#db2777] via-[#9d174d] to-[#17345D]',
      icon: '🔮',
    },
    opponentProfile: {
      name: 'General Crimson',
      title: 'Imperial Vanguard',
      avatarId: 'red_trainer',
      trophies: 135,
      deckCardIds: ['blaster', 'cannon', 'mortar', 'laser', 'saw'],
      cardLevel: 2,
    },
    rewards: {
      coins: 130,
      cubes: 2500,
      chestTier: 'magical',
      chestName: 'Magical Leyline Chest',
      firstClearBonus: {
        coins: 180,
        gems: 25,
        label: 'Sector 4 First Clear Bonus',
      },
    },
    rewardCoins: 130,
    rewardCubes: 2500,
    initialEnemyUnits: [
      { cardId: 'mortar', x: 8, y: 3 },
      { cardId: 'gatling', x: 3, y: 5 },
    ],
  },
  {
    level: 5,
    sectorId: 5,
    name: "Champion's Citadel",
    subtitle: 'Dragonfire Peak',
    description: 'The volcanic peak where elite Crimson champions duel for imperial supremacy.',
    requiredTrophies: 200,
    difficulty: 'expert',
    difficultyLabel: 'Expert',
    difficultyColor: '#F04452',
    recommendedStrength: 750,
    opponentName: 'Emperor of Red',
    opponentTrophies: 220,
    opponentAiInterval: 1800,
    arenaTheme: {
      name: 'Molten Sanctum',
      primaryColor: '#e11d48',
      accentColor: '#f43f5e',
      bannerGradient: 'from-[#e11d48] via-[#9f1239] to-[#17345D]',
      icon: '🌋',
    },
    opponentProfile: {
      name: 'Emperor of Red',
      title: 'Realm Sovereign',
      avatarId: 'red_trainer',
      trophies: 220,
      deckCardIds: ['blaster', 'cannon', 'mortar', 'laser', 'saw', 'roller'],
      cardLevel: 2,
    },
    rewards: {
      coins: 180,
      cubes: 3600,
      chestTier: 'magical',
      chestName: 'Imperial Dragon Chest',
      firstClearBonus: {
        coins: 250,
        gems: 40,
        label: 'Sector 5 First Clear Bonus',
      },
    },
    rewardCoins: 180,
    rewardCubes: 3600,
    initialEnemyUnits: [
      { cardId: 'cannon', x: 3, y: 3 },
      { cardId: 'mortar', x: 8, y: 2 },
      { cardId: 'cannon', x: 12, y: 3 },
    ],
  },
  {
    level: 6,
    sectorId: 6,
    name: 'Sovereign Throne',
    subtitle: 'Royal Colosseum',
    description: 'The pinnacle arena above the clouds where only legendary masters compete for eternal glory.',
    requiredTrophies: 320,
    difficulty: 'expert',
    difficultyLabel: 'Grandmaster',
    difficultyColor: '#FFC83D',
    recommendedStrength: 900,
    opponentName: 'Grand Sovereign Ignis',
    opponentTrophies: 340,
    opponentAiInterval: 1400,
    arenaTheme: {
      name: 'Golden Apex',
      primaryColor: '#d97706',
      accentColor: '#FFC83D',
      bannerGradient: 'from-[#d97706] via-[#92400e] to-[#17345D]',
      icon: '👑',
    },
    opponentProfile: {
      name: 'Grand Sovereign Ignis',
      title: 'Grandmaster Champion',
      avatarId: 'red_trainer',
      trophies: 340,
      deckCardIds: ['blaster', 'cannon', 'mortar', 'laser', 'saw', 'roller', 'gatling'],
      cardLevel: 3,
    },
    rewards: {
      coins: 260,
      cubes: 5000,
      chestTier: 'magical',
      chestName: 'Sovereign Crown Chest',
      firstClearBonus: {
        coins: 400,
        gems: 60,
        label: 'Sector 6 First Clear Bonus',
      },
    },
    rewardCoins: 260,
    rewardCubes: 5000,
    initialEnemyUnits: [
      { cardId: 'cannon', x: 2, y: 3 },
      { cardId: 'laser', x: 8, y: 2 },
      { cardId: 'cannon', x: 13, y: 3 },
    ],
  },
];

export const sectorManager = {
  getAllSectors(): SectorConfig[] {
    return SECTORS;
  },

  getSectorById(sectorId: number): SectorConfig {
    const found = SECTORS.find((s) => s.sectorId === sectorId);
    return found || SECTORS[0];
  },

  getSectorByIndex(index: number): SectorConfig {
    return SECTORS[index] || SECTORS[0];
  },

  isSectorUnlocked(sectorId: number, playerTrophies: number): boolean {
    const sector = this.getSectorById(sectorId);
    return playerTrophies >= sector.requiredTrophies;
  },

  /**
   * Recommends the optimal sector for the player based on current trophies and deck rating
   */
  getRecommendedSector(playerTrophies: number, deckRating: number): SectorConfig {
    // Filter to unlocked sectors
    const unlocked = SECTORS.filter((s) => playerTrophies >= s.requiredTrophies);
    if (unlocked.length === 0) return SECTORS[0];

    // Pick highest unlocked that matches player progression
    // If player has high deck strength, nudge towards higher unlocked
    return unlocked[unlocked.length - 1];
  },

  getNextLockedSector(playerTrophies: number): SectorConfig | null {
    const locked = SECTORS.filter((s) => playerTrophies < s.requiredTrophies);
    return locked.length > 0 ? locked[0] : null;
  },
};
