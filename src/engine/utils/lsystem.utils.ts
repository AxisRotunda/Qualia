
export interface StochasticOption {
    weight: number;
    result: string;
}

export type LRule = string | StochasticOption[];

/**
 * LSystem: Deterministic string rewriting engine for biological structures.
 * Updated for RUN_INDUSTRY: Supports Stochastic Grammars and Seeded Randomness.
 */
export class LSystem {
  constructor(
      public axiom: string,
      public rules: Record<string, LRule>
  ) {}

  /**
   * Produces an expanded instruction string.
   * @param iterations Number of rewriting passes
   * @param rnd Optional RNG function (0..1) to ensure determinism
   */
  generate(iterations: number, rnd: () => number = Math.random): string {
      let current = this.axiom;
      for (let i = 0; i < iterations; i++) {
          let next = '';
          for (let char of current) {
              next += this.resolveChar(char, rnd);
          }
          current = next;
      }
      return current;
  }

  private resolveChar(char: string, rnd: () => number): string {
      const rule = this.rules[char];
      
      if (!rule) return char;

      if (typeof rule === 'string') {
          return rule;
      }

      if (Array.isArray(rule)) {
          // Stochastic Selection using provided RNG
          const totalWeight = rule.reduce((sum, opt) => sum + opt.weight, 0);
          let random = rnd() * totalWeight;
          
          for (const option of rule) {
              random -= option.weight;
              if (random <= 0) return option.result;
          }
          return rule[rule.length - 1].result; // Fallback
      }

      return char;
  }
}
