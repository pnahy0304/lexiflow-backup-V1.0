class DailyWords {
  static const List<Map<String, String>> words = [
    {
      'word': 'Resilience',
      'meaning': 'Sự phục hồi, khả năng kiên cường vượt qua khó khăn',
      'example': 'Resilience is key to overcoming life\'s challenges.',
    },
    {
      'word': 'Eloquent',
      'meaning': 'Hùng biện, có khả năng diễn đạt lưu loát và thu hút',
      'example': 'She made an eloquent speech in defense of her project.',
    },
    {
      'word': 'Benevolent',
      'meaning': 'Nhân từ, rộng lượng, hay làm việc thiện',
      'example': 'The benevolent owner donated a portion of profits to charity.',
    },
    {
      'word': 'Meticulous',
      'meaning': 'Tỉ mỉ, kỹ càng, chú ý đến từng chi tiết',
      'example': 'He was meticulous in preparing the layout of the app.',
    },
    {
      'word': 'Ephemeral',
      'meaning': 'Phù du, chóng tàn, chỉ tồn tại trong thời gian ngắn',
      'example': 'The beauty of cherry blossoms is ephemeral.',
    },
    {
      'word': 'Ubiquitous',
      'meaning': 'Phổ biến, ở đâu cũng có',
      'example': 'Smartphones are ubiquitous in modern society.',
    },
    {
      'word': 'Sovereign',
      'meaning': 'Tối cao, độc lập, có chủ quyền tự trị',
      'example': 'The country became a sovereign nation in 1945.',
    },
    {
      'word': 'Aesthetic',
      'meaning': 'Thẩm mỹ, có khiếu thẩm mỹ nghệ thuật',
      'example': 'The new office design has a modern, clean aesthetic.',
    },
  ];

  static Map<String, String> getWordOfTheDay() {
    final now = DateTime.now();
    // Choose index based on the day of the year
    final day = now.difference(DateTime(now.year, 1, 1)).inDays;
    final index = day % words.length;
    return words[index];
  }
}
