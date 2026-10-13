import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameCanvas, COLS, ROWS } from './GameCanvas';
import { HeaderHUD } from './components/HeaderHUD';
import { DeckHUD } from './components/DeckHUD';
import { CommanderTutorial } from './components/CommanderTutorial';
import { VictoryModal } from './components/VictoryModal';
import { TechStackGuideModal } from './components/TechStackGuideModal';
import { UnityRoadmapModal } from './components/UnityRoadmapModal';
import { Team, Card, Unit, Projectile, Particle, FloatingText, Emote, LevelConfig } from './types';
import { ALL_CARDS, INITIAL_PLAYER_DECK, LEVELS } from './cardsData';
import { sounds } from './audio';
import { Play, RotateCcw, Sparkles, Trophy, FileCode } from 'lucide-react';

export default function App() {
  // Game state
  const [gameState, setGameState] = useState<'splash' | 'playing' | 'victory' | 'defeat'>('splash');
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const currentLevel: LevelConfig = LEVELS[currentLevelIndex] || LEVELS[0];

  const [playerTrophies, setPlayerTrophies] = useState(15);
  const [isMuted, setIsMuted] = useState(false);
  const [showTechModal, setShowTechModal] = useState(false);
  const [showUnityModal, setShowUnityModal] = useState(false);

  // Match stats
  const [timeRemaining, setTimeRemaining] = useState(180); // 3:00
  const [bluePercent, setBluePercent] = useState(50);
  const [redPercent, setRedPercent] = useState(50);

  // Tutorial dialogue
  const [tutorialMessage, setTutorialMessage] = useState<string | null>(null);

  // Deck & Energy
  const [energy, setEnergy] = useState(6);
  const maxEnergy = 10;
  const [hand, setHand] = useState<Card[]>(INITIAL_PLAYER_DECK.slice(0, 4));
  const [nextCard, setNextCard] = useState<Card>(INITIAL_PLAYER_DECK[4]);
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
        initUnits.push({
          id: `enemy-init-${i}-${Date.now()}`,
          team: 'red',
          cardId: u.cardId,
          x: u.x,
          y: u.y,
          hp: ALL_CARDS[u.cardId]?.hp ?? 200,
          maxHp: ALL_CARDS[u.cardId]?.hp ?? 200,
          level: lvl.level,
          angle: Math.PI / 2, // facing down towards player
          shootCooldown: 1.0,
          barrelRecoil: 0,
          totalShotsFired: 0,
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
    setGameState('playing');
  }, []);

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

    // Instant victory condition: 100% or 99% dominance!
    if (bPercent >= 99 && gameState === 'playing') {
      setTimeout(() => {
        setGameState('victory');
      }, 500);
    }
  }, [gameState]);

  // Splat/paint tiles in a radius
  const splatGrid = useCallback((centerX: number, centerY: number, radius: number, team: Team) => {
    setGrid((prevGrid) => {
      const nextGrid = prevGrid.map((row) => [...row]);
      const rMin = Math.max(0, Math.floor(centerY - radius));
      const rMax = Math.min(ROWS - 1, Math.ceil(centerY + radius));
      const cMin = Math.max(0, Math.floor(centerX - radius));
      const cMax = Math.min(COLS - 1, Math.ceil(centerX + radius));

      for (let r = rMin; r <= rMax; r++) {
        for (let c = cMin; c <= cMax; c++) {
          const dist = Math.hypot(c - centerX, r - centerY);
          if (dist <= radius) {
            nextGrid[r][c] = team;
          }
        }
      }

      updateTerritoryPercentages(nextGrid);
      return nextGrid;
    });

    // Spawn splatter particles
    const newParticles: Particle[] = [];
    const color = team === 'blue' ? '#38bdf8' : '#fb7185';
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.5;
      newParticles.push({
        id: `splat-${Date.now()}-${Math.random()}`,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 2 + Math.random() * 3,
        alpha: 1,
        life: 0,
        maxLife: 0.4 + Math.random() * 0.3,
        shape: 'circle',
      });
    }
    // Impact ring
    newParticles.push({
      id: `ring-${Date.now()}-${Math.random()}`,
      x: centerX,
      y: centerY,
      vx: 0,
      vy: 0,
      color,
      size: radius * 0.5,
      alpha: 0.8,
      life: 0,
      maxLife: 0.3,
      shape: 'ring',
    });

    setParticles((prev) => [...prev, ...newParticles]);
  }, [updateTerritoryPercentages]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    let lastTime = performance.now();
    let animId: number;

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      // 1. Energy regeneration
      setEnergy((prev) => Math.min(maxEnergy, prev + dt * 0.85));
      enemyEnergyRef.current = Math.min(maxEnergy, enemyEnergyRef.current + dt * 0.8);

      // 2. Unit shooting logic
      setUnits((prevUnits) => {
        const nextUnits = prevUnits.map((u) => ({ ...u }));
        const newProj: Projectile[] = [];

        nextUnits.forEach((unit) => {
          unit.shootCooldown -= dt;
          unit.barrelRecoil = Math.max(0, unit.barrelRecoil - dt * 4);

          // Mobile Tank Unit locomotion (from keyframe 71.1s)
          if (unit.cardId === 'roller') {
            const speed = 1.2;
            unit.y += (unit.team === 'blue' ? -speed : speed) * dt;
            unit.y = Math.max(1, Math.min(ROWS - 2, unit.y));
            splatGrid(unit.x, unit.y, 1.9, unit.team);
          }

          // Find closest target of opposite team
          const enemies = nextUnits.filter((other) => other.team !== unit.team);
          let targetX = unit.x;
          let targetY = unit.team === 'blue' ? 0 : ROWS - 1;

          if (enemies.length > 0) {
            let closestDist = Infinity;
            enemies.forEach((en) => {
              const d = Math.hypot(en.x - unit.x, en.y - unit.y);
              if (d < closestDist) {
                closestDist = d;
                targetX = en.x;
                targetY = en.y;
              }
            });
          }

          // Smooth aim angle
          const desiredAngle = Math.atan2(targetY - unit.y, targetX - unit.x);
          unit.angle = desiredAngle - Math.PI / 2;

          // Fire projectile
          if (unit.shootCooldown <= 0) {
            const cardData = ALL_CARDS[unit.cardId] || ALL_CARDS.cannon;
            unit.shootCooldown = cardData.fireRate;
            unit.barrelRecoil = 1;
            unit.totalShotsFired++;

            const isBlue = unit.team === 'blue';

            if (unit.cardId === 'cannon') {
              sounds.playCannonShot(!isBlue);
              const angle = unit.angle + Math.PI / 2;
              const speed = 7;
              newProj.push({
                id: `proj-${Date.now()}-${Math.random()}`,
                team: unit.team,
                type: 'cannonball',
                x: unit.x,
                y: unit.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                startX: unit.x,
                startY: unit.y,
                targetX,
                targetY,
                paintRadius: cardData.paintRadius,
                damage: cardData.damage,
                life: 0,
                maxLife: 2.2,
                rotation: 0,
              });
            } else if (unit.cardId === 'mortar') {
              sounds.playMortarLaunch();
              // Lobs to enemy zone
              const destY = isBlue ? Math.random() * 10 + 2 : ROWS - 1 - (Math.random() * 10 + 2);
              const destX = Math.random() * (COLS - 4) + 2;
              newProj.push({
                id: `mortar-${Date.now()}-${Math.random()}`,
                team: unit.team,
                type: 'mortar',
                x: unit.x,
                y: unit.y,
                vx: 0,
                vy: 0,
                startX: unit.x,
                startY: unit.y,
                targetX: destX,
                targetY: destY,
                arcProgress: 0,
                paintRadius: cardData.paintRadius,
                damage: cardData.damage,
                life: 0,
                maxLife: 1.4,
                rotation: 0,
              });
            } else if (unit.cardId === 'gatling') {
              sounds.playBlasterShot(!isBlue);
              // Fan of 3 shots
              const baseAngle = unit.angle + Math.PI / 2;
              [-0.2, 0, 0.2].forEach((offset) => {
                const angle = baseAngle + offset;
                const speed = 10;
                newProj.push({
                  id: `bullet-${Date.now()}-${Math.random()}`,
                  team: unit.team,
                  type: 'bullet',
                  x: unit.x,
                  y: unit.y,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  startX: unit.x,
                  startY: unit.y,
                  targetX,
                  targetY,
                  paintRadius: cardData.paintRadius,
                  damage: cardData.damage * 0.4,
                  life: 0,
                  maxLife: 1.6,
                  rotation: 0,
                });
              });
            } else {
              // Blaster single shot
              sounds.playBlasterShot(!isBlue);
              const angle = unit.angle + Math.PI / 2;
              const speed = 11;
              newProj.push({
                id: `bullet-${Date.now()}-${Math.random()}`,
                team: unit.team,
                type: 'bullet',
                x: unit.x,
                y: unit.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                startX: unit.x,
                startY: unit.y,
                targetX,
                targetY,
                paintRadius: cardData.paintRadius,
                damage: cardData.damage,
                life: 0,
                maxLife: 1.5,
                rotation: 0,
              });
            }
          }
        });

        if (newProj.length > 0) {
          setProjectiles((prev) => [...prev, ...newProj]);
        }

        return nextUnits;
      });

      // 3. Projectiles physics & collision
      setProjectiles((prevProj) => {
        const remaining: Projectile[] = [];

        prevProj.forEach((p) => {
          p.life += dt;

          if (p.type === 'saw') {
            // Saw rolls along trajectory carving paint continuously!
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.rotation += 25 * dt;

            // Inking tiles continuously under saw
            splatGrid(p.x, p.y, p.paintRadius, p.team);

            // Damage units hit by saw
            setUnits((curUnits) => {
              return curUnits
                .map((u) => {
                  if (u.team !== p.team && Math.hypot(u.x - p.x, u.y - p.y) < 1.5) {
                    const dmg = p.damage * dt * 4;
                    const newHp = u.hp - dmg;
                    if (newHp <= 0) {
                      sounds.playExplosion();
                      splatGrid(u.x, u.y, 3, p.team);
                    }
                    return { ...u, hp: newHp };
                  }
                  return u;
                })
                .filter((u) => u.hp > 0);
            });

            // Bounce off side walls
            if (p.x <= 0.5 || p.x >= COLS - 1.5) {
              p.vx = -p.vx;
            }

            if (p.y > 0 && p.y < ROWS) {
              remaining.push(p);
            }
          } else if (p.type === 'mortar') {
            // Parabolic arc progress
            const progress = p.life / p.maxLife;
            p.arcProgress = progress;
            p.x = p.startX + (p.targetX - p.startX) * progress;
            p.y = p.startY + (p.targetY - p.startY) * progress;

            if (progress >= 1.0) {
              // Mortar landing impact
              sounds.playExplosion();
              splatGrid(p.targetX, p.targetY, p.paintRadius, p.team);
              // Splash damage to units
              setUnits((curUnits) =>
                curUnits
                  .map((u) => {
                    if (u.team !== p.team && Math.hypot(u.x - p.targetX, u.y - p.targetY) < p.paintRadius) {
                      const newHp = u.hp - p.damage;
                      if (newHp <= 0) {
                        sounds.playExplosion();
                        splatGrid(u.x, u.y, 2.5, p.team);
                      }
                      return { ...u, hp: newHp };
                    }
                    return u;
                  })
                  .filter((u) => u.hp > 0)
              );
            } else {
              remaining.push(p);
            }
          } else {
            // Standard bullets and cannonballs
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Check collision with enemy units
            let hitUnit = false;
            setUnits((curUnits) => {
              return curUnits
                .map((u) => {
                  if (!hitUnit && u.team !== p.team && Math.hypot(u.x - p.x, u.y - p.y) < 1.1) {
                    hitUnit = true;
                    const newHp = u.hp - p.damage;
                    sounds.playPaintSplat();
                    splatGrid(p.x, p.y, p.paintRadius, p.team);
                    if (newHp <= 0) {
                      sounds.playExplosion();
                      splatGrid(u.x, u.y, 2.5, p.team);
                    }
                    return { ...u, hp: newHp };
                  }
                  return u;
                })
                .filter((u) => u.hp > 0);
            });

            if (!hitUnit) {
              // Paint on landing when out of range or reaches border
              if (p.life >= p.maxLife || p.y <= 0 || p.y >= ROWS || p.x <= 0 || p.x >= COLS) {
                sounds.playPaintSplat();
                splatGrid(p.x, p.y, p.paintRadius, p.team);
              } else {
                remaining.push(p);
              }
            }
          }
        });

        return remaining;
      });

      // 4. Particles update
      setParticles((prevPt) =>
        prevPt
          .map((pt) => ({
            ...pt,
            x: pt.x + pt.vx * dt,
            y: pt.y + pt.vy * dt,
            life: pt.life + dt,
            alpha: 1 - (pt.life + dt) / pt.maxLife,
          }))
          .filter((pt) => pt.life < pt.maxLife)
      );

      // 5. Floating text update
      setFloatingTexts((prevFt) =>
        prevFt
          .map((ft) => ({
            ...ft,
            y: ft.y - dt * 2,
            life: ft.life + dt,
            alpha: 1 - (ft.life + dt) / ft.maxLife,
          }))
          .filter((ft) => ft.life < ft.maxLife)
      );

      // 6. Enemy AI Decision
      if (now - lastAiPlayRef.current > currentLevel.opponentAiInterval) {
        lastAiPlayRef.current = now;
        const aiChoices: Array<'cannon' | 'saw' | 'gatling' | 'mortar'> = ['cannon', 'saw', 'gatling', 'mortar'];
        const chosen = aiChoices[Math.floor(Math.random() * aiChoices.length)];
        const cardObj = ALL_CARDS[chosen];

        if (enemyEnergyRef.current >= cardObj.cost) {
          enemyEnergyRef.current -= cardObj.cost;

          if (chosen === 'saw') {
            // Launch enemy saw blade from top downwards!
            sounds.playSawLaunch();
            const startX = Math.random() * (COLS - 4) + 2;
            const targetX = Math.random() * (COLS - 4) + 2;
            const dirX = targetX - startX;
            const dirY = ROWS;
            const len = Math.hypot(dirX, dirY);
            const speed = 14;

            setProjectiles((prev) => [
              ...prev,
              {
                id: `enemy-saw-${Date.now()}`,
                team: 'red',
                type: 'saw',
                x: startX,
                y: 1,
                vx: (dirX / len) * speed,
                vy: (dirY / len) * speed,
                startX,
                startY: 1,
                targetX,
                targetY: ROWS,
                paintRadius: 2.2,
                damage: 120,
                life: 0,
                maxLife: 3.5,
                rotation: 0,
              },
            ]);
          } else {
            // Place red turret in red territory
            const spawnX = Math.floor(Math.random() * (COLS - 4)) + 2;
            const spawnY = Math.floor(Math.random() * 8) + 2;

            setUnits((prev) => [
              ...prev,
              {
                id: `enemy-unit-${Date.now()}`,
                team: 'red',
                cardId: chosen,
                x: spawnX,
                y: spawnY,
                hp: cardObj.hp,
                maxHp: cardObj.hp,
                level: currentLevel.level,
                angle: Math.PI / 2,
                shootCooldown: 0.8,
                barrelRecoil: 0,
                totalShotsFired: 0,
              },
            ]);
          }
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [gameState, currentLevel, splatGrid]);

  // Match countdown clock
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // End of match: winner with highest %
          if (bluePercent > redPercent) {
            setGameState('victory');
          } else {
            sounds.playDefeat();
            setGameState('defeat');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, bluePercent, redPercent]);

  // Handle player deploying a card from hand
  const handleDeployCard = (card: Card, gridX: number, gridY: number) => {
    if (energy < card.cost || gameState !== 'playing') return;

    setEnergy((prev) => prev - card.cost);

    if (card.id === 'saw') {
      // Launch Buzz Saw
      sounds.playSawLaunch();
      const startX = gridX;
      const startY = gridY;
      const targetX = gridX;
      const targetY = 0;
      const speed = 16;

      setProjectiles((prev) => [
        ...prev,
        {
          id: `player-saw-${Date.now()}`,
          team: 'blue',
          type: 'saw',
          x: startX,
          y: startY,
          vx: 0,
          vy: -speed, // shoot straight up into enemy territory!
          startX,
          startY,
          targetX,
          targetY,
          paintRadius: card.paintRadius,
          damage: card.damage,
          life: 0,
          maxLife: 3.5,
          rotation: 0,
        },
      ]);
    } else {
      // Place turret on field
      sounds.playCardDrop();
      setUnits((prev) => [
        ...prev,
        {
          id: `player-unit-${Date.now()}`,
          team: 'blue',
          cardId: card.id,
          x: gridX,
          y: gridY,
          hp: card.hp,
          maxHp: card.hp,
          level: card.level,
          angle: -Math.PI / 2, // facing up
          shootCooldown: 0.3, // fire fast initial shot
          barrelRecoil: 0,
          totalShotsFired: 0,
        },
      ]);
    }

    // Cycle card: replace played card with nextCard, generate fresh nextCard
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

    // Bot chance to respond with an emote
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

  // Victory flow
  const handleNextLevel = () => {
    setPlayerTrophies((prev) => prev + 15);
    const nextIdx = (currentLevelIndex + 1) % LEVELS.length;
    startLevel(nextIdx);
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="relative w-screen h-screen bg-[#090d16] text-white flex flex-col items-center justify-between overflow-hidden select-none touch-none"
    >
      {/* 1. START / SPLASH SCREEN */}
      {gameState === 'splash' && (
        <div className="absolute inset-0 z-40 bg-gradient-to-b from-slate-950 via-[#0a1128] to-slate-950 flex flex-col items-center justify-between p-6">
          <div className="w-full flex justify-between items-center max-w-sm">
            <span className="text-xs font-bold text-sky-400 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              Trophies: {playerTrophies}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowUnityModal(true)}
                className="text-xs font-bold bg-sky-600/90 hover:bg-sky-500 text-white px-3 py-1.5 rounded-lg border border-sky-400 shadow cursor-pointer transition active:scale-95 flex items-center gap-1"
              >
                <FileCode className="w-3.5 h-3.5" />
                Unity Plan
              </button>
              <button
                onClick={() => setShowTechModal(true)}
                className="text-xs font-bold bg-indigo-600/80 hover:bg-indigo-500 text-white px-2.5 py-1.5 rounded-lg border border-indigo-400 shadow cursor-pointer transition active:scale-95"
              >
                Advice 💡
              </button>
            </div>
          </div>

          {/* Logo with 3D Voxel Blocks (from video splash screen!) */}
          <div className="flex flex-col items-center my-auto animate-in zoom-in-95 duration-500">
            <div className="flex gap-2 mb-4 animate-float">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 shadow-xl border-2 border-rose-300 transform -rotate-12 flex items-center justify-center text-xl font-black">
                🟥
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-xl border-2 border-sky-200 transform rotate-6 flex items-center justify-center text-2xl font-black -translate-y-2">
                🟦
              </div>
            </div>

            <h1 className="text-5xl font-black tracking-tight text-white drop-shadow-[0_6px_12px_rgba(0,0,0,0.8)]">
              COLOR
            </h1>
            <h1 className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-amber-300 to-rose-500 drop-shadow-[0_6px_12px_rgba(0,0,0,0.8)]">
              CLASH
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
              Territory War &amp; Card Arena
            </p>

            {/* Sector select */}
            <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
              <button
                onClick={() => startLevel(currentLevelIndex)}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 via-sky-400 to-blue-600 hover:from-emerald-300 hover:to-blue-500 text-slate-950 font-black text-xl tracking-wider shadow-[0_10px_25px_rgba(56,189,248,0.5)] border-2 border-white cursor-pointer transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Play className="w-6 h-6 fill-current" />
                BATTLE NOW
              </button>

              <div className="flex justify-between items-center bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-xs">
                <span className="font-bold text-slate-400">Sector:</span>
                <span className="font-black text-sky-400">{currentLevel.name}</span>
                <button
                  onClick={() => setCurrentLevelIndex((prev) => (prev + 1) % LEVELS.length)}
                  className="text-amber-400 hover:underline font-bold"
                >
                  Change ➔
                </button>
              </div>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-500">
            Recreated with 60 FPS HTML5 Canvas • Inspired by Color Clash
          </div>
        </div>
      )}

      {/* 2. MATCH TOP HUD */}
      {gameState !== 'splash' && (
        <HeaderHUD
          bluePercent={bluePercent}
          redPercent={redPercent}
          timeRemaining={timeRemaining}
          currentLevel={currentLevel}
          playerTrophies={playerTrophies}
          isMuted={isMuted}
          onToggleMute={() => {
            const muted = sounds.toggleMute();
            setIsMuted(muted);
          }}
          onOpenTechModal={() => setShowTechModal(true)}
          onOpenUnityModal={() => setShowUnityModal(true)}
        />
      )}

      {/* 3. BATTLEFIELD CANVAS */}
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
          isGameOver={gameState !== 'playing'}
        />

        {/* Mascot Commander Tutorial bubble */}
        {tutorialMessage && (
          <CommanderTutorial
            message={tutorialMessage}
            onDismiss={() => setTutorialMessage(null)}
            showHandHint={currentLevel.level === 1}
          />
        )}
      </div>

      {/* 4. DECK & ENERGY BOTTOM HUD */}
      {gameState !== 'splash' && (
        <DeckHUD
          energy={energy}
          maxEnergy={maxEnergy}
          hand={hand}
          nextCard={nextCard}
          selectedCard={selectedCard}
          onSelectCard={setSelectedCard}
          onDragStartCard={handleDragStartCard}
          onSendEmote={handleSendEmote}
          isGameOver={gameState !== 'playing'}
        />
      )}

      {/* 5. VICTORY POPUP */}
      {gameState === 'victory' && (
        <VictoryModal
          level={currentLevel.level}
          timeBonus={timeRemaining}
          rewardCubes={currentLevel.rewardCubes + Math.floor(timeRemaining * 4)}
          rewardCoins={currentLevel.rewardCoins}
          onNextLevel={handleNextLevel}
          onReplayLevel={() => startLevel(currentLevelIndex)}
        />
      )}

      {/* 6. DEFEAT POPUP */}
      {gameState === 'defeat' && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-rose-950 rounded-3xl p-6 border-2 border-rose-500 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-90">
            <div className="w-16 h-16 rounded-2xl bg-rose-600 flex items-center justify-center text-3xl shadow-xl border-2 border-white mb-2">
              💥
            </div>
            <h1 className="text-3xl font-black text-rose-400 mt-2">DEFEAT</h1>
            <p className="text-xs text-slate-300 mt-1">
              Red claimed {redPercent}% territory. Don't give up!
            </p>
            <button
              onClick={() => startLevel(currentLevelIndex)}
              className="mt-5 w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-black text-base shadow-lg border-2 border-white cursor-pointer transition active:scale-95 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              TRY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* 7. TECH STACK COMPARISON MODAL */}
      {showTechModal && (
        <TechStackGuideModal onClose={() => setShowTechModal(false)} />
      )}

      {/* 8. UNITY 3D BLUEPRINT & MASTER PROMPT MODAL */}
      {showUnityModal && (
        <UnityRoadmapModal onClose={() => setShowUnityModal(false)} />
      )}
    </div>
  );
}
