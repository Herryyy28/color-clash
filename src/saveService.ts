import { CardType, PlayerProfile, CardInventoryItem, ChestSlot } from './types';
export type { PlayerProfile, CardInventoryItem, ChestSlot };

export interface SavedGameData {
  version: number;
  playerProfile: PlayerProfile;
  inventory: Record<CardType, CardInventoryItem>;
  activeDeckCardIds: CardType[];
  chestSlots: ChestSlot[];
  currentLevelIndex: number;
  isMuted: boolean;
  hasFreeSpin: boolean;
  lastSpinTimestamp?: number;
}

const SAVE_KEY = 'color_clash_save_data_v2';

export const DEFAULT_PROFILE: PlayerProfile = {
  name: 'Arena Challenger',
  avatarId: 'commander',
  level: 1,
  exp: 0,
  maxExp: 100,
  trophies: 0,
  coins: 650,
  gems: 30,
  cubes: 200,
  isVip: false,
  skillRating: 350,
  highestSectorUnlocked: 1,
  matchesPlayed: 0,
  wins: 0,
  losses: 0,
  recentResults: [],
  difficultyAdjustment: 0,
  clearedSectors: [],
};

export const DEFAULT_INVENTORY: Record<CardType, CardInventoryItem> = {
  blaster: { id: 'blaster', level: 1, cards: 15, cardsRequired: 10, upgradeCost: 100 },
  cannon: { id: 'cannon', level: 1, cards: 12, cardsRequired: 10, upgradeCost: 100 },
  gatling: { id: 'gatling', level: 1, cards: 8, cardsRequired: 10, upgradeCost: 150 },
  saw: { id: 'saw', level: 1, cards: 4, cardsRequired: 10, upgradeCost: 200 },
  roller: { id: 'roller', level: 1, cards: 5, cardsRequired: 10, upgradeCost: 150 },
  mortar: { id: 'mortar', level: 1, cards: 2, cardsRequired: 10, upgradeCost: 250 },
  laser: { id: 'laser', level: 1, cards: 3, cardsRequired: 10, upgradeCost: 200 },
};

export const DEFAULT_CHEST_SLOTS: ChestSlot[] = [
  {
    id: 'slot-1',
    name: 'Silver Crate',
    tier: 'silver',
    unlockDurationSeconds: 15,
    unlockStartedAt: null,
    isOpened: false,
    coinsReward: 150,
    gemsReward: 5,
    cardsReward: 8,
  },
  {
    id: 'slot-2',
    name: 'Wooden Chest',
    tier: 'wooden',
    unlockDurationSeconds: 10,
    unlockStartedAt: null,
    isOpened: false,
    coinsReward: 80,
    gemsReward: 2,
    cardsReward: 4,
  },
  {
    id: 'slot-3',
    name: 'Empty Slot',
    tier: 'wooden',
    unlockDurationSeconds: 0,
    unlockStartedAt: null,
    isOpened: true,
    coinsReward: 0,
    gemsReward: 0,
    cardsReward: 0,
  },
  {
    id: 'slot-4',
    name: 'Gold Chest',
    tier: 'gold',
    unlockDurationSeconds: 25,
    unlockStartedAt: null,
    isOpened: false,
    coinsReward: 350,
    gemsReward: 12,
    cardsReward: 15,
  },
];

export const FREE_SPIN_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export interface FreeSpinStatus {
  hasFreeSpin: boolean;
  canSpin: boolean;
  remainingMs: number;
  nextAvailableTimestamp: number;
  lastSpinTimestamp?: number;
}

// In-memory fallback store when localStorage is unavailable
let memoryStore: Record<string, string> = {};

function getStorageItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {}
  return memoryStore[key] ?? null;
}

function setStorageItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return;
    }
  } catch {}
  memoryStore[key] = value;
}

function removeStorageItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      return;
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
      return;
    }
  } catch {}
  delete memoryStore[key];
}

export const saveService = {
  /**
   * Safely calculates free spin status, handling missing, future, and malformed timestamps
   */
  calculateFreeSpinStatus(savedTimestamp?: number, now: number = Date.now()): FreeSpinStatus {
    if (typeof savedTimestamp !== 'number' || isNaN(savedTimestamp) || savedTimestamp <= 0) {
      // No previous spin recorded or malformed timestamp -> grant free spin
      return {
        hasFreeSpin: true,
        canSpin: true,
        remainingMs: 0,
        nextAvailableTimestamp: now,
      };
    }

    // Future timestamp protection (clock tampering or timezone shift > 1 minute into future)
    if (savedTimestamp > now + 60000) {
      console.warn('[SaveService] Future spin timestamp detected; resetting cooldown safely');
      return {
        hasFreeSpin: false,
        canSpin: false,
        remainingMs: FREE_SPIN_COOLDOWN_MS,
        nextAvailableTimestamp: now + FREE_SPIN_COOLDOWN_MS,
        lastSpinTimestamp: now,
      };
    }

    const elapsed = now - savedTimestamp;
    if (elapsed >= FREE_SPIN_COOLDOWN_MS) {
      return {
        hasFreeSpin: true,
        canSpin: true,
        remainingMs: 0,
        nextAvailableTimestamp: now,
        lastSpinTimestamp: savedTimestamp,
      };
    }

    const remainingMs = Math.max(0, FREE_SPIN_COOLDOWN_MS - elapsed);
    return {
      hasFreeSpin: false,
      canSpin: false,
      remainingMs,
      nextAvailableTimestamp: savedTimestamp + FREE_SPIN_COOLDOWN_MS,
      lastSpinTimestamp: savedTimestamp,
    };
  },

  load(): SavedGameData {
    try {
      const raw = getStorageItem(SAVE_KEY);
      if (!raw) {
        return {
          version: 1,
          playerProfile: DEFAULT_PROFILE,
          inventory: DEFAULT_INVENTORY,
          activeDeckCardIds: ['blaster', 'cannon', 'gatling', 'saw'],
          chestSlots: DEFAULT_CHEST_SLOTS,
          currentLevelIndex: 0,
          isMuted: false,
          hasFreeSpin: true,
        };
      }
      const data: Partial<SavedGameData> = JSON.parse(raw);

      // Validate spin timestamp safely
      const spinStatus = this.calculateFreeSpinStatus(data.lastSpinTimestamp);

      return {
        version: data.version || 1,
        playerProfile: { ...DEFAULT_PROFILE, ...data.playerProfile },
        inventory: { ...DEFAULT_INVENTORY, ...data.inventory },
        activeDeckCardIds: data.activeDeckCardIds?.length === 4 ? data.activeDeckCardIds : ['blaster', 'cannon', 'gatling', 'saw'],
        chestSlots: Array.isArray(data.chestSlots) ? data.chestSlots : DEFAULT_CHEST_SLOTS,
        currentLevelIndex: typeof data.currentLevelIndex === 'number' ? data.currentLevelIndex : 0,
        isMuted: Boolean(data.isMuted),
        hasFreeSpin: spinStatus.hasFreeSpin,
        lastSpinTimestamp: spinStatus.lastSpinTimestamp,
      };
    } catch (e) {
      console.warn('Failed to load saved state, falling back to defaults:', e);
      return {
        version: 1,
        playerProfile: DEFAULT_PROFILE,
        inventory: DEFAULT_INVENTORY,
        activeDeckCardIds: ['blaster', 'cannon', 'gatling', 'saw'],
        chestSlots: DEFAULT_CHEST_SLOTS,
        currentLevelIndex: 0,
        isMuted: false,
        hasFreeSpin: true,
      };
    }
  },

  save(data: Partial<SavedGameData>): void {
    try {
      const current = this.load();
      const updated: SavedGameData = {
        ...current,
        ...data,
      };
      setStorageItem(SAVE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  },

  reset(): void {
    try {
      removeStorageItem(SAVE_KEY);
      memoryStore = {};
    } catch (e) {
      console.warn('Failed to reset save:', e);
    }
  },
};
