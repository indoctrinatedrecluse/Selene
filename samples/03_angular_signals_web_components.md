# 🅰️ Angular Ivy & Signals Showcase

Selene includes full first-class live rendering for **Angular** components running through an optimized Ivy in-memory compiler with real-time template compilation, emulated view encapsulation, dependency injection, and Tailwind utility class integration!

> [!NOTE]
> **Zero Configuration & In-Memory Ivy Compilation**:
> Standard TypeScript code fences with language `angular` compile directly inside Selene's isolated Sandpack Ivy engine. You can also connect to a local Angular CLI project (`ng serve` on port `4200`) using the **Engine Switcher** at the top right.

---

## ⚡ 1. Angular Mission Control Telemetry Card

This component demonstrates reactive state binding, dynamic calculations, badge state transitions, and component-scoped CSS:

```angular
import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  template: `
    <div class="mission-card">
      <div class="card-header">
        <div class="logo-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div>
          <h3>Selene Artemis Lunar Station</h3>
          <p class="subtitle">Angular Ivy Engine • Port 4200</p>
        </div>
        <span class="status-pill" [class.active]="shieldActive">
          {{ shieldActive ? 'SHIELDS ONLINE' : 'SHIELDS OFFLINE' }}
        </span>
      </div>

      <div class="telemetry-grid">
        <div class="metric-box">
          <span class="metric-label">Orbital Velocity</span>
          <span class="metric-value">{{ velocity }} km/s</span>
        </div>
        <div class="metric-box">
          <span class="metric-label">Lunar Altitude</span>
          <span class="metric-value">{{ altitude }} km</span>
        </div>
        <div class="metric-box">
          <span class="metric-label">Reactor Core</span>
          <span class="metric-value" [style.color]="coreTemp > 90 ? '#ef4444' : '#10b981'">
            {{ coreTemp }}°C
          </span>
        </div>
      </div>

      <div class="controls-row">
        <button (click)="boostThrusters()" class="btn-primary">
          🚀 Thruster Boost (+0.5 km/s)
        </button>
        <button (click)="toggleShields()" [class.shield-btn-on]="shieldActive" class="btn-secondary">
          🛡️ {{ shieldActive ? 'Lower Shields' : 'Raise Shields' }}
        </button>
      </div>

      <div class="footer-bar">
        <span>⚡ Emulated View Encapsulation</span>
        <span>Reactive Ivy Runtime</span>
      </div>
    </div>
  `,
  styles: [`
    .mission-card {
      background: #090d16;
      border: 1px solid rgba(244, 63, 94, 0.35);
      border-radius: 1.25rem;
      padding: 1.5rem;
      color: #f1f5f9;
      max-width: 480px;
      margin: 0 auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      font-family: ui-sans-serif, system-ui, sans-serif;
    }
    .card-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
      position: relative;
    }
    .logo-badge {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.75rem;
      background: linear-gradient(135deg, #e11d48, #be123c);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 12px rgba(225, 29, 72, 0.4);
    }
    .logo-badge svg {
      width: 1.35rem;
      height: 1.35rem;
    }
    h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    .subtitle {
      margin: 0;
      font-size: 0.7rem;
      color: #fb7185;
      font-family: monospace;
    }
    .status-pill {
      margin-left: auto;
      font-size: 0.65rem;
      font-weight: 700;
      font-family: monospace;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
      transition: all 0.2s ease;
    }
    .status-pill.active {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border-color: rgba(16, 185, 129, 0.4);
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
    }
    .telemetry-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }
    .metric-box {
      background: #0f172a;
      border: 1px solid #1e293b;
      padding: 0.75rem 0.5rem;
      border-radius: 0.75rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .metric-label {
      font-size: 0.65rem;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.05em;
    }
    .metric-value {
      font-size: 1.1rem;
      font-weight: 800;
      font-family: monospace;
      color: #fff;
    }
    .controls-row {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }
    .btn-primary, .btn-secondary {
      flex: 1;
      padding: 0.6rem 0.75rem;
      border-radius: 0.625rem;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }
    .btn-primary {
      background: #e11d48;
      color: white;
      box-shadow: 0 4px 12px rgba(225, 29, 72, 0.3);
    }
    .btn-primary:hover {
      background: #f43f5e;
      transform: translateY(-1px);
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
  coreTemp = 64;
  shieldActive = true;

  boostThrusters() {
    this.velocity = +(this.velocity + 0.5).toFixed(2);
    this.altitude = +(this.altitude + 4.2).toFixed(1);
    this.coreTemp = Math.min(120, this.coreTemp + 8);
  }

  toggleShields() {
    this.shieldActive = !this.shieldActive;
    if (!this.shieldActive) {
      this.coreTemp = Math.max(40, this.coreTemp - 15);
    }
  }
}
```

---

## 🔬 2. Angular CLI Dev Server Integration

When working on a real Angular workspace:
1. Run `ng serve` in your project directory (defaults to port `4200`).
2. In Selene, switch the header **Engine Switcher** to **Project Server**.
3. Selene maps any code files matching `src/app/.../*.component.ts` to the corresponding Angular route with instant live preview.
