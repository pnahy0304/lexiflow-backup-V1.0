/// Centralized route definitions for LexiFlow app.
///
/// Using named routes is optional; the app currently uses direct
/// [Navigator.push] with [PageRouteBuilder] for animated transitions.
/// This file serves as a registry of all route paths for future
/// migration to named routes and deep-link support.
class AppRoutes {
  AppRoutes._();

  // Route paths
  static const String splash = '/';
  static const String auth = '/auth';
  static const String dashboard = '/dashboard';
  static const String vocabDetail = '/vocab-detail';
  static const String flashcardStudy = '/flashcard-study';
  static const String ocrTranslator = '/ocr-translator';
  static const String bookmarks = '/bookmarks';
  static const String quiz = '/quiz';
  static const String settings = '/settings';
  static const String friends = '/friends';
  static const String groupLeaderboard = '/group-leaderboard';
  static const String wordBattle = '/word-battle';

  /// All route paths in the app (for analytics / navigation guards).
  static const List<String> allRoutes = [
    splash,
    auth,
    dashboard,
    vocabDetail,
    flashcardStudy,
    ocrTranslator,
    bookmarks,
    quiz,
    settings,
    friends,
    groupLeaderboard,
    wordBattle,
  ];
}
