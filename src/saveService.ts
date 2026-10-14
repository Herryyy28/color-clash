import { PlayerProfile, CardInventoryItem, CardType, ChestSlot, Card } from './types';
import { ALL_CARDS } from './cardsData';

const SAVE_KEY = 'color_clash_save_v1';

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

const DEFAULT_PROFILE: PlayerProfile = {
  name: 'Commander',
  avatarId: 'kid_headphones',
  isVip: false,
  level: 3,
  exp: 280,
  maxExp: 500,
  trophies: 35,
  coins: 650,
  gems: 95,
};

const DEFAULT_INVENTORY: Record<CardType, CardInventoryItem> = {
  blaster: { id: 'blaster', level: 1, cards: 10, cardsRequired: 10, upgradeCost: 50 },
  cannon: { id: 'cannon', level: 1, cards: 6, cardsRequired: 10, upgradeCost: 50 },
  saw: { id: 'saw', level: 1, cards: 4, cardsRequired: 10, upgradeCost: 50 },
  mortar: { id: 'mortar', level: 1, cards: 8, cardsRequired: 10, upgradeCost: 50 },
  gatling: { id: 'gatling', level: 1, cards: 3, cardsRequired: 10, upgradeCost: 50 },
  laser: { id: 'laser', level: 1, cards: 2, cardsRequired: 10, upgradeCost: 80 },
  roller: { id: 'roller', level: 1, cards: 5, cardsRequired: 10, upgradeCost: 50 },
};

const DEFAULT_CHEST_SLOTS: ChestSlot[] = [
  {
    id: 'slot-1',
    name: 'Silver Chest',
    tier: 'silver',
    unlockDurationSeconds: 12,
    unlockStartedAt: Date.now() - 4000,
    isOpened: false,
    coinsReward: 180,
    gemsReward: 6,
    cardsReward: 8,
  },
  {
    id: 'slot-2',
    name: 'Gold Chest',
    tier: 'gold',
    unlockDurationSeconds: 60,
    unlockStartedAt: null,
    isOpened: false,
    coinsReward: 420,
    gemsReward: 15,
    cardsReward: 18,
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
    name: 'Wooden Chest',
    tier: 'wooden',
    unlockDurationSeconds: 8,
    unlockStartedAt: null,
    isOpened: false,
    coinsReward: 95,
    gemsReward: 2,
    cardsReward: 4,
  },
];

export const saveService = {
  load(): SavedGameData {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
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
      return {
        version: data.version || 1,
        playerProfile: { ...DEFAULT_PROFILE, ...data.playerProfile },
        inventory: { ...DEFAULT_INVENTORY, ...data.inventory },
        activeDeckCardIds: data.activeDeckCardIds?.length === 4 ? data.activeDeckCardIds : ['blaster', 'cannon', 'gatling', 'saw'],
        chestSlots: Array.isArray(data.chestSlots) ? data.chestSlots : DEFAULT_CHEST_SLOTS,
        currentLevelIndex: typeof data.currentLevelIndex === 'number' ? data.currentLevelIndex : 0,
        isMuted: Boolean(data.isMuted),
        hasFreeSpin: data.hasFreeSpin !== undefined ? data.hasFreeSpin : true,
        lastSpinTimestamp: data.lastSpinTimestamp,
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
      localStorage.setItem(SAVE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
  },

  reset(): void {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) {
      console.warn('Failed to reset save:', e);
    }
  },
};
