import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/format.dart';
import '../core/theme.dart';
import '../models/models.dart';
import '../state/app_state.dart';
import '../widgets/common.dart';
import 'menu_screen.dart';

class OrderDetailScreen extends StatelessWidget {
  final String orderId;
  const OrderDetailScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final order = app.orderById(orderId);

    // Pedido saiu da lista ativa (fechado/cancelado): volta para o salão
    if (order == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (context.mounted && Navigator.canPop(context)) Navigator.pop(context);
      });
      return const Scaffold(body: SizedBox.shrink());
    }

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: Column(
            children: [
              _header(context, app, order),
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
                  children: [
                    if (order.notes != null && order.notes!.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 14),
                        child: Panel(
                          color: Palette.surfaceHi,
                          child: Row(
                            children: [
                              const Icon(Icons.sticky_note_2_outlined,
                                  color: Palette.amber, size: 20),
                              const SizedBox(width: 12),
                              Expanded(child: Text(order.notes!)),
                            ],
                          ),
                        ),
                      ),
                    for (final item in order.items)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _ItemCard(order: order, item: item),
                      ),
                  ],
                ),
              ),
              _footer(context, app, order),
            ],
          ),
        ),
      ),
    );
  }

  Widget _header(BuildContext context, AppState app, OrderModel order) {
    final total = order.activeItems.length;
    final ready = order.isReady;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
      child: Column(
        children: [
          Row(
            children: [
              RoundIconButton(
                icon: Icons.arrow_back_rounded,
                onTap: () => Navigator.pop(context),
              ),
              const Spacer(),
              PopupMenuButton<String>(
                color: Palette.surfaceHi,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16)),
                onSelected: (v) async {
                  if (v == 'customer') {
                    await _editCustomer(context, app, order);
                    return;
                  }
                  if (v != 'cancel') return;
                  final ok = await confirm(
                    context,
                    title: 'Cancelar pedido?',
                    message:
                        'Todos os itens da mesa ${order.tableNumber} serão cancelados e a mesa liberada.',
                    action: 'Cancelar pedido',
                    danger: true,
                  );
                  if (!ok || !context.mounted) return;
                  final done =
                      await attempt(context, () => app.cancelOrder(order.id));
                  if (done) {
                    app.announce('Pedido da mesa ${order.tableNumber} cancelado');
                  }
                },
                itemBuilder: (_) => const [
                  PopupMenuItem(
                    value: 'customer',
                    child: Text('Nome do cliente'),
                  ),
                  PopupMenuItem(
                    value: 'cancel',
                    child: Text('Cancelar pedido',
                        style: TextStyle(color: Palette.rose)),
                  ),
                ],
                child: const SizedBox(
                  width: 40,
                  height: 40,
                  child: Icon(Icons.more_horiz_rounded),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Panel(
            padding: const EdgeInsets.all(20),
            borderColor: ready ? Palette.mint.withValues(alpha: 0.6) : null,
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Mesa ${order.tableNumber}',
                          style: const TextStyle(
                              fontSize: 28, fontWeight: FontWeight.w800)),
                      if (order.customerName != null) ...[
                        const SizedBox(height: 2),
                        Text(order.customerName!,
                            style: const TextStyle(
                                color: Palette.amber,
                                fontWeight: FontWeight.w600,
                                fontSize: 16)),
                      ],
                      const SizedBox(height: 8),
                      StatusPill(
                        ready ? 'Tudo pronto — pode servir' : 'Em preparo',
                        ready ? Palette.mint : Palette.amber,
                        icon: ready
                            ? Icons.notifications_active_rounded
                            : Icons.local_fire_department_rounded,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Aberto ${ago(order.createdAt)} · ${order.readyCount}/$total prontos',
                        style: const TextStyle(
                            color: Palette.textDim, fontSize: 13),
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text('Total',
                        style:
                            TextStyle(color: Palette.textDim, fontSize: 12)),
                    Text(brl(order.total),
                        style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                            color: Palette.amber)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _editCustomer(
      BuildContext context, AppState app, OrderModel order) async {
    final name = await showDialog<String>(
      context: context,
      builder: (_) => _CustomerDialog(initial: order.customerName ?? ''),
    );
    if (name == null || !context.mounted) return;
    await attempt(context, () => app.setCustomer(order.id, name));
  }

  Widget _footer(BuildContext context, AppState app, OrderModel order) {
    final table = app.tables.where((t) => t.id == order.tableId).firstOrNull;
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 4, 20, 16),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: Palette.text,
                side: const BorderSide(color: Palette.line),
                padding: const EdgeInsets.symmetric(vertical: 17),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(18)),
              ),
              onPressed: table == null
                  ? null
                  : () => Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => MenuScreen(table: table)),
                      ),
              icon: const Icon(Icons.add_rounded),
              label: const Text('Adicionar'),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            flex: 2,
            child: GradientButton(
              label: 'Fechar conta',
              icon: Icons.payments_rounded,
              gradient: const LinearGradient(
                  colors: [Color(0xFF3DDBA4), Color(0xFF1FB38A)]),
              onPressed: () async {
                final ok = await confirm(
                  context,
                  title: 'Fechar conta?',
                  message:
                      'Mesa ${order.tableNumber} · total ${brl(order.total)}. A mesa será liberada.',
                  action: 'Fechar conta',
                );
                if (!ok || !context.mounted) return;
                final done =
                    await attempt(context, () => app.closeOrder(order.id));
                if (done) {
                  app.announce(
                      'Mesa ${order.tableNumber} fechada · ${brl(order.total)}',
                      good: true);
                }
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _ItemCard extends StatelessWidget {
  final OrderModel order;
  final OrderItem item;
  const _ItemCard({required this.order, required this.item});

  (String, Color, IconData) get _status => switch (item.status) {
        'PENDING' => ('Na fila', Palette.textDim, Icons.schedule_rounded),
        'PREPARING' =>
          ('Preparando', Palette.sky, Icons.local_fire_department_rounded),
        'READY' => ('Pronto', Palette.mint, Icons.check_circle_rounded),
        _ => ('Cancelado', Palette.rose, Icons.block_rounded),
      };

  @override
  Widget build(BuildContext context) {
    final app = context.read<AppState>();
    final (label, color, icon) = _status;

    return Opacity(
      opacity: item.canceled ? 0.5 : 1,
      child: Panel(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: Palette.surfaceHi,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text('${item.quantity}×',
                      style: const TextStyle(fontWeight: FontWeight.w800)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    item.productName,
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                      decoration:
                          item.canceled ? TextDecoration.lineThrough : null,
                    ),
                  ),
                ),
                Text(brl(item.subtotal),
                    style: const TextStyle(color: Palette.textDim)),
              ],
            ),
            if (item.notes != null && item.notes!.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text('“${item.notes}”',
                  style: const TextStyle(
                      color: Palette.textDim, fontStyle: FontStyle.italic)),
            ],
            const SizedBox(height: 12),
            Row(
              children: [
                StatusPill(label, color, icon: icon),
                if (item.changed && !item.canceled) ...[
                  const SizedBox(width: 8),
                  const StatusPill('Alterado', Palette.amber),
                ],
                const Spacer(),
                if (item.editable) ...[
                  RoundIconButton(
                    icon: Icons.edit_rounded,
                    size: 36,
                    onTap: () => _edit(context, app),
                  ),
                  const SizedBox(width: 8),
                  RoundIconButton(
                    icon: Icons.delete_outline_rounded,
                    size: 36,
                    color: Palette.rose.withValues(alpha: 0.25),
                    onTap: () => _remove(context, app),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _remove(BuildContext context, AppState app) async {
    final ok = await confirm(
      context,
      title: 'Retirar item?',
      message: '${item.quantity}× ${item.productName} será cancelado.',
      action: 'Retirar',
      danger: true,
    );
    if (!ok || !context.mounted) return;
    await guard(context, () => app.removeItem(order.id, item.id));
  }

  Future<void> _edit(BuildContext context, AppState app) async {
    var qty = item.quantity;
    final notes = TextEditingController(text: item.notes ?? '');

    final saved = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheet) => Padding(
          padding: EdgeInsets.fromLTRB(
              24, 24, 24, 24 + MediaQuery.viewInsetsOf(ctx).bottom),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(item.productName,
                  style: const TextStyle(
                      fontSize: 20, fontWeight: FontWeight.w800)),
              const SizedBox(height: 18),
              Row(
                children: [
                  const Text('Quantidade',
                      style: TextStyle(color: Palette.textDim)),
                  const Spacer(),
                  Stepper2(
                    quantity: qty,
                    onMinus: () => setSheet(() => qty = qty > 1 ? qty - 1 : 1),
                    onPlus: () => setSheet(() => qty++),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              TextField(
                controller: notes,
                textCapitalization: TextCapitalization.sentences,
                decoration:
                    const InputDecoration(hintText: 'Observação do item'),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: GradientButton(
                  label: 'Salvar alteração',
                  icon: Icons.check_rounded,
                  onPressed: () => Navigator.pop(ctx, true),
                ),
              ),
            ],
          ),
        ),
      ),
    );

    final newNotes = notes.text;
    notes.dispose();
    if (saved != true || !context.mounted) return;
    await guard(
      context,
      () => app.updateItem(order.id, item.id, quantity: qty, notes: newNotes),
    );
  }
}

class _CustomerDialog extends StatefulWidget {
  final String initial;
  const _CustomerDialog({required this.initial});

  @override
  State<_CustomerDialog> createState() => _CustomerDialogState();
}

class _CustomerDialogState extends State<_CustomerDialog> {
  late final TextEditingController _ctrl =
      TextEditingController(text: widget.initial);

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Nome do cliente',
          style: TextStyle(fontWeight: FontWeight.w700)),
      content: TextField(
        controller: _ctrl,
        autofocus: true,
        textCapitalization: TextCapitalization.words,
        decoration: const InputDecoration(hintText: 'Ex.: João'),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancelar'),
        ),
        TextButton(
          onPressed: () => Navigator.pop(context, _ctrl.text),
          child: const Text('Salvar'),
        ),
      ],
    );
  }
}
