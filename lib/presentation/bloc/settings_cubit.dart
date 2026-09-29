import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

/// Available theme modes for the app.
enum AppThemeMode {
  light,
  dark,
  system,
}

class SettingsState {
  final AppThemeMode themeMode;
  final bool autoPlayAudio;

  const SettingsState({
    this.themeMode = AppThemeMode.system,
    this.autoPlayAudio = false,
  });

  SettingsState copyWith({
    AppThemeMode? themeMode,
    bool? autoPlayAudio,
  }) {
    return SettingsState(
      themeMode: themeMode ?? this.themeMode,
      autoPlayAudio: autoPlayAudio ?? this.autoPlayAudio,
    );
  }
}

/// Cubit for managing app-wide settings (theme, auto-play audio, etc.).
class SettingsCubit extends Cubit<SettingsState> {
  SettingsCubit() : super(const SettingsState());

  /// Cycle through theme modes: light → dark → system → light
  void toggleTheme() {
    switch (state.themeMode) {
      case AppThemeMode.light:
        emit(state.copyWith(themeMode: AppThemeMode.dark));
        break;
      case AppThemeMode.dark:
        emit(state.copyWith(themeMode: AppThemeMode.system));
        break;
      case AppThemeMode.system:
        emit(state.copyWith(themeMode: AppThemeMode.light));
        break;
    }
  }

  /// Toggle auto-play audio on card flip
  void toggleAutoPlayAudio() {
    emit(state.copyWith(autoPlayAudio: !state.autoPlayAudio));
  }

  /// Set a specific theme mode.
  void setThemeMode(AppThemeMode mode) {
    emit(state.copyWith(themeMode: mode));
  }

  /// Human-readable label for the current theme mode.
  String get themeLabel {
    switch (state.themeMode) {
      case AppThemeMode.light:
        return 'Sáng';
      case AppThemeMode.dark:
        return 'Tối';
      case AppThemeMode.system:
        return 'Hệ thống';
    }
  }

  /// Icon for the current theme mode.
  IconData get themeIcon {
    switch (state.themeMode) {
      case AppThemeMode.light:
        return Icons.light_mode_rounded;
      case AppThemeMode.dark:
        return Icons.dark_mode_rounded;
      case AppThemeMode.system:
        return Icons.settings_brightness_rounded;
    }
  }
}
