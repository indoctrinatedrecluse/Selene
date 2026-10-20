import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:selene_mobile/ui/core/theme.dart';

class CelestialStar {
  final double x;
  final double y;
  final double radius;
  final double speed;
  final double phase;
  final Color color;

  const CelestialStar({
    required this.x,
    required this.y,
    required this.radius,
    required this.speed,
    required this.phase,
    required this.color,
  });
}

class CelestialCanvasBackground extends StatefulWidget {
  final Widget child;
  final bool isSparklingEnabled;

  const CelestialCanvasBackground({
    super.key,
    required this.child,
    this.isSparklingEnabled = true,
  });

  @override
  State<CelestialCanvasBackground> createState() => _CelestialCanvasBackgroundState();
}

class _CelestialCanvasBackgroundState extends State<CelestialCanvasBackground>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final List<CelestialStar> _stars;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 8),
    )..repeat();

    _stars = _generateStars(55);
  }

  List<CelestialStar> _generateStars(int count) {
    final random = math.Random(42);
    final colors = [
      Colors.white,
      SeleneTheme.lunarCyan,
      SeleneTheme.goldAccent,
      const Color(0xFFE2E8F0),
      const Color(0xFF93C5FD),
    ];

    return List.generate(count, (index) {
      return CelestialStar(
        x: random.nextDouble(),
        y: random.nextDouble(),
        radius: 0.6 + random.nextDouble() * 1.6,
        speed: 1.0 + random.nextDouble() * 2.5,
        phase: random.nextDouble() * 2 * math.pi,
        color: colors[random.nextInt(colors.length)],
      );
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.isSparklingEnabled) {
      return Container(
        color: SeleneTheme.background,
        child: widget.child,
      );
    }

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return CustomPaint(
          painter: _CelestialSkyPainter(
            stars: _stars,
            progress: _controller.value,
          ),
          child: child,
        );
      },
      child: widget.child,
    );
  }
}

class _CelestialSkyPainter extends CustomPainter {
  final List<CelestialStar> stars;
  final double progress;

  _CelestialSkyPainter({
    required this.stars,
    required this.progress,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;

    // 1. Deep Space Cosmic Nebula Gradient
    final bgPaint = Paint()
      ..shader = const RadialGradient(
        center: Alignment(0.65, -0.75),
        radius: 1.2,
        colors: [
          Color(0xFF0F1A30),
          Color(0xFF090E18),
          SeleneTheme.background,
        ],
        stops: [0.0, 0.45, 1.0],
      ).createShader(rect);
    canvas.drawRect(rect, bgPaint);

    // 2. Glowing Crescent Moon in top right celestial sphere
    final moonCenter = Offset(size.width * 0.86, size.height * 0.08);
    final moonRadius = math.min(size.width, size.height) * 0.055;

    // Lunar atmospheric corona glow
    final glowPaint = Paint()
      ..color = SeleneTheme.lunarCyan.withValues(alpha: 0.06)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 24);
    canvas.drawCircle(moonCenter, moonRadius * 2.2, glowPaint);

    final innerGlowPaint = Paint()
      ..color = const Color(0xFFF1F5F9).withValues(alpha: 0.12)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 10);
    canvas.drawCircle(moonCenter, moonRadius * 1.3, innerGlowPaint);

    // Crescent Moon Shape
    final moonPath = Path()
      ..addOval(Rect.fromCircle(center: moonCenter, radius: moonRadius));
    final cutoutPath = Path()
      ..addOval(
        Rect.fromCircle(
          center: moonCenter.translate(-moonRadius * 0.38, -moonRadius * 0.15),
          radius: moonRadius * 0.95,
        ),
      );
    final crescentPath = Path.combine(PathOperation.difference, moonPath, cutoutPath);

    final crescentPaint = Paint()
      ..shader = const LinearGradient(
        colors: [Color(0xFFFFFFFF), Color(0xFFBAE6FD), Color(0xFF38BDF8)],
        begin: Alignment.topRight,
        end: Alignment.bottomLeft,
      ).createShader(Rect.fromCircle(center: moonCenter, radius: moonRadius));
    canvas.drawPath(crescentPath, crescentPaint);

    // 3. Twinkling / Sparkling Stars
    final timeAngle = progress * 2 * math.pi;

    for (final star in stars) {
      final starPos = Offset(star.x * size.width, star.y * size.height);

      // Avoid drawing right under the moon
      if ((starPos - moonCenter).distance < moonRadius * 2.0) continue;

      // Sinusoidal twinkle pulsation
      final twinkle = (math.sin(timeAngle * star.speed + star.phase) + 1.0) / 2.0;
      final alpha = 0.2 + (twinkle * 0.75);
      final currentRadius = star.radius * (0.75 + (twinkle * 0.45));

      final starPaint = Paint()
        ..color = star.color.withValues(alpha: alpha.clamp(0.0, 1.0))
        ..style = PaintingStyle.fill;

      canvas.drawCircle(starPos, currentRadius, starPaint);

      // Occasional celestial sparkle cross on brighter stars
      if (star.radius > 1.6 && twinkle > 0.7) {
        final crossPaint = Paint()
          ..color = star.color.withValues(alpha: (alpha * 0.5).clamp(0.0, 1.0))
          ..strokeWidth = 0.8
          ..style = PaintingStyle.stroke;

        final crossLen = currentRadius * 2.2;
        canvas.drawLine(
          starPos.translate(-crossLen, 0),
          starPos.translate(crossLen, 0),
          crossPaint,
        );
        canvas.drawLine(
          starPos.translate(0, -crossLen),
          starPos.translate(0, crossLen),
          crossPaint,
        );
      }
    }
  }

  @override
  bool shouldRepaint(covariant _CelestialSkyPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}
