# 🎯 Flutter & Dart Web Showcase & Hardware Engine

Selene provides a state-of-the-art **Flutter & Dart Web Rendering Engine** powered by WebAssembly and the CanvasKit / Skia graphics pipeline.

> [!TIP]
> **Cross-Platform Responsive Simulator**:
> The live Flutter frame includes a device emulator bar at the top:
> - **iPhone 15 Pro** (393 × 852)
> - **Google Pixel 8** (412 × 915)
> - **iPad Mini** (768 × 1024)
> - **Desktop Canvas** (100% Fluid)
> - **Device Orientation Toggle** (Portrait / Landscape)
> - **Local Flutter Dev Tunnel**: Connect directly to your local `flutter run -d web-server --web-port=8080` process!

---

## 📱 1. Material 3 Lunar Telemetry App

This interactive Flutter widget demonstrates Material 3 theme seeding, elevated action buttons, animated state counters, and dark celestial styling:

```flutter
import 'package:flutter/material.dart';

void main() => runApp(const SeleneLunarApp());

class SeleneLunarApp extends StatelessWidget {
  const SeleneLunarApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF070A14),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF38BDF8),
          brightness: Brightness.dark,
        ),
      ),
      home: const LunarDashboardScreen(),
    );
  }
}

class LunarDashboardScreen extends StatefulWidget {
  const LunarDashboardScreen({super.key});

  @override
  State<LunarDashboardScreen> createState() => _LunarDashboardScreenState();
}

class _LunarDashboardScreenState extends State<LunarDashboardScreen> {
  int _collectedSamples = 14;
  double _batteryLevel = 0.88;
  bool _roverDeployed = true;

  void _gatherSample() {
    setState(() {
      _collectedSamples++;
      _batteryLevel = (_batteryLevel - 0.03).clamp(0.05, 1.0);
    });
  }

  void _rechargeBattery() {
    setState(() {
      _batteryLevel = 1.0;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Selene Lunar Station',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        backgroundColor: const Color(0xFF0F172A),
        actions: [
          IconButton(
            icon: Icon(
              _roverDeployed ? Icons.radar : Icons.radar_outlined,
              color: const Color(0xFF38BDF8),
            ),
            onPressed: () {
              setState(() => _roverDeployed = !_roverDeployed);
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Status Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0x4438BDF8), width: 1.5),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x2238BDF8),
                    blurRadius: 20,
                    offset: Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: const Color(0x2238BDF8),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.nightlight_round, color: Color(0xFF38BDF8)),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: const [
                              Text(
                                'Mare Tranquillitatis',
                                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                              Text(
                                'Latitude: 0.6740° N, 23.4720° E',
                                style: TextStyle(fontSize: 10, color: Color(0xFF94A3B8), fontFamily: 'monospace'),
                              ),
                            ],
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: _roverDeployed ? const Color(0x3310B981) : const Color(0x33EF4444),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: _roverDeployed ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                          ),
                        ),
                        child: Text(
                          _roverDeployed ? 'ACTIVE' : 'STANDBY',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: _roverDeployed ? const Color(0xFF34D399) : const Color(0xFFF87171),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Solar Battery Level',
                              style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                            ),
                            const SizedBox(height: 6),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(6),
                              child: LinearProgressIndicator(
                                value: _batteryLevel,
                                minHeight: 8,
                                backgroundColor: const Color(0xFF334155),
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  _batteryLevel > 0.3 ? const Color(0xFF38BDF8) : const Color(0xFFEF4444),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 16),
                      Text(
                        '${(_batteryLevel * 100).toInt()}%',
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Stats Counter Tile
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  Column(
                    children: [
                      const Text('Regolith Samples', style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
                      const SizedBox(height: 4),
                      Text('$_collectedSamples', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
                    ],
                  ),
                  Container(width: 1, height: 36, color: const Color(0xFF1E293B)),
                  Column(
                    children: [
                      const Text('Telemetry Ping', style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
                      const SizedBox(height: 4),
                      const Text('1.28 sec', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF38BDF8))),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Action Buttons
            ElevatedButton.icon(
              onPressed: _batteryLevel > 0.05 ? _gatherSample : null,
              icon: const Icon(Icons.science, size: 18),
              label: Text('Drill Regolith Sample ($_collectedSamples logged)'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0284C7),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 10),
            OutlinedButton.icon(
              onPressed: _rechargeBattery,
              icon: const Icon(Icons.solar_power, size: 18),
              label: const Text('Align Solar Panels (Full Charge)'),
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFF38BDF8),
                side: const BorderSide(color: Color(0xFF0284C7)),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 🎨 2. Cupertino iOS Styling & Custom Canvas

Selene supports Cupertino iOS widgets and Flutter `CustomPainter` shaders. Switch presets using the selector toolbar inside the Flutter preview canvas to explore the Cupertino Settings Card and the Trigonometric Celestial Orbit painter.
