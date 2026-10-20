# 💨 Swift & SwiftUI Multiplatform (Zephyr Swift Canvas) Engine Showcase

Selene now features native, zero-config live render execution for **Apple Swift & SwiftUI** (`swift` and `swiftui`)! Named **Zephyr Swift Canvas**, this engine parses declarative SwiftUI view hierarchies, `@State` reactive bindings, and Apple Cupertino design system paradigms directly within Selene's polymorphic workspace.

> [!NOTE]
> ⚡ **Dual Execution Runtime**:
> 1. **In-Browser SwiftUI Canvas**: Compiles `View` bodies, `VStack`/`HStack`/`ZStack` layouts, SF Symbols, `@State` mutations, and Cupertino dark mode components with zero latency and 100% offline capability.
> 2. **Swift Server Bridge**: Connect directly to your local Swift server (or Swift Playgrounds / Vapor daemon) running on port `8080` using the engine toggle in the block header.

---

## ⚡ 1. Interactive SwiftUI Mission Telemetry Card

Below is a live SwiftUI component simulating a spacecraft telemetry monitor with Cupertino styling, SF-style vector glyphs, and reactive `@State` toggles:

```swift
import SwiftUI

struct ApolloTelemetryView: View {
    @State private var telemetryPulse = 42
    @State private var shieldsEngaged = true
    @State private var thrusterOutput = 98.4
    
    var body: some View {
        VStack(spacing: 16) {
            // Header with Apple Cupertino Aesthetic
            HStack {
                ZStack {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.cyan.opacity(0.15))
                        .frame(width: 44, height: 44)
                    Image(systemName: "wind")
                        .font(.title2)
                        .foregroundColor(.cyan)
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text("Zephyr Orbiter Core")
                        .font(.headline)
                        .foregroundColor(.white)
                    Text("SwiftUI Multiplatform • iOS / macOS")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                
                Spacer()
                
                Text("OPTIMAL")
                    .font(.caption2)
                    .fontWeight(.bold)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.green.opacity(0.2))
                    .foregroundColor(.green)
                    .cornerRadius(8)
            }
            
            Divider()
                .background(Color.gray.opacity(0.3))
            
            // Metrics Row
            HStack(spacing: 12) {
                VStack(alignment: .leading) {
                    Text("PULSE RATE")
                        .font(.caption2)
                        .foregroundColor(.gray)
                    Text("\(telemetryPulse) Hz")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.cyan)
                }
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.black.opacity(0.4))
                .cornerRadius(12)
                
                VStack(alignment: .leading) {
                    Text("THRUSTER")
                        .font(.caption2)
                        .foregroundColor(.gray)
                    Text("\(thrusterOutput)%")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.orange)
                }
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.black.opacity(0.4))
                .cornerRadius(12)
            }
            
            // Interactive Toggle Control
            Toggle("Deflector Shields Active", isOn: $shieldsEngaged)
                .font(.subheadline)
                .foregroundColor(.white)
            
            // Interactive Action Button
            Button(action: {
                telemetryPulse += 1
            }) {
                HStack {
                    Image(systemName: "bolt.fill")
                    Text("Fire Ion Telemetry Pulse")
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.cyan)
                .foregroundColor(.black)
                .font(.headline)
                .cornerRadius(12)
            }
        }
        .padding(20)
        .background(Color(red: 0.08, green: 0.10, blue: 0.15))
        .cornerRadius(20)
        .shadow(radius: 15)
    }
}
```

---

## ⚡ 2. SwiftUI Settings & Navigation Panel

Declarative UI excels in structuring clear lists and settings screens with nested controls. Here is a SwiftUI settings view demonstrating Apple-standard navigation patterns:

```swiftui
import SwiftUI

struct NavigationSettingsView: View {
    @State private var telemetryPulse = 18
    @State private var autoSync = true
    
    var body: some View {
        VStack(spacing: 12) {
            HStack {
                Image(systemName: "gearshape.fill")
                    .foregroundColor(.cyan)
                Text("Orbital Guidance Settings")
                    .font(.headline)
                    .foregroundColor(.white)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            
            VStack(spacing: 8) {
                HStack {
                    Text("Active Star Trackers")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                    Spacer()
                    Text("\(telemetryPulse) nodes")
                        .font(.subheadline)
                        .foregroundColor(.cyan)
                }
                .padding(.vertical, 4)
                
                Toggle("Autonomous Trajectory Correction", isOn: $autoSync)
                    .font(.subheadline)
                    .foregroundColor(.white)
            }
            .padding()
            .background(Color.black.opacity(0.3))
            .cornerRadius(12)
            
            Button("Calibrate Gyroscopes") {
                telemetryPulse += 2
            }
            .frame(maxWidth: .infinity)
            .padding(10)
            .background(Color.gray.opacity(0.2))
            .foregroundColor(.cyan)
            .cornerRadius(8)
        }
        .padding()
        .background(Color(red: 0.07, green: 0.09, blue: 0.13))
        .cornerRadius(16)
    }
}
```

---

## 🚀 Key SwiftUI Engine Capabilities in Selene

- **Declarative View Tree Parser**: Instant in-memory compilation of `VStack`, `HStack`, `ZStack`, and nested layouts with alignment and spacing parameters.
- **Cupertino Aesthetic**: Dark-themed Apple macOS/iOS glass styling with high-contrast typography, rounded rectangle radii, and SF-style icon mapping.
- **Interactive `@State` Simulation**: Supports mutable states and interactive button clicks / toggles directly inside the live rendered preview.
- **Device Emulation**: Switch between iPhone, iPad, and macOS desktop presets with responsive canvas scaling.
- **Universal Property Inspector**: Directly edit theme colors, radii, spacing, and titles via Selene's visual controls.
