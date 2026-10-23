# ControlMesa · App do Garçom (Flutter)

App mobile do garçom, ligado ao `backend` (Express + Prisma + Socket.IO).

## Funcionalidades

- Login (JWT) com perfil `WAITER`/`ADMIN`; sessão persistida; endereço do servidor editável na tela de login.
- **Salão**: mesas desenhadas como mesas redondas com cadeiras. Cores: livre (menta), meu atendimento (âmbar), pronto para servir (menta pulsando), outro garçom (cinza).
- **Cardápio**: busca, categorias, carrinho com observação por item e do pedido; envia para a cozinha (`POST /orders`; se a mesa já tem pedido seu, os itens são acrescentados).
- **Pedidos**: progresso por pedido, detalhe com status de cada item (fila / preparando / pronto), editar quantidade e observação, retirar item, cancelar pedido, fechar conta.
- **Tempo real**: Socket.IO (`item:status`, `order:ready`) mostra avisos e atualiza as telas.

## Primeira execução

O Flutter SDK não estava instalado quando o código foi escrito, então as pastas de plataforma ainda não existem.

```powershell
cd E:\ControlMesa\appGaçom
flutter create . --platforms=android,ios --project-name control_mesa_garcom
Remove-Item test\widget_test.dart -ErrorAction SilentlyContinue
flutter pub get
```

Em `android/app/src/main/AndroidManifest.xml`, dentro de `<manifest>` e antes de `<application>`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

e na tag `<application ...>` acrescente `android:usesCleartextTraffic="true"` (o backend roda em HTTP).

## Rodando

1. Suba o backend: `cd ..\backend; npm run dev` (porta 3333). Crie um usuário `WAITER` pelo admin (`POST /users`).
2. `flutter run`
3. Servidor: emulador Android `http://10.0.2.2:3333` (padrão); celular físico `http://IP-DO-PC:3333` (mesmo Wi‑Fi, porta liberada no firewall). Ajuste pelo ícone no canto da tela de login.

## Estrutura

```
lib/
  core/      tema (paleta "brasa") e formatadores
  models/    User, Table, Category, Product, Order, OrderItem
  services/  api.dart (REST) e socket_service.dart (Socket.IO)
  state/     app_state.dart (sessão + dados + tempo real), cart.dart
  screens/   login, home_shell, tables, menu, cart_sheet, orders, order_detail
  widgets/   common.dart, table_tile.dart
```
