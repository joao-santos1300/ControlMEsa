import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../core/theme.dart';
import '../models/models.dart';

enum TableVisual { free, mine, ready, other }

TableVisual visualFor(TableModel table, OrderModel? mine) {
  if (mine != null) return mine.isReady ? TableVisual.ready : TableVisual.mine;
  return table.occupied ? TableVisual.other : TableVisual.free;
}

Color _colorOf(TableVisual v) => switch (v) {
      TableVisual.free => Palette.mint,
      TableVisual.mine => Palette.amber,
      TableVisual.ready => Palette.mint,
      TableVisual.other => Palette.textDim,
    };

/// Mesa vista de cima: tampo redondo com cadeiras ao redor.
class TableTile extends StatefulWidget {
  final TableModel table;
  final OrderModel? order;
  final VoidCallback onTap;

  const TableTile({
    super.key,
    required this.table,
    required this.order,
    required this.onTap,
  });

  @override
  State<TableTile> createState() => _TableTileState();
}

class _TableTileState extends State<TableTile>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulse = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1400),
  );

  @override
  void initState() {
    super.initState();
    _syncPulse();
  }

  @override
  void didUpdateWidget(covariant TableTile old) {
    super.didUpdateWidget(old);
    _syncPulse();
  }

  void _syncPulse() {
    final ready = visualFor(widget.table, widget.order) == TableVisual.ready;
    if (ready && !_pulse.isAnimating) {
      _pulse.repeat(reverse: true);
    } else if (!ready && _pulse.isAnimating) {
      _pulse.stop();
      _pulse.value = 0;
    }
  }

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  String _caption(TableVisual v) {
    final o = widget.order;
    return switch (v) {
      TableVisual.free => 'Livre',
      TableVisual.mine => o == null
          ? 'Em atendimento'
          : 'Preparando ${o.readyCount}/${o.activeItems.length}',
      TableVisual.ready => 'Pronto p/ servir',
      TableVisual.other => 'Outro garçom',
    };
  }

  @override
  Widget build(BuildContext context) {
    final v = visualFor(widget.table, widget.order);
    final color = _colorOf(v);

    return AnimatedBuilder(
      animation: _pulse,
      builder: (context, _) {
        final glow = v == TableVisual.ready ? 0.15 + 0.30 * _pulse.value : 0.0;
        return Material(
          color: Palette.surface,
          borderRadius: BorderRadius.circular(26),
          child: InkWell(
            borderRadius: BorderRadius.circular(26),
            onTap: widget.onTap,
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(26),
                border: Border.all(
                  color: v == TableVisual.free
                      ? Palette.line
                      : color.withValues(alpha: 0.55),
                ),
                boxShadow: glow > 0
                    ? [
                        BoxShadow(
                          color: color.withValues(alpha: glow),
                          blurRadius: 26,
                          spreadRadius: 1,
                        )
                      ]
                    : null,
              ),
              child: Column(
                children: [
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(10, 12, 10, 0),
                      child: CustomPaint(
                        painter: _TablePainter(color: color, visual: v),
                        child: Center(
                          child: Text(
                            '${widget.table.number}',
                            style: TextStyle(
                              fontSize: 26,
                              fontWeight: FontWeight.w800,
                              color: v == TableVisual.other
                                  ? Palette.textDim
                                  : Palette.text,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(8, 4, 8, 12),
                    child: Text(
                      _caption(v),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: color,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _TablePainter extends CustomPainter {
  final Color color;
  final TableVisual visual;

  _TablePainter({required this.color, required this.visual});

  @override
  void paint(Canvas canvas, Size size) {
    final c = size.center(Offset.zero);
    final radius = math.min(size.width, size.height) / 2;
    final topR = radius * 0.62;
    final filled = visual != TableVisual.free;

    final chair = Paint()
      ..color = color.withValues(alpha: filled ? 0.85 : 0.35);
    const chairs = 6;
    for (var i = 0; i < chairs; i++) {
      final a = (math.pi * 2 / chairs) * i - math.pi / 2;
      final p = c + Offset(math.cos(a), math.sin(a)) * (radius * 0.86);
      canvas.drawCircle(p, radius * 0.11, chair);
    }

    final top = Paint()
      ..shader = RadialGradient(
        colors: [
          color.withValues(alpha: filled ? 0.38 : 0.12),
          color.withValues(alpha: filled ? 0.16 : 0.05),
        ],
      ).createShader(Rect.fromCircle(center: c, radius: topR));
    canvas.drawCircle(c, topR, top);

    canvas.drawCircle(
      c,
      topR,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.6
        ..color = color.withValues(alpha: filled ? 0.9 : 0.4),
    );
  }

  @override
  bool shouldRepaint(covariant _TablePainter old) =>
      old.color != color || old.visual != visual;
}
