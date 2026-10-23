import 'package:socket_io_client/socket_io_client.dart' as io;

/// Conexão em tempo real com a cozinha. O backend coloca o garçom na sala
/// `waiter:<id>` e emite `item:status` e `order:ready`.
class SocketService {
  io.Socket? _socket;

  void connect({
    required String url,
    required String token,
    required void Function(Map<String, dynamic>) onItemStatus,
    required void Function(Map<String, dynamic>) onOrderReady,
    required void Function() onReconnect,
  }) {
    disconnect();
    final socket = io.io(
      url,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token})
          .enableReconnection()
          .disableAutoConnect()
          .build(),
    );

    socket.on('item:status', (data) {
      if (data is Map) onItemStatus(Map<String, dynamic>.from(data));
    });
    socket.on('order:ready', (data) {
      if (data is Map) onOrderReady(Map<String, dynamic>.from(data));
    });
    socket.onReconnect((_) => onReconnect());

    socket.connect();
    _socket = socket;
  }

  void disconnect() {
    _socket?.dispose();
    _socket = null;
  }
}
