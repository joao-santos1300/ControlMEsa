import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/theme.dart';
import '../state/app_state.dart';
import '../widgets/common.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _busy = false;
  bool _hidden = true;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_email.text.trim().isEmpty || _password.text.isEmpty) {
      showSnack(context, 'Informe email e senha');
      return;
    }
    setState(() => _busy = true);
    final app = context.read<AppState>();
    await guard(context, () => app.login(_email.text, _password.text));
    if (mounted) setState(() => _busy = false);
  }

  Future<void> _editServer() async {
    final app = context.read<AppState>();
    final controller = TextEditingController(text: app.serverUrl);
    var searching = false;
    String? hint;

    final saved = await showDialog<String>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setLocal) => AlertDialog(
          title: const Text('Endereço do servidor',
              style: TextStyle(fontWeight: FontWeight.w700)),
          content: SizedBox(
            width: 420,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'O app procura o servidor sozinho na rede. Se preferir, digite o endereço manualmente (ex.: http://192.168.0.10:3333).',
                  style: TextStyle(
                      color: Palette.textDim, fontSize: 13, height: 1.4),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: controller,
                  keyboardType: TextInputType.url,
                  autocorrect: false,
                  decoration: const InputDecoration(hintText: 'http://...'),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Palette.mint,
                      side: const BorderSide(color: Palette.mint),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                    ),
                    onPressed: searching
                        ? null
                        : () async {
                            setLocal(() {
                              searching = true;
                              hint = null;
                            });
                            final found = await app.findServer();
                            if (!ctx.mounted) return;
                            setLocal(() {
                              searching = false;
                              if (found) controller.text = app.serverUrl;
                              hint = found
                                  ? 'Servidor encontrado!'
                                  : 'Nenhum servidor encontrado nesta rede.';
                            });
                          },
                    icon: searching
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: Palette.mint))
                        : const Icon(Icons.wifi_find_rounded, size: 20),
                    label: Text(searching
                        ? 'Procurando na rede...'
                        : 'Procurar automaticamente'),
                  ),
                ),
                if (hint != null) ...[
                  const SizedBox(height: 10),
                  Text(hint!,
                      style: const TextStyle(
                          color: Palette.textDim, fontSize: 13)),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancelar',
                  style: TextStyle(color: Palette.textDim)),
            ),
            FilledButton(
              style: FilledButton.styleFrom(backgroundColor: Palette.ember),
              onPressed: () => Navigator.pop(ctx, controller.text),
              child: const Text('Salvar'),
            ),
          ],
        ),
      ),
    );
    controller.dispose();
    if (saved != null && saved.trim().isNotEmpty) await app.setServer(saved);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AmbientBackground(
        child: SafeArea(
          child: Stack(
            children: [
              Positioned(
                top: 8,
                right: 12,
                child: RoundIconButton(
                  icon: Icons.settings_ethernet_rounded,
                  onTap: _editServer,
                ),
              ),
              Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 28),
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 420),
                    child: TweenAnimationBuilder<double>(
                      tween: Tween(begin: 0, end: 1),
                      duration: const Duration(milliseconds: 700),
                      curve: Curves.easeOutCubic,
                      builder: (context, t, child) => Opacity(
                        opacity: t,
                        child: Transform.translate(
                          offset: Offset(0, 28 * (1 - t)),
                          child: child,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 68,
                            height: 68,
                            decoration: BoxDecoration(
                              gradient: Palette.emberGradient,
                              borderRadius: BorderRadius.circular(22),
                              boxShadow: [
                                BoxShadow(
                                  color: Palette.ember.withValues(alpha: 0.4),
                                  blurRadius: 30,
                                  offset: const Offset(0, 12),
                                ),
                              ],
                            ),
                            child: const Icon(Icons.restaurant_rounded,
                                size: 34, color: Colors.white),
                          ),
                          const SizedBox(height: 28),
                          const Text(
                            'Control\nMesa',
                            style: TextStyle(
                              fontSize: 44,
                              height: 1.0,
                              fontWeight: FontWeight.w800,
                              letterSpacing: -1.5,
                            ),
                          ),
                          const SizedBox(height: 10),
                          const Text(
                            'Área do garçom · entre para abrir o salão',
                            style: TextStyle(color: Palette.textDim),
                          ),
                          const SizedBox(height: 36),
                          TextField(
                            controller: _email,
                            keyboardType: TextInputType.emailAddress,
                            autocorrect: false,
                            textInputAction: TextInputAction.next,
                            decoration: const InputDecoration(
                              hintText: 'Email',
                              prefixIcon: Icon(Icons.alternate_email_rounded,
                                  color: Palette.textDim),
                            ),
                          ),
                          const SizedBox(height: 14),
                          TextField(
                            controller: _password,
                            obscureText: _hidden,
                            onSubmitted: (_) => _submit(),
                            decoration: InputDecoration(
                              hintText: 'Senha',
                              prefixIcon: const Icon(Icons.lock_outline_rounded,
                                  color: Palette.textDim),
                              suffixIcon: IconButton(
                                onPressed: () =>
                                    setState(() => _hidden = !_hidden),
                                icon: Icon(
                                  _hidden
                                      ? Icons.visibility_off_outlined
                                      : Icons.visibility_outlined,
                                  color: Palette.textDim,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 26),
                          SizedBox(
                            width: double.infinity,
                            child: GradientButton(
                              label: 'Entrar no salão',
                              icon: Icons.arrow_forward_rounded,
                              busy: _busy,
                              onPressed: _submit,
                            ),
                          ),
                          const SizedBox(height: 18),
                          _ServerLine(onTap: _editServer),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Mostra qual servidor está em uso (ou que está procurando) sob o formulário.
class _ServerLine extends StatelessWidget {
  final VoidCallback onTap;
  const _ServerLine({required this.onTap});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    return Center(
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (app.discovering)
                const SizedBox(
                    width: 13,
                    height: 13,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: Palette.ember))
              else
                const Icon(Icons.dns_rounded, size: 15, color: Palette.textDim),
              const SizedBox(width: 8),
              Flexible(
                child: Text(
                  app.discovering
                      ? 'Procurando o servidor na rede...'
                      : app.serverUrl,
                  overflow: TextOverflow.ellipsis,
                  style:
                      const TextStyle(color: Palette.textDim, fontSize: 12.5),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
