double _num(dynamic v) => v is num ? v.toDouble() : double.parse(v.toString());

class AppUser {
  final String id;
  final String name;
  final String email;
  final String role;

  const AppUser({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
  });

  factory AppUser.fromJson(Map<String, dynamic> j) => AppUser(
        id: j['id'] as String,
        name: j['name'] as String,
        email: j['email'] as String,
        role: j['role'] as String,
      );

  Map<String, dynamic> toJson() =>
      {'id': id, 'name': name, 'email': email, 'role': role};
}

class TableModel {
  final String id;
  final int number;
  final String? name;
  final bool occupied;

  const TableModel({
    required this.id,
    required this.number,
    required this.name,
    required this.occupied,
  });

  factory TableModel.fromJson(Map<String, dynamic> j) => TableModel(
        id: j['id'] as String,
        number: j['number'] as int,
        name: j['name'] as String?,
        occupied: j['status'] == 'OCCUPIED',
      );
}

class CategoryModel {
  final String id;
  final String name;

  const CategoryModel({required this.id, required this.name});

  factory CategoryModel.fromJson(Map<String, dynamic> j) =>
      CategoryModel(id: j['id'] as String, name: j['name'] as String);
}

class Product {
  final String id;
  final String name;
  final String description;
  final double price;
  final String categoryId;

  const Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.categoryId,
  });

  factory Product.fromJson(Map<String, dynamic> j) => Product(
        id: j['id'] as String,
        name: j['name'] as String,
        description: (j['description'] as String?) ?? '',
        price: _num(j['price']),
        categoryId: j['categoryId'] as String,
      );
}

class OrderItem {
  final String id;
  final int quantity;
  final double unitPrice;
  final String? notes;
  final String status; // PENDING | PREPARING | READY | CANCELED
  final bool changed;
  final String productName;

  const OrderItem({
    required this.id,
    required this.quantity,
    required this.unitPrice,
    required this.notes,
    required this.status,
    required this.changed,
    required this.productName,
  });

  bool get canceled => status == 'CANCELED';
  bool get editable => status == 'PENDING' || status == 'PREPARING';
  double get subtotal => unitPrice * quantity;

  factory OrderItem.fromJson(Map<String, dynamic> j) => OrderItem(
        id: j['id'] as String,
        quantity: j['quantity'] as int,
        unitPrice: _num(j['unitPrice']),
        notes: j['notes'] as String?,
        status: j['status'] as String,
        changed: (j['changed'] as bool?) ?? false,
        productName: (j['product'] as Map<String, dynamic>)['name'] as String,
      );
}

class OrderModel {
  final String id;
  final String status; // OPEN | PREPARING | READY | CLOSED | CANCELED
  final String? notes;
  final String? customerName;
  final String tableId;
  final int tableNumber;
  final String? tableName;
  final List<OrderItem> items;
  final DateTime createdAt;

  const OrderModel({
    required this.id,
    required this.status,
    required this.notes,
    required this.customerName,
    required this.tableId,
    required this.tableNumber,
    required this.tableName,
    required this.items,
    required this.createdAt,
  });

  List<OrderItem> get activeItems => items.where((i) => !i.canceled).toList();
  int get readyCount => activeItems.where((i) => i.status == 'READY').length;
  bool get isReady => status == 'READY';
  bool get hasPending => activeItems.any((i) => i.editable);
  double get total => activeItems.fold(0, (s, i) => s + i.subtotal);

  factory OrderModel.fromJson(Map<String, dynamic> j) {
    final table = j['table'] as Map<String, dynamic>;
    return OrderModel(
      id: j['id'] as String,
      status: j['status'] as String,
      notes: j['notes'] as String?,
      customerName: j['customerName'] as String?,
      tableId: table['id'] as String,
      tableNumber: table['number'] as int,
      tableName: table['name'] as String?,
      items: (j['items'] as List)
          .map((e) => OrderItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      createdAt: DateTime.parse(j['created_at'] as String).toLocal(),
    );
  }
}
