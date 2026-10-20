import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';
import '../models/document_model.dart';
import '../services/selene_api_client.dart';

class DocumentRepository extends ChangeNotifier {
  final SeleneApiClient apiClient;
  static const String _storageKey = 'selene_mobile_documents_v1';
  final _uuid = const Uuid();

  List<DocumentModel> _documents = [];
  String? _selectedDocumentId;
  bool _isLoading = true;

  DocumentRepository({required this.apiClient}) {
    loadDocuments();
  }

  List<DocumentModel> get documents => List.unmodifiable(_documents);
  bool get isLoading => _isLoading;
  String? get selectedDocumentId => _selectedDocumentId;

  DocumentModel? get activeDocument {
    if (_documents.isEmpty) return null;
    if (_selectedDocumentId == null) return _documents.first;
    try {
      return _documents.firstWhere((d) => d.id == _selectedDocumentId);
    } catch (_) {
      return _documents.first;
    }
  }

  Future<void> loadDocuments() async {
    _isLoading = true;
    notifyListeners();

    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_storageKey);

    if (raw != null && raw.isNotEmpty) {
      try {
        final list = (json.decode(raw) as List)
            .map((item) => DocumentModel.fromJson(item as Map<String, dynamic>))
            .toList();
        _documents = list;
      } catch (e) {
        debugPrint('Error decoding documents from storage: $e');
        _documents = _getSeedDocuments();
      }
    } else {
      _documents = _getSeedDocuments();
      await _persistToDisk();
    }

    if (_documents.isNotEmpty && _selectedDocumentId == null) {
      _selectedDocumentId = _documents.first.id;
    }

    _isLoading = false;
    notifyListeners();
  }

  void selectDocument(String id) {
    if (_selectedDocumentId != id) {
      _selectedDocumentId = id;
      notifyListeners();
    }
  }

  Future<DocumentModel> createDocument({String? title, String? initialContent}) async {
    final now = DateTime.now();
    final newDoc = DocumentModel(
      id: _uuid.v4(),
      title: title ?? 'Untitled Celestial Note',
      content: initialContent ?? '# 🌙 New Celestial Note\n\nBegin writing technical prose, equations, or code blocks here.\n',
      updatedAt: now,
      createdAt: now,
    );

    _documents.insert(0, newDoc);
    _selectedDocumentId = newDoc.id;
    await _persistToDisk();
    notifyListeners();
    return newDoc;
  }

  Future<void> updateActiveDocumentContent(String newContent) async {
    final doc = activeDocument;
    if (doc == null) return;

    doc.content = newContent;
    doc.updatedAt = DateTime.now();

    // Check if title should be updated from first markdown heading
    final lines = newContent.split('\n');
    for (final line in lines) {
      final trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        final candidate = trimmed.substring(2).trim();
        if (candidate.isNotEmpty) {
          doc.title = candidate;
        }
        break;
      }
    }

    await _persistToDisk();
    notifyListeners();
  }

  Future<void> recordEpochSnapshot(String label) async {
    final doc = activeDocument;
    if (doc == null) return;

    final epoch = DocumentEpoch(
      id: _uuid.v4(),
      label: label,
      contentSnapshot: doc.content,
      timestamp: DateTime.now(),
    );

    doc.epochs.insert(0, epoch);
    if (doc.epochs.length > 50) {
      doc.epochs = doc.epochs.sublist(0, 50); // limit to last 50 epochs
    }

    await _persistToDisk();
    notifyListeners();
  }

  Future<void> restoreEpoch(DocumentEpoch epoch) async {
    final doc = activeDocument;
    if (doc == null) return;

    // Create a safety checkpoint before rollback
    await recordEpochSnapshot('[Pre-Rollback Safety Checkpoint]');

    doc.content = epoch.contentSnapshot;
    doc.updatedAt = DateTime.now();
    await _persistToDisk();
    notifyListeners();
  }

  Future<void> deleteDocument(String id) async {
    _documents.removeWhere((d) => d.id == id);
    if (_selectedDocumentId == id) {
      _selectedDocumentId = _documents.isNotEmpty ? _documents.first.id : null;
    }
    await _persistToDisk();
    notifyListeners();
  }

  Future<void> _persistToDisk() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = json.encode(_documents.map((d) => d.toJson()).toList());
    await prefs.setString(_storageKey, jsonString);
  }

  List<DocumentModel> _getSeedDocuments() {
    final now = DateTime.now();
    return [
      DocumentModel(
        id: 'seed-01-architecture',
        title: '🌙 Selene Mobile Technical Canvas',
        content: r'''# 🌙 Selene Mobile Technical Canvas

> *Where literate technical writing meets native mobile gestures, mathematical proofs, and collaborative intelligence.* 🚀✨

Welcome to **Selene Mobile (Titan Edition)** — the pure native Flutter companion to Selene Desktop.

---

## 🧮 Mathematical Proofs (KaTeX Engine)

Inline formulas like \$E = mc^2\$ or \$e^{i\\pi} + 1 = 0\$ render with crisp typography.

$$\\oint_{\\partial \\Sigma} \\mathbf{B} \\cdot d\\boldsymbol{\\ell} = \\mu_0 \\left( I_{\\text{enc}} + \\varepsilon_0 \\frac{d\\Phi_E}{dt} \\right)$$

$$\\mathcal{L} = \\frac{1}{2} m \\dot{x}^2 - V(x) \\implies \\frac{d}{dt}\\left(\\frac{\\partial \\mathcal{L}}{\\partial \\dot{x}}\\right) - \\frac{\\partial \\mathcal{L}}{\\partial x} = 0$$

---

## 💻 Polyglot Syntax Intelligence

```python
# 🐍 Python Scientific Orbit Simulation
import numpy as np

def calculate_lunar_transfer(v_init, r_orbit):
    mu_earth = 398600.4418  # km^3/s^2
    energy = (v_init**2) / 2 - (mu_earth / r_orbit)
    semi_major = -mu_earth / (2 * energy)
    return semi_major

print(f"Semi-Major Axis: {calculate_lunar_transfer(10.9, 6678.0):.2f} km")
```

```dart
// 💙 Flutter Material 3 Component
class LunarBeacon extends StatelessWidget {
  const LunarBeacon({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF38BDF8), width: 1.5),
      ),
      padding: const EdgeInsets.all(16),
      child: const Text('✨ Selene Celestial Beacon Active', style: TextStyle(color: Colors.white)),
    );
  }
}
```

---

## 📋 Markdown Tables & Task Lists

| Module | Engine | Native Status |
|---|---|---|
| **Canvas** | TipTap AST & Markdown | ⚡ 120Hz Mobile Native |
| **Math** | KaTeX vector typesetting | ✓ Embedded & Offline |
| **Whiteboard** | Daedalus Vector Overlay | 🎨 Touch & S-Pen Ready |
| **Lunar Tracker** | Synodic Orbit Calculator | 🌙 29.53-Day Ephemeris |

- [x] Symmetrical touch layouts with zero jitter
- [x] Sticky keyboard formatting accessory bar
- [x] High-precision astronomical synodic moon phase
- [ ] Camera paper-to-canvas Hermes scan
''',
        updatedAt: now,
        createdAt: now,
        tags: ['Architecture', 'Specification', 'Mobile'],
      ),
      DocumentModel(
        id: 'seed-02-formulas',
        title: '📐 Quantum Mechanics & Field Equations',
        content: r'''# 📐 Quantum Mechanics & Field Equations

### The Time-Dependent Schrödinger Equation:
$$i\\hbar \\frac{\\partial}{\\partial t} \\Psi(\\mathbf{r}, t) = \\left[ -\\frac{\\hbar^2}{2m} \\nabla^2 + V(\\mathbf{r}, t) \\right] \\Psi(\\mathbf{r}, t)$$

### Einstein Field Equations of General Relativity:
$$R_{\\mu\\nu} - \\frac{1}{2} R g_{\\mu\\nu} + \\Lambda g_{\\mu\\nu} = \\frac{8\\pi G}{c^4} T_{\\mu\\nu}$$

### Maxwell-Heaviside Tensor Formulation:
$$\\partial_\\mu F^{\\mu\\nu} = \\mu_0 J^\\nu, \\quad \\partial_\\mu \\tilde{F}^{\\mu\\nu} = 0$$
''',
        updatedAt: now.subtract(const Duration(hours: 3)),
        createdAt: now.subtract(const Duration(hours: 3)),
        tags: ['Physics', 'KaTeX', 'Mathematics'],
      ),
    ];
  }
}
