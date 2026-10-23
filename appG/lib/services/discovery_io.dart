import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'discovery.dart';

const _port = 3334;
const _magic = 'CONTROLMESA_DISCOVER';

/// Broadcast UDP: o backend responde com seu endereço na rede.
Future<FoundServer?> discover() async {
  RawDatagramSocket? socket;
  try {
    socket = await RawDatagramSocket.bind(InternetAddress.anyIPv4, 0);
    socket.broadcastEnabled = true;
    final done = Completer<FoundServer?>();

    socket.listen((event) {
      if (event != RawSocketEvent.read || done.isCompleted) return;
      final packet = socket!.receive();
      if (packet == null) return;
      try {
        final data = jsonDecode(utf8.decode(packet.data));
        final url = data is Map ? data['url'] as String? : null;
        if (url != null && data['app'] == 'ControlMesa') {
          done.complete(FoundServer(url, (data['name'] as String?) ?? url));
        }
      } catch (_) {}
    });

    // Reenvia algumas vezes: UDP pode se perder em Wi-Fi
    final ping = utf8.encode(_magic);
    for (var i = 0; i < 3 && !done.isCompleted; i++) {
      socket.send(ping, InternetAddress('255.255.255.255'), _port);
      await Future.any([done.future, Future.delayed(const Duration(seconds: 1))]);
    }
    return await done.future
        .timeout(const Duration(milliseconds: 300), onTimeout: () => null);
  } catch (_) {
    return null;
  } finally {
    socket?.close();
  }
}
