
export interface GameSystem {
  /**
   * Execution order. Lower numbers run first.
   * 0-100: Input & Pre-processing
   * 100-200: Game Logic (AI, Scripts)
   * 200-300: Physics Simulation
   * 300-400: Post-Physics Sync & Animation
   * 900+: Rendering
   */
  readonly priority: number;

  /**
   * Called once per frame.
   * @param dt Delta time in milliseconds
   * @param totalTime Total engine runtime in milliseconds
   */
  update(dt: number, totalTime: number): void;
}
