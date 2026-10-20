import 'package:flutter/material.dart';
import 'package:selene_mobile/data/services/lunar_service.dart';
import 'package:selene_mobile/ui/core/theme.dart';

class LunarDiademWidget extends StatelessWidget {
  const LunarDiademWidget({super.key});

  void _showLunarModal(BuildContext context, LunarPhaseInfo info) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 20),
                  decoration: BoxDecoration(
                    color: SeleneTheme.borderHighlight,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              Row(
                children: [
                  Text(info.symbol, style: const TextStyle(fontSize: 44)),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          info.greekName,
                          style: const TextStyle(
                            color: SeleneTheme.lunarCyan,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          '${info.greekAlphabet} • ${info.englishName}',
                          style: const TextStyle(
                            color: SeleneTheme.textSecondary,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: SeleneTheme.lunarCyan.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: SeleneTheme.lunarCyan.withValues(alpha: 0.4)),
                    ),
                    child: Text(
                      '${info.illuminationPercent.toStringAsFixed(1)}%',
                      style: const TextStyle(
                        color: SeleneTheme.lunarCyan,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: SeleneTheme.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: SeleneTheme.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.auto_stories, size: 16, color: SeleneTheme.goldAccent),
                        SizedBox(width: 6),
                        Text(
                          'Orphic Hymn to Selene (Σελήνη)',
                          style: TextStyle(
                            color: SeleneTheme.goldAccent,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      info.hymnSnippet,
                      style: const TextStyle(
                        color: SeleneTheme.textPrimary,
                        fontSize: 13.5,
                        fontStyle: FontStyle.italic,
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              // Cycle Progress Bar
              const Text(
                'Synodic Cycle Progress (29.53 Days)',
                style: TextStyle(color: SeleneTheme.textMuted, fontSize: 11),
              ),
              const SizedBox(height: 6),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: info.cycleProgress,
                  backgroundColor: SeleneTheme.surface,
                  valueColor: const AlwaysStoppedAnimation<Color>(SeleneTheme.lunarCyan),
                  minHeight: 6,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final info = LunarService.calculateCurrentPhase();

    return InkWell(
      onTap: () => _showLunarModal(context, info),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: SeleneTheme.surfaceElevated,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: SeleneTheme.borderHighlight),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(info.symbol, style: const TextStyle(fontSize: 14)),
            const SizedBox(width: 6),
            Text(
              info.greekName,
              style: const TextStyle(
                color: SeleneTheme.lunarCyan,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(width: 6),
            Text(
              '${info.illuminationPercent.toStringAsFixed(0)}%',
              style: const TextStyle(
                color: SeleneTheme.textSecondary,
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
