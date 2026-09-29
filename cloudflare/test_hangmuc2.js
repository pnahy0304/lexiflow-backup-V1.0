import { executeWithRetry } from './src/utils/d1RetryBatch.js';

async function runTest() {
  console.log('--- Testing Hạng mục 2: D1 Retry with Exponential Backoff & Jitter ---');
  let attempts = 0;

  const mockBusyQuery = async () => {
    attempts++;
    if (attempts < 3) {
      throw new Error('D1_ERROR: SQLITE_BUSY: database is locked');
    }
    return { success: true, rows: [{ id: 1, name: 'LexiFlow' }] };
  };

  const startTime = Date.now();
  const result = await executeWithRetry(mockBusyQuery, { baseDelayMs: 20, maxRetries: 5 });
  const duration = Date.now() - startTime;

  console.log(`[PASS] Operation succeeded after ${attempts} attempts in ${duration}ms.`);
  console.log('Result:', result);
}

runTest().catch((err) => {
  console.error('[FAIL]', err);
  process.exit(1);
});
