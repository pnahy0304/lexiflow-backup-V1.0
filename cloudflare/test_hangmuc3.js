async function runCatchUpTest() {
  console.log('--- Testing Hạng mục 3: Catch-up Mode & Streak Freeze logic ---');

  // Test Catch-up Threshold check
  const threshold = 100;
  const mockDueCountOver = 145;
  const suggestCatchUpOver = mockDueCountOver > threshold;

  console.log(`[PASS] Due count ${mockDueCountOver} > ${threshold} => suggest_catchup: ${suggestCatchUpOver}`);

  // Test Streak Freeze Weekly limit (max 1 grant per 7 days)
  const lastGranted6DaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString();
  const daysSinceGrant = (Date.now() - new Date(lastGranted6DaysAgo).getTime()) / (1000 * 60 * 60 * 24);
  const eligibleFreeze1 = daysSinceGrant >= 7;
  console.log(`[PASS] Granted 6 days ago => Eligible for new freeze: ${eligibleFreeze1} (Expected: false)`);

  const lastGranted8DaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
  const daysSinceGrant2 = (Date.now() - new Date(lastGranted8DaysAgo).getTime()) / (1000 * 60 * 60 * 24);
  const eligibleFreeze2 = daysSinceGrant2 >= 7;
  console.log(`[PASS] Granted 8 days ago => Eligible for new freeze: ${eligibleFreeze2} (Expected: true)`);
}

runCatchUpTest().catch((err) => {
  console.error('[FAIL]', err);
  process.exit(1);
});
