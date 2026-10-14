/**
 * Authoritative Territory Manager for Color Clash
 * Manages paint splats, capture radius, continuous trails,
 * and exact mathematical territory percentages from a single denominator.
 */

import { ArenaGrid, GRID_COLS, GRID_ROWS, TOTAL_TILES } from './ArenaGrid';
import { Team } from '../types';

export interface TerritoryScore {
  blueTiles: number;
  redTiles: number;
  totalTiles: number;
  bluePercent: number;
  redPercent: number;
}

export type TerritoryChangeListener = (score: TerritoryScore) => void;

export class TerritoryManager {
  private grid: ArenaGrid;
  private blueTileCount: number = 0;
  private redTileCount: number = 0;
  private listeners: Set<TerritoryChangeListener> = new Set();

  constructor(grid: ArenaGrid) {
    this.grid = grid;
    this.recalculateTotals();
  }

  public subscribe(listener: TerritoryChangeListener): () => void {
    this.listeners.add(listener);
    listener(this.getScore());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const score = this.getScore();
    this.listeners.forEach((l) => l(score));
  }

  public recalculateTotals(): TerritoryScore {
    let blue = 0;
    let red = 0;
    const tiles = this.grid.getAllTiles();

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (tiles[r][c].owner === 'blue') blue++;
        else red++;
      }
    }

    this.blueTileCount = blue;
    this.redTileCount = red;
    return this.getScore();
  }

  public getScore(): TerritoryScore {
    const total = TOTAL_TILES;
    const bluePercent = Math.round((this.blueTileCount / total) * 100);
    const redPercent = 100 - bluePercent; // single unified denominator guarantee

    return {
      blueTiles: this.blueTileCount,
      redTiles: this.redTileCount,
      totalTiles: total,
      bluePercent,
      redPercent,
    };
  }

  /**
   * Splats a circular paint zone at (centerX, centerY) with specified radius in tiles
   */
  public paintRadial(centerX: number, centerY: number, radius: number, team: Team): number {
    const rMin = Math.max(0, Math.floor(centerY - radius));
    const rMax = Math.min(GRID_ROWS - 1, Math.ceil(centerY + radius));
    const cMin = Math.max(0, Math.floor(centerX - radius));
    const cMax = Math.min(GRID_COLS - 1, Math.ceil(centerX + radius));

    let tilesCaptured = 0;
    const radiusSq = radius * radius;

    for (let r = rMin; r <= rMax; r++) {
      for (let c = cMin; c <= cMax; c++) {
        const distSq = (c - centerX) ** 2 + (r - centerY) ** 2;
        if (distSq <= radiusSq) {
          const changed = this.grid.setTileOwner(c, r, team);
          if (changed) {
            tilesCaptured++;
            if (team === 'blue') {
              this.blueTileCount++;
              this.redTileCount--;
            } else {
              this.redTileCount++;
              this.blueTileCount--;
            }
          }
        }
      }
    }

    if (tilesCaptured > 0) {
      this.notify();
    }

    return tilesCaptured;
  }

  /**
   * Paints a linear lane stripe (for Buzzsaws or Laser Beams)
   */
  public paintLine(startX: number, startY: number, endX: number, endY: number, width: number, team: Team): number {
    const steps = Math.ceil(Math.hypot(endX - startX, endY - startY) * 2);
    let captured = 0;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = startX + (endX - startX) * t;
      const y = startY + (endY - startY) * t;
      captured += this.paintRadial(x, y, width, team);
    }

    return captured;
  }
}
