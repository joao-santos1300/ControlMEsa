import 'package:flutter/foundation.dart';

import '../models/models.dart';

class CartLine {
  final Product product;
  int quantity;
  String notes;

  CartLine(this.product, {this.quantity = 1, this.notes = ''});
}

class Cart extends ChangeNotifier {
  final Map<String, CartLine> _lines = {};
  String notes = '';
  String customerName = '';

  List<CartLine> get lines => _lines.values.toList();
  int get count => _lines.values.fold(0, (s, l) => s + l.quantity);
  double get total =>
      _lines.values.fold(0, (s, l) => s + l.product.price * l.quantity);
  bool get isEmpty => _lines.isEmpty;

  int quantityOf(String productId) => _lines[productId]?.quantity ?? 0;

  void add(Product p) {
    final line = _lines[p.id];
    if (line == null) {
      _lines[p.id] = CartLine(p);
    } else {
      line.quantity++;
    }
    notifyListeners();
  }

  void remove(String productId) {
    final line = _lines[productId];
    if (line == null) return;
    if (line.quantity <= 1) {
      _lines.remove(productId);
    } else {
      line.quantity--;
    }
    notifyListeners();
  }

  void setNotes(String productId, String value) {
    _lines[productId]?.notes = value;
  }

  List<Map<String, dynamic>> toPayload() => _lines.values
      .map((l) => {
            'productId': l.product.id,
            'quantity': l.quantity,
            if (l.notes.trim().isNotEmpty) 'notes': l.notes.trim(),
          })
      .toList();
}
