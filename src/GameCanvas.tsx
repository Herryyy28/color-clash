import React, { useRef, useEffect, useCallback } from 'react';
import { Unit, Projectile, Particle, FloatingText, Card, Team, Emote } from './types';
import { sounds } from './audio';

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

  // Convert canvas pixel position to grid coordinates
  const pixelToGrid = useCallback((canvasX: number, canvasY: number, width: number, height: number) => {
    const paddingX = width * 0.04;
    const paddingY = height * 0.02;
    const arenaW = width - paddingX * 2;
    const arenaH = height - paddingY * 2;

    const cellW = arenaW / COLS;
    const cellH = arenaH / ROWS;

    const gx = Math.floor((canvasX - paddingX) / cellW);
    const gy = Math.floor((canvasY - paddingY) / cellH);

    return {
      gx: Math.max(0, Math.min(COLS - 1, gx)),
      gy: Math.max(0, Math.min(ROWS - 1, gy)),
      cellW,
      cellH,
      paddingX,
      paddingY,
    };
  }, []);

  // Main rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 1. Render Arena Outer Frame / Border (Exact match to reference white-beveled stadium card)
      const paddingX = width * 0.04;
      const paddingY = height * 0.02;
      const arenaW = width - paddingX * 2;
      const arenaH = height - paddingY * 2;

      const cellW = arenaW / COLS;
      const cellH = arenaH / ROWS;

      // Outer bezel with white elevated rim and drop shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(paddingX - 4, paddingY - 4, arenaW + 8, arenaH + 8, 14);
      ctx.fill();
      ctx.restore();

      // Inner stadium background
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(paddingX, paddingY, arenaW, arenaH, 10);
      ctx.fill();

      // 2. Render Voxel Grid Cells
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const owner = grid[r]?.[c] ?? 'neutral';
          const cellX = paddingX + c * cellW;
          const cellY = paddingY + r * cellH;

          // Colors matching the video
          let fillColor = '#334155';
          let borderColor = '#475569';
          let highlightColor = '#64748b';

          if (owner === 'blue') {
            fillColor = '#0284c7'; // vibrant azure blue
            borderColor = '#0369a1';
            highlightColor = '#38bdf8';
          } else if (owner === 'red') {
            fillColor = '#e11d48'; // vibrant ruby red
            borderColor = '#be123c';
            highlightColor = '#fb7185';
          }

          // 3D Voxel Extruded Base (Bottom shadow bevel)
          const inset = 0.8;
          ctx.fillStyle = borderColor;
          ctx.beginPath();
          ctx.roundRect(cellX + inset, cellY + inset + 1.5, cellW - inset * 2, cellH - inset * 2, 2.5);
          ctx.fill();

          // Voxel Top Face
          ctx.fillStyle = fillColor;
          ctx.beginPath();
          ctx.roundRect(cellX + inset, cellY + inset, cellW - inset * 2, cellH - inset * 2 - 1, 2.5);
          ctx.fill();

          // 3D Specular Top-Left Highlight
          ctx.fillStyle = highlightColor;
          ctx.globalAlpha = 0.45;
          ctx.fillRect(cellX + inset + 1, cellY + inset + 0.8, cellW - inset * 2 - 2, 1.6);
          ctx.globalAlpha = 1.0;

          // Subtle grid outline
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 0.5;
          ctx.strokeRect(cellX + inset, cellY + inset, cellW - inset * 2, cellH - inset * 2 - 1);
        }
      }

      // Middle dividing line pulse
      const midY = paddingY + (ROWS / 2) * cellH;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(paddingX, midY);
      ctx.lineTo(paddingX + arenaW, midY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Render Aiming Trajectory / Placement Guide if Dragging
      if (draggedCard && dragPos) {
        const { gx, gy } = pixelToGrid(dragPos.x, dragPos.y, width, height);
        const hoverX = paddingX + (gx + 0.5) * cellW;
        const hoverY = paddingY + (gy + 0.5) * cellH;

        const isSaw = draggedCard.id === 'saw';
        const isBlueTerritory = grid[gy]?.[gx] === 'blue';
        const isValidPlacement = isSaw ? gy >= ROWS / 2 : isBlueTerritory;

        if (isSaw) {
          // Saw Trajectory Ray (exact matching from video: white glowing dashed ray pointing up with arrow!)
          ctx.save();
          const startRayY = hoverY;
          const endRayY = paddingY + 10;

          // Glowing corridor
          const grad = ctx.createLinearGradient(0, startRayY, 0, endRayY);
          grad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
          ctx.fillStyle = grad;
          ctx.fillRect(hoverX - cellW * 0.9, endRayY, cellW * 1.8, startRayY - endRayY);

          // Center trajectory dashed line
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([8, 8]);
          ctx.lineDashOffset = -(Date.now() / 25) % 16;
          ctx.beginPath();
          ctx.moveTo(hoverX, startRayY);
          ctx.lineTo(hoverX, endRayY);
          ctx.stroke();
          ctx.setLineDash([]);

          // Arrowhead pointing forward
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(hoverX, endRayY - 8);
          ctx.lineTo(hoverX - 9, endRayY + 10);
          ctx.lineTo(hoverX + 9, endRayY + 10);
          ctx.closePath();
          ctx.fill();

          // Saw preview disk
          ctx.beginPath();
          ctx.arc(hoverX, hoverY, cellW * 0.9, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(245, 158, 11, 0.6)';
          ctx.fill();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        } else {
          // Range & Placement Ring
          ctx.save();
          const rangePx = draggedCard.range * cellW;
          ctx.beginPath();
          ctx.arc(hoverX, hoverY, rangePx, 0, Math.PI * 2);
          ctx.fillStyle = isValidPlacement ? 'rgba(56, 189, 248, 0.12)' : 'rgba(239, 68, 68, 0.12)';
          ctx.fill();
          ctx.strokeStyle = isValidPlacement ? 'rgba(56, 189, 248, 0.6)' : 'rgba(239, 68, 68, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Center target reticle
          ctx.beginPath();
          ctx.arc(hoverX, hoverY, cellW * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = isValidPlacement ? 'rgba(14, 165, 233, 0.4)' : 'rgba(239, 68, 68, 0.4)';
          ctx.fill();
          ctx.strokeStyle = isValidPlacement ? '#38bdf8' : '#ef4444';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }
      }

      // 4. Render Units (Turrets, Cannons, Blasters)
      units.forEach((unit) => {
        const uX = paddingX + (unit.x + 0.5) * cellW;
        const uY = paddingY + (unit.y + 0.5) * cellH;
        const isBlue = unit.team === 'blue';
        const primaryColor = isBlue ? '#0284c7' : '#e11d48';
        const darkColor = isBlue ? '#0f172a' : '#450a0a';
        const accentColor = isBlue ? '#38bdf8' : '#fb7185';

        ctx.save();
        ctx.translate(uX, uY);

        // Unit Drop Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, cellH * 0.35, cellW * 0.75, cellH * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Base Pedestal
        ctx.fillStyle = darkColor;
        ctx.beginPath();
        ctx.roundRect(-cellW * 0.65, -cellH * 0.6, cellW * 1.3, cellH * 1.2, 5);
        ctx.fill();
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner glowing ring
        ctx.beginPath();
        ctx.arc(0, 0, cellW * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = primaryColor;
        ctx.fill();

        // Rotating Barrel / Turret Head
        ctx.save();
        ctx.rotate(unit.angle);

        // Barrel recoil offset
        const recoilOffset = -unit.barrelRecoil * 5;

        if (unit.cardId === 'cannon') {
          // Thick mortar barrel with red/blue muzzle
          ctx.fillStyle = '#334155';
          ctx.fillRect(-cellW * 0.2, recoilOffset, cellW * 0.4, cellH * 0.75);
          // Muzzle ring
          ctx.fillStyle = accentColor;
          ctx.fillRect(-cellW * 0.22, recoilOffset + cellH * 0.65, cellW * 0.44, cellH * 0.15);
        } else if (unit.cardId === 'blaster' || unit.cardId === 'gatling') {
          // Multi-barrel setup
          ctx.fillStyle = '#475569';
          ctx.fillRect(-cellW * 0.25, recoilOffset, cellW * 0.18, cellH * 0.65);
          ctx.fillRect(cellW * 0.07, recoilOffset, cellW * 0.18, cellH * 0.65);
          ctx.fillStyle = accentColor;
          ctx.fillRect(-cellW * 0.25, recoilOffset + cellH * 0.55, cellW * 0.18, 3);
          ctx.fillRect(cellW * 0.07, recoilOffset + cellH * 0.55, cellW * 0.18, 3);
        } else if (unit.cardId === 'mortar') {
          // Wide funnel mortar
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.moveTo(-cellW * 0.15, recoilOffset);
          ctx.lineTo(-cellW * 0.35, recoilOffset + cellH * 0.75);
          ctx.lineTo(cellW * 0.35, recoilOffset + cellH * 0.75);
          ctx.lineTo(cellW * 0.15, recoilOffset);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (unit.cardId === 'roller') {
          // White tank chassis with treads and front roller (from frame 71.1s)
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-cellW * 0.52, -cellH * 0.55, cellW * 0.2, cellH * 1.1);
          ctx.fillRect(cellW * 0.32, -cellH * 0.55, cellW * 0.2, cellH * 1.1);
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.roundRect(-cellW * 0.36, -cellH * 0.5, cellW * 0.72, cellH * 1.0, 3);
          ctx.fill();
          ctx.fillStyle = accentColor;
          ctx.fillRect(-cellW * 0.44, -cellH * 0.7, cellW * 0.88, cellH * 0.25);
          ctx.fillStyle = '#475569';
          ctx.fillRect(-cellW * 0.12, recoilOffset, cellW * 0.24, cellH * 0.55);
        } else {
          // Standard turret barrel
          ctx.fillStyle = '#334155';
          ctx.fillRect(-cellW * 0.15, recoilOffset, cellW * 0.3, cellH * 0.7);
        }

        // Center turret dome
        ctx.beginPath();
        ctx.arc(0, 0, cellW * 0.32, 0, Math.PI * 2);
        ctx.fillStyle = accentColor;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.restore(); // restore angle rotation

        // Level Pill Badge (just like in video: "Lvl. 1" or "Lvl. 3" white pill!)
        const badgeY = -cellH * 0.85;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(-cellW * 0.55, badgeY, cellW * 1.1, cellH * 0.42, 4);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = `bold ${Math.max(9, Math.floor(cellH * 0.3))}px Fredoka, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Lvl.${unit.level}`, 0, badgeY + cellH * 0.21);

        // HP Bar under unit
        const hpPercent = Math.max(0, unit.hp / unit.maxHp);
        const hpBarW = cellW * 1.1;
        const hpBarH = 3.5;
        const hpBarY = cellH * 0.75;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(-hpBarW / 2, hpBarY, hpBarW, hpBarH);
        ctx.fillStyle = isBlue ? '#22c55e' : '#ef4444';
        ctx.fillRect(-hpBarW / 2, hpBarY, hpBarW * hpPercent, hpBarH);

        ctx.restore();
      });

      // 5. Render Projectiles (Cannonballs, Paint Pellets, Buzz Saws, Mortars)
      projectiles.forEach((p) => {
        const pX = paddingX + (p.x + 0.5) * cellW;
        const pY = paddingY + (p.y + 0.5) * cellH;
        const isBlue = p.team === 'blue';
        const color = isBlue ? '#38bdf8' : '#fb7185';
        const trailColor = isBlue ? 'rgba(56, 189, 248, 0.4)' : 'rgba(251, 113, 133, 0.4)';

        ctx.save();

        if (p.type === 'saw') {
          // Spinning Buzz Saw Disc
          ctx.translate(pX, pY);
          ctx.rotate(p.rotation);

          // Glow halo
          ctx.beginPath();
          ctx.arc(0, 0, cellW * 0.9, 0, Math.PI * 2);
          ctx.fillStyle = isBlue ? 'rgba(56, 189, 248, 0.35)' : 'rgba(245, 158, 11, 0.35)';
          ctx.fill();

          // Serrated circular saw blade
          const teeth = 12;
          const outerR = cellW * 0.85;
          const innerR = cellW * 0.65;
          ctx.beginPath();
          for (let i = 0; i < teeth; i++) {
            const a1 = (i / teeth) * Math.PI * 2;
            const a2 = ((i + 0.5) / teeth) * Math.PI * 2;
            ctx.lineTo(Math.cos(a1) * outerR, Math.sin(a1) * outerR);
            ctx.lineTo(Math.cos(a2) * innerR, Math.sin(a2) * innerR);
          }
          ctx.closePath();
          ctx.fillStyle = '#f1f5f9';
          ctx.fill();
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Inner metallic hub
          ctx.beginPath();
          ctx.arc(0, 0, cellW * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = isBlue ? '#0284c7' : '#d97706';
          ctx.fill();
        } else if (p.type === 'cannonball') {
          // Glossy paint cannonball
          ctx.shadowColor = color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(pX, pY, cellW * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();

          // Gloss specular reflection
          ctx.beginPath();
          ctx.arc(pX - cellW * 0.12, pY - cellW * 0.12, cellW * 0.15, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        } else if (p.type === 'mortar') {
          // Parabolic arc mortar with simulated altitude
          const arc = p.arcProgress ?? 0;
          const altitude = Math.sin(arc * Math.PI) * cellH * 3.5;

          // Shadow on the ground
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.beginPath();
          ctx.ellipse(pX, pY, cellW * 0.35, cellH * 0.2, 0, 0, Math.PI * 2);
          ctx.fill();

          // Airborne shell
          const shellY = pY - altitude;
          ctx.beginPath();
          ctx.arc(pX, shellY, cellW * 0.55 * (1 + (altitude / (cellH * 3.5)) * 0.3), 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else {
          // Fast dart pellet / blaster shot
          ctx.translate(pX, pY);
          const angle = Math.atan2(p.vy, p.vx);
          ctx.rotate(angle);

          // Arrow projectile
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(cellW * 0.35, 0);
          ctx.lineTo(-cellW * 0.25, -cellH * 0.15);
          ctx.lineTo(-cellW * 0.1, 0);
          ctx.lineTo(-cellW * 0.25, cellH * 0.15);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      });

      // 6. Render Particles (Paint splats, sparks, smoke)
      particles.forEach((pt) => {
        const ptX = paddingX + (pt.x + 0.5) * cellW;
        const ptY = paddingY + (pt.y + 0.5) * cellH;

        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);

        if (pt.shape === 'ring') {
          ctx.strokeStyle = pt.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(ptX, ptY, pt.size * cellW, 0, Math.PI * 2);
          ctx.stroke();
        } else if (pt.shape === 'square') {
          ctx.fillStyle = pt.color;
          ctx.fillRect(ptX - pt.size / 2, ptY - pt.size / 2, pt.size, pt.size);
        } else {
          ctx.fillStyle = pt.color;
          ctx.beginPath();
          ctx.arc(ptX, ptY, pt.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      // 7. Render Floating Text (+120, SPLAT, etc.)
      floatingTexts.forEach((ft) => {
        const ftX = paddingX + (ft.x + 0.5) * cellW;
        const ftY = paddingY + (ft.y + 0.5) * cellH;

        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.font = `800 ${Math.max(12, Math.floor(cellH * 0.5))}px Fredoka, sans-serif`;
        ctx.fillStyle = ft.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.textAlign = 'center';
        ctx.strokeText(ft.text, ftX, ftY);
        ctx.fillText(ft.text, ftX, ftY);
        ctx.restore();
      });

      // 8. Render Animated Emotes on Battlefield
      emotes.forEach((em) => {
        const emX = paddingX + (em.x + 0.5) * cellW;
        const emY = paddingY + (em.y + 0.5) * cellH;
        const age = (Date.now() - em.createdAt) / 1000;
        if (age > 2.5) return;

        const scale = age < 0.2 ? age / 0.2 : 1;
        const floatY = emY - age * 18;

        ctx.save();
        ctx.translate(emX, floatY);
        ctx.scale(scale, scale);

        // Speech bubble bg
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(-22, -22, 44, 44, 12);
        ctx.fill();
        ctx.strokeStyle = em.team === 'blue' ? '#0284c7' : '#e11d48';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(em.emoji, 0, 0);

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [grid, units, projectiles, particles, floatingTexts, emotes, draggedCard, dragPos, pixelToGrid]);

  // Pointer Up Handler to deploy card
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draggedCard || isGameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const { gx, gy } = pixelToGrid(clientX, clientY, canvas.width, canvas.height);

    // Rule: saw can be launched anywhere on player half; turrets must be on blue tiles
    const isSaw = draggedCard.id === 'saw';
    const isBlueTile = grid[gy]?.[gx] === 'blue';
    const isValid = isSaw ? gy >= ROWS / 2 : isBlueTile;

    if (isValid) {
      onDeployCard(draggedCard, gx, gy);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-1">
      <canvas
        ref={canvasRef}
        width={420}
        height={630}
        onPointerUp={handlePointerUp}
        className="max-h-[72vh] aspect-[2/3] touch-none rounded-xl bg-slate-900 border border-slate-700/60 shadow-2xl"
      />
    </div>
  );
};
