`# 🎯 Flutter & Dart Web Showcase & Hardware Engine

Selene provides a state-of-the-art **Flutter & Dart Web Rendering Engine** powered by WebAssembly and the CanvasKit / Skia graphics pipeline.

> [!TIP]
> **Cross-Platform Responsive Simulator**:
> The live Flutter frame includes a device emulator bar at the top:
> - **iPhone 15 Pro** (393 × 852)
> - **Google Pixel 8** (412 × 915)
> - **iPad Mini** (768 × 1024)
> - **Desktop Canvas** (100% Fluid)
> - **Device Orientation Toggle** (Portrait / Landscape)
> - **Local Flutter Dev Tunnel**: Connect directly to your local \`flutter run -d web-server --web-port=8080\` process!

---

## 📱 1. Material 3 Lunar Telemetry App

This interactive Flutter widget demonstrates Material 3 theme seeding, elevated action buttons, animated state counters, and dark celestial styling:

\`\`\`flutter
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