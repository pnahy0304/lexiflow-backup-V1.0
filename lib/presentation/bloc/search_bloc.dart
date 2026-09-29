import 'dart:convert';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import '../../data/models/dictionary_model.dart';
import '../../data/datasources/dictionary_service.dart';
import '../../services/cloudflare_service.dart';

// --- Events ---
abstract class SearchEvent extends Equatable {
  const SearchEvent();
  @override
  List<Object?> get props => [];
}

class SearchWordSubmitted extends SearchEvent {
  final String word;
  const SearchWordSubmitted(this.word);
  @override
  List<Object?> get props => [word];
}

class HistoryLoadRequested extends SearchEvent {}

class BookmarkToggleRequested extends SearchEvent {
  final String word;
  final bool makeBookmarked;
  final String translation;
  const BookmarkToggleRequested(this.word, this.makeBookmarked, {this.translation = ''});
  @override
  List<Object?> get props => [word, makeBookmarked, translation];
}

class BookmarkCheckRequested extends SearchEvent {
  final String word;
  const BookmarkCheckRequested(this.word);
  @override
  List<Object?> get props => [word];
}

class SearchSuggestionsRequested extends SearchEvent {
  final String prefix;
  const SearchSuggestionsRequested(this.prefix);
  @override
  List<Object?> get props => [prefix];
}

// --- States ---
abstract class SearchState extends Equatable {
  const SearchState();
  @override
  List<Object?> get props => [];
}

class SearchInitial extends SearchState {}
class SearchLoading extends SearchState {}

class SearchSuccess extends SearchState {
  final DictionaryWord word;
  final bool isBookmarked;
  const SearchSuccess(this.word, this.isBookmarked);
  @override
  List<Object?> get props => [word, isBookmarked];
}

class SearchFailure extends SearchState {
  final String message;
  const SearchFailure(this.message);
  @override
  List<Object?> get props => [message];
}

class HistoryLoadSuccess extends SearchState {
  final List<Map<String, dynamic>> history;
  const HistoryLoadSuccess(this.history);
  @override
  List<Object?> get props => [history];
}

class SuggestionsLoadSuccess extends SearchState {
  final List<String> suggestions;
  const SuggestionsLoadSuccess(this.suggestions);
  @override
  List<Object?> get props => [suggestions];
}

// --- Bloc ---
class SearchBloc extends Bloc<SearchEvent, SearchState> {
  final DictionaryService _dictionaryService;
  final CloudflareService _cloudflareService;
  final http.Client _httpClient;

  SearchBloc({
    required DictionaryService dictionaryService,
    required CloudflareService cloudflareService,
    http.Client? httpClient,
  })  : _dictionaryService = dictionaryService,
        _cloudflareService = cloudflareService,
        _httpClient = httpClient ?? http.Client(),
        super(SearchInitial()) {
    on<SearchWordSubmitted>(_onSearchWordSubmitted);
    on<HistoryLoadRequested>(_onHistoryLoadRequested);
    on<BookmarkToggleRequested>(_onBookmarkToggleRequested);
    on<BookmarkCheckRequested>(_onBookmarkCheckRequested);
    on<SearchSuggestionsRequested>(_onSearchSuggestionsRequested);
  }

  Future<void> _onSearchWordSubmitted(SearchWordSubmitted event, Emitter<SearchState> emit) async {
    emit(SearchLoading());
    try {
      final dictionaryWord = await _dictionaryService.getWordDefinition(event.word);

      bool isBookmarked = false;
      final uid = FirebaseAuth.instance.currentUser?.uid;
      if (uid != null) {
        // Save to search history
        await _cloudflareService.addToHistory(uid, dictionaryWord.word, dictionaryWord.vietnameseTranslation);
        // Check bookmark status
        isBookmarked = await _cloudflareService.isWordBookmarked(uid, dictionaryWord.word);
        // Record study streak
        await _cloudflareService.updateStudyStreak(uid);
      }

      emit(SearchSuccess(dictionaryWord, isBookmarked));
    } catch (e) {
      final rawMessage = e.toString().replaceAll('Exception: ', '');
      final userMessage = rawMessage.contains('not found')
          ? 'Không tìm thấy từ này trong từ điển. Vui lòng kiểm tra lại chính tả.'
          : 'Không thể tra cứu từ vựng lúc này. Vui lòng thử lại sau.';
      emit(SearchFailure(userMessage));
    }
  }

  Future<void> _onHistoryLoadRequested(HistoryLoadRequested event, Emitter<SearchState> emit) async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) {
      emit(const HistoryLoadSuccess([]));
      return;
    }
    // Don't emit SearchLoading for history — avoid disrupting the dashboard UI
    // Only emit HistoryLoadSuccess (or empty) directly.
    try {
      final history = await _cloudflareService.getSearchHistory(uid);
      emit(HistoryLoadSuccess(history));
    } catch (_) {
      // Silently return empty history on error — history is not critical
      emit(const HistoryLoadSuccess([]));
    }
  }

  Future<void> _onBookmarkToggleRequested(BookmarkToggleRequested event, Emitter<SearchState> emit) async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return;
    try {
      await _cloudflareService.toggleBookmark(uid, event.word, event.makeBookmarked, translation: event.translation);
      if (state is SearchSuccess) {
        final currentState = state as SearchSuccess;
        if (currentState.word.word.toLowerCase() == event.word.toLowerCase()) {
          emit(SearchSuccess(currentState.word, event.makeBookmarked));
        }
      }
    } catch (_) {
      // Ignore background action errors
    }
  }

  Future<void> _onBookmarkCheckRequested(BookmarkCheckRequested event, Emitter<SearchState> emit) async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return;
    try {
      final isBookmarked = await _cloudflareService.isWordBookmarked(uid, event.word);
      if (state is SearchSuccess) {
        final currentState = state as SearchSuccess;
        emit(SearchSuccess(currentState.word, isBookmarked));
      }
    } catch (_) {
      // Ignore background check errors
    }
  }

  Future<void> _onSearchSuggestionsRequested(SearchSuggestionsRequested event, Emitter<SearchState> emit) async {
    final prefix = event.prefix.trim().toLowerCase();
    if (prefix.isEmpty) {
      emit(const SuggestionsLoadSuccess([]));
      return;
    }
    try {
      final response = await _httpClient.get(
        Uri.parse('https://api.datamuse.com/sug?s=$prefix'),
      );
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final List<String> suggestions = data
            .map((item) => item['word'] as String)
            .take(6)
            .toList();
        emit(SuggestionsLoadSuccess(suggestions));
      }
    } catch (e) {
      // Fallback to empty suggestions if error occurs (no UI interruption)
      emit(const SuggestionsLoadSuccess([]));
    }
  }

  @override
  Future<void> close() {
    _httpClient.close();
    return super.close();
  }
}
