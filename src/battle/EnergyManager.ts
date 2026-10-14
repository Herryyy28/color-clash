/**
 * Authoritative Energy Manager for Color Clash
 * Sole authority for player & AI battle energy.
 * Prevents negative balances, enforces discrete 10-pip maximums,
 * and synchronizes with battle state.
 */

import { Team } from '../types';

export class EnergyManager {
  private blueEnergy: number;
  private redEnergy: number;
  private maxEnergy: number = 10.0;
  private regenRatePerSec: number = 0.65; // ~0.65 energy/second

  constructor(startingEnergy: number = 5.0, maxEnergy: number = 10.0) {
    this.maxEnergy = maxEnergy;
    this.blueEnergy = startingEnergy;
    this.redEnergy = startingEnergy;
  }

  public reset(startingEnergy: number = 5.0) {
    this.blueEnergy = startingEnergy;
    this.redEnergy = startingEnergy;
  }

  public getEnergy(team: Team): number {
    return team === 'blue' ? this.blueEnergy : this.redEnergy;
  }

  public getMaxEnergy(): number {
    return this.maxEnergy;
  }

  public canAfford(team: Team, cost: number): boolean {
    const current = this.getEnergy(team);
    return current >= cost;
  }

  public spendEnergy(team: Team, cost: number): boolean {
    if (cost < 0) return false;
    if (!this.canAfford(team, cost)) {
      return false;
    }

    if (team === 'blue') {
      this.blueEnergy = Math.max(0, +(this.blueEnergy - cost).toFixed(2));
    } else {
      this.redEnergy = Math.max(0, +(this.redEnergy - cost).toFixed(2));
    }
    return true;
  }

  /**
   * Called per tick by BattleSimulation (fixed delta time in seconds)
   */
  public update(deltaSec: number, isGenerating: boolean = true) {
    if (!isGenerating) return;

    const gain = this.regenRatePerSec * deltaSec;
    this.blueEnergy = Math.min(this.maxEnergy, +(this.blueEnergy + gain).toFixed(3));
    this.redEnergy = Math.min(this.maxEnergy, +(this.redEnergy + gain).toFixed(3));
  }
}
