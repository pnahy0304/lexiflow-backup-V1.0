import { isInQuietHours, shouldSendNotification, getLocalTimeInTimezone } from './src/utils/notificationScheduler.js';

async function testNotifications() {
  console.log('--- Testing Hạng mục 6: Notification Scheduler, Timezones & Overnight DND ---');

  // 1. Test Overnight DND (22:00 - 07:00)
  const is1AMInDND = isInQuietHours('01:30', '22:00', '07:00');
  console.log(`[PASS] 01:30 in DND (22:00-07:00): ${is1AMInDND} (Expected: true)`);

  const is8AMInDND = isInQuietHours('08:30', '22:00', '07:00');
  console.log(`[PASS] 08:30 in DND (22:00-07:00): ${is8AMInDND} (Expected: false)`);

  // 2. Test Timezone conversion from UTC to Asia/Ho_Chi_Minh (+7)
  const utcDate = new Date('2026-09-29T13:00:00Z'); // 13:00 UTC = 20:00 Asia/Ho_Chi_Minh
  const localVN = getLocalTimeInTimezone(utcDate, 'Asia/Ho_Chi_Minh');
  console.log(`[PASS] 13:00 UTC -> Local VN time: ${localVN.localTimeStr} (Expected: 20:00)`);

  // 3. Test Schedule Evaluation
  const schedule = {
    uid: 'u-123',
    enabled: true,
    timeOfDay: '20:00',
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
    timezone: 'Asia/Ho_Chi_Minh',
    dndStart: '22:00',
    dndEnd: '07:00'
  };

  const evalResult = shouldSendNotification(schedule, utcDate);
  console.log(`[PASS] Schedule evaluation at 13:00 UTC (20:00 VN): shouldSend = ${evalResult.shouldSend}, Reason: ${evalResult.reason}`);
}

testNotifications().catch((err) => {
  console.error('[FAIL]', err);
  process.exit(1);
});
