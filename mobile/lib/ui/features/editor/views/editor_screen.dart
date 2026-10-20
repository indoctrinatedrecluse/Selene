import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:selene_mobile/data/repositories/document_repository.dart';
import 'package:selene_mobile/data/services/license_service.dart';
import 'package:selene_mobile/ui/core/theme.dart';
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
      // Re-sync editor controller if restored
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
        title: Row(
          children: [
            const Text('🌙', style: TextStyle(fontSize: 18)),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                activeDoc?.title ?? 'Selene',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        actions: [
          // License Status Badge
          InkWell(
            onTap: () => _showLicenseSheet(),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
              decoration: BoxDecoration(
                color: licenseStatus.status == 'active'
                    ? SeleneTheme.emeraldSuccess.withValues(alpha: 0.15)
                    : SeleneTheme.goldAccent.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: licenseStatus.status == 'active'
                      ? SeleneTheme.emeraldSuccess.withValues(alpha: 0.3)
                      : SeleneTheme.goldAccent.withValues(alpha: 0.3),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.shield,
                    size: 11,
                    color: licenseStatus.status == 'active' ? SeleneTheme.emeraldSuccess : SeleneTheme.goldAccent,
                  ),
                  const SizedBox(width: 3),
                  Text(
                    licenseStatus.type == LicenseTier.trial
                        ? '${licenseStatus.daysRemaining}D TRIAL'
                        : licenseStatus.type.name.toUpperCase(),
                    style: TextStyle(
                      color: licenseStatus.status == 'active' ? SeleneTheme.emeraldSuccess : SeleneTheme.goldAccent,
                      fontSize: 9.5,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 6),

          // Lunar Diadem
          const LunarDiademWidget(),
          const SizedBox(width: 4),

          // Athena's Wisdom
          IconButton(
            icon: const Icon(Icons.lightbulb_outline, size: 20, color: SeleneTheme.goldAccent),
            tooltip: "Athena's Wisdom",
            onPressed: _showWisdomSheet,
          ),

          // Chronos Timeline
          IconButton(
            icon: const Icon(Icons.history, size: 20, color: SeleneTheme.lunarCyan),
            tooltip: 'Chronos Timeline',
            onPressed: _showTimelineSheet,
          ),

          // Cloud Share Gist
          IconButton(
            icon: const Icon(Icons.cloud_upload_outlined, size: 20),
            tooltip: 'Share Gist',
            onPressed: _shareCloudGist,
          ),
        ],
      ),
      drawer: _buildScriptoriumDrawer(repo, licenseStatus),
      body: Stack(
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
              const SizedBox(height: 14),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: SeleneTheme.surface,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: SeleneTheme.border),
                ),
                child: Text(
                  'Device HWID: ${status.hwid}',
                  style: const TextStyle(fontFamily: 'monospace', color: SeleneTheme.lunarCyan, fontSize: 11),
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                icon: const Icon(Icons.key, size: 16),
                label: const Text('Activate License or Manage Device'),
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
      color: SeleneTheme.surface,
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
            // Header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: SeleneTheme.border)),
              ),
              child: Row(
                children: [
                  const Text('📜', style: TextStyle(fontSize: 22)),
                  const SizedBox(width: 10),
                  const Column(
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
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.add, color: SeleneTheme.lunarCyan),
                    tooltip: 'New Scroll',
                    onPressed: () {
                      repo.createDocument();
                      Navigator.pop(context);
                    },
                  ),
                ],
              ),
            ),

            // Document List
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(vertical: 8),
                itemCount: repo.documents.length,
                itemBuilder: (context, index) {
                  final doc = repo.documents[index];
                  final isSelected = repo.selectedDocumentId == doc.id;

                  return Container(
                    margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                    decoration: BoxDecoration(
                      color: isSelected ? SeleneTheme.lunarCyan.withValues(alpha: 0.12) : Colors.transparent,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: isSelected ? SeleneTheme.lunarCyan : Colors.transparent,
                        width: 1,
                      ),
                    ),
                    child: ListTile(
                      dense: true,
                      leading: Text(
                        isSelected ? '🌙' : '📄',
                        style: const TextStyle(fontSize: 16),
                      ),
                      title: Text(
                        doc.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: isSelected ? SeleneTheme.lunarCyan : SeleneTheme.textPrimary,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          fontSize: 13.5,
                        ),
                      ),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete_outline, size: 16, color: SeleneTheme.textMuted),
                        onPressed: () => repo.deleteDocument(doc.id),
                      ),
                      onTap: () {
                        repo.selectDocument(doc.id);
                        Navigator.pop(context);
                      },
                    ),
                  );
                },
              ),
            ),

            // Manage License & Device Option (Matches Desktop Help Menu)
            Container(
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: SeleneTheme.border)),
              ),
              child: ListTile(
                dense: true,
                leading: const Icon(Icons.shield_outlined, size: 18, color: SeleneTheme.goldAccent),
                title: const Text('Manage License & Device...', style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 13)),
                subtitle: Text(
                  licenseStatus.type == LicenseTier.trial
                      ? '60-Day Trial (${licenseStatus.daysRemaining}d remaining)'
                      : '${licenseStatus.type.name.toUpperCase()} License Active',
                  style: const TextStyle(color: SeleneTheme.textSecondary, fontSize: 11),
                ),
                trailing: const Icon(Icons.chevron_right, size: 16, color: SeleneTheme.textMuted),
                onTap: () {
                  Navigator.pop(context);
                  _showLicenseSheet();
                },
              ),
            ),

            // Footer Status
            Container(
              padding: const EdgeInsets.all(12),
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: SeleneTheme.border)),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.shield_outlined, size: 14, color: SeleneTheme.emeraldSuccess),
                  SizedBox(width: 6),
                  Text(
                    'Selene Mobile v0.4.0 • Titan Edition',
                    style: TextStyle(color: SeleneTheme.textMuted, fontSize: 11),
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
