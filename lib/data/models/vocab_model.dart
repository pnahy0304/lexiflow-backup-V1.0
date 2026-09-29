class Vocab {
  final String id;
  final String word;
  final String meaning;
  final String example;

  // Spaced Repetition Fields (SM-2 Algorithm)
  final int interval;      // In days
  final double easeFactor;  // Default is 2.5
  final int repetitions;   // Number of consecutive correct reviews
  final DateTime nextReview;

  Vocab({
    required this.id,
    required this.word,
    required this.meaning,
    required this.example,
    this.interval = 0,
    this.easeFactor = 2.5,
    this.repetitions = 0,
    DateTime? nextReview,
  }) : nextReview = nextReview ?? DateTime.now();

  Vocab copyWith({
    String? id,
    String? word,
    String? meaning,
    String? example,
    int? interval,
    double? easeFactor,
    int? repetitions,
    DateTime? nextReview,
  }) {
    return Vocab(
      id: id ?? this.id,
      word: word ?? this.word,
      meaning: meaning ?? this.meaning,
      example: example ?? this.example,
      interval: interval ?? this.interval,
      easeFactor: easeFactor ?? this.easeFactor,
      repetitions: repetitions ?? this.repetitions,
      nextReview: nextReview ?? this.nextReview,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'word': word,
      'meaning': meaning,
      'example': example,
      'interval': interval,
      'easeFactor': easeFactor,
      'repetitions': repetitions,
      'nextReview': nextReview.toIso8601String(),
    };
  }

  factory Vocab.fromMap(Map<String, dynamic> map, String id) {
    DateTime next;
    final nextReviewRaw = map['nextReview'] ?? map['next_review'];
    if (nextReviewRaw is String) {
      next = DateTime.parse(nextReviewRaw);
    } else if (nextReviewRaw != null) {
      next = DateTime.parse(nextReviewRaw.toString());
    } else {
      next = DateTime.now();
    }

    // Handle D1 column naming (ease_factor) alongside legacy (easeFactor)
    final easeFactor = (map['easeFactor'] ?? map['ease_factor'] as num?)?.toDouble() ?? 2.5;

    return Vocab(
      id: id,
      word: map['word'] ?? '',
      meaning: map['meaning'] ?? '',
      example: map['example'] ?? '',
      interval: (map['interval'] as num?)?.toInt() ?? 0,
      easeFactor: easeFactor,
      repetitions: (map['repetitions'] as num?)?.toInt() ?? 0,
      nextReview: next,
    );
  }

  /// Create a [Vocab] from a Cloudflare D1 / JSON API response.
  /// Handles snake_case column names from D1 (ease_factor, next_review).
  factory Vocab.fromJson(Map<String, dynamic> json) {
    DateTime next;
    final nextReviewRaw = json['next_review'] ?? json['nextReview'];
    if (nextReviewRaw is String) {
      next = DateTime.parse(nextReviewRaw);
    } else if (nextReviewRaw != null) {
      next = DateTime.parse(nextReviewRaw.toString());
    } else {
      next = DateTime.now();
    }

    return Vocab(
      id: (json['id'] ?? '').toString(),
      word: json['word'] ?? '',
      meaning: json['meaning'] ?? '',
      example: json['example'] ?? '',
      interval: (json['interval'] as num?)?.toInt() ?? 0,
      easeFactor: (json['easeFactor'] ?? json['ease_factor'] as num?)?.toDouble() ?? 2.5,
      repetitions: (json['repetitions'] as num?)?.toInt() ?? 0,
      nextReview: next,
    );
  }

  /// Convert to a map suitable for Cloudflare D1 JSON serialization.
  /// Uses snake_case column names and ISO-8601 strings for dates.
  Map<String, dynamic> toCloudflareMap() {
    return {
      'id': id,
      'word': word,
      'meaning': meaning,
      'example': example,
      'interval': interval,
      'easeFactor': easeFactor,
      'repetitions': repetitions,
      'nextReview': nextReview.toIso8601String(),
    };
  }
}
