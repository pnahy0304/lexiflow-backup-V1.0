import 'package:flutter_test/flutter_test.dart';
import 'package:lexiflow/core/utils/spaced_repetition.dart';
import 'package:lexiflow/data/models/vocab_model.dart';

void main() {
  group('SpacedRepetitionHelper SM-2 Tests', () {
    late Vocab newVocab;

    setUp(() {
      newVocab = Vocab(
        id: '1',
        word: 'serendipity',
        meaning: 'sự tình cờ may mắn',
        example: 'Finding this book was pure serendipity.',
        interval: 0,
        easeFactor: 2.5,
        repetitions: 0,
      );
    });

    test('Initial review with Good (quality 4) sets repetitions=1, interval=1', () {
      final updated = SpacedRepetitionHelper.calculateNextReview(newVocab, ReviewQuality.good);

      expect(updated.repetitions, equals(1));
      expect(updated.interval, equals(1));
      expect(updated.easeFactor, equals(2.5)); // 2.5 + (0.1 - (5-4)*(0.08 + 0.02)) = 2.5 + 0 = 2.5
    });

    test('Second review with Good (quality 4) sets repetitions=2, interval=6', () {
      final firstReview = SpacedRepetitionHelper.calculateNextReview(newVocab, ReviewQuality.good);
      final secondReview = SpacedRepetitionHelper.calculateNextReview(firstReview, ReviewQuality.good);

      expect(secondReview.repetitions, equals(2));
      expect(secondReview.interval, equals(6));
    });

    test('Third review with Good (quality 4) multiplies interval by ease factor', () {
      final v1 = SpacedRepetitionHelper.calculateNextReview(newVocab, ReviewQuality.good);
      final v2 = SpacedRepetitionHelper.calculateNextReview(v1, ReviewQuality.good);
      final v3 = SpacedRepetitionHelper.calculateNextReview(v2, ReviewQuality.good);

      expect(v3.repetitions, equals(3));
      // 6 * 2.5 = 15
      expect(v3.interval, equals(15));
    });

    test('Review with Easy (quality 5) increases Ease Factor', () {
      final updated = SpacedRepetitionHelper.calculateNextReview(newVocab, ReviewQuality.easy);

      expect(updated.repetitions, equals(1));
      expect(updated.interval, equals(1));
      expect(updated.easeFactor, greaterThan(2.5));
    });

    test('Review with Hard (quality 2 - fail) resets repetitions to 0 and interval to 1', () {
      // First advance repetitions to 2
      final v1 = SpacedRepetitionHelper.calculateNextReview(newVocab, ReviewQuality.good);
      final v2 = SpacedRepetitionHelper.calculateNextReview(v1, ReviewQuality.good);
      expect(v2.repetitions, equals(2));

      // Now rate as Hard (q < 3)
      final failed = SpacedRepetitionHelper.calculateNextReview(v2, ReviewQuality.hard);

      expect(failed.repetitions, equals(0));
      expect(failed.interval, equals(1));
      expect(failed.easeFactor, lessThan(v2.easeFactor));
    });

    test('Review with Again (quality 0 - fail) resets repetitions and decreases Ease Factor', () {
      final failed = SpacedRepetitionHelper.calculateNextReview(newVocab, ReviewQuality.again);

      expect(failed.repetitions, equals(0));
      expect(failed.interval, equals(1));
      expect(failed.easeFactor, lessThan(2.5));
    });

    test('Ease Factor never falls below 1.3 minimum threshold', () {
      Vocab v = newVocab;
      // Repeatedly fail 10 times
      for (int i = 0; i < 10; i++) {
        v = SpacedRepetitionHelper.calculateNextReview(v, ReviewQuality.again);
      }

      expect(v.easeFactor, equals(1.3));
    });
  });
}
