import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import 'discovery_io.dart' as platform;

/// Servidor ControlMesa encontrado na rede.
class FoundServer {
  final String url;
  final String name;
  const FoundServer(this.url, this.name);
}

/// Confirma se [url] é um backend ControlMesa respondendo.
Future<FoundServer?> probeServer(String url,
    {Duration timeout = const Duration(seconds: 2)}) async {
  try {
    final base = url.endsWith('/') ? url.substring(0, url.length - 1) : url;
    final res = await http.get(Uri.parse('$base/server-info')).timeout(timeout);
    if (res.statusCode != 200) return null;
    final data = jsonDecode(res.body);
    if (data is! Map || data['app'] != 'ControlMesa') return null;
    return FoundServer(base, (data['name'] as String?) ?? base);
  } catch (_) {
    return null;
  }
}

/// Procura o servidor na rede enviando um broadcast UDP.
Future<FoundServer?> discoverServer() => platform.discover();
