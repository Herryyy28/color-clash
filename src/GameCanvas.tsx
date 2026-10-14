import React, { useRef, useEffect, useCallback } from 'react';
import { Unit, Projectile, Particle, FloatingText, Card, Team, Emote } from './types';

interface GameCanvasProps {
  grid: Team[][];
  units: Unit[];
  projectiles: Projectile[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  emotes: Emote[];
  draggedCard: Card | null;
  dragPos: { x: number; y: number } | null;
  onDeployCard: (card: Card, gridX: number, gridY: number) => void;
  isGameOver: boolean;
}

export const COLS = 16;
export const ROWS = 26;

// Fantasy Kingdom Clash Material Palette
const PALETTE = {
  grass: '#79B957',
  grassLight: '#B7DE78',
  grassDark: '#5E9E3C',
  dirt: '#A89F82',
  stone: '#C8C7B9',
  stoneDark: '#8F8E80',
  stoneLight: '#E2E1D5',
  arenaBg: '#E9E4D4',
  blueTeam: '#2787F5',
  blueTeamDark: '#174DB8',
  blueTeamLight: '#60A5FA',
  redTeam: '#F04452',
  redTeamDark: '#B91C1C',
  redTeamLight: '#FB7185',
  goldAccent: '#FFC84A',
  woodBrown: '#8B5A2B',
  woodDark: '#5C3A1E',
  woodLight: '#BA7A3D',
};

export const GameCanvas: React.FC<GameCanvasProps> = ({
  grid,
  units,
  projectiles,
  particles,
  floatingTexts,
  emotes,
  draggedCard,
  dragPos,
  onDeployCard,
  isGameOver,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calculate arena metrics ensuring strictly square, proportional tiles and centered framing
  const getArenaMetrics = useCallback((width: number, height: number) => {
    // Leave room around the grid for the lush fantasy kingdom environment (towers, grass, trees)
    const maxW = width * 0.88;
    const maxH = height * 0.92;
    const cellSize = Math.min(maxW / COLS, maxH / ROWS);
    const arenaW = cellSize * COLS;
    const arenaH = cellSize * ROWS;
    const paddingX = (width - arenaW) / 2;
    const paddingY = (height - arenaH) / 2;

    return {
      cellSize,
      cellW: cellSize,
      cellH: cellSize,
      arenaW,
      arenaH,
      paddingX,
      paddingY,
    };
  }, []);

  // Convert canvas pixel position to grid coordinates
  const pixelToGrid = useCallback((canvasX: number, canvasY: number, width: number, height: number) => {
    const { cellSize, paddingX, paddingY } = getArenaMetrics(width, height);

    const gx = Math.floor((canvasX - paddingX) / cellSize);
    const gy = Math.floor((canvasY - paddingY) / cellSize);

    return {
      gx: Math.max(0, Math.min(COLS - 1, gx)),
      gy: Math.max(0, Math.min(ROWS - 1, gy)),
      cellW: cellSize,
      cellH: cellSize,
      paddingX,
      paddingY,
    };
  }, [getArenaMetrics]);

  // Main rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = (timestamp: number) => {
      const width = canvas.width;
      const height = canvas.height;
      const { cellW, cellH, arenaW, arenaH, paddingX, paddingY } = getArenaMetrics(width, height);

      ctx.clearRect(0, 0, width, height);

      // ========================================================
      // 1. SURROUNDING FANTASY KINGDOM TERRAIN (Lush Grass, Trees)
      // ========================================================

      // Base lush green kingdom meadow
      const grassGrad = ctx.createLinearGradient(0, 0, width, height);
      grassGrad.addColorStop(0, PALETTE.grass);
      grassGrad.addColorStop(0.5, '#6FA849');
      grassGrad.addColorStop(1, PALETTE.grassDark);
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, 0, width, height);

      // Stylized light grass patches
      ctx.fillStyle = PALETTE.grassLight;
      ctx.globalAlpha = 0.35;
      const patchSize = Math.max(20, Math.floor(cellW * 1.5));
      for (let px = 6; px < width; px += patchSize * 2.2) {
        for (let py = 6; py < height; py += patchSize * 2.5) {
          ctx.beginPath();
          ctx.ellipse(px, py, patchSize * 0.7, patchSize * 0.4, 0.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Small kingdom flowers (yellow, white, pink)
      ctx.globalAlpha = 0.85;
      const flowerPositions = [
        { x: paddingX * 0.35, y: paddingY + 20, color: '#fef08a' },
        { x: paddingX * 0.6, y: paddingY + 80, color: '#ffffff' },
        { x: paddingX * 0.25, y: paddingY + arenaH - 40, color: '#f472b6' },
        { x: width - paddingX * 0.4, y: paddingY + 30, color: '#ffffff' },
        { x: width - paddingX * 0.5, y: paddingY + 120, color: '#fef08a' },
        { x: width - paddingX * 0.3, y: paddingY + arenaH - 60, color: '#60a5fa' },
      ];
      flowerPositions.forEach((fl) => {
        ctx.fillStyle = fl.color;
        ctx.beginPath();
        ctx.arc(fl.x, fl.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = PALETTE.goldAccent;
        ctx.beginPath();
        ctx.arc(fl.x, fl.y, 1, 0, Math.PI * 2);
        ctx.fill();
      });

      // Decorative stylized trees (Clash of Clans puffy tree canopies)
      const renderTree = (tx: number, ty: number, radius: number) => {
        ctx.save();
        // Tree shadow
        ctx.fillStyle = 'rgba(20, 45, 15, 0.45)';
        ctx.beginPath();
        ctx.ellipse(tx + 4, ty + 6, radius * 1.05, radius * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tree trunk
        ctx.fillStyle = PALETTE.woodDark;
        ctx.fillRect(tx - 3, ty + radius * 0.3, 6, radius * 0.5);

        // Tiered puffy foliage
        ctx.fillStyle = '#4E882B';
        ctx.beginPath();
        ctx.arc(tx, ty, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = PALETTE.grass;
        ctx.beginPath();
        ctx.arc(tx - radius * 0.2, ty - radius * 0.2, radius * 0.75, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = PALETTE.grassLight;
        ctx.beginPath();
        ctx.arc(tx - radius * 0.35, ty - radius * 0.35, radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      const treeR = Math.max(12, Math.floor(cellW * 0.85));
      renderTree(paddingX * 0.45, paddingY * 0.55, treeR);
      renderTree(width - paddingX * 0.45, paddingY * 0.55, treeR);
      renderTree(paddingX * 0.45, height - paddingY * 0.55, treeR);
      renderTree(width - paddingX * 0.45, height - paddingY * 0.55, treeR);

      // Wooden fencing along the left and right meadow borders
      ctx.fillStyle = PALETTE.woodBrown;
      ctx.strokeStyle = PALETTE.woodDark;
      ctx.lineWidth = 1;
      const fenceXLeft = paddingX * 0.85;
      const fenceXRight = width - paddingX * 0.85;
      for (let fy = paddingY + 25; fy < paddingY + arenaH - 25; fy += cellH * 3) {
        // Left post & rails
        ctx.fillRect(fenceXLeft - 2, fy, 4, 14);
        ctx.strokeRect(fenceXLeft - 2, fy, 4, 14);
        ctx.fillRect(fenceXLeft - 2, fy + 3, paddingX * 0.15, 2.5);

        // Right post & rails
        ctx.fillRect(fenceXRight - 2, fy, 4, 14);
        ctx.strokeRect(fenceXRight - 2, fy, 4, 14);
        ctx.fillRect(fenceXRight - paddingX * 0.15, fy + 3, paddingX * 0.15, 2.5);
      }

      ctx.globalAlpha = 1.0;

      // ========================================================
      // 2. DEFENSIVE CORNER WATCHTOWERS (Red Top / Blue Bottom)
      // ========================================================
      const renderWatchtower = (wx: number, wy: number, isRed: boolean) => {
        ctx.save();
        const tW = Math.max(16, Math.floor(cellW * 1.3));
        const tH = Math.max(22, Math.floor(cellH * 1.6));

        // Tower shadow
        ctx.fillStyle = 'rgba(15, 35, 20, 0.4)';
        ctx.beginPath();
        ctx.ellipse(wx, wy + tH * 0.5, tW * 0.8, tW * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();

        // Stone base
        ctx.fillStyle = PALETTE.stoneDark;
        ctx.beginPath();
        ctx.roundRect(wx - tW * 0.45, wy - tH * 0.4, tW * 0.9, tH * 0.8, 3);
        ctx.fill();
        ctx.fillStyle = PALETTE.stone;
        ctx.fillRect(wx - tW * 0.4, wy - tH * 0.35, tW * 0.8, tH * 0.7);

        // Wooden battlement floor
        ctx.fillStyle = PALETTE.woodLight;
        ctx.fillRect(wx - tW * 0.5, wy - tH * 0.45, tW, 4);

        // Conical shingle roof
        ctx.fillStyle = isRed ? PALETTE.redTeamDark : PALETTE.blueTeamDark;
        ctx.beginPath();
        ctx.moveTo(wx, wy - tH * 0.9);
        ctx.lineTo(wx + tW * 0.55, wy - tH * 0.45);
        ctx.lineTo(wx - tW * 0.55, wy - tH * 0.45);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = isRed ? PALETTE.redTeam : PALETTE.blueTeam;
        ctx.beginPath();
        ctx.moveTo(wx, wy - tH * 0.9);
        ctx.lineTo(wx + tW * 0.4, wy - tH * 0.45);
        ctx.lineTo(wx - tW * 0.2, wy - tH * 0.45);
        ctx.closePath();
        ctx.fill();

        // Team Flag Pennant
        const flagWave = Math.sin(timestamp * 0.005 + wx) * 3;
        ctx.fillStyle = isRed ? PALETTE.redTeam : PALETTE.blueTeam;
        ctx.beginPath();
        ctx.moveTo(wx, wy - tH * 0.9);
        ctx.lineTo(wx + 10 + flagWave, wy - tH * 0.85);
        ctx.lineTo(wx, wy - tH * 0.8);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      };

      // Top Red Watchtowers
      renderWatchtower(paddingX - 4, paddingY - 2, true);
      renderWatchtower(paddingX + arenaW + 4, paddingY - 2, true);

      // Bottom Blue Watchtowers
      renderWatchtower(paddingX - 4, paddingY + arenaH + 2, false);
      renderWatchtower(paddingX + arenaW + 4, paddingY + arenaH + 2, false);

      // ========================================================
      // 3. ELEVATED STONE RAMPART & ARENA BORDER
      // ========================================================

      // Outer Stone Rampart Shadow
      ctx.save();
      ctx.shadowColor = 'rgba(20, 35, 10, 0.55)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 6;

      // Heavy Chiseled Stone Border
      ctx.fillStyle = PALETTE.stoneDark;
      ctx.beginPath();
      ctx.roundRect(paddingX - 6, paddingY - 6, arenaW + 12, arenaH + 12, 10);
      ctx.fill();
      ctx.restore();

      // Stone Wall Face with bevel
      ctx.fillStyle = PALETTE.stone;
      ctx.beginPath();
      ctx.roundRect(paddingX - 5, paddingY - 5, arenaW + 10, arenaH + 10, 8);
      ctx.fill();

      // Golden Corner Studs / Rivets
      const rivetR = 2.5;
      const cornerOffsets = [
        { x: paddingX - 2, y: paddingY - 2 },
        { x: paddingX + arenaW + 2, y: paddingY - 2 },
        { x: paddingX - 2, y: paddingY + arenaH + 2 },
        { x: paddingX + arenaW + 2, y: paddingY + arenaH + 2 },
      ];
      ctx.fillStyle = PALETTE.goldAccent;
      cornerOffsets.forEach((co) => {
        ctx.beginPath();
        ctx.arc(co.x, co.y, rivetR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = PALETTE.woodDark;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Inner Arena Flagstone Base
      ctx.fillStyle = PALETTE.arenaBg;
      ctx.beginPath();
      ctx.roundRect(paddingX, paddingY, arenaW, arenaH, 5);
      ctx.fill();

      // ========================================================
      // 4. 16x26 TERRITORY CAPTURE FLAGSTONES (Red vs Blue Kingdom)
      // ========================================================
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const owner = grid[r]?.[c] ?? 'neutral';
          const cellX = paddingX + c * cellW;
          const cellY = paddingY + r * cellH;

          // Stylized Clash-style flagstone colors
          let topColor = PALETTE.arenaBg;
          let shadowColor = PALETTE.stone;
          let highlightColor = PALETTE.stoneLight;

          if (owner === 'blue') {
            topColor = PALETTE.blueTeam;
            shadowColor = PALETTE.blueTeamDark;
            highlightColor = PALETTE.blueTeamLight;
          } else if (owner === 'red') {
            topColor = PALETTE.redTeam;
            shadowColor = PALETTE.redTeamDark;
            highlightColor = PALETTE.redTeamLight;
          }

          const inset = 0.75;
          // 3D Flagstone Chiseled Bottom Shadow
          ctx.fillStyle = shadowColor;
          ctx.beginPath();
          ctx.roundRect(cellX + inset, cellY + inset + 1.2, cellW - inset * 2, cellH - inset * 2, 2);
          ctx.fill();

          // 3D Flagstone Top Face
          ctx.fillStyle = topColor;
          ctx.beginPath();
          ctx.roundRect(cellX + inset, cellY + inset, cellW - inset * 2, cellH - inset * 2 - 0.8, 2);
          ctx.fill();

          // Specular Sunlit Bevel
          ctx.fillStyle = highlightColor;
          ctx.globalAlpha = 0.4;
          ctx.fillRect(cellX + inset + 1, cellY + inset + 0.5, cellW - inset * 2 - 2, 1.2);
          ctx.globalAlpha = 1.0;

          // Flagstone Mortar Border
          ctx.strokeStyle = shadowColor;
          ctx.lineWidth = 0.4;
          ctx.strokeRect(cellX + inset, cellY + inset, cellW - inset * 2, cellH - inset * 2 - 0.8);
        }
      }

      // Middle Dividing River / Stone Bridge Boundary
      const midY = paddingY + (ROWS / 2) * cellH;
      ctx.save();
      ctx.strokeStyle = PALETTE.goldAccent;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(paddingX, midY);
      ctx.lineTo(paddingX + arenaW, midY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Center River Crest / Bridge Keystone
      ctx.fillStyle = PALETTE.stone;
      ctx.strokeStyle = PALETTE.goldAccent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(paddingX + arenaW / 2, midY, cellW * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = PALETTE.goldAccent;
      ctx.font = `${Math.max(10, Math.floor(cellW * 0.7))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚔️', paddingX + arenaW / 2, midY);
      ctx.restore();

      // ========================================================
      // 5. AIMING TRAJECTORY & PLACEMENT GUIDE
      // ========================================================
      if (draggedCard && dragPos) {
        const { gx, gy } = pixelToGrid(dragPos.x, dragPos.y, width, height);
        const hoverX = paddingX + (gx + 0.5) * cellW;
        const hoverY = paddingY + (gy + 0.5) * cellH;

        const isSaw = draggedCard.id === 'saw';
        const isBlueTerritory = grid[gy]?.[gx] === 'blue';
        const isValidPlacement = isSaw ? gy >= ROWS / 2 : isBlueTerritory;

        if (isSaw) {
          // Whirlwind Blade Trajectory Guide
          ctx.save();
          const startRayY = hoverY;
          const endRayY = paddingY + 6;

          const grad = ctx.createLinearGradient(0, startRayY, 0, endRayY);
          grad.addColorStop(0, 'rgba(255, 200, 74, 0.45)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
          ctx.fillStyle = grad;
          ctx.fillRect(hoverX - cellW * 0.8, endRayY, cellW * 1.6, startRayY - endRayY);

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([8, 6]);
          ctx.lineDashOffset = -(timestamp * 0.04) % 14;
          ctx.beginPath();
          ctx.moveTo(hoverX, startRayY);
          ctx.lineTo(hoverX, endRayY);
          ctx.stroke();
          ctx.setLineDash([]);

          // Arrowhead
          ctx.fillStyle = PALETTE.goldAccent;
          ctx.beginPath();
          ctx.moveTo(hoverX, endRayY - 8);
          ctx.lineTo(hoverX - 8, endRayY + 8);
          ctx.lineTo(hoverX + 8, endRayY + 8);
          ctx.closePath();
          ctx.fill();

          // Blade Preview Disc
          ctx.beginPath();
          ctx.arc(hoverX, hoverY, cellW * 0.85, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 200, 74, 0.6)';
          ctx.fill();
          ctx.strokeStyle = PALETTE.goldAccent;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        } else {
          // Castle Range Reticle
          ctx.save();
          const rangePx = draggedCard.range * cellW;
          ctx.beginPath();
          ctx.arc(hoverX, hoverY, rangePx, 0, Math.PI * 2);
          ctx.fillStyle = isValidPlacement ? 'rgba(39, 135, 245, 0.12)' : 'rgba(240, 68, 82, 0.12)';
          ctx.fill();
          ctx.strokeStyle = isValidPlacement ? PALETTE.blueTeam : PALETTE.redTeam;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 5]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Center deployment marker
          ctx.beginPath();
          ctx.arc(hoverX, hoverY, cellW * 0.75, 0, Math.PI * 2);
          ctx.fillStyle = isValidPlacement ? 'rgba(39, 135, 245, 0.4)' : 'rgba(240, 68, 82, 0.4)';
          ctx.fill();
          ctx.strokeStyle = isValidPlacement ? '#ffffff' : '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }
      }

      // ========================================================
      // 6. TOY-LIKE FANTASY UNITS & SIEGE ENGINES
      // ========================================================
      units.forEach((unit) => {
        const uX = paddingX + (unit.x + 0.5) * cellW;
        const uY = paddingY + (unit.y + 0.5) * cellH;
        const isBlue = unit.team === 'blue';
        const primaryColor = isBlue ? PALETTE.blueTeam : PALETTE.redTeam;
        const darkColor = isBlue ? PALETTE.blueTeamDark : PALETTE.redTeamDark;
        const accentColor = isBlue ? PALETTE.blueTeamLight : PALETTE.redTeamLight;

        ctx.save();
        ctx.translate(uX, uY);

        // Unit Ground Shadow
        ctx.fillStyle = 'rgba(15, 30, 20, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, cellH * 0.35, cellW * 0.7, cellH * 0.38, 0, 0, Math.PI * 2);
        ctx.fill();

        // Medieval Stone & Timber Pedestal
        ctx.fillStyle = PALETTE.woodDark;
        ctx.beginPath();
        ctx.roundRect(-cellW * 0.6, -cellH * 0.55, cellW * 1.2, cellH * 1.1, 4);
        ctx.fill();

        ctx.fillStyle = darkColor;
        ctx.beginPath();
        ctx.roundRect(-cellW * 0.55, -cellH * 0.5, cellW * 1.1, cellH * 1.0, 3);
        ctx.fill();
        ctx.strokeStyle = PALETTE.goldAccent;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner team crest ring
        ctx.beginPath();
        ctx.arc(0, 0, cellW * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = primaryColor;
        ctx.fill();

        // Turret / Weapon Head with Aim Rotation
        ctx.save();
        ctx.rotate(unit.angle);

        const recoil = -unit.barrelRecoil * 5;

        // Custom Toy-Like Fantasy Weapon Silhouettes
        if (unit.cardId === 'cannon') {
          // Kingdom Catapult / Heavy Mortar (Wooden arm with stone throwing cup)
          ctx.fillStyle = PALETTE.woodLight;
          ctx.fillRect(-cellW * 0.16, recoil, cellW * 0.32, cellH * 0.75);
          ctx.strokeStyle = PALETTE.woodDark;
          ctx.lineWidth = 1;
          ctx.strokeRect(-cellW * 0.16, recoil, cellW * 0.32, cellH * 0.75);

          // Boulder cup
          ctx.fillStyle = accentColor;
          ctx.beginPath();
          ctx.arc(0, recoil + cellH * 0.65, cellW * 0.22, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = PALETTE.goldAccent;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (unit.cardId === 'blaster' || unit.cardId === 'gatling') {
          // Royal Ranger Crossbow / Volley Ballista (Curved wooden limbs)
          ctx.fillStyle = PALETTE.woodBrown;
          ctx.beginPath();
          ctx.arc(0, recoil + cellH * 0.35, cellW * 0.45, Math.PI * 0.9, Math.PI * 0.1, true);
          ctx.lineWidth = 3;
          ctx.strokeStyle = PALETTE.woodLight;
          ctx.stroke();

          // Golden center bowstock
          ctx.fillStyle = PALETTE.goldAccent;
          ctx.fillRect(-cellW * 0.12, recoil, cellW * 0.24, cellH * 0.65);

          // Bowstring
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(-cellW * 0.38, recoil + cellH * 0.45);
          ctx.lineTo(0, recoil + cellH * 0.15);
          ctx.lineTo(cellW * 0.38, recoil + cellH * 0.45);
          ctx.stroke();
        } else if (unit.cardId === 'mortar') {
          // Alchemist Trebuchet (Stone Crucible)
          ctx.fillStyle = PALETTE.stoneDark;
          ctx.beginPath();
          ctx.moveTo(-cellW * 0.18, recoil);
          ctx.lineTo(-cellW * 0.32, recoil + cellH * 0.75);
          ctx.lineTo(cellW * 0.32, recoil + cellH * 0.75);
          ctx.lineTo(cellW * 0.18, recoil);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = PALETTE.goldAccent;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Glowing potion liquid inside
          ctx.fillStyle = accentColor;
          ctx.beginPath();
          ctx.ellipse(0, recoil + cellH * 0.65, cellW * 0.22, cellH * 0.1, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (unit.cardId === 'laser') {
          // Arcane Monolith / Floating Magic Crystal Spire
          ctx.fillStyle = PALETTE.stoneLight;
          ctx.beginPath();
          ctx.moveTo(0, recoil + cellH * 0.8);
          ctx.lineTo(cellW * 0.2, recoil);
          ctx.lineTo(0, recoil + cellH * 0.2);
          ctx.lineTo(-cellW * 0.2, recoil);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = PALETTE.goldAccent;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Floating crystal gem
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(0, recoil + cellH * 0.4, cellW * 0.16, 0, Math.PI * 2);
          ctx.fill();
        } else if (unit.cardId === 'roller') {
          // Armored Siege Battering Ram
          ctx.fillStyle = PALETTE.woodDark;
          ctx.fillRect(-cellW * 0.48, -cellH * 0.5, cellW * 0.96, cellH * 0.9);
          // Iron corner plates
          ctx.fillStyle = PALETTE.stoneDark;
          ctx.fillRect(-cellW * 0.52, -cellH * 0.55, cellW * 0.25, cellH * 0.25);
          ctx.fillRect(cellW * 0.27, -cellH * 0.55, cellW * 0.25, cellH * 0.25);
          // Front spiked roller
          ctx.fillStyle = accentColor;
          ctx.fillRect(-cellW * 0.45, -cellH * 0.75, cellW * 0.9, cellH * 0.25);
        } else {
          // Standard Siege Turret
          ctx.fillStyle = PALETTE.woodLight;
          ctx.fillRect(-cellW * 0.15, recoil, cellW * 0.3, cellH * 0.7);
        }

        // Center knight helmet dome
        ctx.beginPath();
        ctx.arc(0, 0, cellW * 0.28, 0, Math.PI * 2);
        ctx.fillStyle = accentColor;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore(); // restore rotation

        // Active Shield Bubble (Fantasy Arcane Ward)
        if (unit.shieldHp > 0) {
          const pulse = Math.sin(timestamp * 0.006) * 0.08 + 0.92;
          ctx.beginPath();
          ctx.arc(0, 0, cellW * 0.7 * pulse, 0, Math.PI * 2);
          ctx.fillStyle = isBlue ? 'rgba(96, 165, 250, 0.2)' : 'rgba(251, 113, 133, 0.2)';
          ctx.fill();
          ctx.strokeStyle = isBlue ? PALETTE.blueTeamLight : PALETTE.redTeamLight;
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Speed Haste Magic Aura
        if (unit.passive?.type === 'speed_boost' || unit.passive?.type === 'territory_surge') {
          ctx.strokeStyle = PALETTE.goldAccent;
          ctx.lineWidth = 1.6;
          const streakOffset = (timestamp * 0.04) % (cellH * 0.6);
          ctx.beginPath();
          ctx.moveTo(-cellW * 0.35, cellH * 0.3 - streakOffset);
          ctx.lineTo(-cellW * 0.35, cellH * 0.6 - streakOffset);
          ctx.moveTo(cellW * 0.35, cellH * 0.3 - streakOffset);
          ctx.lineTo(cellW * 0.35, cellH * 0.6 - streakOffset);
          ctx.stroke();
        }

        // Passive Perk Crest Badge
        if (unit.passive) {
          const badgeY = -cellH * 0.72;
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(0, badgeY, cellH * 0.25, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = PALETTE.goldAccent;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.font = `${Math.max(9, Math.floor(cellH * 0.26))}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(unit.passive.icon, 0, badgeY + 0.5);
        }

        // Health Bar (Chiseled Stone & Emerald Fill)
        const hpPercent = Math.max(0, unit.hp / unit.maxHp);
        const hpBarW = cellW * 1.05;
        const hpBarH = 3.5;
        const hpBarY = cellH * 0.74;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(-hpBarW / 2, hpBarY, hpBarW, hpBarH);

        ctx.fillStyle = hpPercent > 0.4 ? '#22c55e' : '#ef4444';
        ctx.fillRect(-hpBarW / 2, hpBarY, hpBarW * hpPercent, hpBarH);
        ctx.strokeStyle = PALETTE.woodDark;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(-hpBarW / 2, hpBarY, hpBarW, hpBarH);

        ctx.restore();
      });

      // ========================================================
      // 7. PROJECTILES (Enchanted Arrows, Boulders, Runes)
      // ========================================================
      projectiles.forEach((p) => {
        const px = paddingX + p.x * cellW;
        const py = paddingY + p.y * cellH;
        const isBlue = p.team === 'blue';
        const pColor = isBlue ? PALETTE.blueTeam : PALETTE.redTeam;
        const glowColor = isBlue ? PALETTE.blueTeamLight : PALETTE.redTeamLight;

        ctx.save();
        ctx.translate(px, py);

        if (p.type === 'saw') {
          // Whirlwind Dwarven Razor Blade
          ctx.rotate(p.rotation);
          ctx.fillStyle = PALETTE.goldAccent;
          ctx.beginPath();
          ctx.arc(0, 0, cellW * 0.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          // 4 Rotating saw teeth
          ctx.fillStyle = PALETTE.woodDark;
          for (let st = 0; st < 4; st++) {
            ctx.rotate(Math.PI / 2);
            ctx.fillRect(cellW * 0.65, -2, 6, 4);
          }
        } else if (p.type === 'cannonball') {
          // Heavy Catapult Paint Boulder
          ctx.fillStyle = pColor;
          ctx.beginPath();
          ctx.arc(0, 0, cellW * 0.38, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (p.type === 'mortar') {
          // High Arc Alchemy Flask
          ctx.fillStyle = glowColor;
          ctx.beginPath();
          ctx.arc(0, 0, cellW * 0.32, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = PALETTE.goldAccent;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (p.type === 'laser_beam') {
          // Leyline Arcane Beam
          ctx.fillStyle = '#00f0ff';
          ctx.fillRect(-cellW * 0.12, -cellH * 0.8, cellW * 0.24, cellH * 1.6);
        } else {
          // Royal Ranger Enchanted Crossbow Bolt
          ctx.rotate(Math.atan2(p.vy, p.vx));
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-5, -1.5, 10, 3);
          ctx.fillStyle = pColor;
          ctx.beginPath();
          ctx.moveTo(5, -3);
          ctx.lineTo(9, 0);
          ctx.lineTo(5, 3);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      });

      // ========================================================
      // 8. COMBAT PARTICLES & PAINT BURSTS
      // ========================================================
      particles.forEach((pt) => {
        const ptx = paddingX + pt.x * cellW;
        const pty = paddingY + pt.y * cellH;

        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        if (pt.shape === 'square') {
          ctx.fillRect(ptx - pt.size / 2, pty - pt.size / 2, pt.size, pt.size);
        } else {
          ctx.arc(ptx, pty, pt.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // ========================================================
      // 9. FLOATING DAMAGE & COMBAT NUMBERS
      // ========================================================
      floatingTexts.forEach((ft) => {
        const ftx = paddingX + ft.x * cellW;
        const fty = paddingY + ft.y * cellH;

        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = ft.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.strokeText(ft.text, ftx, fty);
        ctx.fillText(ft.text, ftx, fty);
        ctx.restore();
      });

      // ========================================================
      // 10. TAUNT EMOTES (Speech Bubbles)
      // ========================================================
      emotes.forEach((em) => {
        const emX = paddingX + (em.x + 0.5) * cellW;
        const emY = paddingY + (em.y + 0.5) * cellH;

        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(emX, emY, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = PALETTE.goldAccent;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(em.emoji, emX, emY);
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [grid, units, projectiles, particles, floatingTexts, emotes, draggedCard, dragPos, getArenaMetrics, pixelToGrid]);

  // Pointer interaction for card deployment
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draggedCard || isGameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    const { gx, gy } = pixelToGrid(canvasX, canvasY, canvas.width, canvas.height);

    // Validate placement rules
    const isSaw = draggedCard.id === 'saw';
    const isBlueTerritory = grid[gy]?.[gx] === 'blue';
    const canDeploy = isSaw ? gy >= ROWS / 2 : isBlueTerritory;

    if (canDeploy) {
      onDeployCard(draggedCard, gx, gy);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        width={480}
        height={780}
        onPointerUp={handlePointerUp}
        className="aspect-[16/26] max-w-[430px] max-h-full min-h-0 w-auto h-auto block select-none touch-none shadow-2xl rounded-2xl"
      />
    </div>
  );
};
