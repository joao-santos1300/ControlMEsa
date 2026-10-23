import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/format.dart';
import '../core/theme.dart';
import '../models/models.dart';
import '../state/app_state.dart';
import '../state/cart.dart';
import '../widgets/common.dart';
import 'cart_sheet.dart';

class MenuScreen extends StatefulWidget {
  final TableModel table;
  const MenuScreen({super.key, required this.table});

  @override
  State<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen> {
  final _cart = Cart();
  final _search = TextEditingController();
  String? _categoryId;
  String _query = '';
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final app = context.read<AppState>();
    await guard(context, () => app.loadMenu());
    if (mounted) setState(() => _loading = false);
  }

  @override
  void dispose() {
    _cart.dispose();
    _search.dispose();
    super.dispose();
  }

  Future<void> _review() async {
    final sent = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (_) => CartSheet(cart: _cart, table: widget.table),
    );
    if (sent == true && mounted) Navigator.pop(context, true);
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final q = _query.trim().toLowerCase();
    final products = app.products.where((p) {
      if (_categoryId != null && p.categoryId != _categoryId) return false;
      return q.isEmpty || p.name.toLowerCase().contains(q);
    }).toList();

    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 10, 20, 0),
                child: Row(
                  children: [
                    RoundIconButton(
                      icon: Icons.arrow_back_rounded,
                      onTap: () => Navigator.pop(context),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Mesa ${widget.table.number}',
                              style: const TextStyle(
                                  fontSize: 22, fontWeight: FontWeight.w800)),
                          const Text('Escolha os itens do pedido',
                              style: TextStyle(
                                  color: Palette.textDim, fontSize: 13)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 18, 20, 12),
                child: TextField(
                  controller: _search,
                  onChanged: (v) => setState(() => _query = v),
                  decoration: InputDecoration(
                    hintText: 'Buscar no cardápio',
                    prefixIcon: const Icon(Icons.search_rounded,
                        color: Palette.textDim),
                    suffixIcon: _query.isEmpty
                        ? null
                        : IconButton(
                            icon: const Icon(Icons.close_rounded,
                                color: Palette.textDim),
                            onPressed: () {
                              _search.clear();
                              setState(() => _query = '');
                            },
                          ),
                  ),
                ),
              ),
              SizedBox(
                height: 42,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  children: [
                    _categoryChip('Tudo', null),
                    for (final c in app.categories) _categoryChip(c.name, c.id),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              Expanded(
                child: _loading
                    ? const Center(
                        child: CircularProgressIndicator(color: Palette.ember))
                    : products.isEmpty
                        ? const EmptyState(
                            icon: Icons.search_off_rounded,
                            title: 'Nada encontrado',
                            subtitle: 'Tente outro nome ou categoria.',
                          )
                        : ListenableBuilder(
                            listenable: _cart,
                            builder: (context, _) => ListView.separated(
                              padding:
                                  const EdgeInsets.fromLTRB(20, 8, 20, 130),
                              itemCount: products.length,
                              separatorBuilder: (_, _) =>
                                  const SizedBox(height: 12),
                              itemBuilder: (context, i) =>
                                  _ProductCard(product: products[i], cart: _cart),
                            ),
                          ),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: ListenableBuilder(
        listenable: _cart,
        builder: (context, _) => AnimatedSlide(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOutBack,
          offset: _cart.isEmpty ? const Offset(0, 1.5) : Offset.zero,
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 14),
              child: GestureDetector(
                onTap: _cart.isEmpty ? null : _review,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 20, vertical: 16),
                  decoration: BoxDecoration(
                    gradient: Palette.emberGradient,
                    borderRadius: BorderRadius.circular(22),
                    boxShadow: [
                      BoxShadow(
                        color: Palette.ember.withValues(alpha: 0.4),
                        blurRadius: 24,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 11, vertical: 5),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.22),
                          borderRadius: BorderRadius.circular(99),
                        ),
                        child: Text('${_cart.count}',
                            style:
                                const TextStyle(fontWeight: FontWeight.w800)),
                      ),
                      const SizedBox(width: 14),
                      const Expanded(
                        child: Text('Revisar pedido',
                            style: TextStyle(
                                fontWeight: FontWeight.w700, fontSize: 16)),
                      ),
                      Text(brl(_cart.total),
                          style: const TextStyle(
                              fontWeight: FontWeight.w800, fontSize: 16)),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _categoryChip(String label, String? id) {
    final selected = _categoryId == id;
    return Padding(
      padding: const EdgeInsets.only(right: 10),
      child: GestureDetector(
        onTap: () => setState(() => _categoryId = id),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          alignment: Alignment.center,
          padding: const EdgeInsets.symmetric(horizontal: 18),
          decoration: BoxDecoration(
            gradient: selected ? Palette.emberGradient : null,
            color: selected ? null : Palette.surfaceHi,
            borderRadius: BorderRadius.circular(99),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontWeight: FontWeight.w700,
              color: selected ? Colors.white : Palette.textDim,
            ),
          ),
        ),
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  final Product product;
  final Cart cart;
  const _ProductCard({required this.product, required this.cart});

  @override
  Widget build(BuildContext context) {
    final qty = cart.quantityOf(product.id);
    return Panel(
      borderColor: qty > 0 ? Palette.ember.withValues(alpha: 0.6) : null,
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(product.name,
                    style: const TextStyle(
                        fontSize: 16, fontWeight: FontWeight.w700)),
                if (product.description.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(product.description,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                          color: Palette.textDim, fontSize: 13, height: 1.3)),
                ],
                const SizedBox(height: 10),
                Text(brl(product.price),
                    style: const TextStyle(
                        color: Palette.amber,
                        fontWeight: FontWeight.w800,
                        fontSize: 15)),
              ],
            ),
          ),
          const SizedBox(width: 12),
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 200),
            child: qty == 0
                ? RoundIconButton(
                    key: const ValueKey('add'),
                    icon: Icons.add_rounded,
                    size: 44,
                    color: Palette.ember,
                    onTap: () => cart.add(product),
                  )
                : Stepper2(
                    key: const ValueKey('step'),
                    quantity: qty,
                    onMinus: () => cart.remove(product.id),
                    onPlus: () => cart.add(product),
                  ),
          ),
        ],
      ),
    );
  }
}

class Stepper2 extends StatelessWidget {
  final int quantity;
  final VoidCallback onMinus;
  final VoidCallback onPlus;

  const Stepper2({
    super.key,
    required this.quantity,
    required this.onMinus,
    required this.onPlus,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Palette.surfaceHi,
        borderRadius: BorderRadius.circular(99),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          RoundIconButton(
              icon: Icons.remove_rounded, size: 34, onTap: onMinus,
              color: Palette.bg),
          SizedBox(
            width: 30,
            child: Text('$quantity',
                textAlign: TextAlign.center,
                style:
                    const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
          ),
          RoundIconButton(
              icon: Icons.add_rounded,
              size: 34,
              onTap: onPlus,
              color: Palette.ember),
        ],
      ),
    );
  }
}
