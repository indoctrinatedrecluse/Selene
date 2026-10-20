import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:selene_mobile/ui/core/theme.dart';

enum WhiteboardTool { pen, highlighter, arrow, rectangle, circle, eraser }

class WhiteboardStroke {
  final WhiteboardTool tool;
  final Color color;
  final double strokeWidth;
  final List<Offset> points;

  WhiteboardStroke({
    required this.tool,
    required this.color,
    required this.strokeWidth,
    required this.points,
  });
}

class WhiteboardOverlay extends StatefulWidget {
  final VoidCallback onClose;

  const WhiteboardOverlay({super.key, required this.onClose});

  @override
  State<WhiteboardOverlay> createState() => _WhiteboardOverlayState();
}

class _WhiteboardOverlayState extends State<WhiteboardOverlay> {
  final List<WhiteboardStroke> _strokes = [];
  final List<WhiteboardStroke> _undoneStrokes = [];

  WhiteboardTool _currentTool = WhiteboardTool.pen;
  Color _currentColor = SeleneTheme.lunarCyan;
  double _strokeWidth = 3.0;
  bool _isPassthrough = false;

  final List<Color> _palette = const [
    SeleneTheme.lunarCyan,
    SeleneTheme.emeraldSuccess,
    SeleneTheme.goldAccent,
    SeleneTheme.roseDanger,
    SeleneTheme.purpleMystic,
    Colors.white,
  ];

  void _undo() {
    if (_strokes.isNotEmpty) {
      setState(() {
        _undoneStrokes.add(_strokes.removeLast());
      });
    }
  }

  void _redo() {
    if (_undoneStrokes.isNotEmpty) {
      setState(() {
        _strokes.add(_undoneStrokes.removeLast());
      });
    }
  }

  void _clear() {
    setState(() {
      _strokes.clear();
      _undoneStrokes.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Gesture Layer
        Positioned.fill(
          child: IgnorePointer(
            ignoring: _isPassthrough,
            child: GestureDetector(
              onPanStart: (details) {
                setState(() {
                  _strokes.add(WhiteboardStroke(
                    tool: _currentTool,
                    color: _currentTool == WhiteboardTool.highlighter
                        ? _currentColor.withValues(alpha: 0.35)
                        : _currentColor,
                    strokeWidth: _currentTool == WhiteboardTool.highlighter ? _strokeWidth * 3 : _strokeWidth,
                    points: [details.localPosition],
                  ));
                  _undoneStrokes.clear();
                });
              },
              onPanUpdate: (details) {
                if (_strokes.isEmpty) return;
                setState(() {
                  _strokes.last.points.add(details.localPosition);
                });
              },
              child: CustomPaint(
                painter: _WhiteboardPainter(strokes: _strokes),
                size: Size.infinite,
              ),
            ),
          ),
        ),

        // Floating Daedalus Control Toolbar (Pinned Top Right)
        Positioned(
          top: MediaQuery.of(context).padding.top + 8,
          right: 12,
          left: 12,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: SeleneTheme.surfaceElevated.withValues(alpha: 0.95),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: SeleneTheme.lunarCyan.withValues(alpha: 0.5)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.5),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                // Title Badge
                const Row(
                  children: [
                    Text('🎨', style: TextStyle(fontSize: 16)),
                    SizedBox(width: 4),
                    Text(
                      'Daedalus',
                      style: TextStyle(
                        color: SeleneTheme.lunarCyan,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const Spacer(),

                // Tools
                _ToolIconButton(
                  icon: Icons.edit,
                  tooltip: "Calliope's Stylus (Pen)",
                  isSelected: _currentTool == WhiteboardTool.pen,
                  onTap: () => setState(() => _currentTool = WhiteboardTool.pen),
                ),
                _ToolIconButton(
                  icon: Icons.brush,
                  tooltip: "Iris's Highlighter",
                  isSelected: _currentTool == WhiteboardTool.highlighter,
                  onTap: () => setState(() => _currentTool = WhiteboardTool.highlighter),
                ),
                _ToolIconButton(
                  icon: Icons.arrow_outward,
                  tooltip: "Apollo's Arrow",
                  isSelected: _currentTool == WhiteboardTool.arrow,
                  onTap: () => setState(() => _currentTool = WhiteboardTool.arrow),
                ),
                _ToolIconButton(
                  icon: Icons.crop_square,
                  tooltip: "Euclidean Frame",
                  isSelected: _currentTool == WhiteboardTool.rectangle,
                  onTap: () => setState(() => _currentTool = WhiteboardTool.rectangle),
                ),
                _ToolIconButton(
                  icon: Icons.circle_outlined,
                  tooltip: "Selene's Orb",
                  isSelected: _currentTool == WhiteboardTool.circle,
                  onTap: () => setState(() => _currentTool = WhiteboardTool.circle),
                ),
                _ToolIconButton(
                  icon: Icons.auto_fix_high,
                  tooltip: "Eraser",
                  isSelected: _currentTool == WhiteboardTool.eraser,
                  onTap: () => setState(() => _currentTool = WhiteboardTool.eraser),
                ),

                const VerticalDivider(width: 12, indent: 4, endIndent: 4),

                // Passthrough mode
                _ToolIconButton(
                  icon: _isPassthrough ? Icons.visibility_off : Icons.touch_app,
                  tooltip: _isPassthrough ? "Interacting with document" : "Drawing mode active",
                  isSelected: _isPassthrough,
                  selectedColor: SeleneTheme.goldAccent,
                  onTap: () => setState(() => _isPassthrough = !_isPassthrough),
                ),

                // Undo / Redo
                IconButton(
                  icon: const Icon(Icons.undo, size: 18),
                  tooltip: 'Undo',
                  onPressed: _strokes.isNotEmpty ? _undo : null,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(minWidth: 30, minHeight: 30),
                ),
                IconButton(
                  icon: const Icon(Icons.redo, size: 18),
                  tooltip: 'Redo',
                  onPressed: _undoneStrokes.isNotEmpty ? _redo : null,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(minWidth: 30, minHeight: 30),
                ),
                IconButton(
                  icon: const Icon(Icons.delete_outline, size: 18, color: SeleneTheme.roseDanger),
                  tooltip: 'Clear Canvas',
                  onPressed: _strokes.isNotEmpty ? _clear : null,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(minWidth: 30, minHeight: 30),
                ),

                // Close Button
                IconButton(
                  icon: const Icon(Icons.close, size: 18, color: Colors.white),
                  tooltip: 'Exit Whiteboard',
                  onPressed: widget.onClose,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(minWidth: 30, minHeight: 30),
                ),
              ],
            ),
          ),
        ),

        // Color & Stroke Palette Drawer (Bottom)
        if (!_isPassthrough)
          Positioned(
            bottom: 60,
            left: 20,
            right: 20,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: SeleneTheme.surfaceElevated.withValues(alpha: 0.95),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: SeleneTheme.borderHighlight),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    ..._palette.map((c) => GestureDetector(
                      onTap: () => setState(() => _currentColor = c),
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        width: 22,
                        height: 22,
                        decoration: BoxDecoration(
                          color: c,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: _currentColor == c ? Colors.white : Colors.transparent,
                            width: 2,
                          ),
                        ),
                      ),
                    )),
                    const SizedBox(width: 8),
                    // Width preset
                    GestureDetector(
                      onTap: () => setState(() => _strokeWidth = _strokeWidth == 3.0 ? 6.0 : _strokeWidth == 6.0 ? 1.5 : 3.0),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: SeleneTheme.surface,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: SeleneTheme.border),
                        ),
                        child: Text(
                          '${_strokeWidth.toInt()}px',
                          style: const TextStyle(fontSize: 11, color: SeleneTheme.textSecondary),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }
}

class _ToolIconButton extends StatelessWidget {
  final IconData icon;
  final String tooltip;
  final bool isSelected;
  final Color? selectedColor;
  final VoidCallback onTap;

  const _ToolIconButton({
    required this.icon,
    required this.tooltip,
    required this.isSelected,
    this.selectedColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final activeColor = selectedColor ?? SeleneTheme.lunarCyan;
    return Tooltip(
      message: tooltip,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.all(6),
          margin: const EdgeInsets.symmetric(horizontal: 1),
          decoration: BoxDecoration(
            color: isSelected ? activeColor.withValues(alpha: 0.2) : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            icon,
            size: 18,
            color: isSelected ? activeColor : SeleneTheme.textSecondary,
          ),
        ),
      ),
    );
  }
}

class _WhiteboardPainter extends CustomPainter {
  final List<WhiteboardStroke> strokes;

  _WhiteboardPainter({required this.strokes});

  @override
  void paint(Canvas canvas, Size size) {
    for (final stroke in strokes) {
      if (stroke.points.isEmpty) continue;

      final paint = Paint()
        ..color = stroke.tool == WhiteboardTool.eraser ? Colors.transparent : stroke.color
        ..strokeWidth = stroke.strokeWidth
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round;

      if (stroke.tool == WhiteboardTool.eraser) {
        paint.blendMode = BlendMode.clear;
      }

      if (stroke.tool == WhiteboardTool.pen ||
          stroke.tool == WhiteboardTool.highlighter ||
          stroke.tool == WhiteboardTool.eraser) {
        if (stroke.points.length == 1) {
          canvas.drawCircle(stroke.points.first, stroke.strokeWidth / 2, paint);
        } else {
          final path = Path()..moveTo(stroke.points.first.dx, stroke.points.first.dy);
          for (int i = 1; i < stroke.points.length; i++) {
            path.lineTo(stroke.points[i].dx, stroke.points[i].dy);
          }
          canvas.drawPath(path, paint);
        }
      } else if (stroke.tool == WhiteboardTool.rectangle && stroke.points.length >= 2) {
        final start = stroke.points.first;
        final end = stroke.points.last;
        final rect = Rect.fromPoints(start, end);
        canvas.drawRect(rect, paint);
      } else if (stroke.tool == WhiteboardTool.circle && stroke.points.length >= 2) {
        final start = stroke.points.first;
        final end = stroke.points.last;
        final rect = Rect.fromPoints(start, end);
        canvas.drawOval(rect, paint);
      } else if (stroke.tool == WhiteboardTool.arrow && stroke.points.length >= 2) {
        final start = stroke.points.first;
        final end = stroke.points.last;
        canvas.drawLine(start, end, paint);

        // Draw arrow head
        final angle = math.atan2(end.dy - start.dy, end.dx - start.dx);
        const arrowSize = 16.0;
        final p1 = Offset(
          end.dx - arrowSize * math.cos(angle - math.pi / 6),
          end.dy - arrowSize * math.sin(angle - math.pi / 6),
        );
        final p2 = Offset(
          end.dx - arrowSize * math.cos(angle + math.pi / 6),
          end.dy - arrowSize * math.sin(angle + math.pi / 6),
        );
        final arrowHeadPath = Path()
          ..moveTo(end.dx, end.dy)
          ..lineTo(p1.dx, p1.dy)
          ..lineTo(p2.dx, p2.dy)
          ..close();
        final fillPaint = Paint()
          ..color = stroke.color
          ..style = PaintingStyle.fill;
        canvas.drawPath(arrowHeadPath, fillPaint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _WhiteboardPainter oldDelegate) => true;
}
