import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/format.dart';
import '../core/theme.dart';
import '../models/models.dart';
import '../state/app_state.dart';
import '../widgets/common.dart';
import 'order_detail_screen.dart';

class OrdersScreen extends StatelessWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    // Pedidos prontos primeiro: são os que precisam de ação imediata
    final orders = [...app.orders]..sort((a, b) {
        if (a.isReady != b.isReady) return a.isReady ? -1 : 1;
        return a.createdAt.compareTo(b.createdAt);
      });

    return RefreshIndicator(
      color: Palette.ember,
      backgroundColor: Palette.surfaceHi,
      onRefresh: app.refreshAll,
      child: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          const SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.fromLTRB(20, 22, 20, 18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Meus pedidos',
                      style: TextStyle(
                          fontSize: 30,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.8)),
                  SizedBox(height: 2),
                  Text('Acompanhe a cozinha em tempo real',
                      style: TextStyle(color: Palette.textDim)),
                ],
              ),
            ),
          ),
          if (orders.isEmpty)
            const SliverFillRemaining(
              hasScrollBody: false,
              child: EmptyState(
                icon: Icons.receipt_long_rounded,
                title: 'Nenhum pedido ativo',
                subtitle: 'Abra uma mesa livre para começar um novo pedido.',
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 120),
              sliver: SliverList.separated(
                itemCount: orders.length,
                separatorBuilder: (_, _) => const SizedBox(height: 12),
                itemBuilder: (context, i) => _OrderCard(order: orders[i]),
              ),
            ),
        ],
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  final OrderModel order;
  const _OrderCard({required this.order});

  @override
  Widget build(BuildContext context) {
    final total = order.activeItems.length;
    final progress = total == 0 ? 0.0 : order.readyCount / total;
    final ready = order.isReady;
    final color = ready ? Palette.mint : Palette.amber;

    return Panel(
      borderColor: ready ? Palette.mint.withValues(alpha: 0.6) : null,
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(
            builder: (_) => OrderDetailScreen(orderId: order.id)),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 62,
            height: 62,
            child: Stack(
              alignment: Alignment.center,
              children: [
                SizedBox.expand(
                  child: CircularProgressIndicator(
                    value: progress,
                    strokeWidth: 5,
                    strokeCap: StrokeCap.round,
                    backgroundColor: Palette.surfaceHi,
                    color: color,
                  ),
                ),
                Text('${order.tableNumber}',
                    style: const TextStyle(
                        fontSize: 20, fontWeight: FontWeight.w800)),
              ],
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text('Mesa ${order.tableNumber}',
                        style: const TextStyle(
                            fontWeight: FontWeight.w700, fontSize: 16)),
                    const SizedBox(width: 8),
                    StatusPill(
                      ready ? 'Pronto' : 'Em preparo',
                      color,
                      icon: ready
                          ? Icons.notifications_active_rounded
                          : Icons.local_fire_department_rounded,
                    ),
                  ],
                ),
                if (order.customerName != null) ...[
                  const SizedBox(height: 4),
                  Text(order.customerName!,
                      style: const TextStyle(
                          color: Palette.amber,
                          fontWeight: FontWeight.w600,
                          fontSize: 14)),
                ],
                const SizedBox(height: 6),
                Text(
                  '${order.readyCount}/$total itens prontos · ${ago(order.createdAt)}',
                  style: const TextStyle(color: Palette.textDim, fontSize: 13),
                ),
              ],
            ),
          ),
          Text(brl(order.total),
              style: const TextStyle(
                  fontWeight: FontWeight.w800, color: Palette.amber)),
        ],
      ),
    );
  }
}
