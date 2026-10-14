/**
 * Authoritative Movement System for Color Clash
 * Updates positions for mobile units (Rollers), clamps arena boundaries,
 * and applies terrain speed advantages on friendly painted territory.
 */

import { UnitRuntime } from './BattleTypes';
import { ArenaGrid, GRID_COLS, GRID_ROWS } from './ArenaGrid';
import { TerritoryManager } from './TerritoryManager';

export class MovementSystem {
  private arenaGrid: ArenaGrid;
  private territoryManager: TerritoryManager;

  constructor(arenaGrid: ArenaGrid, territoryManager: TerritoryManager) {
    this.arenaGrid = arenaGrid;
    this.territoryManager = territoryManager;
  }

  public updateUnitsMovement(units: UnitRuntime[], deltaSec: number) {
    units.forEach((unit) => {
      if (unit.isDead) return;

      // Only mobile vehicles move
      if (unit.cardId === 'roller') {
        const dir = unit.team === 'blue' ? -1 : 1;
        const currentTile = this.arenaGrid.getTile(Math.floor(unit.x), Math.floor(unit.y));

        // Speed boost when riding on friendly painted paint
        const isFriendlyTerrain = currentTile?.owner === unit.team;
        const terrainSpeedBonus = isFriendlyTerrain ? (unit.passive?.speedFactor ?? 1.35) : 1.0;
        const baseSpeed = 2.4 * deltaSec; // ~2.4 tiles per second
        const movementStep = dir * baseSpeed * unit.speedMultiplier * terrainSpeedBonus;

        const nextY = unit.y + movementStep;

        // Boundary collision check
        if (nextY >= 1 && nextY <= GRID_ROWS - 2) {
          unit.y = nextY;
          // Roller continuously paints territory underneath its treads
          this.territoryManager.paintRadial(Math.round(unit.x), Math.round(unit.y), 1.8, unit.team);
        }
      }
    });
  }
}
