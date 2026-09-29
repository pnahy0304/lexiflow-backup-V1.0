import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../data/models/vocab_model.dart';
import '../../services/cloudflare_service.dart';
import '../../core/utils/spaced_repetition.dart';

// --- Events ---
abstract class FlashcardEvent extends Equatable {
  const FlashcardEvent();
  @override
  List<Object?> get props => [];
}

class FlashcardLoadRequested extends FlashcardEvent {}

class FlashcardReviewed extends FlashcardEvent {
  final Vocab vocab;
  final ReviewQuality quality;
  const FlashcardReviewed({required this.vocab, required this.quality});
  @override
  List<Object?> get props => [vocab, quality];
}

class FlashcardAdded extends FlashcardEvent {
  final String word;
  final String meaning;
  final String example;
  const FlashcardAdded({required this.word, required this.meaning, required this.example});
  @override
  List<Object?> get props => [word, meaning, example];
}

// --- States ---
abstract class FlashcardState extends Equatable {
  const FlashcardState();
  @override
  List<Object?> get props => [];
}

class FlashcardInitial extends FlashcardState {}
class FlashcardLoading extends FlashcardState {}

class FlashcardsLoadSuccess extends FlashcardState {
  final List<Vocab> vocabs;
  final int currentIndex;
  const FlashcardsLoadSuccess(this.vocabs, this.currentIndex);
  @override
  List<Object?> get props => [vocabs, currentIndex];
}

class FlashcardsEmpty extends FlashcardState {}

class FlashcardFailure extends FlashcardState {
  final String message;
  const FlashcardFailure(this.message);
  @override
  List<Object?> get props => [message];
}

class FlashcardOperationSuccess extends FlashcardState {}

// --- Bloc ---
class FlashcardBloc extends Bloc<FlashcardEvent, FlashcardState> {
  final CloudflareService _cloudflareService;

  FlashcardBloc({
    required CloudflareService cloudflareService,
  })  : _cloudflareService = cloudflareService,
        super(FlashcardInitial()) {
    on<FlashcardLoadRequested>(_onFlashcardLoadRequested);
    on<FlashcardReviewed>(_onFlashcardReviewed);
    on<FlashcardAdded>(_onFlashcardAdded);
  }

  Future<void> _onFlashcardLoadRequested(FlashcardLoadRequested event, Emitter<FlashcardState> emit) async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) {
      emit(FlashcardsEmpty());
      return;
    }
    emit(FlashcardLoading());
    try {
      // Get all spaced repetition cards
      final allVocabs = await _cloudflareService.getSpacedRepetitionVocabs(uid);
      if (allVocabs.isEmpty) {
        emit(FlashcardsEmpty());
      } else {
        emit(FlashcardsLoadSuccess(allVocabs, 0));
      }
    } catch (e) {
      emit(FlashcardFailure(e.toString()));
    }
  }

  Future<void> _onFlashcardReviewed(FlashcardReviewed event, Emitter<FlashcardState> emit) async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return;
    final currentState = state;
    if (currentState is FlashcardsLoadSuccess) {
      try {
        // Calculate the next spaced repetition values using SM-2
        final updatedVocab = SpacedRepetitionHelper.calculateNextReview(event.vocab, event.quality);

        // Sync back to Cloudflare D1
        await _cloudflareService.saveVocabToReview(uid, updatedVocab);

        // Record study streak
        await _cloudflareService.updateStudyStreak(uid);

        // Move to the next index
        final int nextIndex = currentState.currentIndex + 1;
        if (nextIndex >= currentState.vocabs.length) {
          emit(FlashcardsEmpty());
        } else {
          emit(FlashcardsLoadSuccess(currentState.vocabs, nextIndex));
        }
      } catch (e) {
        emit(FlashcardFailure(e.toString()));
      }
    }
  }

  Future<void> _onFlashcardAdded(FlashcardAdded event, Emitter<FlashcardState> emit) async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return;
    try {
      final newVocab = Vocab(
        id: '', // Cloudflare will autogenerate
        word: event.word,
        meaning: event.meaning,
        example: event.example,
      );
      await _cloudflareService.saveVocabToReview(uid, newVocab);
      emit(FlashcardOperationSuccess());
      // Re-trigger load to update list in background
      add(FlashcardLoadRequested());
    } catch (e) {
      emit(FlashcardFailure(e.toString()));
    }
  }
}
