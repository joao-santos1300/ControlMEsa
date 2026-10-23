import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/theme.dart';
import '../state/app_state.dart';
import '../widgets/common.dart';
import 'orders_screen.dart';
import 'tables_screen.dart';

class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _index = 0;
  StreamSubscription<AppEvent>? _sub;

  @override
  void initState() {
    super.initState();
    _sub = context.read<AppState>().events.listen((e) {
      if (mounted) showSnack(context, e.message, good: e.good);
    });
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();

    return Scaffold(
      extendBody: true,
      body: AmbientBackground(
        child: SafeArea(
          bottom: false,
          child: IndexedStack(
            index: _index,
            children: const [TablesScreen(), OrdersScreen()],
          ),
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(40, 0, 40, 14),
          child: Container(
            height: 64,
            decoration: BoxDecoration(
              color: Palette.surfaceHi.withValues(alpha: 0.96),
              borderRadius: BorderRadius.circular(32),
              border: Border.all(color: Palette.line),
              boxShadow: const [
                BoxShadow(
                    color: Colors.black54, blurRadius: 24, offset: Offset(0, 10))
              ],
            ),
            child: Row(
              children: [
                _NavItem(
                  icon: Icons.grid_view_rounded,
                  label: 'Mesas',
                  selected: _index == 0,
                  onTap: () => setState(() => _index = 0),
                ),
                _NavItem(
                  icon: Icons.receipt_long_rounded,
                  label: 'Pedidos',
                  badge: app.readyOrders,
                  selected: _index == 1,
                  onTap: () => setState(() => _index = 1),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool selected;
  final int badge;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
    this.badge = 0,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: Center(
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 250),
            curve: Curves.easeOutCubic,
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
            decoration: BoxDecoration(
              gradient: selected ? Palette.emberGradient : null,
              borderRadius: BorderRadius.circular(26),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Badge(
                  isLabelVisible: badge > 0,
                  label: Text('$badge'),
                  backgroundColor: Palette.mint,
                  textColor: Colors.black,
                  child: Icon(icon,
                      size: 22,
                      color: selected ? Colors.white : Palette.textDim),
                ),
                AnimatedSize(
                  duration: const Duration(milliseconds: 250),
                  curve: Curves.easeOutCubic,
                  child: selected
                      ? Padding(
                          padding: const EdgeInsets.only(left: 8),
                          child: Text(label,
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w700)),
                        )
                      : const SizedBox.shrink(),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
