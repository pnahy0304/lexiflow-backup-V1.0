import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../core/theme/app_theme.dart';
import '../../core/constants/daily_words.dart';
import '../../core/utils/page_transitions.dart';
import '../../services/cloudflare_service.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/search_bloc.dart';
import '../bloc/flashcard_bloc.dart';
import 'vocab_detail_screen.dart';
import 'flashcard_study_screen.dart';
import 'ocr_translator_screen.dart';
import 'settings_screen.dart';
import 'quiz_screen.dart';
import 'bookmarks_screen.dart';
import 'friends_screen.dart';
import 'word_battle_screen.dart';
import 'group_leaderboard_screen.dart';
import '../widgets/dashboard/word_of_day_card.dart';
import '../widgets/dashboard/study_stats_card.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _searchController = TextEditingController();
  Timer? _debounce;
  Map<String, String> _wordOfTheDay = {};

  CloudflareService get _cloudflareService => context.read<CloudflareService>();

  // Learning Stats
  bool _loadingStats = true;
  int _totalCards = 0;
  int _newCards = 0;
  int _learningCards = 0;
  int _memorizedCards = 0;
  int _streak = 0;

  @override
  void initState() {
    super.initState();
    _wordOfTheDay = DailyWords.getWordOfTheDay();
    _loadDashboardData();
  }

  void _loadDashboardData() {
    context.read<SearchBloc>().add(HistoryLoadRequested());
    context.read<FlashcardBloc>().add(FlashcardLoadRequested());
    _loadStatistics();
    _loadStreak();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  Future<void> _loadStatistics() async {
    setState(() => _loadingStats = true);
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid != null) {
      try {
        final vocabs = await _cloudflareService.getSpacedRepetitionVocabs(uid);
        int total = vocabs.length;
        int newC = 0;
        int learning = 0;
        int memorized = 0;

        for (var v in vocabs) {
          if (v.repetitions == 0) {
            newC++;
          } else if (v.repetitions < 3) {
            learning++;
          } else {
            memorized++;
          }
        }

        if (mounted) {
          setState(() {
            _totalCards = total;
            _newCards = newC;
            _learningCards = learning;
            _memorizedCards = memorized;
            _loadingStats = false;
          });
        }
      } catch (e) {
        if (mounted) setState(() => _loadingStats = false);
      }
    } else {
      if (mounted) setState(() => _loadingStats = false);
    }
  }

  Future<void> _loadStreak() async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid != null) {
      try {
        final streak = await _cloudflareService.getStudyStreak(uid);
        if (mounted) {
          setState(() => _streak = streak);
        }
      } catch (_) {}
    }
  }

  void _onSearchChanged(String query) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () {
      context.read<SearchBloc>().add(SearchSuggestionsRequested(query));
    });
    setState(() {});
  }

  void _searchWord(String word) {
    if (word.trim().isNotEmpty) {
      context.read<SearchBloc>().add(const SearchSuggestionsRequested(''));
      context.read<SearchBloc>().add(SearchWordSubmitted(word.trim()));
      _searchController.clear();
      setState(() {});

      Navigator.push(
        context,
        SlidePageRoute(
          page: VocabDetailScreen(searchWord: word.trim()),
        ),
      ).then((_) => _loadDashboardData());
    }
  }

  Future<void> _deleteHistory(String word) async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid != null) {
      await _cloudflareService.deleteHistoryItem(uid, word);
      if (mounted) {
        context.read<SearchBloc>().add(HistoryLoadRequested());
      }
    }
  }

  Future<void> _clearAllHistory() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Xóa lịch sử'),
        content: const Text('Bạn có chắc muốn xóa toàn bộ lịch sử tra từ không?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Hủy'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Xóa', style: TextStyle(color: AppTheme.errorRed)),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid != null) {
      await _cloudflareService.clearAllHistory(uid);
      if (mounted) {
        context.read<SearchBloc>().add(HistoryLoadRequested());
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đã xóa toàn bộ lịch sử tra từ')),
        );
      }
    }
  }

  String _formatUserName(String rawEmail) {
    if (rawEmail.isEmpty) return 'Học viên LexiFlow';
    String username = rawEmail.contains('@') ? rawEmail.split('@')[0] : rawEmail;
    // Check if username is purely numbers or student ID
    if (RegExp(r'^\d+$').hasMatch(username)) {
      return 'Học viên LexiFlow';
    }
    return username;
  }

  @override
  Widget build(BuildContext context) {
    final authState = context.watch<AuthBloc>().state;
    String rawEmail = 'Học viên';
    if (authState is AuthAuthenticated) {
      rawEmail = authState.user.email ?? 'Học viên';
    }
    final displayName = _formatUserName(rawEmail);

    final cardColor = AppTheme.cardColor(context);
    final textColor = AppTheme.textColor(context);
    final subTextColor = AppTheme.subTextColor(context);
    final borderColor = AppTheme.borderColor(context);
    final primaryColor = AppTheme.primaryColor(context);
    final softBg = AppTheme.softBgColor(context);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        centerTitle: false,
        title: Container(
          constraints: const BoxConstraints(maxWidth: 1240),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [primaryColor, AppTheme.accentColor(context)],
                  ),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: primaryColor.withValues(alpha: 0.3),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    )
                  ],
                ),
                child: const Icon(Icons.menu_book_rounded, color: Colors.white, size: 22),
              ),
              const SizedBox(width: 10),
              Text(
                'LexiFlow',
                style: GoogleFonts.outfit(
                  fontWeight: FontWeight.bold,
                  color: textColor,
                  fontSize: 22,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: primaryColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'STUDIO',
                  style: GoogleFonts.outfit(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: primaryColor,
                    letterSpacing: 1.0,
                  ),
                ),
              ),
            ],
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.leaderboard_rounded, color: AppTheme.accentOrange),
            tooltip: 'BXH Nhóm Học Tập',
            onPressed: () {
              Navigator.push(
                context,
                SlidePageRoute(page: const GroupLeaderboardScreen()),
              );
            },
          ),
          IconButton(
            icon: Icon(Icons.sports_esports_rounded, color: primaryColor),
            tooltip: 'Thách Đấu 1v1 & Kahoot',
            onPressed: () {
              Navigator.push(
                context,
                SlidePageRoute(page: const WordBattleScreen()),
              );
            },
          ),
          IconButton(
            icon: Icon(Icons.people_outline_rounded, color: textColor),
            tooltip: 'Bạn bè & Kết nối',
            onPressed: () {
              Navigator.push(
                context,
                SlidePageRoute(page: const FriendsScreen()),
              ).then((_) => _loadDashboardData());
            },
          ),
          IconButton(
            icon: Icon(Icons.bookmark_border_rounded, color: textColor),
            tooltip: 'Từ vựng đã lưu',
            onPressed: () {
              Navigator.push(
                context,
                SlidePageRoute(page: const BookmarksScreen()),
              ).then((_) => _loadDashboardData());
            },
          ),
          IconButton(
            icon: Icon(Icons.settings_outlined, color: textColor),
            tooltip: 'Cài đặt',
            onPressed: () {
              Navigator.push(
                context,
                SlidePageRoute(page: const SettingsScreen()),
              ).then((_) => _loadDashboardData());
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final isWideScreen = constraints.maxWidth >= 840;

          return RefreshIndicator(
            onRefresh: () async => _loadDashboardData(),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Center(
                child: Container(
                  constraints: const BoxConstraints(maxWidth: 1240),
                  padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
                  child: isWideScreen
                      ? _buildDesktopLayout(
                          context,
                          displayName: displayName,
                          cardColor: cardColor,
                          textColor: textColor,
                          subTextColor: subTextColor,
                          borderColor: borderColor,
                          primaryColor: primaryColor,
                          softBg: softBg,
                        )
                      : _buildMobileLayout(
                          context,
                          displayName: displayName,
                          cardColor: cardColor,
                          textColor: textColor,
                          subTextColor: subTextColor,
                          borderColor: borderColor,
                          primaryColor: primaryColor,
                          softBg: softBg,
                        ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  // ── DESKTOP 2-COLUMN BENTO GRID LAYOUT ──
  Widget _buildDesktopLayout(
    BuildContext context, {
    required String displayName,
    required Color cardColor,
    required Color textColor,
    required Color subTextColor,
    required Color borderColor,
    required Color primaryColor,
    required Color softBg,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // LEFT COLUMN (65% Width)
        Expanded(
          flex: 65,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Hero Welcome Banner
              _buildHeroHeader(displayName, textColor, subTextColor, primaryColor),
              const SizedBox(height: 20),

              // Search Box
              _buildSearchInputContainer(context, cardColor, borderColor, textColor, subTextColor, primaryColor),
              _buildSuggestionsOverlay(cardColor, borderColor, textColor, subTextColor),
              const SizedBox(height: 24),

              // Quick Actions Bento Grid (2x2)
              Text(
                'Công cụ học tập 🚀',
                style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold, color: textColor),
              ),
              const SizedBox(height: 12),
              _buildBentoQuickActionsGrid(context, primaryColor, softBg),
              const SizedBox(height: 28),

              // Search History Section
              _buildSearchHistorySection(context, cardColor, borderColor, textColor, subTextColor, primaryColor, softBg),
            ],
          ),
        ),

        const SizedBox(width: 24),

        // RIGHT SIDEBAR COLUMN (35% Width)
        Expanded(
          flex: 35,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // User Streak Progress Card
              _buildStreakGoalBanner(context, primaryColor),
              const SizedBox(height: 20),

              // Word of the Day Card
              Row(
                children: [
                  Text(
                    'Từ vựng mỗi ngày 💡',
                    style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold, color: textColor),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              WordOfDayCard(
                wordOfTheDay: _wordOfTheDay,
                onTapWord: _searchWord,
              ),
              const SizedBox(height: 24),

              // Memory Stats Card
              Text(
                'Tiến trình Ghi nhớ (SM-2) 📊',
                style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold, color: textColor),
              ),
              const SizedBox(height: 10),
              StudyStatsCard(
                loadingStats: _loadingStats,
                totalCards: _totalCards,
                newCards: _newCards,
                learningCards: _learningCards,
                memorizedCards: _memorizedCards,
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ── MOBILE SINGLE-COLUMN LAYOUT ──
  Widget _buildMobileLayout(
    BuildContext context, {
    required String displayName,
    required Color cardColor,
    required Color textColor,
    required Color subTextColor,
    required Color borderColor,
    required Color primaryColor,
    required Color softBg,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildHeroHeader(displayName, textColor, subTextColor, primaryColor),
        const SizedBox(height: 18),
        _buildSearchInputContainer(context, cardColor, borderColor, textColor, subTextColor, primaryColor),
        _buildSuggestionsOverlay(cardColor, borderColor, textColor, subTextColor),
        const SizedBox(height: 20),
        _buildStreakGoalBanner(context, primaryColor),
        const SizedBox(height: 20),

        // Word of the Day
        Text(
          'Từ vựng mỗi ngày 💡',
          style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold, color: textColor),
        ),
        const SizedBox(height: 10),
        WordOfDayCard(
          wordOfTheDay: _wordOfTheDay,
          onTapWord: _searchWord,
        ),
        const SizedBox(height: 20),

        // Stats Card
        Text(
          'Tiến trình Ghi nhớ (SM-2) 📊',
          style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold, color: textColor),
        ),
        const SizedBox(height: 10),
        StudyStatsCard(
          loadingStats: _loadingStats,
          totalCards: _totalCards,
          newCards: _newCards,
          learningCards: _learningCards,
          memorizedCards: _memorizedCards,
        ),
        const SizedBox(height: 24),

        // Quick Tools
        Text(
          'Công cụ học tập 🚀',
          style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold, color: textColor),
        ),
        const SizedBox(height: 12),
        _buildBentoQuickActionsGrid(context, primaryColor, softBg),
        const SizedBox(height: 28),

        // History
        _buildSearchHistorySection(context, cardColor, borderColor, textColor, subTextColor, primaryColor, softBg),
      ],
    );
  }

  // ── REUSABLE DASHBOARD COMPONENTS ──

  Widget _buildHeroHeader(String displayName, Color textColor, Color subTextColor, Color primaryColor) {
    return Row(
      children: [
        Container(
          height: 48,
          width: 48,
          decoration: BoxDecoration(
            gradient: LinearGradient(colors: [primaryColor, AppTheme.primaryBlue]),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: primaryColor.withValues(alpha: 0.3),
                blurRadius: 10,
                offset: const Offset(0, 4),
              )
            ],
          ),
          child: Center(
            child: Text(
              displayName.isNotEmpty ? displayName[0].toUpperCase() : 'L',
              style: GoogleFonts.outfit(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 22,
              ),
            ),
          ),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Xin chào, $displayName 👋',
                style: GoogleFonts.outfit(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: textColor,
                  letterSpacing: -0.3,
                ),
              ),
              Text(
                'Hôm nay bạn muốn tra cứu hoặc ôn tập từ vựng nào?',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 13,
                  color: subTextColor,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSearchInputContainer(
    BuildContext context,
    Color cardColor,
    Color borderColor,
    Color textColor,
    Color subTextColor,
    Color primaryColor,
  ) {
    return Container(
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: primaryColor.withValues(alpha: 0.25), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: primaryColor.withValues(alpha: AppTheme.isDark(context) ? 0.15 : 0.06),
            blurRadius: 20,
            offset: const Offset(0, 6),
          )
        ],
      ),
      child: TextField(
        controller: _searchController,
        onChanged: _onSearchChanged,
        onSubmitted: _searchWord,
        style: GoogleFonts.outfit(color: textColor, fontSize: 16),
        decoration: InputDecoration(
          hintText: 'Tra cứu từ vựng Oxford (Ví dụ: serendipity, resilient...)',
          hintStyle: GoogleFonts.plusJakartaSans(color: subTextColor.withValues(alpha: 0.65), fontSize: 14),
          prefixIcon: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14.0),
            child: Icon(Icons.search_rounded, color: primaryColor, size: 24),
          ),
          suffixIcon: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (_searchController.text.isNotEmpty)
                IconButton(
                  icon: Icon(Icons.clear_rounded, color: subTextColor),
                  onPressed: () {
                    _searchController.clear();
                    context.read<SearchBloc>().add(const SearchSuggestionsRequested(''));
                    setState(() {});
                  },
                ),
              IconButton(
                icon: Icon(Icons.camera_alt_outlined, color: AppTheme.accentOrange),
                tooltip: 'Dịch qua Camera OCR',
                onPressed: () {
                  Navigator.push(
                    context,
                    SlidePageRoute(page: const OcrTranslatorScreen()),
                  ).then((_) => _loadDashboardData());
                },
              ),
              IconButton(
                icon: Icon(Icons.arrow_forward_rounded, color: primaryColor),
                onPressed: () => _searchWord(_searchController.text),
              ),
              const SizedBox(width: 6),
            ],
          ),
          filled: true,
          fillColor: Colors.transparent,
          border: InputBorder.none,
          enabledBorder: InputBorder.none,
          focusedBorder: InputBorder.none,
        ),
      ),
    );
  }

  Widget _buildSuggestionsOverlay(Color cardColor, Color borderColor, Color textColor, Color subTextColor) {
    return BlocBuilder<SearchBloc, SearchState>(
      builder: (context, state) {
        if (state is SuggestionsLoadSuccess && state.suggestions.isNotEmpty) {
          return Container(
            margin: const EdgeInsets.only(top: 8),
            decoration: BoxDecoration(
              color: cardColor,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: borderColor),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.15),
                  blurRadius: 18,
                  offset: const Offset(0, 8),
                )
              ],
            ),
            child: Column(
              children: state.suggestions.map((suggestion) {
                return ListTile(
                  leading: Icon(Icons.search_rounded, color: subTextColor, size: 18),
                  title: Text(
                    suggestion,
                    style: GoogleFonts.outfit(fontWeight: FontWeight.w600, color: textColor),
                  ),
                  dense: true,
                  onTap: () => _searchWord(suggestion),
                );
              }).toList(),
            ),
          );
        }
        return const SizedBox.shrink();
      },
    );
  }

  Widget _buildStreakGoalBanner(BuildContext context, Color primaryColor) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: AppTheme.primaryGradient(context),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: primaryColor.withValues(alpha: 0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Mục tiêu học tập',
                style: GoogleFonts.outfit(
                  color: Colors.white.withValues(alpha: 0.9),
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.local_fire_department_rounded, color: Colors.orangeAccent, size: 18),
                    const SizedBox(width: 4),
                    Text(
                      _streak > 0 ? 'Streak $_streak Ngày' : 'Bắt đầu ngay!',
                      style: GoogleFonts.outfit(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              )
            ],
          ),
          const SizedBox(height: 14),
          BlocBuilder<FlashcardBloc, FlashcardState>(
            builder: (context, state) {
              int cardCount = 0;
              if (state is FlashcardsLoadSuccess) {
                cardCount = state.vocabs.length;
              }
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    cardCount > 0 ? 'Bạn có $cardCount từ vựng cần ôn tập hôm nay' : '🎉 Bạn đã hoàn thành tất cả từ vựng hôm nay!',
                    style: GoogleFonts.outfit(
                      color: Colors.white,
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 14),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: LinearProgressIndicator(
                      value: _totalCards > 0 ? (_memorizedCards / _totalCards) : 0.0,
                      backgroundColor: Colors.white24,
                      valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                      minHeight: 8,
                    ),
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildBentoQuickActionsGrid(BuildContext context, Color primaryColor, Color softBg) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildBentoTile(
                context,
                icon: Icons.style_rounded,
                title: 'Thẻ Ghi Nhớ',
                subtitle: 'SM-2 Ôn tập từ vựng',
                accentColor: primaryColor,
                bgColor: softBg,
                onTap: () {
                  Navigator.push(
                    context,
                    SlidePageRoute(page: const FlashcardStudyScreen()),
                  ).then((_) => _loadDashboardData());
                },
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildBentoTile(
                context,
                icon: Icons.quiz_rounded,
                title: 'Trắc Nghiệm',
                subtitle: 'Thi kiểm tra trí nhớ',
                accentColor: AppTheme.accentPurple,
                bgColor: AppTheme.isDark(context) ? AppTheme.accentPurple.withValues(alpha: 0.15) : AppTheme.accentPurple.withValues(alpha: 0.1),
                onTap: () {
                  Navigator.push(
                    context,
                    SlidePageRoute(page: const QuizScreen()),
                  ).then((_) => _loadDashboardData());
                },
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildBentoTile(
                context,
                icon: Icons.camera_alt_rounded,
                title: 'Dịch Camera OCR',
                subtitle: 'Quét tài liệu & tra từ từ hình ảnh',
                accentColor: AppTheme.accentOrange,
                bgColor: AppTheme.isDark(context) ? AppTheme.accentOrange.withValues(alpha: 0.15) : AppTheme.accentOrange.withValues(alpha: 0.1),
                onTap: () {
                  Navigator.push(
                    context,
                    SlidePageRoute(page: const OcrTranslatorScreen()),
                  ).then((_) => _loadDashboardData());
                },
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildBentoTile(
                context,
                icon: Icons.bookmarks_rounded,
                title: 'Từ Vựng Đã Lưu',
                subtitle: 'Bộ sưu tập cá nhân',
                accentColor: AppTheme.cyanAccent,
                bgColor: AppTheme.isDark(context) ? AppTheme.cyanAccent.withValues(alpha: 0.15) : AppTheme.cyanAccent.withValues(alpha: 0.1),
                onTap: () {
                  Navigator.push(
                    context,
                    SlidePageRoute(page: const BookmarksScreen()),
                  ).then((_) => _loadDashboardData());
                },
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildBentoTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required Color accentColor,
    required Color bgColor,
    required VoidCallback onTap,
  }) {
    final textColor = AppTheme.textColor(context);
    final subTextColor = AppTheme.subTextColor(context);
    final borderColor = AppTheme.borderColor(context);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: AppTheme.cardColor(context),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: borderColor, width: 1),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: AppTheme.isDark(context) ? 0.15 : 0.03),
              blurRadius: 14,
              offset: const Offset(0, 4),
            )
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(icon, color: accentColor, size: 24),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.outfit(
                      fontWeight: FontWeight.bold,
                      color: textColor,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.plusJakartaSans(
                      color: subTextColor,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchHistorySection(
    BuildContext context,
    Color cardColor,
    Color borderColor,
    Color textColor,
    Color subTextColor,
    Color primaryColor,
    Color softBg,
  ) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Lịch sử tra từ',
              style: GoogleFonts.outfit(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: textColor,
              ),
            ),
            BlocBuilder<SearchBloc, SearchState>(
              builder: (context, state) {
                if (state is HistoryLoadSuccess && state.history.isNotEmpty) {
                  return TextButton(
                    onPressed: _clearAllHistory,
                    child: Text(
                      'Xóa tất cả',
                      style: GoogleFonts.outfit(
                        color: AppTheme.errorRed,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  );
                }
                return const SizedBox.shrink();
              },
            ),
          ],
        ),
        const SizedBox(height: 10),
        BlocBuilder<SearchBloc, SearchState>(
          builder: (context, state) {
            if (state is SearchLoading) {
              return const Center(
                child: Padding(
                  padding: EdgeInsets.all(20.0),
                  child: CircularProgressIndicator(),
                ),
              );
            }
            if (state is HistoryLoadSuccess) {
              final history = state.history;
              if (history.isEmpty) {
                return Center(
                  child: Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Text(
                      'Chưa có lịch sử tra cứu nào.',
                      style: GoogleFonts.plusJakartaSans(color: subTextColor),
                    ),
                  ),
                );
              }
              return ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: history.length > 5 ? 5 : history.length,
                separatorBuilder: (_, _) => const SizedBox(height: 10),
                itemBuilder: (context, index) {
                  final item = history[index];
                  final word = item['word'] ?? '';
                  final translation = item['translation'] ?? '';

                  return Dismissible(
                    key: Key(word),
                    direction: DismissDirection.endToStart,
                    background: Container(
                      alignment: Alignment.centerRight,
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      decoration: BoxDecoration(
                        color: AppTheme.errorRed,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Icon(Icons.delete_outline_rounded, color: Colors.white),
                    ),
                    onDismissed: (_) => _deleteHistory(word),
                    child: Container(
                      decoration: BoxDecoration(
                        color: cardColor,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: borderColor, width: 1),
                      ),
                      child: ListTile(
                        leading: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: softBg,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(Icons.history_rounded, color: primaryColor),
                        ),
                        title: Text(
                          word,
                          style: GoogleFonts.outfit(fontWeight: FontWeight.w600, color: textColor),
                        ),
                        subtitle: Text(
                          translation,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.plusJakartaSans(color: subTextColor, fontSize: 13),
                        ),
                        trailing: Icon(Icons.arrow_forward_ios_rounded, size: 14, color: subTextColor),
                        onTap: () => _searchWord(word),
                      ),
                    ),
                  );
                },
              );
            }
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Text(
                  'Tra từ vựng để lưu trữ lịch sử tại đây.',
                  style: GoogleFonts.plusJakartaSans(color: subTextColor),
                ),
              ),
            );
          },
        ),
      ],
    );
  }
}
