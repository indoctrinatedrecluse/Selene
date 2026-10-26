import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:selene_mobile/ui/core/theme.dart';

class LyreStringDef {
  final String name;
  final String note;
  final double freq;
  final String label;

  const LyreStringDef({
    required this.name,
    required this.note,
    required this.freq,
    required this.label,
  });
}

const List<LyreStringDef> kLyreStrings = [
  LyreStringDef(name: 'Hypate', note: 'D4', freq: 293.66, label: 'Lowest'),
  LyreStringDef(name: 'Parhypate', note: 'E4', freq: 329.63, label: 'Near-Low'),
  LyreStringDef(name: 'Lichanos', note: 'F4', freq: 349.23, label: 'Forefinger'),
  LyreStringDef(name: 'Mese', note: 'G4', freq: 392.0, label: 'Central'),
  LyreStringDef(name: 'Paramese', note: 'A4', freq: 432.0, label: 'Veritas 432'),
  LyreStringDef(name: 'Paranete', note: 'C5', freq: 523.25, label: 'Near-High'),
  LyreStringDef(name: 'Nete', note: 'D5', freq: 587.33, label: 'Highest'),
];

class ApollosLyreSheet extends StatefulWidget {
  final String activeContext;

  const ApollosLyreSheet({
    super.key,
    required this.activeContext,
  });

  static Future<void> show(BuildContext context, {required String activeContext}) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => ApollosLyreSheet(activeContext: activeContext),
    );
  }

  @override
  State<ApollosLyreSheet> createState() => _ApollosLyreSheetState();
}

class _ApollosLyreSheetState extends State<ApollosLyreSheet>
    with SingleTickerProviderStateMixin {
  late AnimationController _waveAnimController;
  int? _activeStringIndex;
  bool _isDroneActive = false;
  bool _isSonifying = false;
  int _droneBaseFreq = 432;
  int _tempoMs = 180;
  Timer? _sonifyTimer;
  int _sonifyStep = 0;
  List<double> _extractedDataPoints = [];

  @override
  void initState() {
    super.initState();
    _waveAnimController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1600),
    )..repeat();

    _parseContextNumbers();
  }

  @override
  void dispose() {
    _waveAnimController.dispose();
    _sonifyTimer?.cancel();
    super.dispose();
  }

  void _parseContextNumbers() {
    final matches = RegExp(r'-?\d+(\.\d+)?').allMatches(widget.activeContext);
    final numbers = matches
        .map((m) => double.tryParse(m.group(0) ?? '')?.abs() ?? 0.0)
        .where((n) => n > 0)
        .take(30)
        .toList();

    if (numbers.length >= 4) {
      _extractedDataPoints = numbers;
    } else {
      _extractedDataPoints = [1, 2, 3, 5, 8, 13, 21, 34, 55, 34, 21, 13, 8, 5, 3, 2, 1];
    }
  }

  void _pluckString(int index) {
    setState(() {
      _activeStringIndex = index;
    });

    HapticFeedback.lightImpact();
    SystemSound.play(SystemSoundType.click);

    Future.delayed(const Duration(milliseconds: 350), () {
      if (mounted && _activeStringIndex == index) {
        setState(() {
          _activeStringIndex = null;
        });
      }
    });
  }

  void _toggleDrone() {
    setState(() {
      _isDroneActive = !_isDroneActive;
    });

    if (_isDroneActive) {
      HapticFeedback.heavyImpact();
    } else {
      HapticFeedback.selectionClick();
    }
  }

  void _toggleSonification() {
    if (_isSonifying) {
      _sonifyTimer?.cancel();
      setState(() {
        _isSonifying = false;
        _sonifyStep = 0;
      });
      return;
    }

    if (_extractedDataPoints.isEmpty) return;

    final minVal = _extractedDataPoints.reduce(math.min);
    final maxVal = _extractedDataPoints.reduce(math.max);
    final range = (maxVal - minVal) == 0 ? 1.0 : (maxVal - minVal);

    setState(() {
      _isSonifying = true;
      _sonifyStep = 0;
    });

    _sonifyTimer?.cancel();
    _sonifyTimer = Timer.periodic(Duration(milliseconds: _tempoMs), (timer) {
      if (!mounted || !_isSonifying) {
        timer.cancel();
        return;
      }

      if (_sonifyStep >= _extractedDataPoints.length) {
        timer.cancel();
        setState(() {
          _isSonifying = false;
          _sonifyStep = 0;
          _activeStringIndex = null;
        });
        return;
      }

      final val = _extractedDataPoints[_sonifyStep];
      final norm = ((val - minVal) / range).clamp(0.0, 1.0);
      final strIdx = (norm * (kLyreStrings.length - 1)).round();

      _pluckString(strIdx);

      setState(() {
        _sonifyStep++;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.88,
      decoration: const BoxDecoration(
        color: SeleneTheme.surfaceElevated,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        border: Border(
          top: BorderSide(color: SeleneTheme.goldAccent, width: 2),
          left: BorderSide(color: SeleneTheme.border),
          right: BorderSide(color: SeleneTheme.border),
        ),
      ),
      child: Column(
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 10, bottom: 6),
              width: 38,
              height: 4,
              decoration: BoxDecoration(
                color: SeleneTheme.textMuted.withValues(alpha: 0.4),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: SeleneTheme.goldAccent.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: SeleneTheme.goldAccent.withValues(alpha: 0.3),
                    ),
                  ),
                  child: const Text('🎵', style: TextStyle(fontSize: 20)),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            "Apollo's Lyre",
                            style: TextStyle(
                              color: SeleneTheme.textPrimary,
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(width: 6),
                          Text(
                            '• 432Hz Veritas',
                            style: TextStyle(
                              color: SeleneTheme.goldAccent,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        'Harmonic Telemetry & Data Sonification Engine',
                        style: TextStyle(color: SeleneTheme.textMuted, fontSize: 11),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: SeleneTheme.textSecondary, size: 20),
                  onPressed: () {
                    _sonifyTimer?.cancel();
                    Navigator.pop(context);
                  },
                ),
              ],
            ),
          ),

          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              children: [
                // 1. Celestial Harmonic Oscilloscope
                Container(
                  height: 110,
                  decoration: BoxDecoration(
                    color: const Color(0xFF06090F),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: SeleneTheme.border),
                  ),
                  child: Stack(
                    children: [
                      Positioned.fill(
                        child: AnimatedBuilder(
                          animation: _waveAnimController,
                          builder: (context, _) {
                            return CustomPaint(
                              painter: LyreWaveformPainter(
                                phase: _waveAnimController.value,
                                isActive: _isDroneActive || _isSonifying || _activeStringIndex != null,
                                activeIndex: _activeStringIndex,
                              ),
                            );
                          },
                        ),
                      ),
                      Positioned(
                        left: 12,
                        top: 8,
                        child: Row(
                          children: [
                            Icon(
                              Icons.graphic_eq,
                              size: 13,
                              color: (_isDroneActive || _isSonifying)
                                  ? SeleneTheme.goldAccent
                                  : SeleneTheme.lunarCyan,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              _isSonifying
                                  ? 'SONIFYING STEP $_sonifyStep / ${_extractedDataPoints.length}'
                                  : _isDroneActive
                                      ? '$_droneBaseFreq HZ BINAURAL DRONE ACTIVE'
                                      : 'CELESTIAL HARMONIC STANDBY',
                              style: const TextStyle(
                                color: SeleneTheme.textMuted,
                                fontSize: 10,
                                fontFamily: 'monospace',
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 14),

                // 2. The Seven Sacred Strings (Heptachord)
                const Row(
                  children: [
                    Text('🏛️', style: TextStyle(fontSize: 14)),
                    SizedBox(width: 6),
                    Text(
                      'SEVEN STRINGS OF THE HEPTACHORD',
                      style: TextStyle(
                        color: SeleneTheme.textMuted,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.8,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                SizedBox(
                  height: 100,
                  child: Row(
                    children: List.generate(kLyreStrings.length, (idx) {
                      final str = kLyreStrings[idx];
                      final isStruck = _activeStringIndex == idx;
                      return Expanded(
                        child: GestureDetector(
                          onTap: () => _pluckString(idx),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 150),
                            margin: const EdgeInsets.symmetric(horizontal: 2),
                            decoration: BoxDecoration(
                              color: isStruck
                                  ? SeleneTheme.goldAccent.withValues(alpha: 0.25)
                                  : SeleneTheme.surface,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: isStruck
                                    ? SeleneTheme.goldAccent
                                    : SeleneTheme.border,
                                width: isStruck ? 1.5 : 1,
                              ),
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                              children: [
                                Container(
                                  width: isStruck ? 3 : 1.5,
                                  height: 38,
                                  decoration: BoxDecoration(
                                    color: isStruck
                                        ? SeleneTheme.goldAccent
                                        : SeleneTheme.textMuted,
                                    borderRadius: BorderRadius.circular(2),
                                    boxShadow: isStruck
                                        ? [
                                            BoxShadow(
                                              color: SeleneTheme.goldAccent.withValues(alpha: 0.8),
                                              blurRadius: 8,
                                            ),
                                          ]
                                        : null,
                                  ),
                                ),
                                Text(
                                  str.note,
                                  style: TextStyle(
                                    color: isStruck ? SeleneTheme.goldAccent : SeleneTheme.textPrimary,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  '${str.freq.toInt()}Hz',
                                  style: const TextStyle(
                                    color: SeleneTheme.textMuted,
                                    fontSize: 9,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    }),
                  ),
                ),

                const SizedBox(height: 16),

                // 3. Engine Modes (Data Sonifier & Focus Drone)
                Row(
                  children: [
                    // Sonifier Card
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: SeleneTheme.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: SeleneTheme.border),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Row(
                              children: [
                                Icon(Icons.waves, size: 16, color: SeleneTheme.lunarCyan),
                                SizedBox(width: 6),
                                Text(
                                  'Data Sonifier',
                                  style: TextStyle(
                                    color: SeleneTheme.textPrimary,
                                    fontSize: 12.5,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${_extractedDataPoints.length} points found in context',
                              style: const TextStyle(color: SeleneTheme.textMuted, fontSize: 10.5),
                            ),
                            const SizedBox(height: 10),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton.icon(
                                icon: Icon(
                                  _isSonifying ? Icons.stop : Icons.play_arrow,
                                  size: 15,
                                ),
                                label: Text(
                                  _isSonifying ? 'Stop Scan' : 'Sonify Text',
                                  style: const TextStyle(fontSize: 11),
                                ),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: _isSonifying
                                      ? SeleneTheme.roseDanger
                                      : SeleneTheme.lunarCyan,
                                  foregroundColor: SeleneTheme.background,
                                  padding: const EdgeInsets.symmetric(vertical: 6),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                                onPressed: _toggleSonification,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(width: 10),

                    // 432 Hz Drone Card
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: SeleneTheme.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: SeleneTheme.border),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.radar, size: 16, color: SeleneTheme.goldAccent),
                                const SizedBox(width: 6),
                                Text(
                                  '$_droneBaseFreq Hz Drone',
                                  style: const TextStyle(
                                    color: SeleneTheme.textPrimary,
                                    fontSize: 12.5,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Pythagorean concentration drone',
                              style: TextStyle(color: SeleneTheme.textMuted, fontSize: 10.5),
                            ),
                            const SizedBox(height: 10),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton.icon(
                                icon: Icon(
                                  _isDroneActive ? Icons.stop : Icons.auto_awesome,
                                  size: 15,
                                ),
                                label: Text(
                                  _isDroneActive ? 'Halt Drone' : 'Emit Drone',
                                  style: const TextStyle(fontSize: 11),
                                ),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: _isDroneActive
                                      ? SeleneTheme.goldAccent
                                      : SeleneTheme.goldAccent.withValues(alpha: 0.2),
                                  foregroundColor: _isDroneActive
                                      ? SeleneTheme.background
                                      : SeleneTheme.goldAccent,
                                  padding: const EdgeInsets.symmetric(vertical: 6),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                                onPressed: _toggleDrone,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 14),

                // 4. Fine-Tuning Controls
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: SeleneTheme.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: SeleneTheme.border),
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.speed, size: 16, color: SeleneTheme.textSecondary),
                          const SizedBox(width: 8),
                          const Text(
                            'Sonification Tempo',
                            style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 12),
                          ),
                          const Spacer(),
                          Text(
                            '${_tempoMs}ms',
                            style: const TextStyle(
                              color: SeleneTheme.lunarCyan,
                              fontSize: 12,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ],
                      ),
                      Slider(
                        value: _tempoMs.toDouble(),
                        min: 80,
                        max: 400,
                        divisions: 16,
                        activeColor: SeleneTheme.lunarCyan,
                        onChanged: (val) {
                          setState(() {
                            _tempoMs = val.toInt();
                          });
                        },
                      ),
                      Row(
                        children: [
                          const Icon(Icons.tune, size: 16, color: SeleneTheme.textSecondary),
                          const SizedBox(width: 8),
                          const Text(
                            'Drone Sacred Frequency',
                            style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 12),
                          ),
                          const Spacer(),
                          TextButton(
                            style: TextButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              backgroundColor: SeleneTheme.surfaceElevated,
                            ),
                            onPressed: () {
                              setState(() {
                                _droneBaseFreq = (_droneBaseFreq == 432) ? 528 : 432;
                              });
                            },
                            child: Text(
                              '$_droneBaseFreq Hz (Tap to toggle)',
                              style: const TextStyle(
                                color: SeleneTheme.goldAccent,
                                fontSize: 11,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class LyreWaveformPainter extends CustomPainter {
  final double phase;
  final bool isActive;
  final int? activeIndex;

  LyreWaveformPainter({
    required this.phase,
    required this.isActive,
    required this.activeIndex,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final midY = size.height / 2;

    // Background horizontal baseline
    final baseLinePaint = Paint()
      ..color = const Color(0xFF1E293B)
      ..strokeWidth = 1.0;
    canvas.drawLine(Offset(0, midY), Offset(size.width, midY), baseLinePaint);

    final path = Path();
    final glowPath = Path();

    final cycles = isActive ? 4.5 : 2.0;
    final amp = isActive ? 24.0 : 8.0;

    for (double x = 0; x <= size.width; x += 2) {
      final normX = x / size.width;
      final y = midY +
          math.sin((normX * cycles * 2 * math.pi) + (phase * 2 * math.pi)) * amp +
          (isActive
              ? math.sin((normX * cycles * 4 * math.pi) - (phase * 3 * math.pi)) * (amp * 0.3)
              : 0);

      if (x == 0) {
        path.moveTo(x, y);
        glowPath.moveTo(x, y);
      } else {
        path.lineTo(x, y);
        glowPath.lineTo(x, y);
      }
    }

    // Glow line
    final glowPaint = Paint()
      ..color = (isActive ? SeleneTheme.goldAccent : SeleneTheme.lunarCyan).withValues(alpha: 0.3)
      ..strokeWidth = 6.0
      ..style = PaintingStyle.stroke
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 6);
    canvas.drawPath(glowPath, glowPaint);

    // Sharp foreground line
    final strokePaint = Paint()
      ..color = isActive ? SeleneTheme.goldAccent : SeleneTheme.lunarCyan
      ..strokeWidth = 2.0
      ..style = PaintingStyle.stroke;
    canvas.drawPath(path, strokePaint);
  }

  @override
  bool shouldRepaint(covariant LyreWaveformPainter oldDelegate) => true;
}
