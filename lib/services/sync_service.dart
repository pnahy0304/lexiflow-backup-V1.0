import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class SyncService {
  static const String _queueKey = 'lexiflow_offline_review_queue';
  static const String _settingsKey = 'lexiflow_user_settings';
  static const String _deviceIdKey = 'lexiflow_device_id';

  final http.Client _client;
  final String _baseUrl;

  SyncService({
    http.Client? client,
    String baseUrl = 'https://lexiflow-api.quoctrunghrnk.workers.dev/api/v1',
  })  : _client = client ?? http.Client(),
        _baseUrl = baseUrl;

  Future<String> _getDeviceId() async {
    final prefs = await SharedPreferences.getInstance();
    String? devId = prefs.getString(_deviceIdKey);
    if (devId == null || devId.isEmpty) {
      devId = 'app-${DateTime.now().millisecondsSinceEpoch}';
      await prefs.setString(_deviceIdKey, devId);
    }
    return devId;
  }

  /// Add a review event to offline queue and attempt immediate sync if connected
  Future<void> queueReviewEvent({
    required String reviewId,
    required String cardId,
    required int rating, // 1=Again, 2=Hard, 3=Good, 4=Easy
    String? clientTime,
    required String idToken,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final deviceId = await _getDeviceId();
    final timeStr = clientTime ?? DateTime.now().toUtc().toIso8601String();

    final event = {
      'review_id': reviewId,
      'card_id': cardId,
      'rating': rating,
      'client_time': timeStr,
      'device_id': deviceId,
    };

    final rawQueue = prefs.getString(_queueKey);
    List<dynamic> queue = rawQueue != null ? jsonDecode(rawQueue) : [];
    queue.add(event);

    await prefs.setString(_queueKey, jsonEncode(queue));

    // Try flushing queue in background
    await flushQueue(idToken: idToken);
  }

  /// Flush queued review events to Cloudflare Worker API idempotently
  Future<bool> flushQueue({required String idToken}) async {
    final prefs = await SharedPreferences.getInstance();
    final rawQueue = prefs.getString(_queueKey);
    if (rawQueue == null || rawQueue.isEmpty) return true;

    List<dynamic> queue = jsonDecode(rawQueue);
    if (queue.isEmpty) return true;

    try {
      final response = await _client.post(
        Uri.parse('$_baseUrl/flashcards/review-events'),
        headers: {
          'Authorization': 'Bearer $idToken',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({'events': queue}),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        // Clear queue after successful idempotency receipt
        await prefs.setString(_queueKey, jsonEncode([]));
        return true;
      }
    } catch (_) {
      // Retain offline queue for next retry
    }

    return false;
  }

  /// Sync user settings (theme, auto-play IPA, etc.) with server
  Future<Map<String, String>> syncUserSettings({
    required String idToken,
    required Map<String, String> localSettings,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final nowIso = DateTime.now().toUtc().toIso8601String();

    final payload = localSettings.entries.map((e) => {
      'key': e.key,
      'value': e.value,
      'updated_at': nowIso,
    }).toList();

    try {
      final response = await _client.post(
        Uri.parse('$_baseUrl/users/settings'),
        headers: {
          'Authorization': 'Bearer $idToken',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({'settings': payload}),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = jsonDecode(response.body);
        if (data['settings'] != null) {
          final settingsMap = (data['settings'] as Map<String, dynamic>);
          final Map<String, String> resultMap = {};
          settingsMap.forEach((k, v) {
            if (v is Map && v['value'] != null) {
              resultMap[k] = v['value'].toString();
            }
          });

          await prefs.setString(_settingsKey, jsonEncode(resultMap));
          return resultMap;
        }
      }
    } catch (_) {}

    return localSettings;
  }
}
