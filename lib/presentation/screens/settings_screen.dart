import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/page_transitions.dart';
import '../../services/cloudflare_service.dart';
import '../../services/notification_service.dart';
import '../../core/constants/daily_words.dart';
import '../bloc/settings_cubit.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/search_bloc.dart';
import 'auth_screen.dart';
import 'bookmarks_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  CloudflareService get _cloudflareService => context.read<CloudflareService>();
  bool _loadingStreak = true;
  int _streak = 0;

  @override
  void initState() {
    super.initState();
    _loadStreakInfo();
  }

  Future<void> _loadStreakInfo() async {
    setState(() => _loadingStreak = true);
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid != null) {
      try {
        // Fetch streak details from Cloudflare D1
        final streak = await _cloudflareService.getStudyStreak(uid);
        if (mounted) {
          setState(() {
            _streak = streak;
            _loadingStreak = false;
          });
        }
      } catch (_) {
        if (mounted) setState(() => _loadingStreak = false);
      }
    } else {
      if (mounted) setState(() => _loadingStreak = false);
    }
  }

  Future<void> _clearAllHistory() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Xóa lịch sử tra từ'),
        content: const Text('Bạn có chắc muốn xóa toàn bộ lịch sử tra từ không? Hành động này không thể hoàn tác.'),
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

    if (confirmed != true || !mounted) return;

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

  Future<void> _logout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Đăng xuất'),
        content: const Text('Bạn có chắc muốn đăng xuất khỏi tài khoản không?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Hủy'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Đăng xuất', style: TextStyle(color: AppTheme.errorRed)),
          ),
        ],
      ),
    );

    if (confirmed != true || !mounted) return;

    context.read<AuthBloc>().add(AuthLogoutRequested());
    Navigator.pushAndRemoveUntil(
      context,
      SlidePageRoute(page: const AuthScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final cardColor = AppTheme.cardColor(context);
    final softBg = AppTheme.softBgColor(context);
    final textColor = AppTheme.textColor(context);
    final subColor = AppTheme.subTextColor(context);
    final borderColor = AppTheme.borderColor(context);
    final primaryColor = AppTheme.primaryColor(context);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text('Cài đặt', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: textColor)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 12),

            // ── Section: Giao diện ──
            _buildSectionHeader('Giao diện', subColor),
            const SizedBox(height: 10),
            Container(
              decoration: BoxDecoration(
                color: cardColor,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: borderColor, width: 1),
              ),
              child: BlocBuilder<SettingsCubit, SettingsState>(
                builder: (context, settingsState) {
                  return SwitchListTile(
                    secondary: Icon(
                      context.read<SettingsCubit>().themeIcon,
                      color: primaryColor,
                    ),
                    title: Text(
                      'Chế độ giao diện',
                      style: GoogleFonts.outfit(fontWeight: FontWeight.w600, color: textColor),
                    ),
                    subtitle: Text(
                      context.read<SettingsCubit>().themeLabel,
                      style: GoogleFonts.outfit(color: subColor, fontSize: 13),
                    ),
                    value: settingsState.themeMode != AppThemeMode.light,
                    onChanged: (_) => context.read<SettingsCubit>().toggleTheme(),
                  );
                },
              ),
            ),
            const SizedBox(height: 24),

            // ── Section: Học tập ──
            _buildSectionHeader('Học tập', subColor),
            const SizedBox(height: 10),
            Container(
              decoration: BoxDecoration(
                color: cardColor,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: borderColor, width: 1),
              ),
              child: Column(
                children: [
                  // Auto-play Audio Switch
                  BlocBuilder<SettingsCubit, SettingsState>(
                    builder: (context, settingsState) {
                      return SwitchListTile(
                        secondary: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: softBg,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(Icons.volume_up_rounded, color: primaryColor, size: 24),
                        ),
                        title: Text(
                          'Tự động phát âm khi lật thẻ',
                          style: GoogleFonts.outfit(fontWeight: FontWeight.w600, color: textColor),
                        ),
                        subtitle: Text(
                          'Tự động phát âm thanh khi lật mặt sau thẻ từ vựng',
                          style: GoogleFonts.outfit(color: subColor, fontSize: 13),
                        ),
                        value: settingsState.autoPlayAudio,
                        onChanged: (_) => context.read<SettingsCubit>().toggleAutoPlayAudio(),
                      );
                    },
                  ),
                  Divider(height: 1, indent: 72, color: borderColor),
                  // Streak Info
                  ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppTheme.accentOrange.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(Icons.local_fire_department_rounded, color: AppTheme.accentOrange, size: 24),
                    ),
                    title: Text(
                      'Chuỗi học tập',
                      style: GoogleFonts.outfit(fontWeight: FontWeight.w600, color: textColor),
                    ),
                    subtitle: _loadingStreak
                        ? Text('Đang tải...', style: GoogleFonts.outfit(color: subColor, fontSize: 13))
                        : Text(
                            _streak > 0 ? '$_streak ngày liên tiếp' : 'Bắt đầu học ngay!',
                            style: GoogleFonts.outfit(color: subColor, fontSize: 13),
                          ),
                    trailing: _streak > 0
                        ? Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppTheme.accentOrange.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              '$_streak 🔥',
                              style: GoogleFonts.outfit(
                                fontWeight: FontWeight.bold,
                                color: AppTheme.accentOrange,
                                fontSize: 16,
                              ),
                            ),
                          )
                        : null,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // ── Section: Dữ liệu ──
            _buildSectionHeader('Dữ liệu', subColor),
            const SizedBox(height: 10),
            Container(
              decoration: BoxDecoration(
                color: cardColor,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: borderColor, width: 1),
              ),
              child: Column(
                children: [
                  // Bookmarks
                  ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: softBg,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(Icons.bookmark_rounded, color: primaryColor, size: 24),
                    ),
                    title: Text(
                      'Từ vựng đã lưu',
                      style: GoogleFonts.outfit(fontWeight: FontWeight.w600, color: textColor),
                    ),
                    subtitle: Text(
                      'Xem danh sách từ vựng đã bookmark',
                      style: GoogleFonts.outfit(color: subColor, fontSize: 13),
                    ),
                    trailing: Icon(Icons.arrow_forward_ios_rounded, size: 14, color: subColor),
                    onTap: () {
                      Navigator.push(
                        context,
                        SlidePageRoute(page: const BookmarksScreen()),
                      );
                    },
                  ),
                  Divider(height: 1, indent: 72, color: borderColor),
                  // Clear History
                  ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppTheme.errorRed.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.delete_sweep_rounded, color: AppTheme.errorRed, size: 24),
                    ),
                    title: Text(
                      'Xóa lịch sử tra từ',
                      style: GoogleFonts.outfit(fontWeight: FontWeight.w600, color: textColor),
                    ),
                    subtitle: Text(
                      'Xóa tất cả lịch sử tra cứu từ điển',
                      style: GoogleFonts.outfit(color: subColor, fontSize: 13),
                    ),
                    onTap: _clearAllHistory,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // ── Section: Thông báo ──
            _buildSectionHeader('Thông báo', subColor),
            const SizedBox(height: 10),
            Container(
              decoration: BoxDecoration(
                color: cardColor,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: borderColor, width: 1),
              ),
              child: ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: softBg,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(Icons.notifications_rounded, color: primaryColor, size: 24),
                ),
                title: Text(
                  'Nhắc nhở hàng ngày',
                  style: GoogleFonts.outfit(fontWeight: FontWeight.w600, color: textColor),
                ),
                subtitle: Text(
                  '9:00 AM — Mỗi ngày học 1 từ vựng',
                  style: GoogleFonts.outfit(color: subColor, fontSize: 13),
                ),
                trailing: ElevatedButton.icon(
                  icon: const Icon(Icons.refresh_rounded, size: 18),
                  label: const Text('Lên lịch lại'),
                  onPressed: () async {
                    final messenger = ScaffoldMessenger.of(context);
                    final notificationService = NotificationService();
                    final dailyWord = DailyWords.getWordOfTheDay();
                    await notificationService.scheduleDailyNotification(
                      dailyWord['word']!,
                      dailyWord['meaning']!,
                    );
                    if (mounted) {
                      messenger.showSnackBar(
                        const SnackBar(content: Text('Đã lên lịch thông báo từ vựng hàng ngày.')),
                      );
                    }
                  },
                ),
              ),
            ),
            const SizedBox(height: 24),

            // ── Section: Tài khoản ──
            _buildSectionHeader('Tài khoản', subColor),
            const SizedBox(height: 10),
            Container(
              decoration: BoxDecoration(
                color: cardColor,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: borderColor, width: 1),
              ),
              child: ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppTheme.errorRed.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.logout_rounded, color: AppTheme.errorRed, size: 24),
                ),
                title: Text(
                  'Đăng xuất',
                  style: GoogleFonts.outfit(fontWeight: FontWeight.w600, color: textColor),
                ),
                subtitle: Text(
                  'Đăng xuất khỏi tài khoản hiện tại',
                  style: GoogleFonts.outfit(color: subColor, fontSize: 13),
                ),
                onTap: _logout,
              ),
            ),
            const SizedBox(height: 24),

            // ── Section: Về ứng dụng ──
            _buildSectionHeader('Về ứng dụng', subColor),
            const SizedBox(height: 10),
            Container(
              decoration: BoxDecoration(
                color: cardColor,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: borderColor, width: 1),
              ),
              child: Column(
                children: [
                  ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: softBg,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(Icons.menu_book_rounded, color: primaryColor, size: 24),
                    ),
                    title: Text(
                      'LexiFlow',
                      style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: textColor, fontSize: 16),
                    ),
                    subtitle: Text(
                      'Phiên bản 1.0.0+1',
                      style: GoogleFonts.outfit(color: subColor, fontSize: 13),
                    ),
                  ),
                  Divider(height: 1, indent: 72, color: borderColor),
                  ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: softBg,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(Icons.info_outline_rounded, color: primaryColor, size: 24),
                    ),
                    title: Text(
                      'Công nghệ',
                      style: GoogleFonts.outfit(fontWeight: FontWeight.w600, color: textColor),
                    ),
                    subtitle: Text(
                      'Flutter • Firebase • SM-2 Algorithm • Google ML Kit • Oxford Dictionary API',
                      style: GoogleFonts.outfit(color: subColor, fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, Color color) {
    return Padding(
      padding: const EdgeInsets.only(left: 4.0),
      child: Text(
        title.toUpperCase(),
        style: GoogleFonts.outfit(
          fontSize: 13,
          fontWeight: FontWeight.bold,
          color: color,
          letterSpacing: 1.0,
        ),
      ),
    );
  }
}

