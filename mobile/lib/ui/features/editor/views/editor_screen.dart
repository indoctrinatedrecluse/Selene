import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:selene_mobile/data/repositories/document_repository.dart';
import 'package:selene_mobile/data/services/license_service.dart';
import 'package:selene_mobile/data/services/sample_service.dart';
import 'package:selene_mobile/ui/core/theme.dart';
import 'package:selene_mobile/ui/features/canvas/celestial_background.dart';
import 'package:selene_mobile/ui/features/canvas/whiteboard_overlay.dart';
import 'package:selene_mobile/ui/features/licensing/license_sheet.dart';
import 'package:selene_mobile/ui/features/lunar/lunar_diadem_widget.dart';
import 'package:selene_mobile/ui/features/oracle/delphic_oracle_sheet.dart';
import 'package:selene_mobile/ui/features/timeline/chronos_timeline_sheet.dart';
import 'package:selene_mobile/ui/features/wisdom/athena_wisdom_sheet.dart';
import 'package:selene_mobile/ui/features/audio/apollos_lyre_sheet.dart';
import 'package:selene_mobile/ui/features/collaboration/orbit_link_sheet.dart';
import 'package:selene_mobile/ui/features/export/hermes_courier_sheet.dart';
import 'package:selene_mobile/ui/features/mesh/mnemosyne_mesh_sheet.dart';
import 'package:selene_mobile/ui/features/oracle/athena_neural_copilot_sheet.dart';
import 'package:selene_mobile/ui/features/editor/widgets/keyboard_accessory_bar.dart';
import 'package:selene_mobile/ui/features/editor/widgets/markdown_canvas.dart';

enum CanvasViewMode { preview, edit, split }

class EditorScreen extends StatefulWidget {
  const EditorScreen({super.key});

  @override
  State<EditorScreen> createState() => _EditorScreenState();
}

class _EditorScreenState extends State<EditorScreen> with WidgetsBindingObserver {
  final TextEditingController _textController = TextEditingController();
  CanvasViewMode _viewMode = CanvasViewMode.preview;
  bool _isWhiteboardActive = false;
  bool _sparklesEnabled = true;
  String? _loadedDocId;

  Timer? _autoSaveDebounceTimer;
  Timer? _periodicAutoSaveTimer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _textController.addListener(_onTextChanged);

    // Periodic auto-save heartbeat every 5 seconds
    _periodicAutoSaveTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (mounted) {
        _flushActiveDocument();
      }
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _autoSaveDebounceTimer?.cancel();
    _periodicAutoSaveTimer?.cancel();
    _textController.removeListener(_onTextChanged);
    _textController.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // Automatically save document whenever app loses focus, is minimized, or closed
    if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.inactive ||
        state == AppLifecycleState.detached ||
        state == AppLifecycleState.hidden) {
      _flushActiveDocument();
    }
  }

  void _flushActiveDocument() {
    final repo = context.read<DocumentRepository>();
    final doc = repo.activeDocument;
    if (doc != null && doc.content != _textController.text) {
      repo.updateActiveDocumentContent(_textController.text);
    } else {
      repo.flushToDisk();
    }
  }

  void _onTextChanged() {
    final repo = context.read<DocumentRepository>();
    final doc = repo.activeDocument;
    if (doc != null && doc.content != _textController.text) {
      doc.content = _textController.text;
      doc.updatedAt = DateTime.now();

      // Debounced auto-save 700ms after user pauses typing
      _autoSaveDebounceTimer?.cancel();
      _autoSaveDebounceTimer = Timer(const Duration(milliseconds: 700), () {
        repo.updateActiveDocumentContent(_textController.text);
      });
    }
  }

  void _syncControllerWithActiveDoc() {
    final repo = context.read<DocumentRepository>();
    final doc = repo.activeDocument;
    if (doc != null && doc.id != _loadedDocId) {
      _loadedDocId = doc.id;
      _textController.text = doc.content;
    }
  }

  void _showOracleSheet() {
    final repo = context.read<DocumentRepository>();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => DelphicOracleSheet(
        apiClient: repo.apiClient,
        activeContext: _textController.text,
        onInsertResult: (text) {
          final current = _textController.text;
          _textController.text = '$current\n\n$text\n';
          _flushActiveDocument();
        },
      ),
    );
  }

  void _showTimelineSheet() {
    final repo = context.read<DocumentRepository>();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => ChronosTimelineSheet(repository: repo),
    ).then((_) {
      final doc = repo.activeDocument;
      if (doc != null) {
        _textController.text = doc.content;
      }
    });
  }

  void _showWisdomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => const AthenaWisdomSheet(),
    );
  }

  void _showAthenaCopilotSheet() {
    final repo = context.read<DocumentRepository>();
    AthenaNeuralCopilotSheet.show(
      context,
      apiClient: repo.apiClient,
      activeContext: _textController.text,
      onInsert: (text) {
        final current = _textController.text;
        _textController.text = '$current\n\n$text\n';
        _flushActiveDocument();
      },
    );
  }

  void _showOrbitLinkSheet() {
    final doc = context.read<DocumentRepository>().activeDocument;
    OrbitLinkSheet.show(
      context,
      activeDocTitle: doc?.title ?? 'Selene Scroll',
      activeDocContent: _textController.text,
      onSyncContent: (newContent) {
        _textController.text = newContent;
        _flushActiveDocument();
      },
    );
  }

  void _showHermesCourierSheet() {
    final repo = context.read<DocumentRepository>();
    final doc = repo.activeDocument;
    if (doc == null) return;
    HermesCourierSheet.show(context, doc, repo);
  }

  void _showMnemosyneMeshSheet() {
    final repo = context.read<DocumentRepository>();
    MnemosyneMeshSheet.show(
      context,
      repository: repo,
      onSelectDocument: (docId, title, content) async {
        setState(() {
          _loadedDocId = docId;
          _textController.text = content;
        });
        await repo.openOrImportSample(docId, title, content);
      },
      onInsertTransclusion: (wikilink) {
        final current = _textController.text;
        _textController.text = '$current\n\n$wikilink\n';
        _flushActiveDocument();
      },
    );
  }

  void _showApollosLyreSheet() {
    ApollosLyreSheet.show(
      context,
      activeContext: _textController.text,
    );
  }

  void _showLoreDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: SeleneTheme.surfaceElevated,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: SeleneTheme.goldAccent),
        ),
        title: const Row(
          children: [
            Text('🏛️', style: TextStyle(fontSize: 20)),
            SizedBox(width: 8),
            Text('Titan Lore: Σελήνη', style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 16)),
          ],
        ),
        content: const SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'In ancient Greek cosmology, Selene (Σελήνη) is the archaic Titaness and personification of the Moon, daughter of the Titans Hyperion and Theia, and sister to Helios (the Sun) and Eos (the Dawn).',
                style: TextStyle(color: SeleneTheme.textSecondary, fontSize: 13, height: 1.45),
              ),
              SizedBox(height: 10),
              Text(
                'She drives her luminous silver chariot across the nocturnal skies, crowning darkness with serene optical clarity. Selene Mobile embodies this ethos: bringing celestial typography, mathematical precision, and live sandboxes to your fingertips.',
                style: TextStyle(color: SeleneTheme.textSecondary, fontSize: 13, height: 1.45),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Glory to Selene', style: TextStyle(color: SeleneTheme.goldAccent)),
          ),
        ],
      ),
    );
  }

  void _showLicenseSheet({bool isDismissible = true}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      isDismissible: isDismissible,
      enableDrag: isDismissible,
      builder: (context) => LicenseSheet(isDismissible: isDismissible),
    );
  }

  Future<void> _shareCloudGist() async {
    final repo = context.read<DocumentRepository>();
    final doc = repo.activeDocument;
    if (doc == null) return;

    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Transmuting document to Selene Cloud Gist...'),
        duration: Duration(milliseconds: 900),
        behavior: SnackBarBehavior.floating,
      ),
    );

    final url = await repo.apiClient.createCloudShareGist(doc);
    if (!mounted) return;

    if (url != null) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: SeleneTheme.surfaceElevated,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: SeleneTheme.lunarCyan),
          ),
          title: const Row(
            children: [
              Text('☁️', style: TextStyle(fontSize: 18)),
              SizedBox(width: 8),
              Text('Cloud Gist Published', style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 16)),
            ],
          ),
          content: SelectableText(
            url,
            style: const TextStyle(color: SeleneTheme.lunarCyan, fontSize: 13),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Close'),
            ),
          ],
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Published locally. Connect to network for Cloud Run sync.'),
          duration: Duration(seconds: 2),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  Future<void> _handleLoadSample(SampleItem sample) async {
    final repo = context.read<DocumentRepository>();

    // 1. Auto-save any active edits before loading
    _flushActiveDocument();

    // 2. Dismiss drawer
    Navigator.pop(context);

    // 3. Clear any existing snackbars immediately
    ScaffoldMessenger.of(context).clearSnackBars();

    // 4. Instant sample load from embedded cache (0ms)
    final content = await SampleService.loadSampleContent(sample);

    // 5. Update UI immediately
    setState(() {
      _loadedDocId = sample.id;
      _textController.text = content;
    });

    // 6. Save in document repository
    await repo.openOrImportSample(sample.id, '${sample.icon} ${sample.title}', content);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✨ Loaded ${sample.title}'),
          duration: const Duration(milliseconds: 700),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final repo = context.watch<DocumentRepository>();
    final licenseService = context.watch<LicenseService>();
    final licenseStatus = licenseService.currentStatus;

    if (licenseStatus.isLocked) {
      return _buildLockedLicenseScreen(licenseStatus);
    }

    _syncControllerWithActiveDoc();
    final activeDoc = repo.activeDocument;
    final isTablet = MediaQuery.of(context).size.width > 768;

    return Scaffold(
      appBar: AppBar(
        leading: Builder(
          builder: (ctx) => IconButton(
            icon: const Icon(Icons.menu, color: SeleneTheme.lunarCyan, size: 24),
            tooltip: 'Open Scriptorium',
            onPressed: () => Scaffold.of(ctx).openDrawer(),
          ),
        ),
        title: Row(
          children: [
            const Text('🌙', style: TextStyle(fontSize: 16)),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                activeDoc?.title ?? 'Selene',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        actions: [
          const LunarDiademWidget(),
          IconButton(
            icon: const Icon(Icons.lightbulb_outline, size: 20, color: SeleneTheme.goldAccent),
            tooltip: "Athena's Wisdom",
            onPressed: _showWisdomSheet,
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert, size: 20, color: SeleneTheme.textSecondary),
            color: SeleneTheme.surfaceElevated,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: const BorderSide(color: SeleneTheme.border),
            ),
            onSelected: (val) {
              if (val == 'license') _showLicenseSheet();
              if (val == 'orbit') _showOrbitLinkSheet();
              if (val == 'hermes') _showHermesCourierSheet();
              if (val == 'athena') _showAthenaCopilotSheet();
              if (val == 'mesh') _showMnemosyneMeshSheet();
              if (val == 'lyre') _showApollosLyreSheet();
              if (val == 'chronos') _showTimelineSheet();
              if (val == 'share') _shareCloudGist();
              if (val == 'sparkle') setState(() => _sparklesEnabled = !_sparklesEnabled);
              if (val == 'wisdom') _showWisdomSheet();
              if (val == 'lore') _showLoreDialog();
            },
            itemBuilder: (ctx) => [
              PopupMenuItem(
                value: 'license',
                child: Row(
                  children: [
                    Icon(
                      Icons.shield,
                      size: 16,
                      color: licenseStatus.status == 'active' ? SeleneTheme.emeraldSuccess : SeleneTheme.goldAccent,
                    ),
                    const SizedBox(width: 10),
                    Text(
                      licenseStatus.type == LicenseTier.trial
                          ? 'License: ${licenseStatus.daysRemaining}D Trial'
                          : 'License: ${licenseStatus.type.name.toUpperCase()}',
                      style: const TextStyle(fontSize: 13, color: SeleneTheme.textPrimary),
                    ),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'orbit',
                child: Row(
                  children: [
                    Icon(Icons.hub_outlined, size: 16, color: SeleneTheme.lunarCyan),
                    SizedBox(width: 10),
                    Text('Orbit Link P2P Sync', style: TextStyle(fontSize: 13, color: SeleneTheme.textPrimary)),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'hermes',
                child: Row(
                  children: [
                    Icon(Icons.send_to_mobile, size: 16, color: SeleneTheme.goldAccent),
                    SizedBox(width: 10),
                    Text('Hermes Courier Exporter', style: TextStyle(fontSize: 13, color: SeleneTheme.textPrimary)),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'athena',
                child: Row(
                  children: [
                    Icon(Icons.psychology_outlined, size: 16, color: SeleneTheme.purpleMystic),
                    SizedBox(width: 10),
                    Text("Athena's Neural Co-Pilot", style: TextStyle(fontSize: 13, color: SeleneTheme.textPrimary)),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'mesh',
                child: Row(
                  children: [
                    Icon(Icons.auto_stories, size: 16, color: SeleneTheme.lunarCyan),
                    SizedBox(width: 10),
                    Text('Mnemosyne Knowledge Mesh', style: TextStyle(fontSize: 13, color: SeleneTheme.textPrimary)),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'lyre',
                child: Row(
                  children: [
                    Icon(Icons.music_note_outlined, size: 16, color: SeleneTheme.goldAccent),
                    SizedBox(width: 10),
                    Text("Apollo's Lyre & Sonifier", style: TextStyle(fontSize: 13, color: SeleneTheme.textPrimary)),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'chronos',
                child: Row(
                  children: [
                    Icon(Icons.history, size: 16, color: SeleneTheme.lunarCyan),
                    SizedBox(width: 10),
                    Text('Chronos Timeline', style: TextStyle(fontSize: 13, color: SeleneTheme.textPrimary)),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'share',
                child: Row(
                  children: [
                    Icon(Icons.cloud_upload_outlined, size: 16, color: SeleneTheme.lunarCyan),
                    SizedBox(width: 10),
                    Text('Publish Cloud Gist', style: TextStyle(fontSize: 13, color: SeleneTheme.textPrimary)),
                  ],
                ),
              ),
              PopupMenuItem(
                value: 'sparkle',
                child: Row(
                  children: [
                    Icon(
                      Icons.auto_awesome,
                      size: 16,
                      color: _sparklesEnabled ? SeleneTheme.goldAccent : SeleneTheme.textMuted,
                    ),
                    const SizedBox(width: 10),
                    Text(
                      _sparklesEnabled ? 'Disable Starry Canvas' : 'Enable Starry Canvas',
                      style: const TextStyle(fontSize: 13, color: SeleneTheme.textPrimary),
                    ),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'lore',
                child: Row(
                  children: [
                    Icon(Icons.account_balance, size: 16, color: SeleneTheme.goldAccent),
                    SizedBox(width: 10),
                    Text('Titan Lore: Σελήνη', style: TextStyle(fontSize: 13, color: SeleneTheme.textPrimary)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(width: 4),
        ],
      ),
      drawer: _buildScriptoriumDrawer(repo, licenseStatus),
      body: Stack(
        children: [
          // 1. Isolated Starry Background Layer (zero impact on foreground text/scroll)
          Positioned.fill(
            child: CelestialCanvasBackground(
              isSparklingEnabled: _sparklesEnabled,
            ),
          ),

          // 2. Foreground Interactive Interface
          Positioned.fill(
            child: Column(
              children: [
                // Mode switcher bar
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  decoration: const BoxDecoration(
                    color: SeleneTheme.surface,
                    border: Border(bottom: BorderSide(color: SeleneTheme.border)),
                  ),
                  child: Row(
                    children: [
                      SegmentedButton<CanvasViewMode>(
                        segments: [
                          const ButtonSegment(
                            value: CanvasViewMode.preview,
                            label: Text('Rendered'),
                            icon: Icon(Icons.remove_red_eye_outlined, size: 16),
                          ),
                          const ButtonSegment(
                            value: CanvasViewMode.edit,
                            label: Text('Markdown'),
                            icon: Icon(Icons.edit_note, size: 16),
                          ),
                          if (isTablet)
                            const ButtonSegment(
                              value: CanvasViewMode.split,
                              label: Text('Dual Split'),
                              icon: Icon(Icons.vertical_split, size: 16),
                            ),
                        ],
                        selected: {_viewMode},
                        onSelectionChanged: (newSelection) {
                          setState(() => _viewMode = newSelection.first);
                        },
                        style: SegmentedButton.styleFrom(
                          backgroundColor: SeleneTheme.surfaceElevated,
                          selectedBackgroundColor: SeleneTheme.lunarCyan.withValues(alpha: 0.2),
                          selectedForegroundColor: SeleneTheme.lunarCyan,
                          foregroundColor: SeleneTheme.textSecondary,
                          textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                          visualDensity: VisualDensity.compact,
                        ),
                      ),
                      const Spacer(),
                      IconButton(
                        icon: const Icon(Icons.psychology_outlined, color: SeleneTheme.purpleMystic, size: 20),
                        tooltip: "Athena's Neural Co-Pilot",
                        onPressed: _showAthenaCopilotSheet,
                      ),
                      IconButton(
                        icon: const Icon(Icons.hub_outlined, color: SeleneTheme.lunarCyan, size: 20),
                        tooltip: 'Mnemosyne Knowledge Mesh',
                        onPressed: _showMnemosyneMeshSheet,
                      ),
                      IconButton(
                        icon: const Icon(Icons.music_note_outlined, color: SeleneTheme.goldAccent, size: 20),
                        tooltip: "Apollo's Lyre & Data Sonifier",
                        onPressed: _showApollosLyreSheet,
                      ),
                      IconButton(
                        icon: Icon(
                          _isWhiteboardActive ? Icons.brush : Icons.brush_outlined,
                          color: _isWhiteboardActive ? SeleneTheme.goldAccent : SeleneTheme.textSecondary,
                          size: 20,
                        ),
                        tooltip: "Daedalus's Drawing Board",
                        onPressed: () {
                          setState(() => _isWhiteboardActive = !_isWhiteboardActive);
                        },
                      ),
                      IconButton(
                        icon: const Icon(Icons.auto_awesome, color: SeleneTheme.purpleMystic, size: 20),
                        tooltip: 'The Delphic Oracle',
                        onPressed: _showOracleSheet,
                      ),
                    ],
                  ),
                ),

                // Main Canvas Area
                Expanded(
                  child: _buildMainView(isTablet),
                ),

                // Keyboard accessory in edit mode
                if (_viewMode == CanvasViewMode.edit)
                  KeyboardAccessoryBar(controller: _textController),
              ],
            ),
          ),

          // 3. Floating Whiteboard Overlay
          if (_isWhiteboardActive)
            Positioned.fill(
              child: WhiteboardOverlay(
                onClose: () => setState(() => _isWhiteboardActive = false),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildLockedLicenseScreen(LicenseStatus status) {
    return Scaffold(
      backgroundColor: SeleneTheme.background,
      body: Center(
        child: Container(
          padding: const EdgeInsets.all(28),
          margin: const EdgeInsets.symmetric(horizontal: 20),
          decoration: BoxDecoration(
            color: SeleneTheme.surfaceElevated,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: SeleneTheme.goldAccent.withValues(alpha: 0.4)),
            boxShadow: [
              BoxShadow(
                color: SeleneTheme.goldAccent.withValues(alpha: 0.1),
                blurRadius: 30,
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: SeleneTheme.goldAccent.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                  border: Border.all(color: SeleneTheme.goldAccent.withValues(alpha: 0.4)),
                ),
                child: const Text('🛡️', style: TextStyle(fontSize: 36)),
              ),
              const SizedBox(height: 18),
              const Text(
                'Selene License Time-Lock',
                style: TextStyle(
                  color: SeleneTheme.textPrimary,
                  fontSize: 19,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                status.message,
                textAlign: TextAlign.center,
                style: const TextStyle(color: SeleneTheme.textSecondary, fontSize: 13, height: 1.45),
              ),
              if (status.tamperReason != null) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: SeleneTheme.roseDanger.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: SeleneTheme.roseDanger.withValues(alpha: 0.4)),
                  ),
                  child: Text(
                    status.tamperReason!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: SeleneTheme.roseDanger, fontSize: 12),
                  ),
                ),
              ],
              const SizedBox(height: 20),
              ElevatedButton.icon(
                icon: const Icon(Icons.key, size: 16),
                label: const Text('Activate Commercial License'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: SeleneTheme.goldAccent,
                  foregroundColor: SeleneTheme.background,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () => _showLicenseSheet(isDismissible: false),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMainView(bool isTablet) {
    switch (_viewMode) {
      case CanvasViewMode.preview:
        return MarkdownCanvas(content: _textController.text);
      case CanvasViewMode.edit:
        return _buildRawEditor();
      case CanvasViewMode.split:
        return Row(
          children: [
            Expanded(child: MarkdownCanvas(content: _textController.text)),
            const VerticalDivider(width: 1, color: SeleneTheme.border),
            Expanded(child: _buildRawEditor()),
          ],
        );
    }
  }

  Widget _buildRawEditor() {
    return Container(
      color: Colors.transparent,
      child: TextField(
        controller: _textController,
        maxLines: null,
        expands: true,
        keyboardType: TextInputType.multiline,
        style: const TextStyle(
          fontFamily: 'monospace',
          fontSize: 14,
          height: 1.5,
          color: SeleneTheme.textPrimary,
        ),
        decoration: const InputDecoration(
          hintText: 'Compose your technical prose, equations, and code blocks...',
          hintStyle: TextStyle(color: SeleneTheme.textMuted),
          contentPadding: EdgeInsets.all(16),
          border: InputBorder.none,
        ),
      ),
    );
  }

  Widget _buildScriptoriumDrawer(DocumentRepository repo, LicenseStatus licenseStatus) {
    return Drawer(
      backgroundColor: SeleneTheme.surfaceElevated,
      child: SafeArea(
        child: Column(
          children: [
            // Scriptorium Header
            Container(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 12),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: SeleneTheme.border)),
              ),
              child: Row(
                children: [
                  const Text('📜', style: TextStyle(fontSize: 22)),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Scriptorium of Selene',
                          style: TextStyle(
                            color: SeleneTheme.textPrimary,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'Local Vault & Sacred Scrolls',
                          style: TextStyle(color: SeleneTheme.textMuted, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.note_add_outlined, color: SeleneTheme.lunarCyan, size: 22),
                    tooltip: 'New Scroll',
                    onPressed: () {
                      _flushActiveDocument();
                      repo.createDocument();
                      Navigator.pop(context);
                    },
                  ),
                ],
              ),
            ),

            // License Status Banner in Drawer
            InkWell(
              onTap: () {
                Navigator.pop(context);
                _showLicenseSheet();
              },
              child: Container(
                margin: const EdgeInsets.fromLTRB(12, 10, 12, 6),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: licenseStatus.status == 'active'
                      ? SeleneTheme.emeraldSuccess.withValues(alpha: 0.12)
                      : SeleneTheme.goldAccent.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: licenseStatus.status == 'active'
                        ? SeleneTheme.emeraldSuccess.withValues(alpha: 0.35)
                        : SeleneTheme.goldAccent.withValues(alpha: 0.35),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.shield,
                      size: 16,
                      color: licenseStatus.status == 'active' ? SeleneTheme.emeraldSuccess : SeleneTheme.goldAccent,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            licenseStatus.type == LicenseTier.trial
                                ? 'TITAN TRIAL • ${licenseStatus.daysRemaining} DAYS REMAINING'
                                : '${licenseStatus.type.name.toUpperCase()} LICENSE ACTIVE',
                            style: TextStyle(
                              color: licenseStatus.status == 'active' ? SeleneTheme.emeraldSuccess : SeleneTheme.goldAccent,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            licenseStatus.maskedKey,
                            style: const TextStyle(color: SeleneTheme.textMuted, fontSize: 10, fontFamily: 'monospace'),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: SeleneTheme.surface,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text('Manage', style: TextStyle(color: SeleneTheme.textSecondary, fontSize: 10.5)),
                    ),
                  ],
                ),
              ),
            ),

            // Scrollable Drawer Sections
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 4),
                children: [
                  // SECTION 1: Active Workspace Scrolls
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                    child: Row(
                      children: [
                        const Text(
                          'MY SCROLLS & NOTES',
                          style: TextStyle(
                            color: SeleneTheme.textMuted,
                            fontSize: 10.5,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.8,
                          ),
                        ),
                        const Spacer(),
                        Text(
                          '${repo.documents.length}',
                          style: const TextStyle(color: SeleneTheme.lunarCyan, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                  ...repo.documents.map((doc) {
                    final isSelected = repo.selectedDocumentId == doc.id;
                    return Container(
                      margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
                      decoration: BoxDecoration(
                        color: isSelected ? SeleneTheme.lunarCyan.withValues(alpha: 0.12) : Colors.transparent,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isSelected ? SeleneTheme.lunarCyan.withValues(alpha: 0.6) : Colors.transparent,
                          width: 1,
                        ),
                      ),
                      child: ListTile(
                        dense: true,
                        leading: Text(isSelected ? '🌙' : '📄', style: const TextStyle(fontSize: 16)),
                        title: Text(
                          doc.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: isSelected ? SeleneTheme.lunarCyan : SeleneTheme.textPrimary,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            fontSize: 13,
                          ),
                        ),
                        trailing: IconButton(
                          icon: const Icon(Icons.delete_outline, size: 18, color: SeleneTheme.textMuted),
                          tooltip: 'Delete Note',
                          onPressed: () async {
                            await repo.deleteDocument(doc.id);
                            if (mounted) {
                              final active = repo.activeDocument;
                              setState(() {
                                _loadedDocId = active?.id;
                                _textController.text = active?.content ?? '';
                              });
                            }
                          },
                        ),
                        onTap: () {
                          _flushActiveDocument();
                          repo.selectDocument(doc.id);
                          Navigator.pop(context);
                        },
                      ),
                    );
                  }),

                  const Divider(color: SeleneTheme.border, height: 20),

                  // SECTION 2: Canonical Samples Folder (20 Showcases)
                  Theme(
                    data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                    child: ExpansionTile(
                      leading: const Text('🏛️', style: TextStyle(fontSize: 18)),
                      title: const Text(
                        'Imperial Showcases (samples/)',
                        style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 13.5, fontWeight: FontWeight.w600),
                      ),
                      subtitle: const Text(
                        '20 Canonical multiplatform templates',
                        style: TextStyle(color: SeleneTheme.textMuted, fontSize: 11),
                      ),
                      children: SampleService.allSamples.map((sample) {
                        return ListTile(
                          dense: true,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 20),
                          leading: Text(sample.icon, style: const TextStyle(fontSize: 16)),
                          title: Text(
                            sample.title,
                            style: const TextStyle(color: SeleneTheme.textPrimary, fontSize: 12.5),
                          ),
                          subtitle: Text(
                            sample.subtitle,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(color: SeleneTheme.textMuted, fontSize: 10.5),
                          ),
                          trailing: const Icon(Icons.arrow_forward_ios, size: 11, color: SeleneTheme.textMuted),
                          onTap: () => _handleLoadSample(sample),
                        );
                      }).toList(),
                    ),
                  ),

                  const Divider(color: SeleneTheme.border, height: 20),

                  // SECTION 3: Feature Options & Tools
                  const Padding(
                    padding: EdgeInsets.fromLTRB(16, 4, 16, 4),
                    child: Text(
                      'FEATURE OPTIONS & CANVAS TOOLS',
                      style: TextStyle(
                        color: SeleneTheme.textMuted,
                        fontSize: 10.5,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.8,
                      ),
                    ),
                  ),
                  ListTile(
                    dense: true,
                    leading: const Icon(Icons.hub_outlined, size: 18, color: SeleneTheme.lunarCyan),
                    title: const Text('Orbit Link P2P Sync', style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 13)),
                    subtitle: const Text('Real-time QR pairing & WebRTC peer collaboration', style: TextStyle(color: SeleneTheme.textMuted, fontSize: 11)),
                    onTap: () {
                      Navigator.pop(context);
                      _showOrbitLinkSheet();
                    },
                  ),
                  ListTile(
                    dense: true,
                    leading: const Icon(Icons.send_to_mobile, size: 18, color: SeleneTheme.goldAccent),
                    title: const Text('Hermes Courier Exporter', style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 13)),
                    subtitle: const Text('Offline HTML, Android share sheet & Gists', style: TextStyle(color: SeleneTheme.textMuted, fontSize: 11)),
                    onTap: () {
                      Navigator.pop(context);
                      _showHermesCourierSheet();
                    },
                  ),
                  ListTile(
                    dense: true,
                    leading: const Icon(Icons.psychology_outlined, size: 18, color: SeleneTheme.purpleMystic),
                    title: const Text("Athena's Neural Co-Pilot", style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 13)),
                    subtitle: const Text('KaTeX tutor, code sandbox doctor & diagram generator', style: TextStyle(color: SeleneTheme.textMuted, fontSize: 11)),
                    onTap: () {
                      Navigator.pop(context);
                      _showAthenaCopilotSheet();
                    },
                  ),
                  ListTile(
                    dense: true,
                    leading: const Icon(Icons.auto_stories, size: 18, color: SeleneTheme.lunarCyan),
                    title: const Text('Mnemosyne Knowledge Mesh', style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 13)),
                    subtitle: const Text('2D Constellation graph & block transclusions', style: TextStyle(color: SeleneTheme.textMuted, fontSize: 11)),
                    onTap: () {
                      Navigator.pop(context);
                      _showMnemosyneMeshSheet();
                    },
                  ),
                  ListTile(
                    dense: true,
                    leading: const Icon(Icons.music_note_outlined, size: 18, color: SeleneTheme.goldAccent),
                    title: const Text("Apollo's Lyre & Data Sonifier", style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 13)),
                    subtitle: const Text('432Hz focus drone & audio telemetry scan', style: TextStyle(color: SeleneTheme.textMuted, fontSize: 11)),
                    onTap: () {
                      Navigator.pop(context);
                      _showApollosLyreSheet();
                    },
                  ),
                  ListTile(
                    dense: true,
                    leading: const Icon(Icons.brush, size: 18, color: SeleneTheme.goldAccent),
                    title: const Text("Daedalus's Drawing Board", style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 13)),
                    subtitle: Text(
                      _isWhiteboardActive ? 'Active touch markup overlay' : 'Tap to open vector drawing board',
                      style: const TextStyle(color: SeleneTheme.textMuted, fontSize: 11),
                    ),
                    trailing: Switch(
                      value: _isWhiteboardActive,
                      activeThumbColor: SeleneTheme.goldAccent,
                      onChanged: (val) {
                        setState(() => _isWhiteboardActive = val);
                        Navigator.pop(context);
                      },
                    ),
                  ),
                  ListTile(
                    dense: true,
                    leading: const Icon(Icons.auto_awesome, size: 18, color: SeleneTheme.purpleMystic),
                    title: const Text('The Delphic Oracle', style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 13)),
                    subtitle: const Text('AI completions, code fixes & synthesis', style: TextStyle(color: SeleneTheme.textMuted, fontSize: 11)),
                    onTap: () {
                      Navigator.pop(context);
                      _showOracleSheet();
                    },
                  ),
                  ListTile(
                    dense: true,
                    leading: const Icon(Icons.history, size: 18, color: SeleneTheme.lunarCyan),
                    title: const Text('Chronos Timeline Revisions', style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 13)),
                    subtitle: const Text('Immutable snapshots & revision history', style: TextStyle(color: SeleneTheme.textMuted, fontSize: 11)),
                    onTap: () {
                      Navigator.pop(context);
                      _showTimelineSheet();
                    },
                  ),
                  ListTile(
                    dense: true,
                    leading: const Icon(Icons.cloud_upload_outlined, size: 18, color: SeleneTheme.lunarCyan),
                    title: const Text('Publish Cloud Gist', style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 13)),
                    subtitle: const Text('Sync and share online with custom URL', style: TextStyle(color: SeleneTheme.textMuted, fontSize: 11)),
                    onTap: () {
                      Navigator.pop(context);
                      _shareCloudGist();
                    },
                  ),
                  ListTile(
                    dense: true,
                    leading: Icon(
                      Icons.star_purple500_outlined,
                      size: 18,
                      color: _sparklesEnabled ? SeleneTheme.goldAccent : SeleneTheme.textMuted,
                    ),
                    title: const Text('Starry Sky Canvas', style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 13)),
                    subtitle: Text(
                      _sparklesEnabled ? 'Moon & twinkling stars active' : 'Plain obsidian background',
                      style: const TextStyle(color: SeleneTheme.textMuted, fontSize: 11),
                    ),
                    trailing: Switch(
                      value: _sparklesEnabled,
                      activeThumbColor: SeleneTheme.goldAccent,
                      onChanged: (val) {
                        setState(() => _sparklesEnabled = val);
                      },
                    ),
                  ),

                  const Divider(color: SeleneTheme.border, height: 20),

                  // SECTION 4: Documentation & Lore
                  const Padding(
                    padding: EdgeInsets.fromLTRB(16, 4, 16, 4),
                    child: Text(
                      'DOCUMENTATION & SPECIFICATION',
                      style: TextStyle(
                        color: SeleneTheme.textMuted,
                        fontSize: 10.5,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.8,
                      ),
                    ),
                  ),
                  ListTile(
                    dense: true,
                    leading: const Icon(Icons.lightbulb_outline, size: 18, color: SeleneTheme.goldAccent),
                    title: const Text("Athena's Wisdom", style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 13)),
                    subtitle: const Text('Syntax guide, KaTeX proofs & component specs', style: TextStyle(color: SeleneTheme.textMuted, fontSize: 11)),
                    onTap: () {
                      Navigator.pop(context);
                      _showWisdomSheet();
                    },
                  ),
                  ListTile(
                    dense: true,
                    leading: const Icon(Icons.account_balance_outlined, size: 18, color: SeleneTheme.goldAccent),
                    title: const Text('Titan Lore & Heritage', style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 13)),
                    subtitle: const Text('Cosmology of Σελήνη & the Titan Moon', style: TextStyle(color: SeleneTheme.textMuted, fontSize: 11)),
                    onTap: () {
                      Navigator.pop(context);
                      _showLoreDialog();
                    },
                  ),
                ],
              ),
            ),

            // Scriptorium Footer
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: SeleneTheme.border)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.shield_outlined, size: 14, color: SeleneTheme.emeraldSuccess),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      'Selene v0.4.0 • Titan Edition',
                      style: TextStyle(color: SeleneTheme.textMuted, fontSize: 11),
                    ),
                  ),
                  Text(
                    licenseStatus.hwid.length > 12 ? licenseStatus.hwid.substring(0, 12) : licenseStatus.hwid,
                    style: const TextStyle(color: SeleneTheme.textMuted, fontSize: 9.5, fontFamily: 'monospace'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
