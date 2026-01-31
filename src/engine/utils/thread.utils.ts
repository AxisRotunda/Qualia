
/**
 * Yields control back to the main thread to allow UI rendering to update.
 * Use inside heavy loops (e.g., procedural generation).
 */
export async function yieldToMain(): Promise<void> {
  return new Promise(resolve => {
    // slightly longer delay than 0 to ensure browser has time to paint
    setTimeout(resolve, 0);
  });
}

/**
 * Delays execution by specified milliseconds.
 */
export async function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
