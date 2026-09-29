import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/dictionary_model.dart';

class DictionaryService {
  final http.Client client;

  /// In-memory cache for dictionary lookups to avoid redundant API calls.
  final Map<String, DictionaryWord> _cache = {};

  /// Maximum number of cached entries before evicting oldest.
  static const int _maxCacheSize = 100;

  DictionaryService({http.Client? client}) : client = client ?? http.Client();

  /// Fetches English definition from Free Dictionary API (Oxford Style)
  /// and translates key definitions into Vietnamese (TFLAT Style).
  /// Results are cached in memory for subsequent lookups.
  Future<DictionaryWord> getWordDefinition(String word) async {
    final cleanWord = word.trim().toLowerCase();

    // Return cached result if available
    if (_cache.containsKey(cleanWord)) {
      return _cache[cleanWord]!;
    }

    final url = Uri.parse('https://api.dictionaryapi.dev/api/v2/entries/en/$cleanWord');

    try {
      final response = await client.get(url);

      if (response.statusCode == 200) {
        final List<dynamic> jsonList = jsonDecode(response.body);
        if (jsonList.isNotEmpty) {
          final dictionaryWord = DictionaryWord.fromJson(jsonList[0]);

          // Translate the main word and first 3 definitions in parallel
          final translations = await Future.wait([
            translateText(dictionaryWord.word),
            ...dictionaryWord.definitions
                .where((d) => d.definition.isNotEmpty)
                .take(3)
                .map((d) => translateText(d.definition)),
          ]);

          dictionaryWord.vietnameseTranslation = translations.first;

          int idx = 1;
          for (var def in dictionaryWord.definitions) {
            if (idx > 3) break;
            if (def.definition.isNotEmpty && idx < translations.length) {
              def.vietnameseTranslation = translations[idx];
              idx++;
            }
          }

          // Cache the result
          _addToCache(cleanWord, dictionaryWord);
          return dictionaryWord;
        }
      }
      throw Exception('Word not found in dictionary');
    } catch (e) {
      throw Exception('Failed to load dictionary: $e');
    }
  }

  /// Add an entry to the in-memory cache with LRU eviction.
  void _addToCache(String key, DictionaryWord value) {
    if (_cache.length >= _maxCacheSize) {
      // Evict the oldest entry (first key in insertion order)
      _cache.remove(_cache.keys.first);
    }
    _cache[key] = value;
  }

  /// Clear the in-memory cache (useful for testing or manual refresh).
  void clearCache() {
    _cache.clear();
  }

  /// Translates text from English to Vietnamese using the free Google Translate client API.
  Future<String> translateText(String text) async {
    if (text.isEmpty) return '';
    final url = Uri.parse(
        'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${Uri.encodeComponent(text)}');

    try {
      final response = await client.get(url);
      if (response.statusCode == 200) {
        final List<dynamic> jsonResult = jsonDecode(response.body);
        if (jsonResult.isNotEmpty && jsonResult[0] != null) {
          final buffer = StringBuffer();
          for (var item in jsonResult[0]) {
            if (item is List && item.isNotEmpty && item[0] is String) {
              buffer.write(item[0]);
            }
          }
          return buffer.toString();
        }
      }
      return 'Dịch lỗi';
    } catch (e) {
      return 'Dịch lỗi: $e';
    }
  }
}
