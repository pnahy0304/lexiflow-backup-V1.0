import 'package:flutter_test/flutter_test.dart';
import 'package:lexiflow/core/theme/app_theme.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('Theme compilation smoke test', () {
    final theme = AppTheme.lightTheme;
    expect(theme, isNotNull);
  });
}
