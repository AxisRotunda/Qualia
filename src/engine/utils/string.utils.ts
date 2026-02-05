
/**
 * NullShield: Extreme defensive string processing.
 * Part of RUN_REPAIR Phase 37.2 / 38.2.
 * Updated V2.1: Added safeLowerCase encapsulation.
 */
export class NullShield {

    /**
   * Safely trims a value, guaranteeing a string return even if input is null/undefined.
   * RUN_OPT: V2.0 - Fast-path for primitives to avoid try/catch overhead.
   */
    static trim(v: unknown): string {
        if (v === null || v === undefined) return '';
        if (typeof v === 'string') return v.trim();
        if (typeof v === 'number') return Number.isFinite(v) ? String(v) : '';

        try {
            const s = String(v);
            return (s === 'null' || s === 'undefined') ? '' : s.trim();
        } catch {
            return '';
        }
    }

    /**
   * Safe lowercase trim.
   * Combines trim() and toLowerCase() in a crash-proof wrapper.
   */
    static sanitize(v: unknown): string {
        return this.trim(v).toLowerCase();
    }

    /**
   * Explicit alias for clarity in semantic usage.
   */
    static safeLowerCase(v: unknown): string {
        return this.sanitize(v);
    }

    /**
   * Safe keyboard key normalization.
   * Handles edge cases where browser key values are empty or space characters.
   */
    static safeKey(v: unknown): string {
        const s = String(v ?? '');
        if (s === ' ' || s === '') return 'Space';
        return s;
    }

    /**
   * Guaranteed fallback for entity identities.
   */
    static entityName(e: number, current: string | null | undefined): string {
        const trimmed = this.trim(current);
        return trimmed || `Entity_${e}`;
    }
}
