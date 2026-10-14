/**
 * Authoritative Combat System for Color Clash
 * Resolves target acquisition, projectile physics, shield damage mitigation,
 * unit elimination, and impact paint splats.
 */

import { UnitRuntime, ProjectileRuntime, ParticleEffect, FloatingNotification, BattleEventLog } from './BattleTypes';
import { ALL_CARDS } from '../cardsData';
import { TerritoryManager } from './TerritoryManager';
import { GRID_COLS, GRID_ROWS } from './ArenaGrid';
import { sounds } from '../audio';

export interface CombatTickEvents {
  events: BattleEventLog[];
  newParticles: ParticleEffect[];
  newFloatingTexts: FloatingNotification[];
}

export class CombatSystem {
  private territoryManager: TerritoryManager;

  constructor(territoryManager: TerritoryManager) {
    this.territoryManager = territoryManager;
  }

  /**
   * Updates turret target tracking, cooldowns, and fires projectiles
   */
  public updateUnitCombat(
    units: UnitRuntime[],
    projectiles: ProjectileRuntime[],
    deltaSec: number
  ): CombatTickEvents {
    const tickEvents: CombatTickEvents = {
      events: [],
      newParticles: [],
      newFloatingTexts: [],
    };

    units.forEach((unit) => {
      if (unit.isDead) return;

      // 1. Recover barrel recoil
      unit.barrelRecoil = Math.max(0, unit.barrelRecoil - deltaSec * 5.0);

      // 2. Acquire nearest enemy target
      const enemies = units.filter((u) => u.team !== unit.team && !u.isDead);
      let targetAngle = unit.team === 'blue' ? -Math.PI / 2 : Math.PI / 2;

      if (enemies.length > 0) {
        let closestDist = Infinity;
        let closestEnemy: UnitRuntime | null = null;

        enemies.forEach((enemy) => {
          const d = Math.hypot(enemy.x - unit.x, enemy.y - unit.y);
          if (d < closestDist) {
            closestDist = d;
            closestEnemy = enemy;
          }
        });

        if (closestEnemy) {
          unit.targetUnitId = (closestEnemy as UnitRuntime).id;
          targetAngle = Math.atan2((closestEnemy as UnitRuntime).y - unit.y, (closestEnemy as UnitRuntime).x - unit.x);
        }
      } else {
        unit.targetUnitId = null;
      }

      // Smooth angle interpolation
      let diff = targetAngle - unit.angle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      unit.angle += diff * 0.18;

      // 3. Tick attack cooldown
      unit.shootCooldown -= deltaSec;

      if (unit.shootCooldown <= 0) {
        const cardData = ALL_CARDS[unit.cardId] || ALL_CARDS.blaster;
        const speedBonus = unit.passive?.type === 'rapid_overcharge' ? 1.3 : 1.0;
        unit.shootCooldown = cardData.fireRate > 0 ? (cardData.fireRate / speedBonus) : 1.2;
        unit.barrelRecoil = 1.0;
        unit.totalShotsFired++;

        // Spawn projectile according to card identity
        const isEnemy = unit.team === 'red';
        const projType: ProjectileRuntime['type'] =
          unit.cardId === 'cannon' ? 'cannonball' : unit.cardId === 'mortar' ? 'mortar' : 'bullet';

        if (projType === 'cannonball') {
          sounds.playCannonShot(isEnemy);
        } else {
          sounds.playBlasterShot(isEnemy);
        }

        const projSpeed = 0.55 * (unit.passive?.type === 'rapid_overcharge' ? 1.25 : 1.0);
        const vx = Math.cos(unit.angle) * projSpeed;
        const vy = Math.sin(unit.angle) * projSpeed;

        projectiles.push({
          id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          team: unit.team,
          type: projType,
          x: unit.x + Math.cos(unit.angle) * 0.8,
          y: unit.y + Math.sin(unit.angle) * 0.8,
          vx,
          vy,
          startX: unit.x,
          startY: unit.y,
          targetX: unit.x + Math.cos(unit.angle) * cardData.range,
          targetY: unit.y + Math.sin(unit.angle) * cardData.range,
          paintRadius: cardData.paintRadius,
          damage: cardData.damage,
          life: 85,
          maxLife: 85,
          rotation: unit.angle,
        });
      }
    });

    return tickEvents;
  }

  /**
   * Updates projectile movement, collision checks, shield absorption, and impact splats
   */
  public updateProjectiles(
    projectiles: ProjectileRuntime[],
    units: UnitRuntime[]
  ): CombatTickEvents {
    const tickEvents: CombatTickEvents = {
      events: [],
      newParticles: [],
      newFloatingTexts: [],
    };

    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1;

      // Arena boundary collision
      const isOutOfBounds = p.x < 0 || p.x >= GRID_COLS || p.y < 0 || p.y >= GRID_ROWS;

      if (isOutOfBounds || p.life <= 0) {
        sounds.playPaintSplat();
        this.territoryManager.paintRadial(Math.round(p.x), Math.round(p.y), p.paintRadius, p.team);
        this.spawnImpactParticles(p.x, p.y, p.team, tickEvents);
        projectiles.splice(i, 1);
        continue;
      }

      // Unit collision check
      let hitTarget = false;
      for (const unit of units) {
        if (unit.team !== p.team && !unit.isDead) {
          const dist = Math.hypot(unit.x - p.x, unit.y - p.y);
          if (dist < 1.1) {
            hitTarget = true;
            sounds.playPaintSplat();
            this.territoryManager.paintRadial(Math.round(p.x), Math.round(p.y), p.paintRadius, p.team);
            this.spawnImpactParticles(p.x, p.y, p.team, tickEvents);

            // Damage resolution: Shield absorbs first!
            let remainingDamage = p.damage;
            if (unit.shieldHp > 0) {
              if (unit.shieldHp >= remainingDamage) {
                unit.shieldHp -= remainingDamage;
                remainingDamage = 0;
              } else {
                remainingDamage -= unit.shieldHp;
                unit.shieldHp = 0;
              }
            }

            unit.hp = Math.max(0, unit.hp - remainingDamage);

            // Floating damage text
            tickEvents.newFloatingTexts.push({
              id: `ft_${Date.now()}_${Math.random()}`,
              x: unit.x,
              y: unit.y - 0.5,
              text: `-${p.damage}`,
              color: p.team === 'blue' ? '#38bdf8' : '#fb7185',
              alpha: 1.0,
              life: 25,
              maxLife: 25,
            });

            // Check if unit eliminated
            if (unit.hp <= 0 && !unit.isDead) {
              unit.isDead = true;
              sounds.playUnitExplode();
              const isBlue = unit.team === 'blue';
              const cardData = ALL_CARDS[unit.cardId];
              tickEvents.events.push({
                id: `evt_${Date.now()}`,
                type: 'turret_destroyed',
                text: `${isBlue ? 'Blue' : 'Red'} ${cardData?.name || 'Unit'} Destroyed`,
                subtext: isBlue ? 'Friendly loss' : 'Enemy position cleared',
                team: unit.team,
                timestamp: Date.now(),
                icon: '💥',
              });

              this.spawnExplosionParticles(unit.x, unit.y, unit.team, tickEvents);
            }

            // Piercing attacks like Buzzsaw pierce through; standard projectiles consume on impact
            if (p.type !== 'saw') {
              projectiles.splice(i, 1);
              break;
            }
          }
        }
      }
    }

    return tickEvents;
  }

  private spawnImpactParticles(x: number, y: number, team: 'blue' | 'red', tickEvents: CombatTickEvents) {
    for (let j = 0; j < 6; j++) {
      tickEvents.newParticles.push({
        id: `p_${Math.random()}`,
        x,
        y,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        color: team === 'blue' ? '#38bdf8' : '#fb7185',
        size: Math.random() * 4 + 2,
        alpha: 1.0,
        life: 20,
        maxLife: 20,
        shape: 'circle',
      });
    }
  }

  private spawnExplosionParticles(x: number, y: number, team: 'blue' | 'red', tickEvents: CombatTickEvents) {
    for (let j = 0; j < 14; j++) {
      tickEvents.newParticles.push({
        id: `exp_${Math.random()}`,
        x,
        y,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        color: team === 'blue' ? '#0ea5e9' : '#f43f5e',
        size: Math.random() * 6 + 3,
        alpha: 1.0,
        life: 30,
        maxLife: 30,
        shape: 'circle',
      });
    }
  }
}
