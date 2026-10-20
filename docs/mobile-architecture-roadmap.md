# 📱 Selene Mobile Architecture & Strategy Roadmap (Titan Edition)

> **Pure Native Flutter/Dart Frontend for Selene**  
> *Bringing 120Hz literate technical authoring, KaTeX mathematical proofs, polyglot syntax intelligence, and mythological lunar elegance to Android.* 🚀🌙

---

## 🏛️ Strategic Vision & Architecture (Strategy A)

Selene Mobile is engineered as a **pure native Flutter frontend** communicating directly with the existing Selene Next.js standalone container deployed on Google Cloud Run (`https://selene-h5zdysrkqa-uc.a.run.app`).

By leveraging **Strategy A (Pure Native Flutter)** rather than webview touch emulation, Selene Mobile achieves:
- **Zero Input Latency**: Native keyboard accessory docking with zero cursor jumping or soft keyboard IME clipping.
- **Hardware S-Pen & Stylus Acceleration**: Low-latency `CustomPainter` with palm rejection and stylus button detection for *Daedalus's Drawing Board*.
- **Offline Resilience**: Local-first document persistence with zero-latency instant startup.
- **Battery & Memory Optimization**: Code blocks and math are rendered as native vector/text widgets; compute-heavy engines execute on-demand.

---

## 📱 Mobile-Exclusive Superpowers

1. **📷 Camera-to-Markdown (Hermes’ Transmutation)**:
   - Capture whiteboard sketches, academic journal equations, or handwritten notes using CameraX.
   - Stream high-resolution captures directly to the Cloud Run `/api/ai/ingest` endpoint to extract structured GitHub Flavored Markdown and KaTeX math.

2. **🌙 Android Home Screen Lunar Diadem Widget**:
   - Built with Flutter's `home_widget` package.
   - Displays real-time synodic lunar phases ($29.53058867$-day cycle), illumination percentages, and classical Greek phase nomenclature (*Noumenia*, *Meniskos*, *Dichotomos*, *Amphikyrtos*, *Panselinos*) directly on the user's Android launcher.

3. **✍️ Daedalus Stylus & S-Pen Engine**:
   - Transparent vector sketching overlay above live documents.
   - Includes *Calliope’s Stylus* (Pen), *Iris’s Prismatic Highlighter*, *Apollo’s Arrow*, *Euclidean Frame*, and *Selene’s Orb*.
   - Passthrough mode allows simultaneous drawing and underlying document interaction.

4. **📲 Native Android Share Sheet Integration**:
   - Highlight text in any Android application and select *"Send to Selene"* to create a new celestial note.
   - 1-tap export of notes to Google Drive, Slack, or GitHub Gist via Cloud Run (`/api/share`).

5. **⏳ Chronos Epoch Timeline & Time-Warp**:
   - Milestone tagging before refactors.
   - Offline revision snapshot tree with safe 1-tap rollbacks.

6. **🔮 The Delphic Oracle AI Copilot**:
   - Mobile-first bottom sheet providing inline prose continuation, proof explanations, and AST code auto-repair connecting to `/api/ai/complete` and `/api/ai/fix`.

---

## 📂 Mobile Project Layout (`mobile/`)

```
mobile/
├── pubspec.yaml                       # Flutter 3.47+ dependencies
├── lib/
│   ├── main.dart                      # App entry point & ChangeNotifierProvider setup
│   ├── data/
│   │   ├── models/
│   │   │   └── document_model.dart    # Document & Epoch JSON data models
│   │   ├── repositories/
│   │   │   └── document_repository.dart # Local SharedPreferences & Seed data
│   │   └── services/
│   │       ├── lunar_service.dart     # Astronomical synodic orbit calculator
│   │       └── selene_api_client.dart # Cloud Run HTTP client with HMAC attestation
│   └── ui/
│       ├── core/
│       │   └── theme.dart             # Selene Midnight Obsidian & Celestial palette
│       └── features/
│           ├── editor/
│           │   ├── views/
│           │   │   └── editor_screen.dart # Main workspace with Scriptorium drawer
│           │   └── widgets/
│           │       ├── keyboard_accessory_bar.dart # Sticky formatting dock
│           │       └── markdown_canvas.dart # KaTeX + Syntax highlighted viewer
│           ├── canvas/
│           │   └── whiteboard_overlay.dart # Daedalus vector drawing overlay
│           ├── lunar/
│           │   └── lunar_diadem_widget.dart # Moon phase AppBar widget & Orphic hymns
│           ├── oracle/
│           │   └── delphic_oracle_sheet.dart # AI copilot bottom sheet
│           ├── timeline/
│           │   └── chronos_timeline_sheet.dart # Revision history & restore
│           └── wisdom/
│               └── athena_wisdom_sheet.dart # Olympian tips & specimen snippets
└── test/
    └── widget_test.dart               # Automated Flutter widget smoke tests
```

---

## 🔒 Backend Attestation & Security

The Flutter mobile client adheres to the Next.js `middleware.ts` cryptographic gatekeeper:
- **`X-Selene-App-ID`**: `selene-mobile-client`
- **`X-Selene-Timestamp`**: Epoch milliseconds
- **`X-Selene-HWID`**: Unique Android hardware identifier
- **`X-Selene-Signature`**: `HMAC-SHA256(timestamp + ":" + path + ":" + hwid, secret)`
- **`X-Selene-License-Token`**: `TRIAL-ACTIVE-MOBILE-SEAT`

---

## 🚀 Running & Testing Selene Mobile

```bash
# Navigate to mobile project directory
cd mobile

# Verify code health with Dart static analyzer
flutter analyze

# Execute automated widget test suite
flutter test

# Run on connected Android device or emulator
flutter run
```
