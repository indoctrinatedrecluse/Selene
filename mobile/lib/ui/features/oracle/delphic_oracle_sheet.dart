import 'package:flutter/material.dart';
import 'package:selene_mobile/data/services/selene_api_client.dart';
import 'package:selene_mobile/ui/core/theme.dart';

class DelphicOracleSheet extends StatefulWidget {
  final SeleneApiClient apiClient;
  final String activeContext;
  final Function(String) onInsertResult;

  const DelphicOracleSheet({
    super.key,
    required this.apiClient,
    required this.activeContext,
    required this.onInsertResult,
  });

  @override
  State<DelphicOracleSheet> createState() => _DelphicOracleSheetState();
}

class _DelphicOracleSheetState extends State<DelphicOracleSheet> {
  final TextEditingController _promptController = TextEditingController();
  bool _isLoading = false;
  String? _response;

  final List<String> _presets = [
    '✨ Continue technical prose',
    '🧮 Explain mathematical proof',
    '⚡ Optimize code block',
    '📑 Generate API specification',
  ];

  Future<void> _submitPrompt(String prompt) async {
    if (prompt.trim().isEmpty) return;

    setState(() {
      _isLoading = true;
      _response = null;
    });

    final result = await widget.apiClient.askDelphicOracle(
      prompt: prompt,
      context: widget.activeContext,
    );

    if (mounted) {
      setState(() {
        _isLoading = false;
        _response = result;
      });
    }
  }

  @override
  void dispose() {
    _promptController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(16, 16, 16, MediaQuery.of(context).viewInsets.bottom + 24),
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
                  color: SeleneTheme.purpleMystic.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: SeleneTheme.purpleMystic.withValues(alpha: 0.5)),
                ),
                child: const Text('🔮', style: TextStyle(fontSize: 18)),
              ),
              const SizedBox(width: 12),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'The Delphic Oracle',
                    style: TextStyle(
                      color: SeleneTheme.textPrimary,
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    'Pythian Intelligence & Prose Copilot',
                    style: TextStyle(color: SeleneTheme.textSecondary, fontSize: 12),
                  ),
                ],
              ),
              const Spacer(),
              if (_isLoading)
                const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(SeleneTheme.purpleMystic),
                  ),
                ),
            ],
          ),

          const SizedBox(height: 16),

          // Presets Carousel
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _presets.map((preset) {
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ActionChip(
                    label: Text(preset, style: const TextStyle(fontSize: 12, color: SeleneTheme.textPrimary)),
                    backgroundColor: SeleneTheme.surface,
                    side: const BorderSide(color: SeleneTheme.border),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    onPressed: () {
                      _promptController.text = preset.substring(2).trim();
                      _submitPrompt(_promptController.text);
                    },
                  ),
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: 12),

          // Input field
          TextField(
            controller: _promptController,
            style: const TextStyle(color: SeleneTheme.textPrimary, fontSize: 14),
            decoration: InputDecoration(
              hintText: 'Ask the Oracle for prose continuation, KaTeX formulas, or code...',
              hintStyle: const TextStyle(color: SeleneTheme.textMuted, fontSize: 13),
              filled: true,
              fillColor: SeleneTheme.surface,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: SeleneTheme.border),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: SeleneTheme.border),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: SeleneTheme.purpleMystic, width: 1.5),
              ),
              suffixIcon: IconButton(
                icon: const Icon(Icons.arrow_upward, color: SeleneTheme.purpleMystic),
                onPressed: () => _submitPrompt(_promptController.text),
              ),
            ),
            onSubmitted: _submitPrompt,
          ),

          // Response area
          if (_response != null) ...[
            const SizedBox(height: 14),
            Container(
              constraints: const BoxConstraints(maxHeight: 180),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: SeleneTheme.surface,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: SeleneTheme.borderHighlight),
              ),
              child: SingleChildScrollView(
                child: Text(
                  _response!,
                  style: const TextStyle(color: SeleneTheme.textPrimary, fontSize: 13.5, height: 1.5),
                ),
              ),
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton.icon(
                  icon: const Icon(Icons.add_circle_outline, size: 16),
                  label: const Text('Insert into Document'),
                  style: TextButton.styleFrom(
                    foregroundColor: SeleneTheme.lunarCyan,
                  ),
                  onPressed: () {
                    widget.onInsertResult(_response!);
                    Navigator.pop(context);
                  },
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
