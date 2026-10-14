import React, { useState, useEffect, useRef } from 'react';
import { Card, CardInventoryItem, CardType } from '../types';
import { ALL_CARDS } from '../cardsData';
import { sounds } from '../audio';
import { Sparkles, ArrowUp, Check, Flame, Trophy, Info, Swords, Zap, Layers, RefreshCw } from 'lucide-react';
import { ResponsiveModal } from './ResponsiveModal';
import confetti from 'canvas-confetti';

interface CardCollectionViewProps {
  inventory: Record<CardType, CardInventoryItem>;
  activeDeck: Card[];
  playerCoins: number;
  onUpgradeCard: (cardId: CardType) => void;
  onEquipCard: (cardId: CardType, slotIndex: number) => void;
  onCoinShortfall?: (itemTitle: string, requiredCoins: number, currentCoins: number) => void;
}

// Card Rarity Configuration matching Color Clash reference
type CardRarity = 'common' | 'rare' | 'epic';

const CARD_RARITIES: Record<CardType, { rarity: CardRarity; border: string; glow: string; badgeBg: string; label: string }> = {
  blaster: { rarity: 'common', border: 'border-sky-400', glow: 'shadow-[0_0_12px_rgba(56,189,248,0.4)]', badgeBg: 'bg-sky-500', label: 'Common' },
  cannon: { rarity: 'common', border: 'border-sky-400', glow: 'shadow-[0_0_12px_rgba(56,189,248,0.4)]', badgeBg: 'bg-sky-500', label: 'Common' },
  saw: { rarity: 'rare', border: 'border-amber-400', glow: 'shadow-[0_0_14px_rgba(245,158,11,0.5)]', badgeBg: 'bg-amber-500', label: 'Rare' },
  gatling: { rarity: 'rare', border: 'border-amber-400', glow: 'shadow-[0_0_14px_rgba(245,158,11,0.5)]', badgeBg: 'bg-amber-500', label: 'Rare' },
  roller: { rarity: 'rare', border: 'border-amber-400', glow: 'shadow-[0_0_14px_rgba(245,158,11,0.5)]', badgeBg: 'bg-amber-500', label: 'Rare' },
  mortar: { rarity: 'epic', border: 'border-purple-400', glow: 'shadow-[0_0_16px_rgba(168,85,247,0.6)]', badgeBg: 'bg-purple-600', label: 'Epic' },
  laser: { rarity: 'epic', border: 'border-purple-400', glow: 'shadow-[0_0_16px_rgba(168,85,247,0.6)]', badgeBg: 'bg-purple-600', label: 'Epic' },
};

/**
 * Live Battle Demo Canvas Component
 * Exact match to Reference Video (Frames 165.4s & 170.4s)
 * Shows the unit painting the enemy red territory blue in real-time!
 */
const MiniArenaPreview: React.FC<{ card: Card }> = ({ card }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastShotTime = 0;
    let resetTimer = 0;

    // 10 cols x 6 rows grid
    const cols = 10;
    const rows = 6;
    const tiles: number[][] = []; // 0 = red, 1 = blue

    const resetTiles = () => {
      tiles.length = 0;
      for (let r = 0; r < rows; r++) {
        const rowArr: number[] = [];
        for (let c = 0; c < cols; c++) {
          rowArr.push(r >= 3 ? 1 : 0); // top 3 red, bottom 3 blue
        }
        tiles.push(rowArr);
      }
    };
    resetTiles();

    interface DemoProj {
      x: number;
      y: number;
      vx: number;
      vy: number;
      type: string;
      life: number;
    }
    const projectiles: DemoProj[] = [];

    interface DemoParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      life: number;
      color: string;
    }
    const particles: DemoParticle[] = [];

    const unitX = 4.5;
    const unitY = 4.2;

    const render = (time: number) => {
      // Periodic reset every 5.5s so demo keeps showing battle
      resetTimer += 16;
      if (resetTimer > 5500) {
        resetTimer = 0;
        resetTiles();
      }

      // Shoot cycle every ~1.2s
      if (time - lastShotTime > 1100) {
        lastShotTime = time;
        if (card.id === 'saw') {
          projectiles.push({ x: unitX, y: unitY, vx: 0, vy: -0.09, type: 'saw', life: 60 });
        } else if (card.id === 'gatling') {
          projectiles.push({ x: unitX, y: unitY, vx: -0.03, vy: -0.08, type: 'bullet', life: 50 });
          projectiles.push({ x: unitX, y: unitY, vx: 0, vy: -0.09, type: 'bullet', life: 50 });
          projectiles.push({ x: unitX, y: unitY, vx: 0.03, vy: -0.08, type: 'bullet', life: 50 });
        } else if (card.id === 'cannon') {
          projectiles.push({ x: unitX, y: unitY, vx: (Math.random() - 0.5) * 0.03, vy: -0.07, type: 'cannon', life: 45 });
        } else if (card.id === 'mortar') {
          projectiles.push({ x: unitX, y: unitY, vx: 0, vy: -0.05, type: 'mortar', life: 55 });
        } else if (card.id === 'laser') {
          projectiles.push({ x: unitX, y: unitY, vx: 0, vy: -0.16, type: 'laser', life: 30 });
        } else {
          projectiles.push({ x: unitX, y: unitY, vx: (Math.random() - 0.5) * 0.02, vy: -0.08, type: 'bullet', life: 50 });
        }
      }

      const w = canvas.width;
      const h = canvas.height;
      const cellW = w / cols;
      const cellH = h / rows;

      ctx.clearRect(0, 0, w, h);

      // 1. Draw Grid Tiles with 3D Bevel
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const isBlue = tiles[r]?.[c] === 1;
          const x = c * cellW;
          const y = r * cellH;

          ctx.fillStyle = isBlue ? '#0ea5e9' : '#e11d48';
          ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);

          // Top highlight bevel
          ctx.fillStyle = isBlue ? '#38bdf8' : '#fb7185';
          ctx.fillRect(x + 1, y + 1, cellW - 2, 2);

          // Bottom shadow bevel
          ctx.fillStyle = isBlue ? '#0369a1' : '#9f1239';
          ctx.fillRect(x + 1, y + cellH - 3, cellW - 2, 2);
        }
      }

      // Middle White Dividing Territory Line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 3 * cellH);
      ctx.lineTo(w, 3 * cellH);
      ctx.stroke();

      // 2. Update & Draw Projectiles
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        const px = p.x * cellW;
        const py = p.y * cellH;

        // Splatter tiles along the way or on hit
        const gridCol = Math.floor(p.x);
        const gridRow = Math.floor(p.y);

        if (gridRow >= 0 && gridRow < rows && gridCol >= 0 && gridCol < cols) {
          if (tiles[gridRow][gridCol] === 0) {
            tiles[gridRow][gridCol] = 1; // painted blue!
            // Spawn splatter particles
            for (let k = 0; k < 3; k++) {
              particles.push({
                x: px,
                y: py,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 2,
                life: 15,
                color: '#38bdf8',
              });
            }
          }
        }

        // Draw projectile graphic
        if (p.type === 'saw') {
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(time * 0.02);
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(0, 0, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        } else if (p.type === 'cannon' || p.type === 'mortar') {
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();
        } else if (p.type === 'laser') {
          ctx.fillStyle = '#00f0ff';
          ctx.fillRect(px - 3, py - 12, 6, 24);
        } else {
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        if (p.life <= 0 || p.y < 0) {
          projectiles.splice(i, 1);
        }
      }

      // 3. Update & Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;

        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();

        if (pt.life <= 0) particles.splice(i, 1);
      }

      // 4. Draw Friendly Unit
      const ux = unitX * cellW;
      const uy = unitY * cellH + Math.sin(time * 0.006) * 3;

      // Unit Aura
      ctx.fillStyle = 'rgba(56,189,248,0.3)';
      ctx.beginPath();
      ctx.arc(ux, uy, 18, 0, Math.PI * 2);
      ctx.fill();

      // Unit Icon
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(card.icon, ux, uy);

      // Enemy Target Turret
      const ex = 5 * cellW;
      const ey = 1.2 * cellH;
      ctx.font = '18px sans-serif';
      ctx.fillText('🤖', ex, ey);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [card]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border-2 border-sky-300/80 shadow-[0_0_20px_rgba(56,189,248,0.4)] bg-[#071940]">
      {/* Top Banner Tag */}
      <div className="absolute top-1.5 left-2 z-10 flex items-center gap-1 bg-[#092257]/90 border border-sky-300/60 px-2 py-0.5 rounded-full text-[9px] font-black text-sky-200 shadow">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>LIVE BATTLE ARENA DEMO</span>
      </div>

      <canvas
        ref={canvasRef}
        width={280}
        height={140}
        className="w-full h-32 block bg-[#071940]"
      />
    </div>
  );
};

export const CardCollectionView: React.FC<CardCollectionViewProps> = ({
  inventory,
  activeDeck,
  playerCoins,
  onUpgradeCard,
  onEquipCard,
  onCoinShortfall,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<CardType | null>(null);
  const [equippingCardId, setEquippingCardId] = useState<CardType | null>(null);
  const [filter, setFilter] = useState<'all' | 'upgrade' | 'common' | 'rare' | 'epic'>('all');
  const [justUpgraded, setJustUpgraded] = useState(false);

  const selectedCard = selectedCardId ? ALL_CARDS[selectedCardId] : null;
  const selectedInventory = selectedCardId ? inventory[selectedCardId] : null;

  // Deck Average Elixir
  const avgEnergy = (
    activeDeck.reduce((acc, c) => acc + c.cost, 0) / (activeDeck.length || 1)
  ).toFixed(1);

  // Upgradeable count for notification badge
  const totalUpgradeable = Object.values(inventory).filter(
    (inv) => inv.cards >= inv.cardsRequired && playerCoins >= inv.upgradeCost
  ).length;

  // Filtered Cards
  const allCardEntries = Object.values(ALL_CARDS);
  const filteredCards = allCardEntries.filter((card) => {
    const inv = inventory[card.id];
    const rarity = CARD_RARITIES[card.id]?.rarity;
    if (filter === 'upgrade') {
      return inv && inv.cards >= inv.cardsRequired;
    }
    if (filter === 'common' || filter === 'rare' || filter === 'epic') {
      return rarity === filter;
    }
    return true;
  });

  // Upgrade card action with level up animation
  const handleUpgradeAction = (cardId: CardType) => {
    const inv = inventory[cardId];
    if (!inv) return;

    if (playerCoins < inv.upgradeCost) {
      onCoinShortfall?.(
        `${ALL_CARDS[cardId]?.name || 'Card'} (Lvl ${inv.level + 1})`,
        inv.upgradeCost,
        playerCoins
      );
      return;
    }

    sounds.playCardUpgrade();
    onUpgradeCard(cardId);
    setJustUpgraded(true);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#fbbf24', '#22c55e', '#ffffff'],
    });

    setTimeout(() => {
      setJustUpgraded(false);
    }, 1800);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto scroll-touch p-3 sm:p-4 pb-12 select-none bg-gradient-to-b from-[#1769D2] via-[#124d9c] to-[#17345D] text-white font-body">
      {/* ======================================================== */}
      {/* 1. TOP HEADER & CURRENCY (Royal Fantasy Arena)           */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between pb-2 border-b border-[#FFC83D]/30 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-display text-white flex items-center gap-1.5 drop-shadow tracking-wider">
            BATTLE DECK &amp; CARDS <Sparkles className="w-5 h-5 text-[#FFC83D]" />
          </h1>
          <span className="text-[11px] text-blue-100 font-body font-semibold">
            Build your 4-card tactical loadout • Level up to boost stats
          </span>
        </div>
        <div className="flex items-center gap-1 bg-[#17345D] border-2 border-[#FFC83D] px-2.5 py-1 rounded-xl shadow-[0_2px_8px_rgba(255,200,61,0.3)]">
          <span className="text-[#FFC83D] text-xs">🪙</span>
          <span className="text-xs game-counter font-extrabold text-[#FFC83D]">{playerCoins}</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. ACTIVE BATTLE DECK (4 SLOTS)                          */}
      {/* ======================================================== */}
      <div className="mt-2.5 bg-[#17345D] border-2 border-[#FFC83D] rounded-2xl p-2.5 sm:p-3 shadow-[0_4px_16px_rgba(23,52,93,0.5)] shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-display text-[#FFC83D] uppercase tracking-wider">
              Deck 1 (4 Battle Cards)
            </span>
            <span className="text-[10px] font-display text-[#4a2800] bg-[#FFC83D] px-2 py-0.5 rounded-full border border-white shadow-sm">
              ⚡ Avg: <strong className="game-counter font-extrabold">{avgEnergy}</strong>
            </span>
          </div>

          {equippingCardId && (
            <span className="text-[10px] font-display text-[#FFC83D] animate-pulse bg-[#0f2444] px-2 py-0.5 rounded-full border border-[#FFC83D]/60">
              Tap slot to replace!
            </span>
          )}
        </div>

        {/* 4 Active Deck Slots */}
        <div className="grid grid-cols-4 gap-2">
          {activeDeck.slice(0, 4).map((card, idx) => {
            const inv = inventory[card.id];
            const isEquipTarget = equippingCardId !== null;
            const rarity = CARD_RARITIES[card.id];

            return (
              <div
                key={`${card.id}-${idx}`}
                onClick={() => {
                  if (equippingCardId) {
                    sounds.playClick();
                    onEquipCard(equippingCardId, idx);
                    setEquippingCardId(null);
                  } else {
                    sounds.playClick();
                    setSelectedCardId(card.id);
                  }
                }}
                className={`relative bg-gradient-to-b from-[#1c75e8] via-[#1769D2] to-[#17345D] rounded-xl p-1.5 border-2 border-b-4 flex flex-col items-center cursor-pointer transition active:translate-y-1 active:border-b-2 shadow ${
                  isEquipTarget
                    ? 'border-[#FFC83D] bg-amber-500/20 ring-2 ring-[#FFC83D] animate-pulse'
                    : 'border-[#FFC83D]/70 border-b-[#0b1c36] hover:border-[#FFC83D]'
                }`}
              >
                {/* Elixir Cost droplet on top-left */}
                <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-[#79B957] text-[#123105] game-counter font-extrabold text-[9px] flex items-center justify-center border border-white shadow">
                  {card.cost}
                </div>

                {/* Level badge on top-right */}
                <div className="absolute top-1 right-1 text-[8px] game-counter font-extrabold text-[#4a2800] bg-[#FFC83D] px-1 rounded-sm leading-tight border border-white shadow">
                  Lvl {inv?.level || card.level}
                </div>

                {/* Card Icon */}
                <div className="w-10 h-10 rounded-xl bg-[#0f2444] border border-white/30 flex items-center justify-center text-2xl mt-2.5 shadow-inner">
                  {card.icon}
                </div>
                <span className="text-[10px] font-display text-white truncate max-w-full mt-1">
                  {card.name.split(' ')[0]}
                </span>
                <span className="text-[8px] font-display text-[#FFC83D] mt-0.5 uppercase tracking-wide">
                  Slot {idx + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MASCOT CHAT BALLOON (Reference 120.3s & 155.2s)       */}
      {/* ======================================================== */}
      <div className="mt-2.5 relative w-full flex items-center justify-between bg-gradient-to-r from-[#1746a8] to-[#123687] rounded-2xl p-2.5 border-2 border-sky-300/70 shadow-[0_4px_16px_rgba(14,165,233,0.3)] shrink-0">
        <div className="flex items-center gap-2">
          {/* Comic Chat Balloon with Pointer (Warm Parchment) */}
          <div className="relative parchment-panel px-3 py-1.5 rounded-2xl font-display text-xs shadow-md border-2 border-[#b3830c] flex items-center gap-1.5 text-[#3b2207]">
            <span className="text-[#b3830c]">💡</span>
            <span>Remember to upgrade your cards!</span>
            {totalUpgradeable > 0 && (
              <span className="bg-[#79B957] text-[#123105] text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ml-1 animate-pulse shadow-sm">
                {totalUpgradeable} Ready
              </span>
            )}
          </div>
        </div>

        {/* Mascot Character Peeking in */}
        <div
          onClick={() => sounds.playBattleHorns()}
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1769D2] via-[#FFC83D] to-[#17345D] border-2 border-white shadow flex items-center justify-center text-xl shrink-0 animate-bounce cursor-pointer"
          title="Tap Commander!"
        >
          🤖
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. FILTER TABS (All, Ready to Upgrade, Rarity)            */}
      {/* ======================================================== */}
      <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-display transition cursor-pointer border-2 border-b-4 active:translate-y-0.5 active:border-b-2 ${
            filter === 'all'
              ? 'btn-royal-blue border-white text-white'
              : 'bg-[#17345D] text-blue-200 hover:text-white border-[#3b68a8]/60 border-b-[#0f2444]'
          }`}
        >
          All ({allCardEntries.length})
        </button>

        <button
          onClick={() => setFilter('upgrade')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-display transition cursor-pointer border-2 border-b-4 active:translate-y-0.5 active:border-b-2 ${
            filter === 'upgrade'
              ? 'btn-arena-green border-white text-[#123105]'
              : 'bg-[#17345D] text-[#9ae275] hover:text-white border-[#79B957]/50 border-b-[#0f2444]'
          }`}
        >
          <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />
          Upgrade Ready ({totalUpgradeable})
        </button>

        <button
          onClick={() => setFilter('common')}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-display transition cursor-pointer border-2 border-b-4 active:translate-y-0.5 active:border-b-2 ${
            filter === 'common'
              ? 'bg-slate-400 text-slate-950 shadow border-white border-b-slate-700'
              : 'bg-[#17345D] text-slate-300 hover:text-white border-slate-500/40 border-b-[#0f2444]'
          }`}
        >
          Common
        </button>

        <button
          onClick={() => setFilter('rare')}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-display transition cursor-pointer border-2 border-b-4 active:translate-y-0.5 active:border-b-2 ${
            filter === 'rare'
              ? 'btn-royal-gold border-white text-[#4a2800]'
              : 'bg-[#17345D] text-[#FFC83D] hover:text-white border-[#FFC83D]/40 border-b-[#0f2444]'
          }`}
        >
          Rare
        </button>

        <button
          onClick={() => setFilter('epic')}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-display transition cursor-pointer border-2 border-b-4 active:translate-y-0.5 active:border-b-2 ${
            filter === 'epic'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow border-white border-b-purple-950'
              : 'bg-[#17345D] text-purple-300 hover:text-white border-purple-400/40 border-b-[#0f2444]'
          }`}
        >
          Epic
        </button>
      </div>

      {/* ======================================================== */}
      {/* 5. CARDS COLLECTION GRID (Royal Fantasy Arena Cards)      */}
      {/* ======================================================== */}
      <div className="mt-2.5 flex-1">
        <div className="grid grid-cols-2 gap-2.5">
          {filteredCards.map((card) => {
            const inv = inventory[card.id] || {
              id: card.id,
              level: 1,
              cards: 4,
              cardsRequired: 10,
              upgradeCost: 50,
            };

            const isDeckMember = activeDeck.some((c) => c.id === card.id);
            const canAffordCoins = playerCoins >= inv.upgradeCost;
            const hasEnoughCards = inv.cards >= inv.cardsRequired;
            const canUpgrade = hasEnoughCards && canAffordCoins;
            const progress = Math.min(100, Math.round((inv.cards / inv.cardsRequired) * 100));
            const rarity = CARD_RARITIES[card.id];

            return (
              <div
                key={card.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedCardId(card.id);
                }}
                className={`relative bg-[#17345D] rounded-2xl p-2.5 border-2 border-b-4 transition cursor-pointer active:translate-y-0.5 active:border-b-2 flex flex-col justify-between shadow-[0_4px_14px_rgba(23,52,93,0.5)] ${
                  canUpgrade
                    ? 'border-[#79B957] border-b-[#285014] shadow-[0_0_16px_rgba(121,185,87,0.5)] ring-1 ring-[#79B957]'
                    : isDeckMember
                    ? 'border-[#FFC83D] border-b-[#8c6000] shadow-[0_0_12px_rgba(255,200,61,0.4)]'
                    : `${rarity?.border || 'border-[#3b68a8]/50'} border-b-[#0a182d] hover:border-[#FFC83D]`
                }`}
              >
                {/* Rarity & Deck Badges */}
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-[9px] font-display uppercase px-2 py-0.5 rounded shadow text-white ${rarity?.badgeBg || 'bg-[#1769D2]'}`}>
                    {rarity?.label || 'Common'}
                  </span>

                  {isDeckMember && (
                    <span className="bg-[#FFC83D] text-[#4a2800] font-display text-[9px] uppercase px-2 py-0.5 rounded shadow border border-white">
                      In Deck
                    </span>
                  )}
                </div>

                {/* Card Artwork & Main Info */}
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1c75e8] via-[#1769D2] to-[#17345D] p-1 border-2 border-white/60 flex items-center justify-center text-2xl relative shadow shrink-0">
                    {card.icon}
                    {/* Elixir Cost Droplet */}
                    <span className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-[#79B957] text-[#123105] game-counter font-extrabold text-[9px] flex items-center justify-center border border-white shadow">
                      {card.cost}
                    </span>
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs sm:text-sm font-display text-white truncate drop-shadow">
                      {card.name}
                    </span>
                    <span className="text-[11px] font-display text-[#FFC83D]">
                      Level {inv.level}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-blue-200 game-counter font-extrabold mt-0.5">
                      <span>⚔️ {card.damage}</span>
                      <span>❤️ {card.hp}</span>
                    </div>
                  </div>
                </div>

                {/* Shards Progress Bar */}
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[10px] text-blue-200 mb-0.5 font-bold">
                    <span className="font-display text-[9px] text-[#FFC83D]">CARDS</span>
                    <span className={`game-counter font-extrabold ${hasEnoughCards ? 'text-[#79B957]' : ''}`}>
                      {inv.cards}/{inv.cardsRequired}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#0f2444] rounded-full overflow-hidden border border-[#3b68a8] p-0.5 flex">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        hasEnoughCards
                          ? 'bg-gradient-to-r from-[#9ae275] to-[#79B957] shadow-[0_0_8px_rgba(121,185,87,0.8)]'
                          : 'bg-gradient-to-r from-[#388af6] to-[#1769D2]'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Upgrade Button or Quick Action */}
                {hasEnoughCards ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpgradeAction(card.id);
                    }}
                    className={`mt-2 w-full py-2 px-2 rounded-xl font-display text-xs shadow-lg flex items-center justify-center gap-1 active:translate-y-1 active:border-b-2 cursor-pointer border-2 border-white transition ${
                      canAffordCoins
                        ? 'btn-arena-green text-[#123105] hover:brightness-110 animate-pulse'
                        : 'bg-gradient-to-r from-amber-600 to-amber-700 text-yellow-200 border-b-4 border-b-amber-950'
                    }`}
                  >
                    <ArrowUp className="w-4 h-4 stroke-[3]" />
                    <span>UPGRADE ({inv.upgradeCost} 🪙)</span>
                  </button>
                ) : (
                  <div className="mt-1.5 text-center text-[10px] font-body font-semibold text-blue-200/80">
                    Need {inv.cardsRequired - inv.cards} more to upgrade
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6. CARD DETAIL INSPECTOR & UPGRADE MODAL                  */}
      {/* ======================================================== */}
      {selectedCard && selectedInventory && (
        <ResponsiveModal
          isOpen={true}
          onClose={() => setSelectedCardId(null)}
          title={selectedCard.name}
          subtitle={`Level ${selectedInventory.level} • Cost: ${selectedCard.cost} Energy`}
          icon={<span className="text-2xl">{selectedCard.icon}</span>}
          maxWidthClass="max-w-sm"
        >
          <div className="flex flex-col items-center">
            {/* Level Up Celebration Banner Flash */}
            {justUpgraded && (
              <div className="w-full mb-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 rounded-xl py-1.5 px-3 font-black text-xs text-center border-2 border-white shadow-xl animate-bounce">
                🎉 LEVEL UP! NOW LEVEL {selectedInventory.level}!
              </div>
            )}

            {/* LIVE BATTLE SIMULATION PREVIEW (Frame 165.4s) */}
            <MiniArenaPreview card={selectedCard} />

            {/* Level & Rarity Tags */}
            <div className="flex items-center gap-2 mt-2.5">
              <span className="text-xs font-black text-amber-950 bg-amber-400 border border-white px-2.5 py-0.5 rounded-full shadow">
                Level {selectedInventory.level}
              </span>
              <span className="text-xs font-black text-teal-950 bg-emerald-400 border border-white px-2.5 py-0.5 rounded-full shadow">
                Cost: {selectedCard.cost} Energy
              </span>
              <span className={`text-xs font-black text-white px-2.5 py-0.5 rounded-full shadow ${CARD_RARITIES[selectedCard.id]?.badgeBg || 'bg-sky-500'}`}>
                {CARD_RARITIES[selectedCard.id]?.label || 'Common'}
              </span>
            </div>

            <p className="text-xs text-blue-100 text-center mt-1.5 px-1 font-medium leading-relaxed">
              {selectedCard.description}
            </p>

            {/* Passive Ability Box */}
            {selectedCard.passive && (
              <div className="w-full mt-2.5 bg-[#0a235c] border-2 border-sky-300/50 rounded-2xl p-2.5 flex items-center gap-2.5 shadow">
                <div
                  data-ability-active="true"
                  className="unit-indicator-icon w-9 h-9 rounded-xl bg-sky-500 border border-white flex items-center justify-center text-xl shrink-0 shadow"
                >
                  {selectedCard.passive.icon}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black text-yellow-300 uppercase tracking-wide">
                    Passive: {selectedCard.passive.name}
                  </span>
                  <span className="text-[11px] text-blue-100 leading-snug">
                    {selectedCard.passive.description}
                  </span>
                </div>
              </div>
            )}

            {/* STAT COMPARISON (Warm Parchment Panel) */}
            <div className="w-full mt-2.5 parchment-panel p-3 rounded-2xl text-xs shadow-md">
              <div className="text-[10px] font-display text-[#946927] uppercase tracking-wider mb-1.5 pb-1 border-b border-[#d4a962] flex justify-between">
                <span>COMBAT STATISTICS</span>
                <span className="text-[#285014] font-extrabold">UPGRADE PREVIEW (+15%)</span>
              </div>

              {/* Damage Stat */}
              <div className="flex justify-between items-center py-0.5 text-[#3b2207] font-semibold">
                <span>Damage:</span>
                <div className="flex items-center gap-1.5">
                  <strong className="text-[#3b2207] font-extrabold">{selectedCard.damage}</strong>
                  <span className="text-[#285014] font-extrabold game-counter">
                    ➔ {Math.round(selectedCard.damage * 1.15)} (+{Math.round(selectedCard.damage * 0.15)})
                  </span>
                </div>
              </div>

              {/* Health Stat */}
              <div className="flex justify-between items-center py-0.5 text-[#3b2207] font-semibold">
                <span>Health:</span>
                <div className="flex items-center gap-1.5">
                  <strong className="text-[#3b2207] font-extrabold">{selectedCard.hp}</strong>
                  <span className="text-[#285014] font-extrabold game-counter">
                    ➔ {Math.round(selectedCard.hp * 1.15)} (+{Math.round(selectedCard.hp * 0.15)})
                  </span>
                </div>
              </div>

              {/* Fire Rate */}
              <div className="flex justify-between items-center py-0.5 text-[#3b2207] font-semibold">
                <span>Fire Cadence:</span>
                <strong className="text-[#3b2207] font-extrabold">
                  {selectedCard.fireRate > 0 ? `${selectedCard.fireRate}s per shot` : 'Instant Splash'}
                </strong>
              </div>

              {/* Paint Radius */}
              <div className="flex justify-between items-center py-0.5 text-[#3b2207] font-semibold">
                <span>Paint Radius:</span>
                <strong className="text-[#3b2207] font-extrabold">{selectedCard.paintRadius} Grid Units</strong>
              </div>
            </div>

            {/* Shards Progress Bar in Modal */}
            <div className="w-full mt-2.5 bg-[#17345D] p-2.5 rounded-xl border border-[#3b68a8]">
              <div className="flex items-center justify-between text-xs font-display text-[#FFC83D] mb-1">
                <span>CARD SHARDS</span>
                <span className={selectedInventory.cards >= selectedInventory.cardsRequired ? 'text-[#79B957] game-counter font-extrabold' : 'text-[#FFC83D] game-counter font-extrabold'}>
                  {selectedInventory.cards} / {selectedInventory.cardsRequired}
                </span>
              </div>
              <div className="w-full h-3 bg-[#0f2444] rounded-full p-0.5 border border-[#3b68a8] flex overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FFC83D] to-[#79B957] rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (selectedInventory.cards / selectedInventory.cardsRequired) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Action Buttons: Use in Deck + Upgrade */}
            <div className="flex items-center gap-2 mt-3 w-full">
              {/* Use / Equip Button */}
              <button
                onClick={() => {
                  sounds.playClick();
                  setEquippingCardId(selectedCard.id);
                  setSelectedCardId(null);
                }}
                className={`flex-1 py-3 px-3 rounded-xl font-display text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition border shadow flex items-center justify-center gap-1.5 ${
                  activeDeck.some((c) => c.id === selectedCard.id)
                    ? 'bg-[#17345D] border-[#FFC83D] text-[#FFC83D]'
                    : 'btn-royal-blue text-white border-white'
                }`}
              >
                {activeDeck.some((c) => c.id === selectedCard.id) ? (
                  <>
                    <Check className="w-4 h-4 text-[#79B957]" /> IN ACTIVE DECK
                  </>
                ) : (
                  <>
                    <Swords className="w-4 h-4" /> EQUIP IN DECK
                  </>
                )}
              </button>

              {/* Upgrade Button */}
              {selectedInventory.cards >= selectedInventory.cardsRequired && (
                <button
                  onClick={() => handleUpgradeAction(selectedCard.id)}
                  className={`flex-1 py-3 px-3 rounded-xl font-display text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition flex items-center justify-center gap-1 border border-white shadow ${
                    playerCoins < selectedInventory.upgradeCost
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-yellow-200'
                      : 'btn-arena-green text-[#123105] animate-pulse'
                  }`}
                >
                  <ArrowUp className="w-4 h-4 stroke-[3]" />
                  UPGRADE ({selectedInventory.upgradeCost} 🪙)
                </button>
              )}
            </div>
          </div>
        </ResponsiveModal>
      )}

      {/* ======================================================== */}
      {/* 7. DECK SLOT SELECTOR OVERLAY (When Equipping a Card)     */}
      {/* ======================================================== */}
      {equippingCardId && (
        <ResponsiveModal
          isOpen={true}
          onClose={() => setEquippingCardId(null)}
          title={`Equip ${ALL_CARDS[equippingCardId]?.name}`}
          subtitle="Choose which deck slot to replace:"
          icon={<span className="text-2xl">{ALL_CARDS[equippingCardId]?.icon}</span>}
          maxWidthClass="max-w-sm"
        >
          <div className="flex flex-col gap-2">
            {activeDeck.slice(0, 4).map((slotCard, idx) => {
              const isSameCard = slotCard.id === equippingCardId;

              return (
                <div
                  key={`equip-slot-${idx}`}
                  onClick={() => {
                    sounds.playClick();
                    onEquipCard(equippingCardId, idx);
                    setEquippingCardId(null);
                  }}
                  className={`w-full p-2.5 rounded-2xl border-2 flex items-center justify-between transition cursor-pointer active:scale-98 shadow ${
                    isSameCard
                      ? 'bg-emerald-900/40 border-emerald-400'
                      : 'bg-gradient-to-r from-[#1746a8] to-[#123687] border-sky-300/70 hover:border-yellow-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-sky-300 bg-[#092257] px-2 py-1 rounded-lg">
                      Slot {idx + 1}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[#092257] border border-white/40 flex items-center justify-center text-2xl shadow">
                      {slotCard.icon}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-black text-white">{slotCard.name}</span>
                      <span className="text-[10px] text-sky-200">
                        Level {inventory[slotCard.id]?.level || slotCard.level} • {slotCard.cost}⚡
                      </span>
                    </div>
                  </div>

                  {isSameCard ? (
                    <span className="text-xs font-black text-emerald-300 flex items-center gap-1">
                      <Check className="w-4 h-4 text-emerald-400" /> Equipped
                    </span>
                  ) : (
                    <button className="bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black text-xs px-3 py-1.5 rounded-xl border border-white shadow">
                      Replace
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </ResponsiveModal>
      )}
    </div>
  );
};
