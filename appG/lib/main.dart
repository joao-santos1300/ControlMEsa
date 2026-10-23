import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/theme.dart';
import 'screens/home_shell.dart';
import 'screens/login_screen.dart';
import 'state/app_state.dart';
import 'widgets/common.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(ChangeNotifierProvider(
    create: (_) => AppState()..boot(),
    child: const GarcomApp(),
  ));
}

final _navigatorKey = GlobalKey<NavigatorState>();

class GarcomApp extends StatelessWidget {
  const GarcomApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ControlMesa Garçom',
      debugShowCheckedModeBanner: false,
      navigatorKey: _navigatorKey,
      theme: buildTheme(),
      home: const _Root(),
    );
  }
}

class _Root extends StatefulWidget {
  const _Root();

  @override
  State<_Root> createState() => _RootState();
}

class _RootState extends State<_Root> {
  bool _wasLoggedIn = false;

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();

    // Ao sair (ou sessão expirada) descarta telas empilhadas sobre o salão
    if (_wasLoggedIn && !app.loggedIn) {
      WidgetsBinding.instance.addPostFrameCallback(
          (_) => _navigatorKey.currentState?.popUntil((r) => r.isFirst));
    }
    _wasLoggedIn = app.loggedIn;

    if (app.booting) {
      return const Scaffold(
        body: AmbientBackground(
          child: Center(child: CircularProgressIndicator(color: Palette.ember)),
        ),
      );
    }
    return app.loggedIn ? const HomeShell() : const LoginScreen();
  }
}
