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

  @override
  void dispose() {
    _milestoneController.dispose();
    super.dispose();
  }

  void _promptNewMilestone() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Text('⏳', style: TextStyle(fontSize: 18)),
            SizedBox(width: 8),
            Text('Tag Milestone Checkpoint', style: TextStyle(fontSize: 16)),
          ],
        ),
        content: TextField(
          controller: _milestoneController,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: 'e.g. [Pre-Refactor Architecture]',
            hintStyle: TextStyle(color: SeleneTheme.textMuted, fontSize: 13),
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

  @override
  Widget build(BuildContext context) {
    final doc = widget.repository.activeDocument;
    final epochs = doc?.epochs ?? [];

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 36,
              height: 4,
              margin: const EdgeInsets.only(bottom: 16),
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
              const Column(
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
                    'Semantic Revision History & Safe Time-Warp',
                    style: TextStyle(color: SeleneTheme.textSecondary, fontSize: 12),
                  ),
                ],
              ),
              const Spacer(),
              ElevatedButton.icon(
                icon: const Icon(Icons.bookmark_add, size: 16),
                label: const Text('Tag'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: SeleneTheme.lunarCyan.withValues(alpha: 0.2),
                  foregroundColor: SeleneTheme.lunarCyan,
                  elevation: 0,
                  side: const BorderSide(color: SeleneTheme.lunarCyan),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
                  visualDensity: VisualDensity.compact,
                ),
                onPressed: _promptNewMilestone,
              ),
            ],
          ),

          const SizedBox(height: 16),

          if (epochs.isEmpty) ...[
            Container(
              padding: const EdgeInsets.all(24),
              alignment: Alignment.center,
              child: const Text(
                'No historical epochs recorded yet.\nTap "Tag" to create your first milestone checkpoint.',
                textAlign: TextAlign.center,
                style: TextStyle(color: SeleneTheme.textMuted, fontSize: 13),
              ),
            ),
          ] else ...[
            Flexible(
              child: ListView.builder(
                shrinkWrap: true,
                itemCount: epochs.length,
                itemBuilder: (context, index) {
                  final epoch = epochs[index];
                  final isSelected = _selectedEpoch?.id == epoch.id;
                  final timeStr = DateFormat('MMM d, h:mm a').format(epoch.timestamp);

                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    decoration: BoxDecoration(
                      color: isSelected ? SeleneTheme.surfaceElevated : SeleneTheme.surface,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: isSelected ? SeleneTheme.lunarCyan : SeleneTheme.border,
                        width: isSelected ? 1.5 : 1,
                      ),
                    ),
                    child: ListTile(
                      title: Text(
                        epoch.label,
                        style: TextStyle(
                          color: isSelected ? SeleneTheme.lunarCyan : SeleneTheme.textPrimary,
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                      ),
                      subtitle: Text(
                        timeStr,
                        style: const TextStyle(color: SeleneTheme.textMuted, fontSize: 11),
                      ),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.restore, size: 18, color: SeleneTheme.lunarCyan),
                            tooltip: 'Time-Warp Restore',
                            onPressed: () {
                              widget.repository.restoreEpoch(epoch);
                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Restored epoch: ${epoch.label}'),
                                  duration: const Duration(seconds: 2),
                                ),
                              );
                            },
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
}
