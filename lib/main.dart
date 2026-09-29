import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

// Services
import 'services/auth_service.dart';
import 'services/cloudflare_service.dart';
import 'services/notification_service.dart';
import 'data/datasources/dictionary_service.dart';

// Constants & Helpers
import 'core/constants/daily_words.dart';

// Themes & Styles
import 'core/theme/app_theme.dart';

// BLoCs
import 'presentation/bloc/auth_bloc.dart';
import 'presentation/bloc/search_bloc.dart';
import 'presentation/bloc/flashcard_bloc.dart';
import 'presentation/bloc/ocr_bloc.dart';
import 'presentation/bloc/settings_cubit.dart';

// Screens
import 'presentation/screens/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  // Initialize Core Services & Local Notifications
  final authService = AuthService();
  final cloudflareService = CloudflareService();
  final dictionaryService = DictionaryService();
  final notificationService = NotificationService();

  await notificationService.initialize();

  // Schedule daily repeating notification "Mỗi ngày học 1 từ vựng" (TFLAT style)
  try {
    final dailyWord = DailyWords.getWordOfTheDay();
    await notificationService.scheduleDailyNotification(
      dailyWord['word']!,
      dailyWord['meaning']!,
    );
  } catch (e) {
    // Suppress notification errors if they fail during testing/CI
  }

  runApp(
    MultiRepositoryProvider(
      providers: [
        RepositoryProvider<AuthService>.value(value: authService),
        RepositoryProvider<CloudflareService>.value(value: cloudflareService),
        RepositoryProvider<DictionaryService>.value(value: dictionaryService),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider<AuthBloc>(
            create: (context) => AuthBloc(authService: authService)..add(AuthCheckRequested()),
          ),
          BlocProvider<SearchBloc>(
            create: (context) => SearchBloc(
              dictionaryService: dictionaryService,
              cloudflareService: cloudflareService,
            ),
          ),
          BlocProvider<FlashcardBloc>(
            create: (context) => FlashcardBloc(
              cloudflareService: cloudflareService,
            ),
          ),
          BlocProvider<OcrBloc>(
            create: (context) => OcrBloc(),
          ),
          BlocProvider<SettingsCubit>(
            create: (context) => SettingsCubit(),
          ),
        ],
        child: const LexiFlowApp(),
      ),
    ),
  );
}

class LexiFlowApp extends StatelessWidget {
  const LexiFlowApp({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<SettingsCubit, SettingsState>(
      builder: (context, settingsState) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          title: 'LexiFlow',
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: _mapThemeMode(settingsState.themeMode),
          home: const SplashScreen(),
        );
      },
    );
  }

  ThemeMode _mapThemeMode(AppThemeMode mode) {
    switch (mode) {
      case AppThemeMode.light:
        return ThemeMode.light;
      case AppThemeMode.dark:
        return ThemeMode.dark;
      case AppThemeMode.system:
        return ThemeMode.system;
    }
  }
}