import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import '../models/models.dart';

class ApiException implements Exception {
  final String message;
  final int? status;

  const ApiException(this.message, [this.status]);

  @override
  String toString() => message;
}

class ApiClient {
  String baseUrl = '';
  String? token;

  /// Chamado quando o servidor responde 401 (token expirado/ inválido).
  void Function()? onUnauthorized;

  Future<dynamic> _send(
    String method,
    String path, {
    Map<String, dynamic>? body,
    Map<String, String>? query,
  }) async {
    final base = baseUrl.endsWith('/')
        ? baseUrl.substring(0, baseUrl.length - 1)
        : baseUrl;
    var uri = Uri.parse('$base$path');
    if (query != null) uri = uri.replace(queryParameters: query);

    final headers = <String, String>{
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };

    try {
      final req = http.Request(method, uri)..headers.addAll(headers);
      if (body != null) req.body = jsonEncode(body);
      final streamed = await req.send().timeout(const Duration(seconds: 15));
      final res = await http.Response.fromStream(streamed);

      final decoded = res.body.isEmpty ? null : jsonDecode(res.body);
      if (res.statusCode >= 200 && res.statusCode < 300) return decoded;

      final message = decoded is Map && decoded['error'] is String
          ? decoded['error'] as String
          : 'Erro inesperado (${res.statusCode})';
      if (res.statusCode == 401 && token != null) onUnauthorized?.call();
      throw ApiException(message, res.statusCode);
    } on ApiException {
      rethrow;
    } on TimeoutException {
      throw const ApiException('O servidor demorou demais para responder');
    } on SocketException {
      throw const ApiException('Não foi possível conectar ao servidor');
    } on FormatException {
      throw const ApiException('Resposta inválida do servidor');
    } on http.ClientException {
      throw const ApiException('Não foi possível conectar ao servidor');
    }
  }

  List<T> _list<T>(dynamic data, T Function(Map<String, dynamic>) map) =>
      (data as List).map((e) => map(e as Map<String, dynamic>)).toList();

  Future<(AppUser, String)> login(String email, String password) async {
    final data = await _send('POST', '/session',
        body: {'email': email, 'password': password}) as Map<String, dynamic>;
    return (AppUser.fromJson(data), data['token'] as String);
  }

  Future<List<TableModel>> tables() async =>
      _list(await _send('GET', '/tables'), TableModel.fromJson);

  Future<List<CategoryModel>> categories() async =>
      _list(await _send('GET', '/categories'), CategoryModel.fromJson);

  Future<List<Product>> products() async =>
      _list(await _send('GET', '/products'), Product.fromJson);

  Future<List<OrderModel>> myOrders() async =>
      _list(await _send('GET', '/orders/mine'), OrderModel.fromJson);

  /// Cria o pedido da mesa ou, se já houver um aberto do mesmo garçom,
  /// acrescenta os itens a ele (comportamento do backend).
  Future<OrderModel> createOrder({
    required String tableId,
    required List<Map<String, dynamic>> items,
    String? notes,
    String? customerName,
  }) async {
    final data = await _send('POST', '/orders', body: {
      'tableId': tableId,
      'items': items,
      if (notes != null && notes.trim().isNotEmpty) 'notes': notes.trim(),
      if (customerName != null && customerName.trim().isNotEmpty)
        'customerName': customerName.trim(),
    });
    return OrderModel.fromJson(data as Map<String, dynamic>);
  }

  Future<void> updateItem(String orderId, String itemId,
      {int? quantity, String? notes}) async {
    await _send('PUT', '/orders/$orderId/items/$itemId', body: {
      if (quantity != null) 'quantity': quantity,
      if (notes != null) 'notes': notes,
    });
  }

  Future<void> setCustomer(String orderId, String customerName) async {
    await _send('PUT', '/orders/$orderId/customer',
        body: {'customerName': customerName});
  }

  Future<void> removeItem(String orderId, String itemId) async {
    await _send('DELETE', '/orders/$orderId/items/$itemId');
  }

  Future<void> closeOrder(String orderId) async {
    await _send('PUT', '/orders/$orderId/close');
  }

  Future<void> cancelOrder(String orderId) async {
    await _send('DELETE', '/orders/$orderId');
  }
}
