
/**
 * Creates a Web Worker from a string script.
 * Handles Blob creation and URL revocation automatically.
 * @param script The javascript code as a string
 * @returns A new Worker instance
 */
export function createInlineWorker(script: string): Worker {
  const blob = new Blob([script], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url);
  
  // Revoke the URL immediately as the Worker has already loaded the script.
  // This frees up memory associated with the Blob.
  URL.revokeObjectURL(url);
  
  return worker;
}
