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
import 'package:selene_mobile/ui/features/editor/widgets/keyboard_accessory_bar.dart';
import 'package:selene_mobile/ui/features/editor/widgets/markdown_canvas.dart';

enum CanvasViewMode { preview, edit, split }

class EditorScreen extends StatefulWidget {
  const EditorScreen({super.key});

  @override
  State<EditorScreen> createState() => _EditorScreenState();
}

class _EditorScreenState extends State<EditorScreen> {
  final TextEditingController _textController = TextEditingController();
  CanvasViewMode _viewMode = CanvasViewMode.preview;
  bool _isWhiteboardActive = false;
  bool _sparklesEnabled = true;
  String? _loadedDocId;

  @override
  void initState() {
    super.initState();
    _textController.addListener(_onTextChanged);
  }

  @override
  void dispose() {
    _textController.removeListener(_onTextChanged);
    _textController.dispose();
    super.dispose();
  }

  void _onTextChanged() {
    final repo = context.read<DocumentRepository>();
    final doc = repo.activeDocument;
    if (doc != null && doc.content != _textController.text) {
      repo.updateActiveDocumentContent(_textController.text);
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

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Transmuting document to Selene Cloud Gist...'),
        duration: Duration(seconds: 1),
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
        ),
      );
    }
  }

  Future<void> _handleLoadSample(SampleItem sample) async {
    final repo = context.read<DocumentRepository>();
    Navigator.pop(context); // Close drawer

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Unrolling canonical showcase: ${sample.title}...'),
        duration: const Duration(milliseconds: 900),
      ),
    );

    final content = await SampleService.loadSampleContent(sample);
    await repo.openOrImportSample(sample.id, '${sample.icon} ${sample.title}', content);

    if (mounted) {
      setState(() {
        _loadedDocId = sample.id;
        _textController.text = content;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final repo = context.watch<DocumentRepository>();
    final licenseService = context.watch<LicenseService>();
    final licenseStatus = licenseService.currentStatus;

    // Check if License Lock is active (expired or tampered)
    if (licenseStatus.isLocked) {
      return _buildLockedLicenseScreen(licenseStatus);
    }

    _syncControllerWithActiveDoc();
    final activeDoc = repo.activeDocument;
    final isTablet = MediaQuery.of(context).size.width > 768;

    return Scaffold(
      appBar: AppBar(
        // Generous, dedicated leading hamburger button with zero badge collisions
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
          // Lunar Diadem Ephemeris indicator
          const LunarDiademWidget(),

          // Athena's Wisdom
          IconButton(
            icon: const Icon(Icons.lightbulb_outline, size: 20, color: SeleneTheme.goldAccent),
            tooltip: "Athena's Wisdom",
            onPressed: _showWisdomSheet,
          ),

          // Overflow menu for licensing, timeline, share, and celestial sky
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert, size: 20, color: SeleneTheme.textSecondary),
            color: SeleneTheme.surfaceElevated,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: const BorderSide(color: SeleneTheme.border),
            ),
            onSelected: (val) {
              if (val == 'license') _showLicenseSheet();
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
      body: CelestialCanvasBackground(
        isSparklingEnabled: _sparklesEnabled,
        child: Stack(
          children: [
            Column(
              children: [
                // Mode switcher bar (Preview vs Edit vs Split on tablet)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  decoration: const BoxDecoration(
                    color: SeleneTheme.surface,
                    border: Border(bottom: BorderSide(color: SeleneTheme.border)),
                  ),
                  child: Row(
                    children: [
                      // View Mode Segmented Controls
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

                      // Whiteboard Markup Toggle
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

                      // Delphic Oracle AI Copilot
                      IconButton(
                        icon: const Icon(Icons.auto_awesome, color: SeleneTheme.purpleMystic, size: 20),
                        tooltip: 'The Delphic Oracle',
                        onPressed: _showOracleSheet,
                      ),
                    ],
                  ),
                ),

                // Main Canvas / Editor Area
                Expanded(
                  child: _buildMainView(isTablet),
                ),

                // Bottom sticky keyboard formatting accessory (Edit Mode only)
                if (_viewMode == CanvasViewMode.edit)
                  KeyboardAccessoryBar(controller: _textController),
              ],
            ),

            // Floating Whiteboard Overlay
            if (_isWhiteboardActive)
              Positioned.fill(
                child: WhiteboardOverlay(
                  onClose: () => setState(() => _isWhiteboardActive = false),
                ),
              ),
          ],
        ),
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
                      repo.createDocument();
                      Navigator.pop(context);
                    },
                  ),
                ],
              ),
            ),

            // Prominent License Status Banner in Drawer
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

            // Scrollable Sections: User Scrolls, Canonical Samples, Features, and Docs
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
                        trailing: repo.documents.length > 1
                            ? IconButton(
                                icon: const Icon(Icons.delete_outline, size: 16, color: SeleneTheme.textMuted),
                                onPressed: () => repo.deleteDocument(doc.id),
                              )
                            : null,
                        onTap: () {
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
