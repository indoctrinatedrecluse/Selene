import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:selene_mobile/data/models/document_model.dart';
import 'package:selene_mobile/data/repositories/document_repository.dart';
import 'package:selene_mobile/ui/core/theme.dart';

class ChronosTimelineSheet extends StatefulWidget {
  final DocumentRepository repository;

  const ChronosTimelineSheet({super.key, required this.repository});

  @override
  State<ChronosTimelineSheet> createState() => _ChronosTimelineSheetState();
}

class _ChronosTimelineSheetState extends State<ChronosTimelineSheet> {
  final TextEditingController _milestoneController = TextEditingController();
  DocumentEpoch? _selectedEpoch;
  bool _showDiff = false;

  @override
  void dispose() {
    _milestoneController.dispose();
    super.dispose();
  }

  void _promptNewMilestone() {
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
            Text('⏳', style: TextStyle(fontSize: 18)),
            SizedBox(width: 8),
            Text('Tag Milestone Checkpoint', style: TextStyle(fontSize: 16, color: SeleneTheme.textPrimary)),
          ],
        ),
        content: TextField(
          controller: _milestoneController,
          autofocus: true,
          style: const TextStyle(color: SeleneTheme.textPrimary, fontSize: 14),
          decoration: InputDecoration(
            hintText: 'e.g. [Alpha Architecture Approved]',
            hintStyle: const TextStyle(color: SeleneTheme.textMuted, fontSize: 13),
            filled: true,
            fillColor: SeleneTheme.surface,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: SeleneTheme.border),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: SeleneTheme.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: SeleneTheme.lunarCyan,
              foregroundColor: SeleneTheme.background,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () {
              final label = _milestoneController.text.trim();
              if (label.isNotEmpty) {
                widget.repository.recordEpochSnapshot(label);
                _milestoneController.clear();
                Navigator.pop(ctx);
                setState(() {});
              }
            },
            child: const Text('Save Epoch'),
          ),
        ],
      ),
    );
  }

  void _confirmRestore(DocumentEpoch epoch) {
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
            Text('⚡', style: TextStyle(fontSize: 18)),
            SizedBox(width: 8),
            Text('Time-Warp Safe Rollback', style: TextStyle(fontSize: 16, color: SeleneTheme.textPrimary)),
          ],
        ),
        content: Text(
          'Revert document state to "${epoch.label}" (${DateFormat('MMM d, h:mm a').format(epoch.timestamp)})?\n\nSelene will automatically record a "[Pre-Rollback Safety Checkpoint]" so you can always return to your current draft.',
          style: const TextStyle(color: SeleneTheme.textSecondary, fontSize: 13, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: SeleneTheme.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: SeleneTheme.goldAccent,
              foregroundColor: SeleneTheme.background,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () {
              widget.repository.restoreEpoch(epoch);
              Navigator.pop(ctx); // Close dialog
              Navigator.pop(context); // Close sheet
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Time-Warp active: Restored "${epoch.label}"'),
                  backgroundColor: SeleneTheme.surfaceElevated,
                  duration: const Duration(seconds: 2),
                ),
              );
            },
            child: const Text('Confirm Restore'),
          ),
        ],
      ),
    );
  }

  List<_DiffLine> _computeDiff(String oldText, String newText) {
    final oldLines = oldText.split('\n');
    final newLines = newText.split('\n');
    final List<_DiffLine> diff = [];

    final maxLines = oldLines.length > newLines.length ? oldLines.length : newLines.length;

    for (int i = 0; i < maxLines; i++) {
      if (i < oldLines.length && i < newLines.length) {
        if (oldLines[i] == newLines[i]) {
          diff.add(_DiffLine(
            type: _DiffType.unchanged,
            text: oldLines[i],
            oldLineNum: i + 1,
            newLineNum: i + 1,
          ));
        } else {
          diff.add(_DiffLine(
            type: _DiffType.deletion,
            text: oldLines[i],
            oldLineNum: i + 1,
          ));
          diff.add(_DiffLine(
            type: _DiffType.addition,
            text: newLines[i],
            newLineNum: i + 1,
          ));
        }
      } else if (i < oldLines.length) {
        diff.add(_DiffLine(
          type: _DiffType.deletion,
          text: oldLines[i],
          oldLineNum: i + 1,
        ));
      } else if (i < newLines.length) {
        diff.add(_DiffLine(
          type: _DiffType.addition,
          text: newLines[i],
          newLineNum: i + 1,
        ));
      }
    }

    return diff;
  }

  @override
  Widget build(BuildContext context) {
    final doc = widget.repository.activeDocument;
    final epochs = doc?.epochs ?? [];
    final currentContent = doc?.content ?? '';
    final maxHeight = MediaQuery.of(context).size.height * 0.88;

    return Container(
      constraints: BoxConstraints(maxHeight: maxHeight),
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      decoration: const BoxDecoration(
        color: SeleneTheme.surfaceElevated,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 36,
              height: 4,
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                color: SeleneTheme.borderHighlight,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: SeleneTheme.lunarCyan.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: SeleneTheme.lunarCyan.withValues(alpha: 0.4)),
                ),
                child: const Text('⏳', style: TextStyle(fontSize: 18)),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Chronos Epoch Timeline',
                      style: TextStyle(
                        color: SeleneTheme.textPrimary,
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'Semantic Revisions & Visual Diff Inspector',
                      style: TextStyle(color: SeleneTheme.textSecondary, fontSize: 11.5),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              ElevatedButton.icon(
                icon: const Icon(Icons.bookmark_add, size: 15),
                label: const Text('Tag Epoch'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: SeleneTheme.lunarCyan.withValues(alpha: 0.18),
                  foregroundColor: SeleneTheme.lunarCyan,
                  elevation: 0,
                  side: const BorderSide(color: SeleneTheme.lunarCyan),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  visualDensity: VisualDensity.compact,
                ),
                onPressed: _promptNewMilestone,
              ),
            ],
          ),

          const SizedBox(height: 12),

          if (epochs.isEmpty) ...[
            Container(
              padding: const EdgeInsets.all(32),
              alignment: Alignment.center,
              child: const Column(
                children: [
                  Icon(Icons.history_toggle_off, size: 40, color: SeleneTheme.textMuted),
                  SizedBox(height: 12),
                  Text(
                    'No historical epochs recorded yet.\nTap "Tag Epoch" to capture an intentional milestone checkpoint.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: SeleneTheme.textMuted, fontSize: 13, height: 1.4),
                  ),
                ],
              ),
            ),
          ] else ...[
            // View mode switch if epoch is selected
            if (_selectedEpoch != null) ...[
              Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: SeleneTheme.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: SeleneTheme.border),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        'Viewing: ${_selectedEpoch!.label}',
                        style: const TextStyle(
                          color: SeleneTheme.lunarCyan,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    InkWell(
                      onTap: () => setState(() => _showDiff = !_showDiff),
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: _showDiff ? SeleneTheme.lunarCyan.withValues(alpha: 0.2) : Colors.transparent,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: SeleneTheme.lunarCyan.withValues(alpha: 0.4)),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              _showDiff ? Icons.list_alt : Icons.compare_arrows,
                              size: 14,
                              color: SeleneTheme.lunarCyan,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              _showDiff ? 'Epoch List' : 'Visual Diff',
                              style: const TextStyle(color: SeleneTheme.lunarCyan, fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // Content body: either Epochs List or Visual Diff
            Expanded(
              child: _showDiff && _selectedEpoch != null
                  ? _buildDiffViewer(_selectedEpoch!, currentContent)
                  : ListView.builder(
                      itemCount: epochs.length,
                      itemBuilder: (context, index) {
                        final epoch = epochs[index];
                        final isSelected = _selectedEpoch?.id == epoch.id;
                        final timeStr = DateFormat('MMM d, h:mm a').format(epoch.timestamp);

                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          decoration: BoxDecoration(
                            color: isSelected ? SeleneTheme.surfaceElevated : SeleneTheme.surface,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSelected ? SeleneTheme.lunarCyan : SeleneTheme.border,
                              width: isSelected ? 1.5 : 1,
                            ),
                          ),
                          child: ListTile(
                            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
                            onTap: () {
                              setState(() {
                                _selectedEpoch = epoch;
                                _showDiff = true;
                              });
                            },
                            title: Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    epoch.label,
                                    style: TextStyle(
                                      color: isSelected ? SeleneTheme.lunarCyan : SeleneTheme.textPrimary,
                                      fontWeight: FontWeight.w600,
                                      fontSize: 13.5,
                                    ),
                                  ),
                                ),
                                if (index == 0)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: SeleneTheme.emeraldSuccess.withValues(alpha: 0.15),
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(color: SeleneTheme.emeraldSuccess.withValues(alpha: 0.3)),
                                    ),
                                    child: const Text(
                                      'LATEST',
                                      style: TextStyle(
                                        color: SeleneTheme.emeraldSuccess,
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                            subtitle: Padding(
                              padding: const EdgeInsets.only(top: 4),
                              child: Text(
                                timeStr,
                                style: const TextStyle(color: SeleneTheme.textMuted, fontSize: 11),
                              ),
                            ),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.compare_arrows, size: 18, color: SeleneTheme.lunarCyan),
                                  tooltip: 'Inspect Diff',
                                  onPressed: () {
                                    setState(() {
                                      _selectedEpoch = epoch;
                                      _showDiff = true;
                                    });
                                  },
                                ),
                                IconButton(
                                  icon: const Icon(Icons.restore, size: 18, color: SeleneTheme.goldAccent),
                                  tooltip: 'Safe Time-Warp Rollback',
                                  onPressed: () => _confirmRestore(epoch),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildDiffViewer(DocumentEpoch epoch, String currentContent) {
    final diff = _computeDiff(epoch.contentSnapshot, currentContent);
    final additions = diff.where((d) => d.type == _DiffType.addition).length;
    final deletions = diff.where((d) => d.type == _DiffType.deletion).length;

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF070B12),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: SeleneTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Diff Stats Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: const BoxDecoration(
              color: Color(0xFF0F172A),
              borderRadius: BorderRadius.vertical(top: Radius.circular(11)),
              border: Border(bottom: BorderSide(color: SeleneTheme.border)),
            ),
            child: Row(
              children: [
                const Text(
                  'UNIFIED DIFF',
                  style: TextStyle(
                    color: SeleneTheme.textSecondary,
                    fontSize: 10.5,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.8,
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: SeleneTheme.emeraldSuccess.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    '+$additions',
                    style: const TextStyle(color: SeleneTheme.emeraldSuccess, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(width: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: SeleneTheme.roseDanger.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    '-$deletions',
                    style: const TextStyle(color: SeleneTheme.roseDanger, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton.icon(
                  icon: const Icon(Icons.restore, size: 14),
                  label: const Text('Rollback'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: SeleneTheme.goldAccent,
                    foregroundColor: SeleneTheme.background,
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    visualDensity: VisualDensity.compact,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: () => _confirmRestore(epoch),
                ),
              ],
            ),
          ),

          // Diff Lines
          Expanded(
            child: ListView.builder(
              itemCount: diff.length,
              itemBuilder: (context, idx) {
                final line = diff[idx];
                Color bgColor = Colors.transparent;
                Color textColor = SeleneTheme.textPrimary;
                String prefix = ' ';

                if (line.type == _DiffType.addition) {
                  bgColor = SeleneTheme.emeraldSuccess.withValues(alpha: 0.15);
                  textColor = SeleneTheme.emeraldSuccess;
                  prefix = '+';
                } else if (line.type == _DiffType.deletion) {
                  bgColor = SeleneTheme.roseDanger.withValues(alpha: 0.15);
                  textColor = SeleneTheme.roseDanger;
                  prefix = '-';
                } else {
                  textColor = SeleneTheme.textSecondary;
                }

                return Container(
                  color: bgColor,
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(
                        width: 28,
                        child: Text(
                          line.newLineNum != null ? '${line.newLineNum}' : (line.oldLineNum != null ? '${line.oldLineNum}' : ''),
                          style: const TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 10,
                            color: SeleneTheme.textMuted,
                          ),
                        ),
                      ),
                      Text(
                        '$prefix ',
                        style: TextStyle(
                          fontFamily: 'monospace',
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: textColor,
                        ),
                      ),
                      Expanded(
                        child: Text(
                          line.text,
                          style: TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 11.5,
                            color: textColor,
                            height: 1.35,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

enum _DiffType { unchanged, addition, deletion }

class _DiffLine {
  final _DiffType type;
  final String text;
  final int? oldLineNum;
  final int? newLineNum;

  _DiffLine({
    required this.type,
    required this.text,
    this.oldLineNum,
    this.newLineNum,
  });
}
