import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_theme.dart';

class BattleQuestion {
  final int index;
  final String word;
  final String phonetic;
  final String correctAnswer;
  final List<String> options;

  BattleQuestion({
    required this.index,
    required this.word,
    required this.phonetic,
    required this.correctAnswer,
    required this.options,
  });
}

class BattlePlayer {
  final String uid;
  final String name;
  final String avatarUrl;
  int score;
  bool isReady;

  BattlePlayer({
    required this.uid,
    required this.name,
    required this.avatarUrl,
    this.score = 0,
    this.isReady = true,
  });
}

class WordBattleScreen extends StatefulWidget {
  final String mode; // '1v1' | 'kahoot'
  final String? roomCode;

  const WordBattleScreen({
    super.key,
    this.mode = '1v1',
    this.roomCode,
  });

  @override
  State<WordBattleScreen> createState() => _WordBattleScreenState();
}

class _WordBattleScreenState extends State<WordBattleScreen> {
  late String _mode;
  late String _roomCode;
  String _gameState = 'lobby'; // 'lobby' | 'playing' | 'ended'

  int _currentQuestionIndex = 0;
  int _secondsRemaining = 15;
  Timer? _timer;

  String? _selectedOption;
  bool _answered = false;
  int _myScore = 0;
  int _opponentScore = 0;

  final List<BattlePlayer> _players = [
    BattlePlayer(
      uid: 'self-1',
      name: 'Bạn (LexiPro)',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      score: 0,
    ),
    BattlePlayer(
      uid: 'opp-1',
      name: 'Trần Trung Đức',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=250',
      score: 0,
    ),
  ];

  final List<BattleQuestion> _questions = [
    BattleQuestion(
      index: 0,
      word: 'meticulous',
      phonetic: '/məˈtɪkjələs/',
      correctAnswer: 'Tỉ mỉ, cẩn thận',
      options: ['Tỉ mỉ, cẩn thận', 'Hào hứng', 'Do dự, ngập ngừng', 'Dễ vỡ'],
    ),
    BattleQuestion(
      index: 1,
      word: 'serendipity',
      phonetic: '/ˌserənˈdɪpəti/',
      correctAnswer: 'Sự tình cờ may mắn',
      options: ['Rủi ro đột ngột', 'Sự tình cờ may mắn', 'Kế hoạch chi tiết', 'Nỗi buồn thầm lặng'],
    ),
    BattleQuestion(
      index: 2,
      word: 'resilient',
      phonetic: '/rɪˈzɪliənt/',
      correctAnswer: 'Kiên cường, phục hồi nhanh',
      options: ['Cứng nhắc', 'Kiên cường, phục hồi nhanh', 'Yếu đuối', 'Chậm chạp'],
    ),
    BattleQuestion(
      index: 3,
      word: 'ephemeral',
      phonetic: '/ɪˈfemərəl/',
      correctAnswer: 'Phù du, ngắn ngủi',
      options: ['Vĩnh cửu', 'Phù du, ngắn ngủi', 'Rõ ràng', 'Bí ẩn'],
    ),
    BattleQuestion(
      index: 4,
      word: 'eloquent',
      phonetic: '/ˈeləkwənt/',
      correctAnswer: 'Hùng hồn, lưu loát',
      options: ['Hùng hồn, lưu loát', 'Im lặng', 'Do dự', 'Khó hiểu'],
    ),
  ];

  @override
  void initState() {
    super.initState();
    _mode = widget.mode;
    _roomCode = widget.roomCode ?? (_mode == '1v1' ? 'BTL-8492' : 'ROOM-9102');
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startGame() {
    setState(() {
      _gameState = 'playing';
      _currentQuestionIndex = 0;
      _myScore = 0;
      _opponentScore = 0;
    });
    _startQuestionTimer();
  }

  void _startQuestionTimer() {
    _timer?.cancel();
    setState(() {
      _secondsRemaining = 15;
      _selectedOption = null;
      _answered = false;
    });

    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) return;
      if (_secondsRemaining > 1) {
        setState(() {
          _secondsRemaining--;
        });
      } else {
        _timer?.cancel();
        _onTimeExpired();
      }
    });
  }

  void _onTimeExpired() {
    if (!_answered) {
      _handleSelectOption('');
    }
  }

  void _handleSelectOption(String option) {
    if (_answered) return;
    _timer?.cancel();

    final currentQ = _questions[_currentQuestionIndex];
    final isCorrect = option == currentQ.correctAnswer;

    int points = 0;
    if (isCorrect) {
      final speedBonus = (_secondsRemaining * 3);
      points = 100 + speedBonus;
    }

    // Simulate opponent response (70% accuracy)
    final oppCorrect = _currentQuestionIndex % 2 == 0;
    final oppPoints = oppCorrect ? (100 + ((_secondsRemaining - 1).clamp(1, 15) * 2)) : 0;

    setState(() {
      _selectedOption = option;
      _answered = true;
      _myScore += points;
      _opponentScore += oppPoints;
      _players[0].score = _myScore;
      _players[1].score = _opponentScore;
    });

    Future.delayed(const Duration(milliseconds: 1800), () {
      if (!mounted) return;
      if (_currentQuestionIndex < _questions.length - 1) {
        setState(() {
          _currentQuestionIndex++;
        });
        _startQuestionTimer();
      } else {
        setState(() {
          _gameState = 'ended';
        });
      }
    });
  }

  void _copyRoomCode() {
    Clipboard.setData(ClipboardData(text: _roomCode));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Đã sao chép mã phòng: $_roomCode'),
        backgroundColor: AppTheme.primaryColor(context),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final textColor = AppTheme.textColor(context);
    final subTextColor = AppTheme.subTextColor(context);
    final primaryColor = AppTheme.primaryColor(context);
    final cardColor = AppTheme.cardColor(context);
    final softBg = AppTheme.softBgColor(context);
    final borderColor = AppTheme.borderColor(context);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text(
          _mode == '1v1' ? '⚔️ Thách Đấu 1v1' : '🎉 Phòng Đấu Nhóm Kahoot',
          style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: textColor),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.copy_rounded),
            tooltip: 'Sao chép mã phòng',
            onPressed: _copyRoomCode,
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: _gameState == 'lobby'
            ? _buildLobbyView(textColor, subTextColor, primaryColor, cardColor, softBg, borderColor)
            : _gameState == 'playing'
                ? _buildPlayingView(textColor, subTextColor, primaryColor, cardColor, softBg, borderColor)
                : _buildEndedView(textColor, subTextColor, primaryColor, cardColor, softBg, borderColor),
      ),
    );
  }

  Widget _buildLobbyView(Color textColor, Color subTextColor, Color primaryColor, Color cardColor, Color softBg, Color borderColor) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: cardColor,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: primaryColor.withValues(alpha: 0.3), width: 1.5),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: AppTheme.isDark(context) ? 0.2 : 0.04),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            children: [
              Text(
                _mode == '1v1' ? 'PHÒNG THÁCH ĐẤU 1v1' : 'PHÒNG ĐẤU NHÓM KAHOOT',
                style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold, color: primaryColor, letterSpacing: 1.0),
              ),
              const SizedBox(height: 12),
              GestureDetector(
                onTap: _copyRoomCode,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  decoration: BoxDecoration(
                    color: softBg,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: borderColor),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        _roomCode,
                        style: GoogleFonts.outfit(fontSize: 28, fontWeight: FontWeight.w800, color: primaryColor, letterSpacing: 2.0),
                      ),
                      const SizedBox(width: 10),
                      Icon(Icons.copy_rounded, color: primaryColor, size: 20),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Mời đối thủ hoặc chia sẻ mã này để tham gia trận đấu',
                style: GoogleFonts.outfit(color: subTextColor, fontSize: 13),
              ),
            ],
          ),
        ),
        const SizedBox(height: 28),

        // Joined Players List
        Text(
          'Danh Sách Người Chơi (${_players.length})',
          style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold, color: textColor),
        ),
        const SizedBox(height: 12),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _players.length,
          itemBuilder: (context, index) {
            final p = _players[index];
            return Card(
              color: cardColor,
              margin: const EdgeInsets.only(bottom: 10),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: ListTile(
                leading: CircleAvatar(backgroundImage: NetworkImage(p.avatarUrl)),
                title: Text(p.name, style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: textColor)),
                subtitle: Text(p.isReady ? 'Sẵn sàng 🟢' : 'Đang đợi...', style: GoogleFonts.outfit(color: AppTheme.successGreen, fontSize: 12)),
                trailing: Icon(Icons.check_circle_rounded, color: primaryColor),
              ),
            );
          },
        ),
        const SizedBox(height: 32),

        // Start Game Button
        SizedBox(
          width: double.infinity,
          height: 52,
          child: ElevatedButton.icon(
            icon: const Icon(Icons.play_arrow_rounded, size: 28),
            label: Text('Bắt Đầu Trận Đấu!', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold)),
            style: ElevatedButton.styleFrom(
              backgroundColor: primaryColor,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            onPressed: _startGame,
          ),
        ),
      ],
    );
  }

  Widget _buildPlayingView(Color textColor, Color subTextColor, Color primaryColor, Color cardColor, Color softBg, Color borderColor) {
    final q = _questions[_currentQuestionIndex];

    return Column(
      children: [
        // Live Battle Score Bar
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: cardColor,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: borderColor),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Player 1 (Self)
              Row(
                children: [
                  CircleAvatar(radius: 18, backgroundImage: NetworkImage(_players[0].avatarUrl)),
                  const SizedBox(width: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Bạn', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 13, color: textColor)),
                      Text('+$_myScore điểm', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 13, color: primaryColor)),
                    ],
                  ),
                ],
              ),

              // Realtime Timer Indicator
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                  color: _secondsRemaining <= 5 ? Colors.red.shade50 : AppTheme.accentOrange.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: _secondsRemaining <= 5 ? Colors.red : AppTheme.accentOrange),
                ),
                child: Row(
                  children: [
                    Icon(Icons.timer_outlined, size: 18, color: _secondsRemaining <= 5 ? Colors.red : AppTheme.accentOrange),
                    const SizedBox(width: 4),
                    Text(
                      '${_secondsRemaining}s',
                      style: GoogleFonts.outfit(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: _secondsRemaining <= 5 ? Colors.red : AppTheme.accentOrange,
                      ),
                    ),
                  ],
                ),
              ),

              // Player 2 (Opponent)
              Row(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('Đối thủ', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 13, color: textColor)),
                      Text('+$_opponentScore điểm', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.purple.shade600)),
                    ],
                  ),
                  const SizedBox(width: 8),
                  CircleAvatar(radius: 18, backgroundImage: NetworkImage(_players[1].avatarUrl)),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Question Progress
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Câu hỏi ${_currentQuestionIndex + 1} / ${_questions.length}', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: primaryColor)),
            Text('Tốc độ + Độ chính xác', style: GoogleFonts.outfit(color: subTextColor, fontSize: 12)),
          ],
        ),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(6),
          child: LinearProgressIndicator(
            value: (_currentQuestionIndex + 1) / _questions.length,
            backgroundColor: borderColor,
            valueColor: AlwaysStoppedAnimation<Color>(primaryColor),
            minHeight: 6,
          ),
        ),
        const SizedBox(height: 20),

        // Question Card
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: cardColor,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: borderColor),
          ),
          child: Column(
            children: [
              Text(
                q.word,
                style: GoogleFonts.outfit(fontSize: 34, fontWeight: FontWeight.bold, color: primaryColor),
              ),
              const SizedBox(height: 4),
              Text(
                q.phonetic,
                style: GoogleFonts.outfit(fontSize: 16, color: subTextColor, fontStyle: FontStyle.italic),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // 4 Options Grid
        Expanded(
          child: ListView.separated(
            itemCount: q.options.length,
            separatorBuilder: (context, index) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final option = q.options[index];
              final isSelected = _selectedOption == option;
              final isCorrect = option == q.correctAnswer;

              Color bg = cardColor;
              Color borderC = borderColor;
              Color textC = textColor;

              if (_answered) {
                if (isCorrect) {
                  bg = Colors.green.shade50;
                  borderC = Colors.green;
                  textC = Colors.green.shade900;
                } else if (isSelected && !isCorrect) {
                  bg = Colors.red.shade50;
                  borderC = Colors.red;
                  textC = Colors.red.shade900;
                }
              }

              return InkWell(
                onTap: _answered ? null : () => _handleSelectOption(option),
                borderRadius: BorderRadius.circular(16),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  decoration: BoxDecoration(
                    color: bg,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: borderC, width: 1.5),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        option,
                        style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.bold, color: textC),
                      ),
                      if (_answered && isCorrect)
                        const Icon(Icons.check_circle_rounded, color: Colors.green, size: 22),
                      if (_answered && isSelected && !isCorrect)
                        const Icon(Icons.cancel_rounded, color: Colors.red, size: 22),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildEndedView(Color textColor, Color subTextColor, Color primaryColor, Color cardColor, Color softBg, Color borderColor) {
    final won = _myScore >= _opponentScore;

    return Center(
      child: Container(
        padding: const EdgeInsets.all(28),
        decoration: BoxDecoration(
          color: cardColor,
          borderRadius: BorderRadius.circular(28),
          border: Border.all(color: borderColor, width: 1.5),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: AppTheme.isDark(context) ? 0.25 : 0.05),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              won ? '🏆 CHIẾN THẮNG RỰC RỠ!' : '🤝 TRẬN ĐẤU KẾT THÚC',
              style: GoogleFonts.outfit(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: won ? Colors.amber.shade600 : primaryColor,
              ),
            ),
            const SizedBox(height: 16),

            // Score Breakdown
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: softBg,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  Column(
                    children: [
                      CircleAvatar(radius: 24, backgroundImage: NetworkImage(_players[0].avatarUrl)),
                      const SizedBox(height: 6),
                      Text('Bạn', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 13, color: textColor)),
                      Text('$_myScore điểm', style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 16, color: primaryColor)),
                    ],
                  ),
                  Text('VS', style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 18, color: subTextColor)),
                  Column(
                    children: [
                      CircleAvatar(radius: 24, backgroundImage: NetworkImage(_players[1].avatarUrl)),
                      const SizedBox(height: 6),
                      Text('Đối thủ', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 13, color: textColor)),
                      Text('$_opponentScore điểm', style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 16, color: Colors.purple.shade600)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            ElevatedButton.icon(
              icon: const Icon(Icons.replay_rounded),
              label: const Text('Đấu Trận Khác'),
              style: ElevatedButton.styleFrom(
                backgroundColor: primaryColor,
                padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
              ),
              onPressed: () {
                setState(() {
                  _gameState = 'lobby';
                });
              },
            ),
          ],
        ),
      ),
    );
  }
}
