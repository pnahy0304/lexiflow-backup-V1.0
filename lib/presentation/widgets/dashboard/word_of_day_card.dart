import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';

class WordOfDayCard extends StatelessWidget {
  final Map<String, String> wordOfTheDay;
  final ValueChanged<String> onTapWord;

  const WordOfDayCard({
    super.key,
    required this.wordOfTheDay,
    required this.onTapWord,
  });

  @override
  Widget build(BuildContext context) {
    final word = wordOfTheDay['word'] ?? '';
    final meaning = wordOfTheDay['meaning'] ?? '';
    final example = wordOfTheDay['example'] ?? '';

    final cardColor = AppTheme.cardColor(context);
    final primaryColor = AppTheme.primaryColor(context);
    final textColor = AppTheme.textColor(context);
    final subTextColor = AppTheme.subTextColor(context);
    final borderColor = AppTheme.borderColor(context);
    final softBg = AppTheme.softBgColor(context);

    return InkWell(
      onTap: () => onTapWord(word),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        width: double.infinity,
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
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: primaryColor.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.auto_awesome_rounded, size: 14, color: primaryColor),
                          const SizedBox(width: 4),
                          Text(
                            'Từ vựng hôm nay',
                            style: GoogleFonts.outfit(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: primaryColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                Icon(Icons.arrow_forward_ios_rounded, size: 14, color: subTextColor),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              word,
              style: GoogleFonts.outfit(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: primaryColor,
                letterSpacing: -0.3,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              meaning,
              style: GoogleFonts.outfit(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: textColor,
              ),
            ),
            if (example.isNotEmpty) ...[
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: softBg,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  'Ví dụ: "$example"',
                  style: GoogleFonts.outfit(
                    fontSize: 13,
                    fontStyle: FontStyle.italic,
                    color: subTextColor,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

