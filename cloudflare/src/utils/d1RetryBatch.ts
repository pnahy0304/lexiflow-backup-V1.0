// ============================================================
// D1 Database Utility — Batch Execution, Retry with Exponential Backoff & Jitter
// Prevents SQLITE_BUSY / Lock Contention during peak concurrent writes
// ============================================================

export interface D1RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

/**
 * Execute a D1 operation or batch with exponential backoff and jitter for SQLITE_BUSY handling
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  options: D1RetryOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 4;
  const baseDelayMs = options.baseDelayMs ?? 50;
  const maxDelayMs = options.maxDelayMs ?? 1000;

  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (err: any) {
      attempt++;
      const errorMessage = err?.message || String(err);
      const isBusy =
        errorMessage.includes('SQLITE_BUSY') ||
        errorMessage.includes('database is locked') ||
        errorMessage.includes('D1_ERROR: SQLITE_BUSY');

      if (!isBusy || attempt > maxRetries) {
        throw err;
      }

      // Exponential backoff + full jitter calculation
      const exponentialDelay = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));
      const jitterDelay = Math.floor(Math.random() * exponentialDelay);

      console.warn(`[D1 Retry] SQLITE_BUSY detected (Attempt ${attempt}/${maxRetries}). Retrying in ${jitterDelay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, jitterDelay));
    }
  }
}
