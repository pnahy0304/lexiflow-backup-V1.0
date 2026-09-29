import 'dart:async';
import 'package:flutter_test/flutter_test.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:lexiflow/presentation/bloc/auth_bloc.dart';
import 'package:lexiflow/services/auth_service.dart';

class FakeAuthService implements AuthService {
  User? _mockUser;
  final _controller = StreamController<User?>.broadcast();

  void setMockUser(User? user) {
    _mockUser = user;
    _controller.add(user);
  }

  @override
  User? get currentUser => _mockUser;

  @override
  Stream<User?> get authStateChanges => _controller.stream;

  @override
  Future<User?> login(String email, String password) async {
    if (email == 'test@lexiflow.com' && password == 'password123') {
      return _mockUser;
    }
    throw Exception('wrong-password');
  }

  @override
  Future<User?> register(String email, String password) async {
    if (password.length < 6) {
      throw Exception('weak-password');
    }
    return _mockUser;
  }

  @override
  Future<void> logout() async {
    _mockUser = null;
    _controller.add(null);
  }

  @override
  Future<User?> signInWithGoogle() async {
    return _mockUser;
  }

  @override
  Future<void> sendPasswordResetEmail(String email) async {
    if (email.contains('invalid')) {
      throw Exception('invalid-email');
    }
  }
}


void main() {
  group('AuthBloc Unit Tests', () {
    late FakeAuthService fakeAuthService;
    late AuthBloc authBloc;

    setUp(() {
      fakeAuthService = FakeAuthService();
      authBloc = AuthBloc(authService: fakeAuthService);
    });

    tearDown(() {
      authBloc.close();
    });

    test('Initial state is AuthInitial', () {
      expect(authBloc.state, equals(AuthInitial()));
    });

    test('AuthCheckRequested returns AuthUnauthenticated when no user is logged in', () async {
      authBloc.add(AuthCheckRequested());
      await expectLater(
        authBloc.stream,
        emits(AuthUnauthenticated()),
      );
    });

    test('AuthPasswordResetRequested emits [AuthLoading, AuthPasswordResetSent] on success', () async {
      authBloc.add(const AuthPasswordResetRequested('test@lexiflow.com'));

      await expectLater(
        authBloc.stream,
        emitsInOrder([
          AuthLoading(),
          const AuthPasswordResetSent('test@lexiflow.com'),
        ]),
      );
    });

    test('AuthPasswordResetRequested emits [AuthLoading, AuthFailure] on invalid email', () async {
      authBloc.add(const AuthPasswordResetRequested('invalid-email'));

      await expectLater(
        authBloc.stream,
        emitsInOrder([
          AuthLoading(),
          isA<AuthFailure>(),
        ]),
      );
    });

    test('AuthLogoutRequested emits [AuthLoading, AuthUnauthenticated]', () async {
      authBloc.add(AuthLogoutRequested());

      await expectLater(
        authBloc.stream,
        emitsInOrder([
          AuthLoading(),
          AuthUnauthenticated(),
        ]),
      );
    });

    test('AuthGoogleSignInSubmitted emits [AuthLoading, AuthUnauthenticated] when mock user is null', () async {
      authBloc.add(AuthGoogleSignInSubmitted());

      await expectLater(
        authBloc.stream,
        emitsInOrder([
          AuthLoading(),
          AuthUnauthenticated(),
        ]),
      );
    });
  });
}


