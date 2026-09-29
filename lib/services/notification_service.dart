import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:timezone/timezone.dart' as tz;

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin _notificationsPlugin =
      FlutterLocalNotificationsPlugin();

  /// Track the last scheduled date to avoid re-scheduling on every app launch.
  String? _lastScheduledDateKey;

  /// Initialize local notifications configuration and timezone mappings.
  Future<void> initialize() async {
    tz.initializeTimeZones();

    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const DarwinInitializationSettings iosSettings =
        DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const InitializationSettings settings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notificationsPlugin.initialize(settings: settings);
  }

  /// Schedules a repeating daily notification at 9:00 AM with a specific word.
  /// Only re-schedules if the date has changed since last schedule.
  Future<void> scheduleDailyNotification(String word, String meaning) async {
    final now = DateTime.now();
    final todayKey = '${now.year}-${now.month}-${now.day}';

    // Skip if already scheduled for today
    if (_lastScheduledDateKey == todayKey) return;

    const AndroidNotificationDetails androidDetails =
        AndroidNotificationDetails(
      'daily_vocab_channel',
      'Mỗi ngày học 1 từ vựng',
      channelDescription:
          'Thông báo nhắc nhở học từ vựng mỗi ngày giống TFLAT',
      importance: Importance.max,
      priority: Priority.high,
    );

    const DarwinNotificationDetails iosDetails = DarwinNotificationDetails();

    const NotificationDetails platformDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    // Cancel existing scheduled notification on ID 0 to prevent duplicates
    await _notificationsPlugin.cancel(id: 0);

    // Schedule for daily repeating at 9:00 AM (v21 API: named parameters)
    await _notificationsPlugin.zonedSchedule(
      id: 0,
      title: 'Mỗi ngày học 1 từ vựng 📚',
      body: 'Hôm nay hãy học từ: $word - $meaning',
      scheduledDate: _nextInstanceOfNineAM(),
      notificationDetails: platformDetails,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      matchDateTimeComponents: DateTimeComponents.time,
    );

    _lastScheduledDateKey = todayKey;
  }

  tz.TZDateTime _nextInstanceOfNineAM() {
    final tz.TZDateTime now = tz.TZDateTime.now(tz.local);
    tz.TZDateTime scheduledDate =
        tz.TZDateTime(tz.local, now.year, now.month, now.day, 9, 0);
    if (scheduledDate.isBefore(now)) {
      scheduledDate = scheduledDate.add(const Duration(days: 1));
    }
    return scheduledDate;
  }
}
