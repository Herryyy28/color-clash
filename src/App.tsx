import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameCanvas, COLS, ROWS } from './GameCanvas';
import { HeaderHUD } from './components/HeaderHUD';
import { DeckHUD } from './components/DeckHUD';
import { CommanderTutorial } from './components/CommanderTutorial';
import { VictoryModal } from './components/VictoryModal';
import { TechStackGuideModal } from './components/TechStackGuideModal';
import { UnityRoadmapModal } from './components/UnityRoadmapModal';
import { BottomNavBar } from './components/BottomNavBar';
import { HomeBattleView } from './components/HomeBattleView';
import { CardCollectionView } from './components/CardCollectionView';
import { DailySpinView } from './components/DailySpinView';
import { ShopView } from './components/ShopView';
import { SettingsView } from './components/SettingsView';
import { NoAdsVipModal } from './components/NoAdsVipModal';
import { VersusIntroModal } from './components/VersusIntroModal';
import { AvatarSelectionModal } from './components/AvatarSelectionModal';
import { BattleLog } from './components/BattleLog';
import {
  Team,
  Card,
  Unit,
  Projectile,
  Particle,
  FloatingText,
  Emote,
  LevelConfig,
  NavTab,
  ChestSlot,
  CardInventoryItem,
  SpinReward,
  PlayerProfile,
  CardType,
  BattleEvent,
} from './types';
import { ALL_CARDS, INITIAL_PLAYER_DECK, LEVELS } from './cardsData';
import { sounds } from './audio';
import { saveService } from './saveService';
import { Play, RotateCcw, Sparkles, Trophy, Home } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // Navigation & High-level State
  const [gameState, setGameState] = useState<'splash' | 'menu' | 'playing' | 'victory' | 'defeat'>('menu');
  const [currentTab, setCurrentTab] = useState<NavTab>('battle');

  // Load persistent game data on initialization
  const initialSave = useRef(saveService.load()).current;
  const [currentLevelIndex, setCurrentLevelIndex] = useState(initialSave.currentLevelIndex);
  const currentLevel: LevelConfig = LEVELS[currentLevelIndex] || LEVELS[0];

  // Modals
  const [showTechModal, setShowTechModal] = useState(false);
  const [showUnityModal, setShowUnityModal] = useState(false);
  const [showNoAdsModal, setShowNoAdsModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showVersusModal, setShowVersusModal] = useState(false);
  const [isMuted, setIsMuted] = useState(initialSave.isMuted);

  // In-arena match countdown (3 -> 2 -> 1 -> CLASH!)
  const [battleCountdown, setBattleCountdown] = useState<number | null>(null);

  // Player Progression Profile
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(initialSave.playerProfile);

  // Card Inventory
  const [inventory, setInventory] = useState<Record<CardType, CardInventoryItem>>(initialSave.inventory);

  // Active 4-card Battle Deck
  const [activeDeck, setActiveDeck] = useState<Card[]>(() => {
    const cards = initialSave.activeDeckCardIds.map((id) => ALL_CARDS[id]).filter(Boolean);
    return cards.length === 4 ? cards : [ALL_CARDS.blaster, ALL_CARDS.cannon, ALL_CARDS.gatling, ALL_CARDS.saw];
  });

  // Chest Slots (4 slots with timers)
  const [chestSlots, setChestSlots] = useState<ChestSlot[]>(initialSave.chestSlots);

  // Daily spin state
  const [hasFreeSpin, setHasFreeSpin] = useState(initialSave.hasFreeSpin);

  // Match stats
  const [timeRemaining, setTimeRemaining] = useState(180);
  const [bluePercent, setBluePercent] = useState(50);
  const [redPercent, setRedPercent] = useState(50);
  const [tutorialMessage, setTutorialMessage] = useState<string | null>(null);

  // Deck & Energy
  const [energy, setEnergy] = useState(6);
  const maxEnergy = 10;
  const [hand, setHand] = useState<Card[]>(activeDeck.slice(0, 4));
  const [nextCard, setNextCard] = useState<Card>(ALL_CARDS.roller);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);

  // Arena Grid
  const [grid, setGrid] = useState<Team[][]>(() => {
    const initial: Team[][] = [];
    for (let r = 0; r < ROWS; r++) {
      const row: Team[] = [];
      for (let c = 0; c < COLS; c++) {
        row.push(r < ROWS / 2 ? 'red' : 'blue');
      }
      initial.push(row);
    }
    return initial;
  });

  // Entities
  const [units, setUnits] = useState<Unit[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [emotes, setEmotes] = useState<Emote[]>([]);

  // Enemy AI ref
  const enemyEnergyRef = useRef(5);
  const lastAiPlayRef = useRef(Date.now());
  const gridRef = useRef(grid);
  gridRef.current = grid;
  const unitsRef = useRef(units);
  unitsRef.current = units;

  // Battle Combat Event Log
  const [battleEvents, setBattleEvents] = useState<BattleEvent[]>([]);
  const lastTerritoryPercentRef = useRef<number>(50);

  const addBattleEvent = useCallback((event: Omit<BattleEvent, 'id' | 'timestamp'>) => {
    setBattleEvents((prev) => {
      const newEvent: BattleEvent = {
        ...event,
        id: `be-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
      };
      return [newEvent, ...prev].slice(0, 5);
    });
  }, []);

  // Real-time chest unlock timer interval
  useEffect(() => {
    const interval = setInterval(() => {
      setChestSlots((prev) => [...prev]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize or reset a level
  const startLevel = useCallback((lvlIndex: number) => {
    const lvl = LEVELS[lvlIndex] || LEVELS[0];
    setCurrentLevelIndex(lvlIndex);

    // Initial grid: 50% red, 50% blue
    const newGrid: Team[][] = [];
    for (let r = 0; r < ROWS; r++) {
      const row: Team[] = [];
      for (let c = 0; c < COLS; c++) {
        row.push(r < ROWS / 2 ? 'red' : 'blue');
      }
      newGrid.push(row);
    }
    setGrid(newGrid);

    // Initial Units
    const initUnits: Unit[] = [];
    if (lvl.initialEnemyUnits) {
      lvl.initialEnemyUnits.forEach((u, i) => {
        const cardData = ALL_CARDS[u.cardId] || ALL_CARDS.cannon;
        initUnits.push({
          id: `enemy-init-${i}-${Date.now()}`,
          team: 'red',
          cardId: u.cardId,
          x: u.x,
          y: u.y,
          hp: cardData.hp,
          maxHp: cardData.hp,
          shieldHp: cardData.passive?.shieldValue ?? 0,
          maxShieldHp: cardData.passive?.shieldValue ?? 0,
          speedMultiplier: cardData.passive?.speedFactor ?? 1.0,
          level: lvl.level,
          angle: Math.PI / 2, // facing down towards player
          shootCooldown: 1.0,
          barrelRecoil: 0,
          totalShotsFired: 0,
          passive: cardData.passive,
        });
      });
    }

    setUnits(initUnits);
    setProjectiles([]);
    setParticles([]);
    setFloatingTexts([]);
    setEmotes([]);
    setTimeRemaining(180);
    setEnergy(6);
    enemyEnergyRef.current = 5;
    lastAiPlayRef.current = Date.now();
    setBluePercent(50);
    setRedPercent(50);
    setTutorialMessage(lvl.tutorialTip ?? null);

    // Initialize battle log with match start event
    setBattleEvents([
      {
        id: `start-${Date.now()}`,
        type: 'match_event',
        text: 'Clash Commenced!',
        subtext: `Sector ${lvl.level}`,
        team: 'neutral',
        timestamp: Date.now(),
        icon: '⚔️',
      },
    ]);
    lastTerritoryPercentRef.current = 50;

    // Hand populated from activeDeck
    setHand(activeDeck.slice(0, 4));
    const remainingCards = Object.values(ALL_CARDS).filter(
      (c) => !activeDeck.slice(0, 4).some((d) => d.id === c.id)
    );
    setNextCard(remainingCards[0] || ALL_CARDS.roller);

    setGameState('playing');
    setBattleCountdown(3);
    sounds.playClick();
  }, [activeDeck]);

  // Battle countdown ticker (3 -> 2 -> 1 -> CLASH! -> start)
  useEffect(() => {
    if (gameState !== 'playing' || battleCountdown === null) return;

    if (battleCountdown > 0) {
      const timer = setTimeout(() => {
        sounds.playClick();
        setBattleCountdown((prev) => (prev !== null && prev > 1 ? prev - 1 : 0));
      }, 700);
      return () => clearTimeout(timer);
    } else if (battleCountdown === 0) {
      sounds.playBattleHorns();
      const timer = setTimeout(() => {
        setBattleCountdown(null);
      }, 650);
      return () => clearTimeout(timer);
    }
  }, [gameState, battleCountdown]);

  // Auto-save player progression to localStorage
  useEffect(() => {
    saveService.save({
      playerProfile,
      inventory,
      activeDeckCardIds: activeDeck.map((c) => c.id as CardType),
      chestSlots,
      currentLevelIndex,
      isMuted,
      hasFreeSpin,
    });
  }, [playerProfile, inventory, activeDeck, chestSlots, currentLevelIndex, isMuted, hasFreeSpin]);

  // Recalculate territory percentage whenever grid updates
  const updateTerritoryPercentages = useCallback((currentGrid: Team[][]) => {
    let blueCount = 0;
    let redCount = 0;
    const total = ROWS * COLS;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (currentGrid[r][c] === 'blue') blueCount++;
        else if (currentGrid[r][c] === 'red') redCount++;
      }
    }

    const bPercent = Math.round((blueCount / total) * 100);
    const rPercent = 100 - bPercent;
    setBluePercent(bPercent);
    setRedPercent(rPercent);

    // Track major territory captured events for BattleLog
    const prevB = lastTerritoryPercentRef.current;
    if (Math.abs(bPercent - prevB) >= 7) {
      if (bPercent >= 55 && prevB < 55) {
        addBattleEvent({
          type: 'territory_captured',
          text: `Blue Captured ${bPercent}% Territory`,
          subtext: 'Territory lead secured',
          team: 'blue',
          icon: '🚩',
        });
        lastTerritoryPercentRef.current = bPercent;
      } else if (rPercent >= 55 && (100 - prevB) < 55) {
        addBattleEvent({
          type: 'territory_captured',
          text: `Red Captured ${rPercent}% Territory`,
          subtext: 'Enemy territory push',
          team: 'red',
          icon: '🚩',
        });
        lastTerritoryPercentRef.current = bPercent;
      } else if (bPercent >= 70 && prevB < 70) {
        addBattleEvent({
          type: 'territory_captured',
          text: `Blue Dominating: ${bPercent}% Grid`,
          subtext: 'High ground control',
          team: 'blue',
          icon: '🚩',
        });
        lastTerritoryPercentRef.current = bPercent;
      } else if (rPercent >= 70 && (100 - prevB) < 70) {
        addBattleEvent({
          type: 'territory_captured',
          text: `Red Dominating: ${rPercent}% Grid`,
          subtext: 'Critical defence needed',
          team: 'red',
          icon: '🚩',
        });
        lastTerritoryPercentRef.current = bPercent;
      }
    }

    // Instant victory condition: 99% or 100% dominance
    if (bPercent >= 99 && gameState === 'playing') {
      setTimeout(() => {
        setGameState('victory');
      }, 500);
    }
  }, [gameState, addBattleEvent]);

  // Splat/paint tiles in a radius
  const splatGrid = useCallback((centerX: number, centerY: number, radius: number, team: Team) => {
    setGrid((prevGrid) => {
      const nextGrid = prevGrid.map((row) => [...row]);
      const rMin = Math.max(0, Math.floor(centerY - radius));
      const rMax = Math.min(ROWS - 1, Math.ceil(centerY + radius));
      const cMin = Math.max(0, Math.floor(centerX - radius));
      const cMax = Math.min(COLS - 1, Math.ceil(centerX + radius));

      let paintedAny = false;
      for (let r = rMin; r <= rMax; r++) {
        for (let c = cMin; c <= cMax; c++) {
          const distSq = (c - centerX) ** 2 + (r - centerY) ** 2;
          if (distSq <= radius ** 2) {
            if (nextGrid[r][c] !== team) {
              nextGrid[r][c] = team;
              paintedAny = true;
            }
          }
        }
      }

      if (paintedAny) {
        updateTerritoryPercentages(nextGrid);
      }
      return nextGrid;
    });
  }, [updateTerritoryPercentages]);

  // Energy regeneration & match timer loop
  useEffect(() => {
    if (gameState !== 'playing' || battleCountdown !== null) return;

    // Smooth continuous energy regeneration (~0.6 energy/sec)
    const energyTimer = setInterval(() => {
      setEnergy((prev) => Math.min(maxEnergy, +(prev + 0.15).toFixed(2)));
      enemyEnergyRef.current = Math.min(10, +(enemyEnergyRef.current + 0.15).toFixed(2));
    }, 250);

    // 1-second match timer countdown
    const secondTimer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Match ends: determine victor based on territory percentage
          if (bluePercent > redPercent) {
            setGameState('victory');
          } else if (redPercent > bluePercent) {
            sounds.playDefeat();
            setGameState('defeat');
          } else {
            // Sudden Death tie: grant +30s overtime
            addBattleEvent({
              type: 'match_event',
              text: 'Sudden Death Overtime',
              subtext: '+30s Golden Goal',
              team: 'neutral',
              icon: '⏱️',
            });
            return 30;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(energyTimer);
      clearInterval(secondTimer);
    };
  }, [gameState, battleCountdown, bluePercent, redPercent, maxEnergy]);

  // Enemy AI Logic Loop
  useEffect(() => {
    if (gameState !== 'playing' || battleCountdown !== null) return;

    const aiInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastAiPlayRef.current < currentLevel.opponentAiInterval) return;

      const aiCards = [ALL_CARDS.cannon, ALL_CARDS.blaster, ALL_CARDS.gatling, ALL_CARDS.saw, ALL_CARDS.mortar];
      const pick = aiCards[Math.floor(Math.random() * aiCards.length)];

      if (enemyEnergyRef.current >= pick.cost) {
        enemyEnergyRef.current -= pick.cost;
        lastAiPlayRef.current = now;

        const isSaw = pick.id === 'saw';
        const spawnX = Math.floor(Math.random() * (COLS - 4)) + 2;
        const spawnY = isSaw ? 2 : Math.floor(Math.random() * 8) + 2;

        if (isSaw) {
          sounds.playSawWhir();
          addBattleEvent({
            type: 'saw_launch',
            text: 'Red Buzz Saw Launched',
            subtext: 'Lane assault incoming',
            team: 'red',
            icon: '🪚',
          });
          setProjectiles((prev) => [
            ...prev,
            {
              id: `saw-enemy-${Date.now()}`,
              team: 'red',
              type: 'saw',
              x: spawnX,
              y: spawnY,
              vx: 0,
              vy: 0.35 * (pick.passive?.speedFactor ?? 1.0),
              startX: spawnX,
              startY: spawnY,
              targetX: spawnX,
              targetY: ROWS - 1,
              paintRadius: pick.paintRadius,
              damage: pick.damage,
              life: 180,
              maxLife: 180,
              rotation: 0,
            },
          ]);
        } else {
          sounds.playCardDeploy();
          if (pick.id === 'mortar' || pick.id === 'gatling' || pick.id === 'roller') {
            addBattleEvent({
              type: 'special_deploy',
              text: `Red ${pick.name} Deployed`,
              subtext: 'Enemy tactical unit',
              team: 'red',
              icon: pick.icon,
            });
          }
          setUnits((prev) => [
            ...prev,
            {
              id: `enemy-unit-${Date.now()}`,
              team: 'red',
              cardId: pick.id,
              x: spawnX,
              y: spawnY,
              hp: pick.hp,
              maxHp: pick.hp,
              shieldHp: pick.passive?.shieldValue ?? 0,
              maxShieldHp: pick.passive?.shieldValue ?? 0,
              speedMultiplier: pick.passive?.speedFactor ?? 1.0,
              level: currentLevel.level,
              angle: Math.PI / 2,
              shootCooldown: pick.fireRate,
              barrelRecoil: 0,
              totalShotsFired: 0,
              passive: pick.passive,
            },
          ]);
        }
      }
    }, 1200);

    return () => clearInterval(aiInterval);
  }, [gameState, battleCountdown, currentLevel, addBattleEvent]);

  // Main 60 FPS Combat, Recoil & Projectile Physics loop
  useEffect(() => {
    if (gameState !== 'playing' || battleCountdown !== null) return;

    let animId: number;

    const gameTick = () => {
      // 1. Update Units
      setUnits((prevUnits) => {
        const nextUnits: Unit[] = [];

        prevUnits.forEach((unit) => {
          if (unit.hp <= 0) {
            // Unit defeated
            sounds.playUnitExplode();
            const cardData = ALL_CARDS[unit.cardId];
            const unitName = cardData?.name || 'Turret';
            const isBlue = unit.team === 'blue';
            addBattleEvent({
              type: 'turret_destroyed',
              text: `${isBlue ? 'Blue' : 'Red'} ${unitName} Destroyed`,
              subtext: isBlue ? 'Friendly loss' : 'Enemy base struck',
              team: unit.team,
              icon: '💥',
            });
            // Emit death particles
            setParticles((p) => [
              ...p,
              ...Array.from({ length: 12 }, () => ({
                id: `die-p-${Math.random()}`,
                x: unit.x,
                y: unit.y,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                color: unit.team === 'blue' ? '#38bdf8' : '#fb7185',
                size: Math.random() * 5 + 3,
                alpha: 1,
                life: 30,
                maxLife: 30,
                shape: 'circle' as const,
              })),
            ]);
            return;
          }

          // Mobile units (e.g. roller) drive forward
          let nextX = unit.x;
          let nextY = unit.y;
          if (unit.cardId === 'roller') {
            const dir = unit.team === 'blue' ? -0.04 : 0.04;
            const currentTileOwner = gridRef.current[Math.floor(unit.y)]?.[Math.floor(unit.x)];
            const terrainBonus = currentTileOwner === unit.team ? (unit.passive?.speedFactor ?? 1.4) : 1.0;
            nextY += dir * terrainBonus;
            splatGrid(Math.round(nextX), Math.round(nextY), 1.8, unit.team);
          }

          // Target acquisition: find closest opposing unit
          const enemies = unitsRef.current.filter((u) => u.team !== unit.team && u.hp > 0);
          let targetAngle = unit.team === 'blue' ? -Math.PI / 2 : Math.PI / 2;

          if (enemies.length > 0) {
            let closestDist = Infinity;
            let closestEnemy: Unit | null = null;
            enemies.forEach((enemy) => {
              const d = Math.hypot(enemy.x - unit.x, enemy.y - unit.y);
              if (d < closestDist) {
                closestDist = d;
                closestEnemy = enemy;
              }
            });

            if (closestEnemy) {
              const enemyUnit: Unit = closestEnemy;
              targetAngle = Math.atan2(enemyUnit.y - unit.y, enemyUnit.x - unit.x);
            }
          }

          // Smooth turret rotation
          let diffAngle = targetAngle - unit.angle;
          while (diffAngle < -Math.PI) diffAngle += Math.PI * 2;
          while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;
          const nextAngle = unit.angle + diffAngle * 0.12;

          // Shooting cooldown tick
          let nextCooldown = unit.shootCooldown - 0.016;
          let nextRecoil = Math.max(0, unit.barrelRecoil - 0.08);

          if (nextCooldown <= 0) {
            const cardData = ALL_CARDS[unit.cardId] || ALL_CARDS.cannon;
            const isEnemy = unit.team === 'red';
            nextRecoil = 1.0;

            // Apply speed boost passive if unit has speed boost
            const cadenceBonus = unit.passive?.speedFactor ?? 1.0;
            nextCooldown = cardData.fireRate > 0 ? (cardData.fireRate / cadenceBonus) : 1.0;

            const projType =
              unit.cardId === 'cannon'
                ? 'cannonball'
                : unit.cardId === 'mortar'
                ? 'mortar'
                : 'bullet';

            if (projType === 'cannonball') {
              sounds.playCannonShot(isEnemy);
            } else {
              sounds.playBlasterShot(isEnemy);
            }

            // Spawn projectile
            const bulletSpeed = 0.45 * (unit.passive?.type === 'rapid_overcharge' ? 1.25 : 1.0);
            const vx = Math.cos(nextAngle) * bulletSpeed;
            const vy = Math.sin(nextAngle) * bulletSpeed;

            setProjectiles((prev) => [
              ...prev,
              {
                id: `proj-${Date.now()}-${Math.random()}`,
                team: unit.team,
                type: projType,
                x: unit.x + Math.cos(nextAngle) * 0.8,
                y: unit.y + Math.sin(nextAngle) * 0.8,
                vx,
                vy,
                startX: unit.x,
                startY: unit.y,
                targetX: unit.x + Math.cos(nextAngle) * cardData.range,
                targetY: unit.y + Math.sin(nextAngle) * cardData.range,
                paintRadius: cardData.paintRadius,
                damage: cardData.damage,
                life: 90,
                maxLife: 90,
                rotation: nextAngle,
              },
            ]);
          }

          nextUnits.push({
            ...unit,
            x: nextX,
            y: nextY,
            angle: nextAngle,
            shootCooldown: nextCooldown,
            barrelRecoil: nextRecoil,
          });
        });

        return nextUnits;
      });

      // 2. Update Projectiles & Collisions
      setProjectiles((prevProj) => {
        const nextProj: Projectile[] = [];

        prevProj.forEach((p) => {
          const nextX = p.x + p.vx;
          const nextY = p.y + p.vy;
          const nextLife = p.life - 1;

          // Check if projectile reached edge of arena
          const hitWall = nextX < 0 || nextX >= COLS || nextY < 0 || nextY >= ROWS;

          if (hitWall || nextLife <= 0) {
            // Splat paint on impact!
            sounds.playPaintSplat();
            splatGrid(Math.round(nextX), Math.round(nextY), p.paintRadius, p.team);

            // Emit paint splatter particles
            setParticles((particlesList) => [
              ...particlesList,
              ...Array.from({ length: 8 }, () => ({
                id: `splat-p-${Math.random()}`,
                x: nextX,
                y: nextY,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                color: p.team === 'blue' ? '#38bdf8' : '#fb7185',
                size: Math.random() * 4 + 2,
                alpha: 1,
                life: 25,
                maxLife: 25,
                shape: 'circle' as const,
              })),
            ]);
            return;
          }

          // Check direct unit collision
          let collided = false;
          unitsRef.current.forEach((targetUnit) => {
            if (targetUnit.team !== p.team && targetUnit.hp > 0) {
              const d = Math.hypot(targetUnit.x - nextX, targetUnit.y - nextY);
              if (d < 1.1) {
                collided = true;
                sounds.playPaintSplat();
                splatGrid(Math.round(nextX), Math.round(nextY), p.paintRadius, p.team);

                // Apply damage (shield absorbs first if active)
                setUnits((curUnits) =>
                  curUnits.map((u) => {
                    if (u.id === targetUnit.id) {
                      let remainingDmg = p.damage;
                      let newShield = u.shieldHp;
                      if (newShield > 0) {
                        if (newShield >= remainingDmg) {
                          newShield -= remainingDmg;
                          remainingDmg = 0;
                        } else {
                          remainingDmg -= newShield;
                          newShield = 0;
                        }
                      }
                      const newHp = Math.max(0, u.hp - remainingDmg);
                      return {
                        ...u,
                        hp: newHp,
                        shieldHp: newShield,
                      };
                    }
                    return u;
                  })
                );

                // Show floating damage number
                setFloatingTexts((ft) => [
                  ...ft,
                  {
                    id: `dmg-${Date.now()}-${Math.random()}`,
                    x: nextX,
                    y: nextY - 0.5,
                    text: `-${p.damage}`,
                    color: p.team === 'blue' ? '#38bdf8' : '#fb7185',
                    alpha: 1,
                    life: 40,
                    maxLife: 40,
                  },
                ]);
              }
            }
          });

          if (!collided) {
            nextProj.push({
              ...p,
              x: nextX,
              y: nextY,
              life: nextLife,
              rotation: p.rotation + 0.15,
            });
          }
        });

        return nextProj;
      });

      // 3. Update Particles
      setParticles((prevP) =>
        prevP
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 1,
            alpha: p.life / p.maxLife,
          }))
          .filter((p) => p.life > 0)
      );

      // 4. Update Floating Damage Text
      setFloatingTexts((prevFt) =>
        prevFt
          .map((ft) => ({
            ...ft,
            y: ft.y - 0.02,
            life: ft.life - 1,
            alpha: ft.life / ft.maxLife,
          }))
          .filter((ft) => ft.life > 0)
      );

      // 5. Clean expired emotes (after 4 seconds)
      setEmotes((prev) => prev.filter((e) => Date.now() - e.createdAt < 4000));

      animId = requestAnimationFrame(gameTick);
    };

    animId = requestAnimationFrame(gameTick);
    return () => cancelAnimationFrame(animId);
  }, [gameState, splatGrid, addBattleEvent]);

  // Card Deployment by Player
  const handleDeployCard = (card: Card, gx: number, gy: number) => {
    if (energy < card.cost) return;

    // Check territorial placement validity
    const isSaw = card.id === 'saw';
    const isBlueTerritory = grid[gy]?.[gx] === 'blue';

    if (!isSaw && !isBlueTerritory) {
      // Cannot place regular turret on enemy red territory
      return;
    }

    setEnergy((prev) => +(prev - card.cost).toFixed(1));

    if (isSaw) {
      sounds.playSawWhir();
      addBattleEvent({
        type: 'saw_launch',
        text: 'Blue Buzz Saw Launched',
        subtext: 'Lane shredder',
        team: 'blue',
        icon: '🪚',
      });
      setProjectiles((prev) => [
        ...prev,
        {
          id: `saw-blue-${Date.now()}`,
          team: 'blue',
          type: 'saw',
          x: gx,
          y: gy,
          vx: 0,
          vy: -0.42 * (card.passive?.speedFactor ?? 1.0),
          startX: gx,
          startY: gy,
          targetX: gx,
          targetY: 0,
          paintRadius: card.paintRadius,
          damage: card.damage,
          life: 180,
          maxLife: 180,
          rotation: 0,
        },
      ]);
    } else {
      sounds.playCardDeploy();
      if (card.id === 'mortar' || card.id === 'gatling' || card.id === 'roller') {
        addBattleEvent({
          type: 'special_deploy',
          text: `Blue ${card.name} Deployed`,
          subtext: `Cost ${card.cost} Elixir`,
          team: 'blue',
          icon: card.icon,
        });
      }
      setUnits((prev) => [
        ...prev,
        {
          id: `player-unit-${Date.now()}`,
          team: 'blue',
          cardId: card.id,
          x: gx,
          y: gy,
          hp: card.hp,
          maxHp: card.hp,
          shieldHp: card.passive?.shieldValue ?? 0,
          maxShieldHp: card.passive?.shieldValue ?? 0,
          speedMultiplier: card.passive?.speedFactor ?? 1.0,
          level: card.level,
          angle: -Math.PI / 2, // facing up towards enemy
          shootCooldown: card.fireRate > 0 ? (card.fireRate / (card.passive?.speedFactor ?? 1.0)) : 1.0,
          barrelRecoil: 0,
          totalShotsFired: 0,
          passive: card.passive,
        },
      ]);
    }

    // Cycle next card from activeDeck/ALL_CARDS
    setHand((prevHand) => {
      const idx = prevHand.findIndex((c) => c.id === card.id);
      if (idx === -1) return prevHand;
      const nextHand = [...prevHand];
      nextHand[idx] = nextCard;
      return nextHand;
    });

    const cardKeys = Object.keys(ALL_CARDS) as Array<keyof typeof ALL_CARDS>;
    const randomKey = cardKeys[Math.floor(Math.random() * cardKeys.length)];
    setNextCard(ALL_CARDS[randomKey]);

    setSelectedCard(null);
    setDraggedCard(null);
    setDragPos(null);
  };

  // Card pointer drag handlers
  const handleDragStartCard = (card: Card, e: React.PointerEvent) => {
    setDraggedCard(card);
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggedCard) {
      setDragPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handlePointerUp = () => {
    setDraggedCard(null);
    setDragPos(null);
  };

  // Emote reaction
  const handleSendEmote = (emoji: string) => {
    setEmotes((prev) => [
      ...prev,
      {
        id: `emote-${Date.now()}`,
        emoji,
        team: 'blue',
        x: Math.floor(COLS / 2),
        y: ROWS - 6,
        createdAt: Date.now(),
      },
    ]);

    setTimeout(() => {
      if (gameState === 'playing') {
        const botEmojis = ['😈', '😎', '😡', '😂'];
        const botPick = botEmojis[Math.floor(Math.random() * botEmojis.length)];
        setEmotes((cur) => [
          ...cur,
          {
            id: `enemy-emote-${Date.now()}`,
            emoji: botPick,
            team: 'red',
            x: Math.floor(COLS / 2),
            y: 5,
            createdAt: Date.now(),
          },
        ]);
      }
    }, 1200);
  };

  // Chest Unlocking Handlers
  const handleStartUnlockChest = (slotId: string) => {
    sounds.playClick();
    setChestSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, unlockStartedAt: Date.now() } : s))
    );
  };

  const handleOpenChest = (slotId: string) => {
    setChestSlots((prev) =>
      prev.map((slot) => {
        if (slot.id === slotId) {
          sounds.playRewardClaim();
          setPlayerProfile((p) => ({
            ...p,
            coins: p.coins + slot.coinsReward,
            gems: p.gems + slot.gemsReward,
            exp: p.exp + 40,
          }));

          // Award random card shards
          const allTypes = Object.keys(inventory) as CardType[];
          const awardedType = allTypes[Math.floor(Math.random() * allTypes.length)];
          setInventory((inv) => ({
            ...inv,
            [awardedType]: {
              ...inv[awardedType],
              cards: inv[awardedType].cards + slot.cardsReward,
            },
          }));

          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
          return {
            ...slot,
            isOpened: true,
            unlockStartedAt: null,
          };
        }
        return slot;
      })
    );
  };

  // Card Upgrade Handler
  const handleUpgradeCard = (cardId: CardType) => {
    const inv = inventory[cardId];
    if (!inv || inv.cards < inv.cardsRequired || playerProfile.coins < inv.upgradeCost) return;

    // Deduct coins & upgrade inventory
    const newCoins = playerProfile.coins - inv.upgradeCost;
    const newLevel = inv.level + 1;
    const newCards = inv.cards - inv.cardsRequired;
    const newRequired = Math.round(inv.cardsRequired * 1.8);
    const newCost = Math.round(inv.upgradeCost * 2);

    setInventory((prev) => ({
      ...prev,
      [cardId]: {
        ...inv,
        level: newLevel,
        cards: newCards,
        cardsRequired: newRequired,
        upgradeCost: newCost,
      },
    }));

    // Update ALL_CARDS and activeDeck with improved stats
    const baseCard = ALL_CARDS[cardId];
    if (baseCard) {
      baseCard.level = newLevel;
      baseCard.damage = Math.round(baseCard.damage * 1.15);
      baseCard.hp = Math.round(baseCard.hp * 1.15);
      if (baseCard.passive?.shieldValue) {
        baseCard.passive.shieldValue = Math.round(baseCard.passive.shieldValue * 1.2);
      }
    }

    setActiveDeck((prev) =>
      prev.map((c) => (c.id === cardId ? { ...baseCard } : c))
    );

    // Give player EXP
    setPlayerProfile((p) => {
      const expGain = 50 * newLevel;
      let nextExp = p.exp + expGain;
      let nextLvl = p.level;
      let nextMaxExp = p.maxExp;
      if (nextExp >= nextMaxExp) {
        nextExp -= nextMaxExp;
        nextLvl += 1;
        nextMaxExp = Math.round(nextMaxExp * 1.5);
      }
      return {
        ...p,
        coins: newCoins,
        level: nextLvl,
        exp: nextExp,
        maxExp: nextMaxExp,
      };
    });

    confetti({ particleCount: 50, spread: 50, origin: { y: 0.5 } });
  };

  // Equip card into deck
  const handleEquipCard = (cardId: CardType, slotIndex: number) => {
    const targetCard = ALL_CARDS[cardId];
    if (!targetCard) return;

    setActiveDeck((prev) => {
      const nextDeck = [...prev];
      nextDeck[slotIndex] = targetCard;
      return nextDeck;
    });
  };

  // Daily Spin Reward Handler
  const handleClaimSpinReward = (reward: SpinReward) => {
    setHasFreeSpin(false);
    if (reward.type === 'coins') {
      setPlayerProfile((p) => ({ ...p, coins: p.coins + reward.amount }));
    } else if (reward.type === 'gems') {
      setPlayerProfile((p) => ({ ...p, gems: p.gems + reward.amount }));
    } else if (reward.type === 'cards') {
      const allTypes = Object.keys(inventory) as CardType[];
      const awarded = allTypes[Math.floor(Math.random() * allTypes.length)];
      setInventory((inv) => ({
        ...inv,
        [awarded]: { ...inv[awarded], cards: inv[awarded].cards + reward.amount },
      }));
    } else if (reward.type === 'chest') {
      // Find empty slot or award coins
      const emptySlot = chestSlots.find((s) => s.isOpened);
      if (emptySlot) {
        setChestSlots((slots) =>
          slots.map((s) =>
            s.id === emptySlot.id
              ? {
                  ...s,
                  name: 'Silver Crate',
                  tier: 'silver',
                  unlockDurationSeconds: 15,
                  unlockStartedAt: null,
                  isOpened: false,
                  coinsReward: 180,
                  gemsReward: 6,
                  cardsReward: 8,
                }
              : s
          )
        );
      } else {
        setPlayerProfile((p) => ({ ...p, coins: p.coins + 200 }));
      }
    }
  };

  // Victory flow
  const handleNextLevel = () => {
    setPlayerProfile((p) => ({ ...p, trophies: p.trophies + 15, coins: p.coins + currentLevel.rewardCoins }));
    // Try to drop a chest in empty slot
    const emptySlot = chestSlots.find((s) => s.isOpened);
    if (emptySlot) {
      setChestSlots((slots) =>
        slots.map((s) =>
          s.id === emptySlot.id
            ? {
                ...s,
                name: 'Victory Chest',
                tier: currentLevel.level % 2 === 0 ? 'silver' : 'wooden',
                unlockDurationSeconds: 15,
                unlockStartedAt: null,
                isOpened: false,
                coinsReward: 120 + currentLevel.level * 30,
                gemsReward: 3 + currentLevel.level,
                cardsReward: 6 + currentLevel.level * 2,
              }
            : s
        )
      );
    }
    const nextIdx = (currentLevelIndex + 1) % LEVELS.length;
    startLevel(nextIdx);
  };

  const handleReturnToHome = () => {
    setPlayerProfile((p) => ({ ...p, trophies: p.trophies + 15, coins: p.coins + currentLevel.rewardCoins }));
    setGameState('menu');
    setCurrentTab('battle');
  };

  // Count upgradeable cards for notification badge
  const upgradeableCardsCount = Object.values(inventory).filter(
    (item) => item.cards >= item.cardsRequired && playerProfile.coins >= item.upgradeCost
  ).length;

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="relative w-screen h-screen bg-gradient-to-br from-[#0c2357] via-[#091b42] to-[#071536] text-white flex justify-center items-center overflow-hidden select-none touch-none"
    >
      {/* Mobile Portrait Shell */}
      <div className="w-full h-full max-w-full sm:max-w-[440px] flex flex-col items-center justify-between relative bg-gradient-to-b from-[#1343a8] via-[#0e358c] to-[#0a296d] sm:shadow-[0_0_50px_rgba(20,90,220,0.4)] sm:border-x-2 sm:border-blue-400/50 overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        {/* ======================================================== */}
        {/* 1. START / SPLASH SCREEN (Frames 16.6s & 23.7s from Video) */}
        {/* ======================================================== */}
        {gameState === 'splash' && (
          <div
            onClick={() => {
              sounds.playClick();
              setGameState('menu');
              setCurrentTab('battle');
            }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-between p-6 cursor-pointer overflow-hidden select-none"
            style={{
              background: 'radial-gradient(circle at 50% 30%, #3b82f6 0%, #1d4ed8 35%, #1e3a8a 65%, #0f2766 100%)',
            }}
          >
            {/* Background grid */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:20px_20px]" />

            {/* Top Bar with Trophy count */}
            <div className="w-full flex justify-between items-center z-10">
              <span className="text-xs font-black text-white/90 bg-blue-900/60 backdrop-blur px-3 py-1 rounded-full border border-blue-300/40 flex items-center gap-1.5 shadow">
                <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                Trophies: {playerProfile.trophies}
              </span>
            </div>

            {/* Central 3D "COLOR CLASH" Logo Image */}
            <div className="flex flex-col items-center my-auto z-10 animate-in zoom-in-95 duration-700">
              <div className="relative w-60 h-60 flex items-center justify-center filter drop-shadow-[0_15px_30px_rgba(15,35,90,0.6)] animate-float">
                <img
                  src="/logo.png"
                  alt="Color Clash"
                  className="w-full h-full object-contain rounded-3xl"
                />
              </div>

              {/* Pulsing "TAP TO BATTLE" Prompt */}
              <div className="mt-4 flex flex-col items-center gap-2">
                <div className="px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-blue-500 text-blue-950 font-black text-lg tracking-wider shadow-[0_10px_30px_rgba(56,189,248,0.7)] border-2 border-white animate-pulse flex items-center gap-2">
                  <Play className="w-5 h-5 fill-current" />
                  TAP TO BATTLE
                </div>
                <span className="text-xs font-bold text-white/80">Sector: {currentLevel.name}</span>
              </div>
            </div>

            {/* Bottom Publisher & Studio Branding */}
            <div className="w-full flex justify-between items-end z-10 px-2 text-white/80">
              <div className="flex flex-col items-start">
                <span className="text-xl font-black tracking-tighter text-white drop-shadow">
                  voodoo
                </span>
                <span className="text-[8px] font-bold text-white/60 tracking-wider">
                  INSTANT GAMES
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-md bg-red-600 border border-white/80 flex items-center justify-center text-xs shadow">
                  🛡️
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] font-black tracking-wider text-white">
                    TARBOOSH
                  </span>
                  <span className="text-[8px] font-bold tracking-widest text-white/70">
                    GAMES
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. MENU VIEWS (HOME, CARDS, SHOP, SPIN, SETTINGS)        */}
        {/* ======================================================== */}
        {gameState === 'menu' && (
          <div className="w-full h-full flex flex-col justify-between overflow-hidden">
            {/* View container */}
            <div className="flex-1 w-full overflow-hidden">
              {currentTab === 'battle' && (
                <HomeBattleView
                  playerProfile={playerProfile}
                  currentLevel={currentLevel}
                  selectedSectorIndex={currentLevelIndex}
                  onSelectSector={(idx) => setCurrentLevelIndex(idx)}
                  levels={LEVELS}
                  activeDeck={activeDeck}
                  chestSlots={chestSlots}
                  onOpenChest={handleOpenChest}
                  onStartUnlockChest={handleStartUnlockChest}
                  onStartBattle={() => setShowVersusModal(true)}
                  onOpenDeckTab={() => setCurrentTab('cards')}
                  onOpenShopTab={() => setCurrentTab('shop')}
                  onOpenSpinTab={() => setCurrentTab('spin')}
                  onOpenUnityModal={() => setShowUnityModal(true)}
                  onOpenTechModal={() => setShowTechModal(true)}
                  onOpenAvatarModal={() => setShowAvatarModal(true)}
                  onOpenNoAdsModal={() => setShowNoAdsModal(true)}
                />
              )}

              {currentTab === 'cards' && (
                <CardCollectionView
                  inventory={inventory}
                  activeDeck={activeDeck}
                  playerCoins={playerProfile.coins}
                  onUpgradeCard={handleUpgradeCard}
                  onEquipCard={handleEquipCard}
                />
              )}

              {currentTab === 'shop' && (
                <ShopView
                  playerCoins={playerProfile.coins}
                  playerGems={playerProfile.gems}
                  onAddCoins={(amount) =>
                    setPlayerProfile((p) => ({ ...p, coins: p.coins + amount }))
                  }
                  onAddGems={(amount) =>
                    setPlayerProfile((p) => ({ ...p, gems: p.gems + amount }))
                  }
                  onDeductGems={(amount) => {
                    if (playerProfile.gems >= amount) {
                      setPlayerProfile((p) => ({ ...p, gems: p.gems - amount }));
                      return true;
                    }
                    return false;
                  }}
                  onOpenChestLoot={(tier) => {
                    const coinBonus = tier === 'magical' ? 1500 : tier === 'gold' ? 500 : 150;
                    const cardBonus = tier === 'magical' ? 50 : tier === 'gold' ? 25 : 10;
                    setPlayerProfile((p) => ({ ...p, coins: p.coins + coinBonus }));
                    const allTypes = Object.keys(inventory) as CardType[];
                    const rand = allTypes[Math.floor(Math.random() * allTypes.length)];
                    setInventory((inv) => ({
                      ...inv,
                      [rand]: { ...inv[rand], cards: inv[rand].cards + cardBonus },
                    }));
                    confetti({ particleCount: 75, spread: 70, origin: { y: 0.5 } });
                  }}
                />
              )}

              {currentTab === 'spin' && (
                <DailySpinView
                  playerCoins={playerProfile.coins}
                  playerGems={playerProfile.gems}
                  hasFreeSpin={hasFreeSpin}
                  onClaimReward={handleClaimSpinReward}
                />
              )}

              {currentTab === 'settings' && (
                <SettingsView
                  isMuted={isMuted}
                  onToggleMute={() => {
                    const muted = sounds.toggleMute();
                    setIsMuted(muted);
                  }}
                  onOpenUnityModal={() => setShowUnityModal(true)}
                  onOpenTechModal={() => setShowTechModal(true)}
                  onResetTutorial={() => {
                    setTutorialMessage(currentLevel.tutorialTip ?? 'Drag cards to conquer the red territory!');
                    setCurrentTab('battle');
                  }}
                />
              )}
            </div>

            {/* Bottom 5-Tab Navigation Bar */}
            <BottomNavBar
              currentTab={currentTab}
              onSelectTab={setCurrentTab}
              hasFreeSpin={hasFreeSpin}
              upgradeableCardsCount={upgradeableCardsCount}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. IN-MATCH TACTICAL BATTLE ARENA (PLAYING STATE)        */}
        {/* ======================================================== */}
        {gameState !== 'splash' && gameState !== 'menu' && (
          <>
            {/* Header HUD */}
            <HeaderHUD
              bluePercent={bluePercent}
              redPercent={redPercent}
              timeRemaining={timeRemaining}
              currentLevel={currentLevel}
              playerTrophies={playerProfile.trophies}
              playerName={playerProfile.name}
              playerAvatarId={playerProfile.avatarId || 'kid_headphones'}
              playerCoins={playerProfile.coins}
              playerGems={playerProfile.gems}
              isVip={playerProfile.isVip}
              onOpenAvatarModal={() => setShowAvatarModal(true)}
              isMuted={isMuted}
              onToggleMute={() => {
                const muted = sounds.toggleMute();
                setIsMuted(muted);
              }}
            />

            {/* Battlefield Canvas */}
            <div className="flex-1 w-full flex items-center justify-center relative overflow-hidden">
              <GameCanvas
                grid={grid}
                units={units}
                projectiles={projectiles}
                particles={particles}
                floatingTexts={floatingTexts}
                emotes={emotes}
                draggedCard={draggedCard || selectedCard}
                dragPos={dragPos}
                onDeployCard={handleDeployCard}
                isGameOver={gameState !== 'playing' || battleCountdown !== null}
              />

              {/* BattleLog Component on the Arena Grid */}
              <BattleLog events={battleEvents} maxEvents={5} />

              {/* In-Arena Match Countdown Overlay */}
              {battleCountdown !== null && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-40 bg-[#0a235c]/35 backdrop-blur-[2px]">
                  <div className="flex flex-col items-center animate-in zoom-in-75 duration-200">
                    <span className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-300 to-yellow-500 drop-shadow-[0_4px_16px_rgba(245,158,11,0.9)] filter">
                      {battleCountdown > 0 ? battleCountdown : 'CLASH!'}
                    </span>
                    <span className="text-[10px] sm:text-xs font-black text-sky-200 uppercase tracking-widest mt-1 bg-[#123e9a]/90 px-3 py-0.5 rounded-full border border-sky-300/70 shadow-lg">
                      Sector {currentLevel.level} Battle
                    </span>
                  </div>
                </div>
              )}

              {/* Mascot Commander Tutorial bubble */}
              {tutorialMessage && battleCountdown === null && (
                <CommanderTutorial
                  message={tutorialMessage}
                  onDismiss={() => setTutorialMessage(null)}
                  showHandHint={currentLevel.level === 1}
                />
              )}
            </div>

            {/* Deck & Energy Bottom HUD */}
            <DeckHUD
              energy={energy}
              maxEnergy={maxEnergy}
              hand={hand}
              nextCard={nextCard}
              selectedCard={selectedCard}
              onSelectCard={setSelectedCard}
              onDragStartCard={handleDragStartCard}
              onSendEmote={handleSendEmote}
              isGameOver={gameState !== 'playing' || battleCountdown !== null}
            />
          </>
        )}

        {/* ======================================================== */}
        {/* 4. VICTORY POPUP MODAL                                  */}
        {/* ======================================================== */}
        {gameState === 'victory' && (
          <VictoryModal
            level={currentLevel.level}
            timeBonus={timeRemaining}
            rewardCubes={currentLevel.rewardCubes + Math.floor(timeRemaining * 4)}
            rewardCoins={currentLevel.rewardCoins}
            onNextLevel={handleNextLevel}
            onReplayLevel={() => startLevel(currentLevelIndex)}
            onReturnHome={handleReturnToHome}
          />
        )}

        {/* ======================================================== */}
        {/* 5. DEFEAT POPUP MODAL                                    */}
        {/* ======================================================== */}
        {gameState === 'defeat' && (
          <div className="fixed inset-0 z-50 bg-[#071940]/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative w-full max-w-sm bg-gradient-to-b from-[#183478] to-[#601222] rounded-3xl p-6 border-2 border-rose-400 shadow-[0_0_50px_rgba(244,63,94,0.35)] flex flex-col items-center text-center animate-in zoom-in-90">
              <div className="w-16 h-16 rounded-2xl bg-rose-600 flex items-center justify-center text-3xl shadow-xl border-2 border-white mb-2">
                💥
              </div>
              <h1 className="text-3xl font-black text-rose-300 mt-2">DEFEAT</h1>
              <p className="text-xs text-blue-100 mt-1">
                Red claimed {redPercent}% territory. Don't give up!
              </p>
              <div className="flex gap-2 w-full mt-5">
                <button
                  onClick={() => {
                    setGameState('menu');
                    setCurrentTab('battle');
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-blue-900/70 hover:bg-blue-800 text-white font-bold text-sm border border-blue-400/40 cursor-pointer active:scale-95 transition flex items-center justify-center gap-1 shadow"
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>
                <button
                  onClick={() => startLevel(currentLevelIndex)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 text-white font-black text-sm shadow-lg border-2 border-white cursor-pointer active:scale-95 transition flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 6. TECH STACK GUIDE MODAL (Unity vs Godot vs Web)        */}
      {/* ======================================================== */}
      {showTechModal && (
        <TechStackGuideModal onClose={() => setShowTechModal(false)} />
      )}

      {/* ======================================================== */}
      {/* 7. UNITY 3D BLUEPRINT & MASTER PROMPT MODAL              */}
      {/* ======================================================== */}
      {showUnityModal && (
        <UnityRoadmapModal onClose={() => setShowUnityModal(false)} />
      )}

      {/* ======================================================== */}
      {/* 8. NO ADS VIP POPUP MODAL (Video 0-2s)                   */}
      {/* ======================================================== */}
      <NoAdsVipModal
        isOpen={showNoAdsModal}
        onClose={() => setShowNoAdsModal(false)}
        isVipActive={!!playerProfile.isVip}
        onActivateVip={() => {
          setPlayerProfile((p) => ({
            ...p,
            isVip: true,
            gems: p.gems + 200,
            coins: p.coins + 1500,
          }));
        }}
      />

      {/* ======================================================== */}
      {/* 9. VERSUS INTRO MATCH SEQUENCE (Video 3-7s)              */}
      {/* ======================================================== */}
      <VersusIntroModal
        isOpen={showVersusModal}
        playerName={playerProfile.name}
        playerAvatarId={playerProfile.avatarId || 'kid_headphones'}
        playerTrophies={playerProfile.trophies}
        currentLevel={currentLevel}
        onFightStart={() => {
          setShowVersusModal(false);
          startLevel(currentLevelIndex);
        }}
      />

      {/* ======================================================== */}
      {/* 10. AVATAR & NAME CUSTOMIZATION OVERLAY (Video 15-18s, 31-36s) */}
      {/* ======================================================== */}
      <AvatarSelectionModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        currentAvatarId={playerProfile.avatarId || 'kid_headphones'}
        onSelectAvatar={(avatarId) => {
          setPlayerProfile((p) => ({ ...p, avatarId }));
        }}
        playerName={playerProfile.name}
        onUpdatePlayerName={(newName) => {
          setPlayerProfile((p) => ({ ...p, name: newName }));
        }}
        playerGems={playerProfile.gems}
        playerCoins={playerProfile.coins}
        isVip={!!playerProfile.isVip}
        isLiveInBattle={gameState === 'playing'}
        onDeductGems={(amount) => {
          if (playerProfile.gems >= amount) {
            setPlayerProfile((p) => ({ ...p, gems: p.gems - amount }));
            return true;
          }
          return false;
        }}
        onDeductCoins={(amount) => {
          if (playerProfile.coins >= amount) {
            setPlayerProfile((p) => ({ ...p, coins: p.coins - amount }));
            return true;
          }
          return false;
        }}
      />
    </div>
  );
}
