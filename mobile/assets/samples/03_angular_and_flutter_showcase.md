# 🎯 Angular & Flutter Cross-Platform Showcase

Experience enterprise Angular Ivy components and Flutter Web CanvasKit side-by-side inside Selene.

---

## 🅰️ 1. Angular Ivy Component (Reactive State & Scoped CSS)

```angular
import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  template: `
    <div class="card">
      <div class="header">
        <div class="icon">🌙</div>
        <div>
          <h3>Apollo Guidance Computer</h3>
          <p class="subtitle">Angular Ivy Live Preview</p>
        </div>
      </div>
      <div class="metric-row">
        <div class="metric-box">
          <div class="metric-label">Orbital Velocity</div>
          <div class="metric-value">{{ velocity }} km/s</div>
        </div>
        <div class="metric-box">
          <div class="metric-label">Lunar Altitude</div>
          <div class="metric-value">{{ altitude }} km</div>
        </div>
      </div>
      <div class="actions">
        <button class="btn-primary" (click)="boostThrusters()">Fire Thrusters</button>
        <button class="btn-secondary" [class.shield-btn-on]="shieldActive" (click)="toggleShields()">
          Shields: {{ shieldActive ? 'ENGAGED' : 'OFFLINE' }}
        </button>
      </div>
      <div class="footer-bar">
        <span>Angular 18+ Ivy Runtime</span>
        <span>Isolated Emulated Encapsulation</span>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: #090d16;
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 1rem;
      padding: 1.5rem;
      color: #fff;
      font-family: system-ui, sans-serif;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }
    .icon {
      font-size: 1.5rem;
      background: rgba(56, 189, 248, 0.15);
      border-radius: 0.5rem;
      padding: 0.25rem 0.5rem;
    }
    h3 {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: #38bdf8;
    }
    .subtitle {
      margin: 0;
      font-size: 0.75rem;
      color: #94a3b8;
    }
    .metric-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }
    .metric-box {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 0.75rem;
      padding: 0.75rem;
    }
    .metric-label {
      font-size: 0.65rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .metric-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: #f8fafc;
      font-family: monospace;
      margin-top: 0.25rem;
    }
    .actions {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    button {
      flex: 1;
      padding: 0.6rem;
      border-radius: 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .btn-primary {
      background: #0284c7;
      color: #fff;
    }
    .btn-primary:hover {
      background: #0369a1;
    }
    .btn-secondary {
      background: #1e293b;
      color: #cbd5e1;
      border: 1px solid #334155;
    }
    .btn-secondary:hover {
      background: #334155;
    }
    .btn-secondary.shield-btn-on {
      background: rgba(16, 185, 129, 0.2);
      border-color: rgba(16, 185, 129, 0.5);
      color: #34d399;
    }
    .footer-bar {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #1e293b;
      padding-top: 0.75rem;
      font-size: 0.65rem;
      color: #64748b;
      font-family: monospace;
    }
  `]
})
export class AppComponent {
  velocity = 7.68;
  altitude = 112;
  shieldActive = true;

  boostThrusters() {
    this.velocity = +(this.velocity + 0.5).toFixed(2);
    this.altitude = +(this.altitude + 4.2).toFixed(1);
  }

  toggleShields() {
    this.shieldActive = !this.shieldActive;
  }
}
```

---

## 🎯 2. Flutter & Dart Web Widget (CanvasKit WebAssembly)

```flutter
import 'package:flutter/material.dart';

void main() => runApp(const LunarStationApp());

class LunarStationApp extends StatelessWidget {
  const LunarStationApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF040711),
        colorSchemeSeed: const Color(0xFF38BDF8),
        useMaterial3: true,
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
      _batteryLevel = (_batteryLevel - 0.04).clamp(0.0, 1.0);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Selene Lunar Station', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0F172A),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
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
                      const Text('Drilled Samples', style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
                      const SizedBox(height: 4),
                      Text('$_collectedSamples', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
                    ],
                  ),
                  Container(width: 1, height: 36, color: const Color(0xFF1E293B)),
                  Column(
                    children: [
                      const Text('Battery Power', style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
                      const SizedBox(height: 4),
                      Text('${(_batteryLevel * 100).toInt()}%', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF38BDF8))),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: _batteryLevel > 0.05 ? _gatherSample : null,
              icon: const Icon(Icons.science, size: 18),
              label: Text('Gather Regolith Sample ($_collectedSamples logged)'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0284C7),
                foregroundColor: Colors.white,
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
