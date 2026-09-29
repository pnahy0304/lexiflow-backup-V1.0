import '../../data/models/vocab_model.dart';

enum ReviewQuality {
  again, // failed / reset
  hard,  // pass with difficulty
  good,  // standard success
  easy   // perfect recall
}

class SpacedRepetitionHelper {
  /// Applies the SM-2 Spaced Repetition algorithm to update a [Vocab] card.
  /// Review quality ratings:
  /// - [ReviewQuality.again] -> q = 0 (Failure)
  /// - [ReviewQuality.hard]  -> q = 2 (Borderline success)
  /// - [ReviewQuality.good]  -> q = 4 (Solid success)
  /// - [ReviewQuality.easy]  -> q = 5 (Perfect recall)
  static Vocab calculateNextReview(Vocab vocab, ReviewQuality quality) {
    int q;
    switch (quality) {
      case ReviewQuality.again:
        q = 0;
        break;
      case ReviewQuality.hard:
        q = 2;
        break;
      case ReviewQuality.good:
        q = 4;
        break;
      case ReviewQuality.easy:
        q = 5;
        break;
    }

    int nextRepetitions;
    int nextInterval;
    double nextEaseFactor = vocab.easeFactor;

    if (q < 3) {
      // Failed review: reset repetitions and schedule for tomorrow (1 day)
      nextRepetitions = 0;
      nextInterval = 1;
    } else {
      // Successful review
      if (vocab.repetitions == 0) {
        nextInterval = 1;
      } else if (vocab.repetitions == 1) {
        nextInterval = 6;
      } else {
        nextInterval = (vocab.interval * vocab.easeFactor).round();
      }
      nextRepetitions = vocab.repetitions + 1;
    }

    // Update Ease Factor based on quality rating
    nextEaseFactor = vocab.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (nextEaseFactor < 1.3) {
      nextEaseFactor = 1.3;
    }

    final DateTime nextReviewDate = DateTime.now().add(Duration(days: nextInterval));

    return vocab.copyWith(
      repetitions: nextRepetitions,
      interval: nextInterval,
      easeFactor: nextEaseFactor,
      nextReview: nextReviewDate,
    );
  }
}
