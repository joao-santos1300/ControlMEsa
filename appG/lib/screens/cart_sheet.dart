import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/format.dart';
import '../core/theme.dart';
import '../models/models.dart';
import '../state/app_state.dart';
import '../state/cart.dart';
import '../widgets/common.dart';
import 'menu_screen.dart' show Stepper2;

class CartSheet extends StatefulWidget {
  final Cart cart;
  final TableModel table;
  const CartSheet({super.key, required this.cart, required this.table});

  @override
  State<CartSheet> createState() => _CartSheetState();
}

class _CartSheetState extends State<CartSheet> {
  bool _busy = false;

  Future<void> _send() async {
    final app = context.read<AppState>();
    final cart = widget.cart;
    setState(() => _busy = true);
    final order = await guard(
      context,
      () => app.sendOrder(
        tableId: widget.table.id,
        items: cart.toPayload(),
        notes: cart.notes,
        customerName: cart.customerName,
      ),
    );
    if (!mounted) return;
    setState(() => _busy = false);
    if (order != null) {
      app.announce('Pedido da mesa ${widget.table.number} enviado à cozinha',
          good: true);
      Navigator.pop(context, true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = widget.cart;
    final bottom = MediaQuery.viewInsetsOf(context).bottom;

    return ListenableBuilder(
      listenable: cart,
      builder: (context, _) {
        if (cart.isEmpty) {
          // Esvaziou o carrinho dentro da folha: fecha sem enviar.
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted && Navigator.canPop(context)) Navigator.pop(context);
          });
        }
        return Padding(
          padding: EdgeInsets.only(bottom: bottom),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                margin: const EdgeInsets.only(top: 10),
                width: 42,
                height: 4,
                decoration: BoxDecoration(
                  color: Palette.line,
                  borderRadius: BorderRadius.circular(99),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 18, 24, 8),
                child: Row(
                  children: [
                    Expanded(
                      child: Text('Pedido · Mesa ${widget.table.number}',
                          style: const TextStyle(
                              fontSize: 20, fontWeight: FontWeight.w800)),
                    ),
                    Text(brl(cart.total),
                        style: const TextStyle(
                            color: Palette.amber,
                            fontSize: 18,
                            fontWeight: FontWeight.w800)),
                  ],
                ),
              ),
              Flexible(
                child: ListView(
                  shrinkWrap: true,
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 8),
                  children: [
                    for (final line in cart.lines) _line(line),
                    const SizedBox(height: 6),
                    TextField(
                      onChanged: (v) => cart.customerName = v,
                      controller:
                          TextEditingController(text: cart.customerName),
                      textCapitalization: TextCapitalization.words,
                      decoration: const InputDecoration(
                        hintText: 'Nome do cliente (opcional)',
                        prefixIcon: Icon(Icons.person_outline_rounded,
                            color: Palette.textDim),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      onChanged: (v) => cart.notes = v,
                      controller: TextEditingController(text: cart.notes),
                      minLines: 1,
                      maxLines: 3,
                      textCapitalization: TextCapitalization.sentences,
                      decoration: const InputDecoration(
                        hintText: 'Observação geral do pedido (opcional)',
                        prefixIcon: Icon(Icons.sticky_note_2_outlined,
                            color: Palette.textDim),
                      ),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
                child: SizedBox(
                  width: double.infinity,
                  child: GradientButton(
                    label: 'Enviar para a cozinha',
                    icon: Icons.local_fire_department_rounded,
                    busy: _busy,
                    onPressed: cart.isEmpty ? null : _send,
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _line(CartLine line) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Palette.surfaceHi,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(line.product.name,
                          style: const TextStyle(
                              fontWeight: FontWeight.w700, fontSize: 15)),
                      const SizedBox(height: 2),
                      Text(brl(line.product.price * line.quantity),
                          style: const TextStyle(
                              color: Palette.textDim, fontSize: 13)),
                    ],
                  ),
                ),
                Stepper2(
                  quantity: line.quantity,
                  onMinus: () => widget.cart.remove(line.product.id),
                  onPlus: () => widget.cart.add(line.product),
                ),
              ],
            ),
            const SizedBox(height: 10),
            TextField(
              controller: TextEditingController(text: line.notes),
              onChanged: (v) => widget.cart.setNotes(line.product.id, v),
              style: const TextStyle(fontSize: 14),
              decoration: InputDecoration(
                isDense: true,
                filled: true,
                fillColor: Palette.bg,
                hintText: 'Ex.: sem cebola, ponto médio…',
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
