import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/models.dart';
import '../services/api.dart';
import '../services/discovery.dart';
import '../services/socket_service.dart';

class AppEvent {
  final String message;
  final bool good;
  const AppEvent(this.message, {this.good = false});
}

class AppState extends ChangeNotifier {
  AppState() {
    api.onUnauthorized = _handleUnauthorized;
  }

  final api = ApiClient();
  final _socket = SocketService();
  final _events = StreamController<AppEvent>.broadcast();
  late SharedPreferences _prefs;

  bool booting = true;
  AppUser? user;
  String serverUrl = _defaultServer();

  List<TableModel> tables = [];
  List<CategoryModel> categories = [];
  List<Product> products = [];
  List<OrderModel> orders = [];

  bool loading = false;
  String? error;

  /// True enquanto procura o servidor na rede.
  bool discovering = false;

  Stream<AppEvent> get events => _events.stream;
  bool get loggedIn => user != null;
  int get readyOrders => orders.where((o) => o.isReady).length;
  int get freeTables => tables.where((t) => !t.occupied).length;

  static String _defaultServer() =>
      !kIsWeb && Platform.isAndroid ? 'http://10.0.2.2:3333' : 'http://localhost:3333';

  OrderModel? orderForTable(String tableId) {
    for (final o in orders) {
      if (o.tableId == tableId) return o;
    }
    return null;
  }

  OrderModel? orderById(String id) {
    for (final o in orders) {
      if (o.id == id) return o;
    }
    return null;
  }

  /// Mensagem global exibida pelo HomeShell, mesmo após fechar a tela de origem.
  void announce(String message, {bool good = false}) =>
      _events.add(AppEvent(message, good: good));

  // ---------- sessão ----------

  Future<void> boot() async {
    _prefs = await SharedPreferences.getInstance();
    serverUrl = _prefs.getString('server_url') ?? serverUrl;
    api.baseUrl = serverUrl;
    // Servidor salvo fora do ar (IP mudou?) -> procura de novo na rede
    if (await probeServer(serverUrl) == null) await findServer();

    final token = _prefs.getString('token');
    final rawUser = _prefs.getString('user');
    if (token != null && rawUser != null) {
      try {
        user = AppUser.fromJson(jsonDecode(rawUser) as Map<String, dynamic>);
        api.token = token;
        _connectSocket();
        unawaited(refreshAll());
      } catch (_) {
        await _clearSession();
      }
    }
    booting = false;
    notifyListeners();
  }

  Future<void> setServer(String url) async {
    serverUrl = url.trim();
    api.baseUrl = serverUrl;
    await _prefs.setString('server_url', serverUrl);
    notifyListeners();
  }

  /// Procura o backend na rede local e passa a usá-lo. Devolve se achou.
  Future<bool> findServer() async {
    if (discovering) return false;
    discovering = true;
    notifyListeners();
    try {
      final found = await discoverServer();
      if (found == null) return false;
      await setServer(found.url);
      return true;
    } finally {
      discovering = false;
      notifyListeners();
    }
  }

  Future<void> login(String email, String password,
      {bool retry = true}) async {
    final (AppUser, String) result;
    try {
      result = await api.login(email.trim(), password);
    } on ApiException catch (e) {
      // Sem resposta do servidor: tenta achá-lo na rede e repete uma vez
      if (!retry || e.status != null || !await findServer()) rethrow;
      return login(email, password, retry: false);
    }
    final (u, token) = result;
    if (u.role != 'WAITER' && u.role != 'ADMIN') {
      throw const ApiException('Este acesso não é de garçom');
    }
    user = u;
    api.token = token;
    await _prefs.setString('token', token);
    await _prefs.setString('user', jsonEncode(u.toJson()));
    _connectSocket();
    notifyListeners();
    unawaited(refreshAll());
  }

  Future<void> logout() async {
    _socket.disconnect();
    await _clearSession();
    notifyListeners();
  }

  Future<void> _clearSession() async {
    user = null;
    api.token = null;
    tables = [];
    orders = [];
    products = [];
    categories = [];
    await _prefs.remove('token');
    await _prefs.remove('user');
  }

  void _handleUnauthorized() {
    if (!loggedIn) return;
    _events.add(const AppEvent('Sessão expirada. Entre novamente.'));
    logout();
  }

  // ---------- dados ----------

  Future<void> refreshAll() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      final results = await Future.wait([api.tables(), api.myOrders()]);
      tables = results[0] as List<TableModel>;
      orders = results[1] as List<OrderModel>;
    } on ApiException catch (e) {
      error = e.message;
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  Future<void> loadMenu({bool force = false}) async {
    if (!force && products.isNotEmpty) return;
    final results = await Future.wait([api.categories(), api.products()]);
    categories = results[0] as List<CategoryModel>;
    products = results[1] as List<Product>;
    notifyListeners();
  }

  // ---------- ações ----------

  Future<OrderModel> sendOrder({
    required String tableId,
    required List<Map<String, dynamic>> items,
    String? notes,
    String? customerName,
  }) async {
    final order = await api.createOrder(
        tableId: tableId,
        items: items,
        notes: notes,
        customerName: customerName);
    await refreshAll();
    return order;
  }

  Future<void> updateItem(String orderId, String itemId,
      {int? quantity, String? notes}) async {
    await api.updateItem(orderId, itemId, quantity: quantity, notes: notes);
    await refreshAll();
  }

  Future<void> setCustomer(String orderId, String customerName) async {
    await api.setCustomer(orderId, customerName);
    await refreshAll();
  }

  Future<void> removeItem(String orderId, String itemId) async {
    await api.removeItem(orderId, itemId);
    await refreshAll();
  }

  Future<void> closeOrder(String orderId) async {
    await api.closeOrder(orderId);
    await refreshAll();
  }

  Future<void> cancelOrder(String orderId) async {
    await api.cancelOrder(orderId);
    await refreshAll();
  }

  // ---------- tempo real ----------

  void _connectSocket() {
    final token = api.token;
    if (token == null) return;
    _socket.connect(
      url: serverUrl,
      token: token,
      onItemStatus: (d) {
        final table = (d['table'] as Map?)?['number'];
        // Pedido completo é avisado por `order:ready`
        if (d['orderStatus'] != 'READY') {
          final preparing = d['status'] == 'PREPARING';
          _events.add(AppEvent(
            preparing
                ? 'Mesa $table · a cozinha começou a preparar'
                : 'Mesa $table · item pronto!',
            good: !preparing,
          ));
        }
        unawaited(refreshAll());
      },
      onOrderReady: (d) {
        final table = (d['table'] as Map?)?['number'];
        _events.add(AppEvent('Mesa $table · pedido completo, pode servir!',
            good: true));
        unawaited(refreshAll());
      },
      onReconnect: () => unawaited(refreshAll()),
    );
  }

  @override
  void dispose() {
    _socket.disconnect();
    _events.close();
    super.dispose();
  }
}
