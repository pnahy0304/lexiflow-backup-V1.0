/// Application-wide constants for LexiFlow.
class AppConstants {
  AppConstants._();

  // --- API Endpoints ---
  static const String freeDictionaryApi = 'https://api.dictionaryapi.dev/api/v2/entries/en';
  static const String googleTranslateApi = 'https://translate.googleapis.com/translate_a/single';
  static const String datamuseSuggestApi = 'https://api.datamuse.com/sug';

  // --- Cloudflare Worker API ---
  static const String cloudflareApiBaseUrl = 'https://lexiflow-api.quoctrunghrnk.workers.dev/api/v1';

  // --- Spaced Repetition Defaults ---
  static const double defaultEaseFactor = 2.5;
  static const double minimumEaseFactor = 1.3;
  static const int initialInterval = 1; // days

  // --- UI ---
  static const int searchDebounceMs = 300;
  static const int splashDurationMs = 2500;
  static const int maxSuggestions = 6;
  static const int maxDefinitionsPerWord = 3;
  static const int maxDashboardHistory = 5;

  // --- Notification ---
  static const String dailyVocabChannelId = 'daily_vocab_channel';
  static const String dailyVocabChannelName = 'Mỗi ngày học 1 từ vựng';
  static const int notificationHour = 9;
  static const int notificationMinute = 0;
}
