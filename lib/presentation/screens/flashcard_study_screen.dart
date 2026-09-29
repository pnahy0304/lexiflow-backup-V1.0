import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flip_card/flip_card.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:audioplayers/audioplayers.dart';
import '../../core/theme/app_theme.dart';
import '../bloc/flashcard_bloc.dart';
import '../../core/utils/spaced_repetition.dart';
import '../../data/models/vocab_model.dart';

import '../bloc/settings_cubit.dart';
import 'custom_review_screen.dart';
import '../../core/utils/page_transitions.dart';

class FlashcardStudyScreen extends StatefulWidget {
  const FlashcardStudyScreen({super.key});

  @override
  State<FlashcardStudyScreen> createState() => _FlashcardStudyScreenState();
}

class _FlashcardStudyScreenState extends State<FlashcardStudyScreen> {
  final GlobalKey<FlipCardState> _cardKey = GlobalKey<FlipCardState>();

  @override
  void initState() {
    super.initState();
    context.read<FlashcardBloc>().add(FlashcardLoadRequested());
  }

  void _onAnswer(Vocab vocab, ReviewQuality quality) {
    // If card is flipped back, flip it back to front before showing next card
    if (_cardKey.currentState != null && !_cardKey.currentState!.isFront) {
      _cardKey.currentState!.toggleCard();
    }
    context.read<FlashcardBloc>().add(FlashcardReviewed(vocab: vocab, quality: quality));
  }

  @override
  Widget build(BuildContext context) {
    final cardColor = AppTheme.cardColor(context);
    final textColor = AppTheme.textColor(context);
    final subTextColor = AppTheme.subTextColor(context);
    final borderColor = AppTheme.borderColor(context);
    final primaryColor = AppTheme.primaryColor(context);
    final softBg = AppTheme.softBgColor(context);
    final isAutoPlay = context.watch<SettingsCubit>().state.autoPlayAudio;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text('Thẻ Ghi Nhớ', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: textColor)),
        actions: [
          IconButton(
            tooltip: 'Ôn Tập Cấp Tốc',
            icon: Icon(Icons.bolt_rounded, color: Colors.amber.shade600),
            onPressed: () {
              Navigator.push(
                context,
                SlidePageRoute(page: const CustomReviewScreen()),
              );
            },
          ),
        ],
      ),
      body: BlocBuilder<FlashcardBloc, FlashcardState>(
        builder: (context, state) {
          if (state is FlashcardLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state is FlashcardFailure) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(28.0),
                child: Text('Lỗi: ${state.message}', style: GoogleFonts.outfit(color: textColor)),
              ),
            );
          }

          if (state is FlashcardsEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(28.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: primaryColor.withValues(alpha: 0.12),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.check_circle_rounded,
                        size: 64,
                        color: primaryColor,
                      ),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'Tất cả đã hoàn thành! 🎉',
                      style: GoogleFonts.outfit(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: textColor,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Hôm nay bạn không có thẻ từ vựng nào cần ôn tập. Hãy thêm từ mới từ mục tìm kiếm nhé!',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(
                        color: subTextColor,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 32),
                    ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Quay lại Trang chủ'),
                    ),
                  ],
                ),
              ),
            );
          }

          if (state is FlashcardsLoadSuccess) {
            final vocabs = state.vocabs;
            final currentIndex = state.currentIndex;

            if (currentIndex >= vocabs.length) {
              return Center(
                child: Padding(
                  padding: const EdgeInsets.all(28.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.check_circle_rounded, size: 64, color: primaryColor),
                      const SizedBox(height: 16),
                      Text(
                        'Tất cả đã hoàn thành! 🎉',
                        style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.bold, color: textColor),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Quay lại Trang chủ'),
                      ),
                    ],
                  ),
                ),
              );
            }

            final currentVocab = vocabs[currentIndex];

            return Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                children: [
                  // Progress indicator
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Tiến độ ôn tập',
                        style: GoogleFonts.outfit(color: subTextColor, fontWeight: FontWeight.w600),
                      ),
                      Text(
                        '${currentIndex + 1} / ${vocabs.length}',
                        style: GoogleFonts.outfit(color: primaryColor, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: LinearProgressIndicator(
                      value: (currentIndex + 1) / vocabs.length,
                      backgroundColor: borderColor,
                      valueColor: AlwaysStoppedAnimation<Color>(primaryColor),
                      minHeight: 8,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Flip Card Widget (Theme Aware)
                  Expanded(
                    child: FlipCard(
                      key: _cardKey,
                      direction: FlipDirection.HORIZONTAL,
                      onFlipDone: (isFront) {
                        if (!isFront && isAutoPlay) {
                          final AudioPlayer audioPlayer = AudioPlayer();
                          try {
                            final url = 'https://dict.youdao.com/dictvoice?type=2&audio=${currentVocab.word}';
                            audioPlayer.play(UrlSource(url));
                          } catch (_) {}
                        }
                      },
                      front: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: cardColor,
                          borderRadius: BorderRadius.circular(30),
                          border: Border.all(color: borderColor, width: 1.5),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: AppTheme.isDark(context) ? 0.25 : 0.04),
                              blurRadius: 20,
                              offset: const Offset(0, 10),
                            ),
                          ],
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              currentVocab.word,
                              style: GoogleFonts.outfit(
                                fontSize: 36,
                                fontWeight: FontWeight.bold,
                                color: primaryColor,
                                letterSpacing: -0.5,
                              ),
                            ),
                            const SizedBox(height: 24),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              decoration: BoxDecoration(
                                color: softBg,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.touch_app_rounded, color: subTextColor, size: 18),
                                  const SizedBox(width: 6),
                                  Text(
                                    'Chạm để lật thẻ xem nghĩa',
                                    style: GoogleFonts.outfit(
                                      color: subTextColor,
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      back: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: softBg,
                          borderRadius: BorderRadius.circular(30),
                          border: Border.all(color: primaryColor.withValues(alpha: 0.3), width: 1.5),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              currentVocab.word,
                              style: GoogleFonts.outfit(
                                fontSize: 20,
                                color: subTextColor,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              currentVocab.meaning,
                              textAlign: TextAlign.center,
                              style: GoogleFonts.outfit(
                                fontSize: 28,
                                fontWeight: FontWeight.bold,
                                color: primaryColor,
                              ),
                            ),
                            if (currentVocab.example.isNotEmpty) ...[
                              const SizedBox(height: 24),
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: cardColor,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: borderColor),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Ví dụ mẫu:',
                                      style: GoogleFonts.outfit(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: subTextColor,
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      '"${currentVocab.example}"',
                                      style: GoogleFonts.outfit(
                                        fontSize: 14,
                                        fontStyle: FontStyle.italic,
                                        color: textColor,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Rating Buttons (Spaced Repetition)
                  Column(
                    children: [
                      Text(
                        'Bạn có nhớ từ vựng này không?',
                        style: GoogleFonts.outfit(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: subTextColor,
                        ),
                      ),
                      const SizedBox(height: 14),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildReviewButton(
                            context,
                            label: 'Lặp lại',
                            quality: ReviewQuality.again,
                            bgColor: AppTheme.isDark(context) ? Colors.red.shade900.withValues(alpha: 0.4) : Colors.red.shade50,
                            textColor: AppTheme.isDark(context) ? Colors.red.shade300 : Colors.red.shade700,
                            vocab: currentVocab,
                          ),
                          _buildReviewButton(
                            context,
                            label: 'Khó',
                            quality: ReviewQuality.hard,
                            bgColor: AppTheme.isDark(context) ? Colors.orange.shade900.withValues(alpha: 0.4) : Colors.orange.shade50,
                            textColor: AppTheme.isDark(context) ? Colors.orange.shade300 : Colors.orange.shade700,
                            vocab: currentVocab,
                          ),
                          _buildReviewButton(
                            context,
                            label: 'Tốt',
                            quality: ReviewQuality.good,
                            bgColor: AppTheme.isDark(context) ? Colors.green.shade900.withValues(alpha: 0.4) : Colors.green.shade50,
                            textColor: AppTheme.isDark(context) ? Colors.green.shade300 : Colors.green.shade700,
                            vocab: currentVocab,
                          ),
                          _buildReviewButton(
                            context,
                            label: 'Dễ',
                            quality: ReviewQuality.easy,
                            bgColor: AppTheme.isDark(context) ? Colors.blue.shade900.withValues(alpha: 0.4) : Colors.blue.shade50,
                            textColor: AppTheme.isDark(context) ? Colors.blue.shade300 : Colors.blue.shade700,
                            vocab: currentVocab,
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                ],
              ),
            );
          }

          return const Center(child: Text('Đang chuẩn bị thẻ ghi nhớ...'));
        },
      ),
    );
  }

  Widget _buildReviewButton(
    BuildContext context, {
    required String label,
    required ReviewQuality quality,
    required Color bgColor,
    required Color textColor,
    required Vocab vocab,
  }) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4.0),
        child: InkWell(
          onTap: () => _onAnswer(vocab, quality),
          borderRadius: BorderRadius.circular(14),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 14),
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: textColor.withValues(alpha: 0.3), width: 1),
            ),
            child: Center(
              child: Text(
                label,
                style: GoogleFonts.outfit(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  color: textColor,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

