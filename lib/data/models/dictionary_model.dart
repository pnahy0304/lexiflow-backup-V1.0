class DictionaryWord {
  final String word;
  final String phonetic;
  final String audioUrl;
  final List<DictionaryDefinition> definitions;
  String vietnameseTranslation; // Holds the Vietnamese translated definition

  DictionaryWord({
    required this.word,
    required this.phonetic,
    required this.audioUrl,
    required this.definitions,
    this.vietnameseTranslation = '',
  });

  factory DictionaryWord.fromJson(Map<String, dynamic> json) {
    // Extract phonetic string
    String phoneticStr = json['phonetic'] ?? '';
    if (phoneticStr.isEmpty && json['phonetics'] != null && (json['phonetics'] as List).isNotEmpty) {
      for (var p in json['phonetics']) {
        if (p['text'] != null && (p['text'] as String).isNotEmpty) {
          phoneticStr = p['text'];
          break;
        }
      }
    }

    // Extract audio url
    String audioUrlStr = '';
    if (json['phonetics'] != null && (json['phonetics'] as List).isNotEmpty) {
      for (var p in json['phonetics']) {
        if (p['audio'] != null && (p['audio'] as String).isNotEmpty) {
          audioUrlStr = p['audio'];
          // Clean up protocol if it starts with //
          if (audioUrlStr.startsWith('//')) {
            audioUrlStr = 'https:$audioUrlStr';
          }
          break;
        }
      }
    }

    // Extract meanings and definitions
    List<DictionaryDefinition> defs = [];
    if (json['meanings'] != null) {
      for (var meaning in json['meanings']) {
        String partOfSpeech = meaning['partOfSpeech'] ?? '';
        if (meaning['definitions'] != null) {
          for (var def in meaning['definitions']) {
            defs.add(DictionaryDefinition(
              partOfSpeech: partOfSpeech,
              definition: def['definition'] ?? '',
              example: def['example'] ?? '',
            ));
          }
        }
      }
    }

    return DictionaryWord(
      word: json['word'] ?? '',
      phonetic: phoneticStr,
      audioUrl: audioUrlStr,
      definitions: defs,
    );
  }
}

class DictionaryDefinition {
  final String partOfSpeech;
  final String definition;
  final String example;
  String vietnameseTranslation;

  DictionaryDefinition({
    required this.partOfSpeech,
    required this.definition,
    required this.example,
    this.vietnameseTranslation = '',
  });
}
