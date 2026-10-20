import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:selene_mobile/data/repositories/document_repository.dart';
import 'package:selene_mobile/ui/core/theme.dart';
import 'package:selene_mobile/ui/features/canvas/whiteboard_overlay.dart';
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
          title: const Row(
            children: [
              Text('☁️', style: TextStyle(fontSize: 18)),
              SizedBox(width: 8),
              Text('Cloud Gist Published', style: TextStyle(fontSize: 16)),
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
          // Lunar Diadem
          const LunarDiademWidget(),
          const SizedBox(width: 6),

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
      drawer: _buildScriptoriumDrawer(repo),
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

                    // Daedalus Whiteboard Toggle Button
                    InkWell(
                      onTap: () => setState(() => _isWhiteboardActive = !_isWhiteboardActive),
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: _isWhiteboardActive
                              ? SeleneTheme.lunarCyan.withValues(alpha: 0.2)
                              : SeleneTheme.surfaceElevated,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: _isWhiteboardActive
                                ? SeleneTheme.lunarCyan
                                : SeleneTheme.border,
                          ),
                        ),
                        child: Row(
                          children: [
                            const Text('🎨', style: TextStyle(fontSize: 14)),
                            const SizedBox(width: 4),
                            Text(
                              'Daedalus',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: _isWhiteboardActive
                                    ? SeleneTheme.lunarCyan
                                    : SeleneTheme.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Canvas Content Area
              Expanded(
                child: _buildCanvasContent(isTablet),
              ),

              // Sticky Keyboard Accessory Bar (in Edit Mode)
              if (_viewMode == CanvasViewMode.edit || _viewMode == CanvasViewMode.split)
                KeyboardAccessoryBar(
                  controller: _textController,
                  onOracleRequested: _showOracleSheet,
                ),
            ],
          ),

          // Daedalus Whiteboard Vector Canvas Overlay
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

  Widget _buildCanvasContent(bool isTablet) {
    if (_viewMode == CanvasViewMode.preview) {
      return MarkdownCanvas(content: _textController.text);
    } else if (_viewMode == CanvasViewMode.edit) {
      return _buildTextEditor();
    } else {
      // Split mode on tablet / landscape
      return Row(
        children: [
          Expanded(child: _buildTextEditor()),
          const VerticalDivider(width: 1),
          Expanded(child: MarkdownCanvas(content: _textController.text)),
        ],
      );
    }
  }

  Widget _buildTextEditor() {
    return Container(
      color: SeleneTheme.background,
      child: TextField(
        controller: _textController,
        maxLines: null,
        expands: true,
        keyboardType: TextInputType.multiline,
        style: const TextStyle(
          color: SeleneTheme.textPrimary,
          fontSize: 14.5,
          fontFamily: 'monospace',
          height: 1.55,
        ),
        decoration: const InputDecoration(
          contentPadding: EdgeInsets.all(16),
          border: InputBorder.none,
          hintText: 'Compose your literate markdown prose, KaTeX math formulas, or code blocks...',
          hintStyle: TextStyle(color: SeleneTheme.textMuted, fontSize: 14),
        ),
      ),
    );
  }

  Widget _buildScriptoriumDrawer(DocumentRepository repo) {
    return Drawer(
      backgroundColor: SeleneTheme.surfaceElevated,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Drawer Header
            Container(
              padding: const EdgeInsets.all(18),
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
