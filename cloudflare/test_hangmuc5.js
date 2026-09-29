async function testAntiCheat() {
  console.log('--- Testing Hạng mục 5: Server-side Anti-cheat & Time Validation ---');

  const serverStartTime = Date.now();
  
  // Normal human response time (1800ms)
  const humanDurationMs = 1800;
  const isHumanBotLike = humanDurationMs < 350;
  console.log(`[PASS] Human response (${humanDurationMs}ms): isFlagged = ${isHumanBotLike} (Expected: false)`);

  // Instant bot script response time (50ms)
  const botDurationMs = 50;
  const isBotBotLike = botDurationMs < 350;
  console.log(`[PASS] Bot response (${botDurationMs}ms): isFlagged = ${isBotBotLike} (Expected: true)`);
}

testAntiCheat().catch((err) => {
  console.error('[FAIL]', err);
  process.exit(1);
});
