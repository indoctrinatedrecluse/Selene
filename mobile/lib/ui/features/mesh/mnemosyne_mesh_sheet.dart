import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:selene_mobile/data/repositories/document_repository.dart';
import 'package:selene_mobile/data/services/sample_service.dart';
import 'package:selene_mobile/ui/core/theme.dart';

class ConstellationNode {
  final String id;
  final String title;
  final String category;
  final Color color;
  final List<String> links;
  Offset position;

  ConstellationNode({
    required this.id,
    required this.title,
    required this.category,
    required this.color,
    required this.links,
    required this.position,
  });
}

class MnemosyneMeshSheet extends StatefulWidget {
  final DocumentRepository repository;
  final Function(String docId, String title, String content)? onSelectDocument;
  final Function(String wikilink)? onInsertTransclusion;

  const MnemosyneMeshSheet({
    super.key,
    required this.repository,
    this.onSelectDocument,
    this.onInsertTransclusion,
  });

  static Future<void> show(
    BuildContext context, {
    required DocumentRepository repository,
    Function(String docId, String title, String content)? onSelectDocument,
    Function(String wikilink)? onInsertTransclusion,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => MnemosyneMeshSheet(
        repository: repository,
        onSelectDocument: onSelectDocument,
        onInsertTransclusion: onInsertTransclusion,
      ),
    );
  }

  @override
  State<MnemosyneMeshSheet> createState() => _MnemosyneMeshSheetState();
}

class _MnemosyneMeshSheetState extends State<MnemosyneMeshSheet>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  final TextEditingController _searchController = TextEditingController();
  List<ConstellationNode> _nodes = [];
  ConstellationNode? _selectedNode;
  String _filterQuery = '';

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat();

    _searchController.addListener(() {
      setState(() {
        _filterQuery = _searchController.text.trim().toLowerCase();
      });
    });

    _initializeGraphNodes();
  }

  @override
  void dispose() {
    _animController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _initializeGraphNodes() {
    final List<ConstellationNode> nodes = [];
    final rand = math.Random(42);

    // 1. Add user notes
    final docs = widget.repository.documents;
    for (int i = 0; i < docs.length; i++) {
      final doc = docs[i];
      final angle = (i / math.max(1, docs.length)) * 2 * math.pi;
      final radius = 100.0 + rand.nextDouble() * 40.0;
      final x = 200.0 + radius * math.cos(angle);
      final y = 200.0 + radius * math.sin(angle);

      // Extract wikilinks from doc content: [[Page]]
      final wikilinkMatches = RegExp(r'\[\[(.*?)\]\]').allMatches(doc.content);
      final links = wikilinkMatches.map((m) => m.group(1) ?? '').toList();

      nodes.add(ConstellationNode(
        id: doc.id,
        title: doc.title,
        category: 'Vault Scroll',
        color: SeleneTheme.lunarCyan,
        links: links,
        position: Offset(x, y),
      ));
    }

    // 2. Add Imperial Samples
    final samples = SampleService.allSamples;
    for (int i = 0; i < samples.length; i++) {
      final sample = samples[i];
      final angle = (i / samples.length) * 2 * math.pi;
      final radius = 180.0 + rand.nextDouble() * 50.0;
      final x = 200.0 + radius * math.cos(angle);
      final y = 200.0 + radius * math.sin(angle);

      Color catColor = SeleneTheme.goldAccent;
      if (sample.category.toLowerCase().contains('math')) {
        catColor = const Color(0xFFF472B6);
      } else if (sample.category.toLowerCase().contains('code') ||
          sample.category.toLowerCase().contains('dev')) {
        catColor = const Color(0xFF60A5FA);
      } else if (sample.category.toLowerCase().contains('chart') ||
          sample.category.toLowerCase().contains('data')) {
        catColor = const Color(0xFF34D399);
      }

      nodes.add(ConstellationNode(
        id: sample.id,
        title: '${sample.icon} ${sample.title}',
        category: sample.category,
        color: catColor,
        links: [
          if (i > 0) samples[i - 1].id,
          if (i < samples.length - 1) samples[i + 1].id,
        ],
        position: Offset(x, y),
      ));
    }

    _nodes = nodes;
    if (_nodes.isNotEmpty) {
      _selectedNode = _nodes.first;
    }
  }

  void _handleSelectNode(ConstellationNode node) {
    setState(() {
      _selectedNode = node;
    });
  }

  void _copyTransclusion(ConstellationNode node) {
    final wikilink = '![[${node.title}]]';
    Clipboard.setData(ClipboardData(text: wikilink));
    if (widget.onInsertTransclusion != null) {
      widget.onInsertTransclusion!(wikilink);
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Transclusion link copied: $wikilink'),
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  Future<void> _jumpToNode(ConstellationNode node) async {
    Navigator.pop(context);
    // Check if it's a sample or user doc
    final sample = SampleService.allSamples.where((s) => s.id == node.id).firstOrNull;
    if (sample != null) {
      final content = await SampleService.loadSampleContent(sample);
      if (widget.onSelectDocument != null) {
        widget.onSelectDocument!(sample.id, '${sample.icon} ${sample.title}', content);
      }
    } else {
      widget.repository.selectDocument(node.id);
    }
  }

  @override
  Widget build(BuildContext context) {
    bool isMatchingFilter(ConstellationNode n) {
      if (_filterQuery.isEmpty) return true;
      return n.title.toLowerCase().contains(_filterQuery) ||
          n.category.toLowerCase().contains(_filterQuery);
    }

    return Container(
      height: MediaQuery.of(context).size.height * 0.90,
      decoration: const BoxDecoration(
        color: SeleneTheme.surfaceElevated,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        border: Border(
          top: BorderSide(color: SeleneTheme.purpleMystic, width: 2),
          left: BorderSide(color: SeleneTheme.border),
          right: BorderSide(color: SeleneTheme.border),
        ),
      ),
      child: Column(
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 10, bottom: 6),
              width: 38,
              height: 4,
              decoration: BoxDecoration(
                color: SeleneTheme.textMuted.withValues(alpha: 0.4),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: SeleneTheme.purpleMystic.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: SeleneTheme.purpleMystic.withValues(alpha: 0.3),
                    ),
                  ),
                  child: const Text('🌌', style: TextStyle(fontSize: 20)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Text(
                            'Mnemosyne Knowledge Mesh',
                            style: TextStyle(
                              color: SeleneTheme.textPrimary,
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(width: 6),
                          Icon(Icons.hub_outlined, size: 14, color: SeleneTheme.purpleMystic),
                        ],
                      ),
                      Text(
                        'Bi-Directional Wiki Graph & Transclusions (${_nodes.length} Astral Nodes)',
                        style: const TextStyle(color: SeleneTheme.textMuted, fontSize: 11),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: SeleneTheme.textSecondary, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),

          // Search bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: TextField(
              controller: _searchController,
              style: const TextStyle(color: SeleneTheme.textPrimary, fontSize: 13),
              decoration: InputDecoration(
                hintText: 'Search celestial nodes & wikilinks...',
                hintStyle: const TextStyle(color: SeleneTheme.textMuted, fontSize: 12),
                prefixIcon: const Icon(Icons.search, size: 16, color: SeleneTheme.textMuted),
                suffixIcon: _filterQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 16, color: SeleneTheme.textMuted),
                        onPressed: () => _searchController.clear(),
                      )
                    : null,
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                filled: true,
                fillColor: SeleneTheme.surface,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: SeleneTheme.border),
                ),
              ),
            ),
          ),

          // 2D Constellation Canvas Area
          Expanded(
            child: Stack(
              children: [
                Positioned.fill(
                  child: AnimatedBuilder(
                    animation: _animController,
                    builder: (context, _) {
                      return CustomPaint(
                        painter: MnemosyneConstellationPainter(
                          nodes: _nodes,
                          selectedNode: _selectedNode,
                          pulsePhase: _animController.value,
                          filterQuery: _filterQuery,
                        ),
                      );
                    },
                  ),
                ),

                // Interactive tap overlay
                Positioned.fill(
                  child: GestureDetector(
                    onTapUp: (details) {
                      final localPos = details.localPosition;
                      for (final node in _nodes) {
                        final dist = (node.position - localPos).distance;
                        if (dist < 28) {
                          _handleSelectNode(node);
                          break;
                        }
                      }
                    },
                  ),
                ),

                // Node Chips Horizontal Scroll at Bottom of Canvas
                Positioned(
                  left: 12,
                  right: 12,
                  bottom: 8,
                  child: SizedBox(
                    height: 36,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: _nodes.where(isMatchingFilter).length,
                      separatorBuilder: (_, _) => const SizedBox(width: 8),
                      itemBuilder: (context, idx) {
                        final node = _nodes.where(isMatchingFilter).toList()[idx];
                        final isSel = _selectedNode?.id == node.id;
                        return InkWell(
                          onTap: () => _handleSelectNode(node),
                          borderRadius: BorderRadius.circular(16),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: isSel
                                  ? node.color.withValues(alpha: 0.25)
                                  : SeleneTheme.surface.withValues(alpha: 0.8),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: isSel ? node.color : SeleneTheme.border,
                                width: isSel ? 1.5 : 1,
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 8,
                                  height: 8,
                                  decoration: BoxDecoration(
                                    color: node.color,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  node.title,
                                  style: TextStyle(
                                    color: isSel ? SeleneTheme.textPrimary : SeleneTheme.textSecondary,
                                    fontSize: 11,
                                    fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Selected Node Inspection Drawer Card
          if (_selectedNode != null)
            Container(
              padding: const EdgeInsets.all(14),
              margin: const EdgeInsets.fromLTRB(14, 0, 14, 14),
              decoration: BoxDecoration(
                color: SeleneTheme.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: _selectedNode!.color.withValues(alpha: 0.4),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.3),
                    blurRadius: 10,
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: _selectedNode!.color.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: _selectedNode!.color.withValues(alpha: 0.4)),
                        ),
                        child: Text(
                          _selectedNode!.category.toUpperCase(),
                          style: TextStyle(
                            color: _selectedNode!.color,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _selectedNode!.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: SeleneTheme.textPrimary,
                            fontSize: 13.5,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Ident: ${_selectedNode!.id} • Linked to ${_selectedNode!.links.length} Astral Celestial Nodes',
                    style: const TextStyle(color: SeleneTheme.textMuted, fontSize: 11),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          icon: const Icon(Icons.link, size: 14),
                          label: const Text('Copy ![[Link]]', style: TextStyle(fontSize: 11.5)),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: SeleneTheme.lunarCyan,
                            side: const BorderSide(color: SeleneTheme.lunarCyan),
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          onPressed: () => _copyTransclusion(_selectedNode!),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ElevatedButton.icon(
                          icon: const Icon(Icons.open_in_new, size: 14),
                          label: const Text('Jump to Scroll', style: TextStyle(fontSize: 11.5)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: SeleneTheme.purpleMystic,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          onPressed: () => _jumpToNode(_selectedNode!),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class MnemosyneConstellationPainter extends CustomPainter {
  final List<ConstellationNode> nodes;
  final ConstellationNode? selectedNode;
  final double pulsePhase;
  final String filterQuery;

  MnemosyneConstellationPainter({
    required this.nodes,
    required this.selectedNode,
    required this.pulsePhase,
    required this.filterQuery,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Background deep celestial grid
    final gridPaint = Paint()
      ..color = const Color(0xFF1E293B).withValues(alpha: 0.3)
      ..strokeWidth = 0.5;

    for (double x = 0; x < size.width; x += 40) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
    }
    for (double y = 0; y < size.height; y += 40) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }

    if (nodes.isEmpty) return;

    // Center adjustment
    final centerX = size.width / 2;
    final centerY = size.height / 2;

    // Draw links between nodes
    final linePaint = Paint()
      ..strokeWidth = 1.2
      ..style = PaintingStyle.stroke;

    for (final node in nodes) {
      final posA = _adjustPos(node.position, size, centerX, centerY);
      for (final linkId in node.links) {
        final target = nodes.where((n) => n.id == linkId).firstOrNull;
        if (target != null) {
          final posB = _adjustPos(target.position, size, centerX, centerY);
          final isHighlighted = selectedNode?.id == node.id || selectedNode?.id == target.id;

          linePaint.color = isHighlighted
              ? SeleneTheme.purpleMystic.withValues(alpha: 0.7)
              : const Color(0xFF334155).withValues(alpha: 0.4);
          linePaint.strokeWidth = isHighlighted ? 1.8 : 0.8;

          canvas.drawLine(posA, posB, linePaint);

          // Moving photon packet along highlighted edges
          if (isHighlighted) {
            final t = (pulsePhase * 2) % 1.0;
            final packetPos = Offset.lerp(posA, posB, t)!;
            final packetPaint = Paint()..color = SeleneTheme.lunarCyan;
            canvas.drawCircle(packetPos, 2.5, packetPaint);
          }
        }
      }
    }

    // Draw Stars (Nodes)
    for (final node in nodes) {
      final pos = _adjustPos(node.position, size, centerX, centerY);
      final isSel = selectedNode?.id == node.id;
      final isFiltered = filterQuery.isNotEmpty &&
          !node.title.toLowerCase().contains(filterQuery) &&
          !node.category.toLowerCase().contains(filterQuery);

      final alpha = isFiltered ? 0.2 : 1.0;

      // Glow halo
      if (isSel) {
        final haloPaint = Paint()
          ..color = node.color.withValues(alpha: 0.35 * alpha)
          ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 12);
        canvas.drawCircle(pos, 16 + math.sin(pulsePhase * 2 * math.pi) * 3, haloPaint);
      }

      // Outer ring
      final ringPaint = Paint()
        ..color = isSel ? node.color.withValues(alpha: alpha) : node.color.withValues(alpha: 0.6 * alpha)
        ..style = PaintingStyle.stroke
        ..strokeWidth = isSel ? 2.5 : 1.5;
      canvas.drawCircle(pos, isSel ? 10 : 6, ringPaint);

      // Core star
      final corePaint = Paint()
        ..color = isSel ? Colors.white : node.color.withValues(alpha: alpha)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(pos, isSel ? 5 : 3.5, corePaint);
    }
  }

  Offset _adjustPos(Offset orig, Size size, double cx, double cy) {
    // Normalizes 0-400 coordinate space to fit canvas size
    final scaleX = size.width / 440;
    final scaleY = size.height / 440;
    return Offset(orig.dx * scaleX, orig.dy * scaleY);
  }

  @override
  bool shouldRepaint(covariant MnemosyneConstellationPainter oldDelegate) => true;
}
