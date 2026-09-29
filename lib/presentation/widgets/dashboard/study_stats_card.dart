import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';

class StudyStatsCard extends StatelessWidget {
  final bool loadingStats;
  final int totalCards;
  final int newCards;
  final int learningCards;
  final int memorizedCards;

  const StudyStatsCard({
    super.key,
    required this.loadingStats,
    required this.totalCards,
    required this.newCards,
    required this.learningCards,
    required this.memorizedCards,
  });

  Widget _buildStatLabel(BuildContext context, String title, int count, Color color) {
    final textColor = AppTheme.textColor(context);
    return Row(
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 6),
        Text(
          '$title: $count',
          style: GoogleFonts.outfit(fontSize: 13, color: textColor, fontWeight: FontWeight.w500),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    if (loadingStats) {
      return const Center(child: CircularProgressIndicator());
    }

    final cardColor = AppTheme.cardColor(context);
    final textColor = AppTheme.textColor(context);
    final subTextColor = AppTheme.subTextColor(context);
    final borderColor = AppTheme.borderColor(context);
    final primaryColor = AppTheme.primaryColor(context);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: borderColor, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: AppTheme.isDark(context) ? 0.2 : 0.03),
            blurRadius: 16,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Tổng cộng: $totalCards từ vựng',
                style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: textColor, fontSize: 16),
              ),
              Icon(Icons.pie_chart_outline_rounded, color: primaryColor, size: 20),
            ],
          ),
          const SizedBox(height: 16),
          totalCards == 0
              ? Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: Text(
                    'Chưa có thống kê. Hãy lưu thêm từ vựng để bắt đầu ôn tập.',
                    style: GoogleFonts.outfit(color: subTextColor, fontSize: 13),
                  ),
                )
              : Column(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: SizedBox(
                        height: 14,
                        width: double.infinity,
                        child: Row(
                          children: [
                            if (newCards > 0)
                              Expanded(
                                flex: newCards,
                                child: Container(color: AppTheme.isDark(context) ? Colors.grey.shade700 : Colors.grey.shade300),
                              ),
                            if (learningCards > 0)
                              Expanded(
                                flex: learningCards,
                                child: Container(color: AppTheme.accentOrange),
                              ),
                            if (memorizedCards > 0)
                              Expanded(
                                flex: memorizedCards,
                                child: Container(color: primaryColor),
                              ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildStatLabel(context, 'Chưa học', newCards, AppTheme.isDark(context) ? Colors.grey.shade400 : Colors.grey.shade400),
                        _buildStatLabel(context, 'Đang học', learningCards, AppTheme.accentOrange),
                        _buildStatLabel(context, 'Đã thuộc', memorizedCards, primaryColor),
                      ],
                    ),
                  ],
                ),
        ],
      ),
    );
  }
}

