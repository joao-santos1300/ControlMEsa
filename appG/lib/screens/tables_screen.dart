import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/format.dart';
import '../core/theme.dart';
import '../models/models.dart';
import '../state/app_state.dart';
import '../widgets/common.dart';
import '../widgets/table_tile.dart';
import 'menu_screen.dart';
import 'order_detail_screen.dart';

enum _Filter { all, free, mine }

class TablesScreen extends StatefulWidget {
  const TablesScreen({super.key});

  @override
  State<TablesScreen> createState() => _TablesScreenState();
}

class _TablesScreenState extends State<TablesScreen> {
  _Filter _filter = _Filter.all;

  void _open(BuildContext context, AppState app, int index) {
    final table = _visible(app)[index];
    final order = app.orderForTable(table.id);

    if (order != null) {
      Navigator.push(context,
          MaterialPageRoute(builder: (_) => OrderDetailScreen(orderId: order.id)));
    } else if (table.occupied) {
      showSnack(context, 'Mesa ${table.number} está com outro garçom');
    } else {
      Navigator.push(
          context, MaterialPageRoute(builder: (_) => MenuScreen(table: table)));
    }
  }

  List<TableModel> _visible(AppState app) => app.tables.where((t) {
        switch (_filter) {
          case _Filter.all:
            return true;
          case _Filter.free:
            return !t.occupied;
          case _Filter.mine:
            return app.orderForTable(t.id) != null;
        }
      }).toList();

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final tables = _visible(app);

    return RefreshIndicator(
      color: Palette.ember,
      backgroundColor: Palette.surfaceHi,
      onRefresh: app.refreshAll,
      child: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          SliverToBoxAdapter(child: _Header(app: app)),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 22, 20, 14),
              child: Row(
                children: [
                  _chip('Todas', _Filter.all),
                  _chip('Livres', _Filter.free),
                  _chip('Minhas', _Filter.mine),
                ],
              ),
            ),
          ),
          if (app.error != null && app.tables.isEmpty)
            SliverFillRemaining(
              hasScrollBody: false,
              child: EmptyState(
                icon: Icons.cloud_off_rounded,
                title: 'Sem conexão',
                subtitle: '${app.error}\nPuxe para baixo para tentar de novo.',
              ),
            )
          else if (app.loading && app.tables.isEmpty)
            const SliverFillRemaining(
              hasScrollBody: false,
              child: Center(
                  child: CircularProgressIndicator(color: Palette.ember)),
            )
          else if (tables.isEmpty)
            const SliverFillRemaining(
              hasScrollBody: false,
              child: EmptyState(
                icon: Icons.table_restaurant_rounded,
                title: 'Nenhuma mesa aqui',
                subtitle: 'Troque o filtro para ver as outras mesas.',
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 120),
              sliver: SliverGrid.builder(
                gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                  maxCrossAxisExtent: 180,
                  mainAxisSpacing: 14,
                  crossAxisSpacing: 14,
                  childAspectRatio: 0.92,
                ),
                itemCount: tables.length,
                itemBuilder: (context, i) {
                  final t = tables[i];
                  return TableTile(
                    table: t,
                    order: app.orderForTable(t.id),
                    onTap: () => _open(context, app, i),
                  );
                },
              ),
            ),
        ],
      ),
    );
  }

  Widget _chip(String label, _Filter value) {
    final selected = _filter == value;
    return Padding(
      padding: const EdgeInsets.only(right: 10),
      child: GestureDetector(
        onTap: () => setState(() => _filter = value),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 9),
          decoration: BoxDecoration(
            color: selected ? Palette.text : Palette.surfaceHi,
            borderRadius: BorderRadius.circular(99),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontWeight: FontWeight.w700,
              color: selected ? Palette.bg : Palette.textDim,
            ),
          ),
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  final AppState app;
  const _Header({required this.app});

  @override
  Widget build(BuildContext context) {
    final name = firstName(app.user?.name ?? '');
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(greeting(),
                        style: const TextStyle(
                            color: Palette.textDim, fontSize: 14)),
                    const SizedBox(height: 2),
                    Text(
                      name,
                      style: const TextStyle(
                        fontSize: 30,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.8,
                      ),
                    ),
                  ],
                ),
              ),
              GestureDetector(
                onTap: () => _profile(context),
                child: Container(
                  width: 48,
                  height: 48,
                  alignment: Alignment.center,
                  decoration: const BoxDecoration(
                    gradient: Palette.emberGradient,
                    shape: BoxShape.circle,
                  ),
                  child: Text(
                    name.isEmpty ? '?' : name[0].toUpperCase(),
                    style: const TextStyle(
                        fontWeight: FontWeight.w800, fontSize: 19),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              _stat('${app.freeTables}', 'livres', Palette.mint),
              const SizedBox(width: 10),
              _stat('${app.orders.length}', 'pedidos', Palette.amber),
              const SizedBox(width: 10),
              _stat('${app.readyOrders}', 'prontos', Palette.sky),
            ],
          ),
        ],
      ),
    );
  }

  Widget _stat(String value, String label, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 14),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.10),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color.withValues(alpha: 0.25)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(value,
                style: TextStyle(
                    fontSize: 26, fontWeight: FontWeight.w800, color: color)),
            Text(label,
                style: const TextStyle(color: Palette.textDim, fontSize: 12)),
          ],
        ),
      ),
    );
  }

  void _profile(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(app.user?.name ?? '',
                  style: const TextStyle(
                      fontSize: 20, fontWeight: FontWeight.w800)),
              const SizedBox(height: 4),
              Text(app.user?.email ?? '',
                  style: const TextStyle(color: Palette.textDim)),
              const SizedBox(height: 4),
              Text(app.serverUrl,
                  style:
                      const TextStyle(color: Palette.textDim, fontSize: 12)),
              const SizedBox(height: 22),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Palette.rose,
                    side: const BorderSide(color: Palette.rose),
                    padding: const EdgeInsets.symmetric(vertical: 15),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                  ),
                  onPressed: () {
                    Navigator.pop(ctx);
                    app.logout();
                  },
                  icon: const Icon(Icons.logout_rounded),
                  label: const Text('Sair'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
