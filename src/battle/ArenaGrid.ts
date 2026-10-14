/**
 * Authoritative Arena Grid for Color Clash
 * 16 Columns x 26 Rows (416 tiles).
 * Coordinates, bounds checking, occupancy, and deployment rules.
 */

import { GridCoord, TileState } from './BattleTypes';
import { Team } from '../types';

export const GRID_COLS = 16;
export const GRID_ROWS = 26;
export const TOTAL_TILES = GRID_COLS * GRID_ROWS;

export class ArenaGrid {
  private tiles: TileState[][] = [];

  constructor() {
    this.resetGrid();
  }

  public resetGrid() {
    this.tiles = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      const row: TileState[] = [];
      const defaultOwner: Team = r < GRID_ROWS / 2 ? 'red' : 'blue';
      for (let c = 0; c < GRID_COLS; c++) {
        row.push({
          id: `tile_${c}_${r}`,
          x: c,
          y: r,
          owner: defaultOwner,
          paintIntensity: 1.0,
          lastPaintedAt: 0,
        });
      }
      this.tiles.push(row);
    }
  }

  public getTile(x: number, y: number): TileState | null {
    if (!this.isInBounds(x, y)) return null;
    return this.tiles[y][x];
  }

  public setTileOwner(x: number, y: number, owner: Team, timestamp: number = Date.now()): boolean {
    if (!this.isInBounds(x, y)) return false;
    const tile = this.tiles[y][x];
    const changed = tile.owner !== owner;
    tile.owner = owner;
    tile.paintIntensity = 1.0;
    tile.lastPaintedAt = timestamp;
    return changed;
  }

  public isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < GRID_COLS && y >= 0 && y < GRID_ROWS;
  }

  public clampCoord(x: number, y: number): GridCoord {
    return {
      x: Math.max(0, Math.min(GRID_COLS - 1, x)),
      y: Math.max(0, Math.min(GRID_ROWS - 1, y)),
    };
  }

  public isValidDeploymentCell(team: Team, x: number, y: number, isSpecialLaneCard: boolean = false): boolean {
    if (!this.isInBounds(x, y)) return false;

    // Special lane projectiles (buzzsaw/laser/mortar) can target anywhere inside arena
    if (isSpecialLaneCard) return true;

    const tile = this.getTile(x, y);
    if (!tile) return false;

    // Direct placement: must be on friendly territory, or on friendly half of arena
    if (team === 'blue') {
      return tile.owner === 'blue' || y >= GRID_ROWS / 2;
    } else {
      return tile.owner === 'red' || y < GRID_ROWS / 2;
    }
  }

  public getAllTiles(): TileState[][] {
    return this.tiles;
  }

  public getRawGridOwners(): Team[][] {
    return this.tiles.map((row) => row.map((t) => t.owner));
  }
}
