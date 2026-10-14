/**
 * Authoritative Battle Timer for Color Clash
 * Tracks 180s match clock, pause state, and sudden death overtime.
 */

export class BattleTimer {
  private durationSeconds: number;
  private timeRemaining: number;
  private isPaused: boolean = false;
  private isExpired: boolean = false;

  constructor(durationSeconds: number = 180) {
    this.durationSeconds = durationSeconds;
    this.timeRemaining = durationSeconds;
  }

  public reset(durationSeconds: number = 180) {
    this.durationSeconds = durationSeconds;
    this.timeRemaining = durationSeconds;
    this.isPaused = false;
    this.isExpired = false;
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  public getTimeRemaining(): number {
    return Math.max(0, Math.ceil(this.timeRemaining));
  }

  public getExactTime(): number {
    return this.timeRemaining;
  }

  public addOvertime(seconds: number = 30) {
    this.timeRemaining += seconds;
    this.isExpired = false;
  }

  /**
   * Called per tick by BattleSimulation
   * Returns true when time runs out
   */
  public update(deltaSec: number): boolean {
    if (this.isPaused || this.isExpired) return false;

    this.timeRemaining -= deltaSec;
    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.isExpired = true;
      return true; // Match time expired!
    }
    return false;
  }
}
