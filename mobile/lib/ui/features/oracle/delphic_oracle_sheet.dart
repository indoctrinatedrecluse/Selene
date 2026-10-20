import 'package:flutter/material.dart';
import 'package:selene_mobile/data/services/selene_api_client.dart';
import 'package:selene_mobile/ui/core/theme.dart';

class OracleDivinationPreset {
  final String icon;
  final String name;
  final String role;
  final String prompt;

  const OracleDivinationPreset({
    required this.icon,
    required this.name,
    required this.role,
    required this.prompt,
  });
}

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

  final List<OracleDivinationPreset> _divinations = const [
    OracleDivinationPreset(
      icon: '🌋',
      name: "Hephaestus's Forge",
      role: 'Algorithm Optimization',
      prompt: 'Harden and optimize this implementation: diagnose algorithmic bottlenecks, improve asymptotic runtime, and ensure robust error boundaries.',
    ),
    OracleDivinationPreset(
      icon: '🦉',
      name: "Athena's Wisdom",
      role: 'Architectural Critique',
      prompt: 'Evaluate this architecture with strategic wisdom: critique component coupling, state invariants, data flow, and recommend hardened design patterns.',
    ),
    OracleDivinationPreset(
      icon: '💨',
      name: "Zephyrus's Breeze",
      role: 'Prose Polish',
      prompt: 'Refine and polish this technical prose: elevate clarity, conciseness, and precision while maintaining an authoritative engineering voice.',
    ),
    OracleDivinationPreset(
      icon: '📜',
      name: "Hermes' Transmutation",
      role: 'API & Schema Spec',
      prompt: 'Transmute this specification into a rigorous RFC schema with complete endpoint signatures, type models, and HTTP telemetry.',
    ),
    OracleDivinationPreset(
      icon: '🧮',
      name: 'Pythagorean Lemma',
      role: 'Formal KaTeX Derivation',
      prompt: 'Derive a step-by-step mathematical proof in KaTeX LaTeX notation for the theoretical equations described in this document.',
    ),
    OracleDivinationPreset(
      icon: '🪐',
      name: "Apollo's Prophecy",
      role: 'Failure Mode Analysis',
      prompt: 'Identify subtle concurrency edge cases, race conditions, memory leaks, and distributed network partition risks in this system.',
    ),
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
    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.88,
      ),
      padding: EdgeInsets.fromLTRB(16, 12, 16, MediaQuery.of(context).viewInsets.bottom + 24),
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
                    'Pythian Intelligence & Olympian Divinations',
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

          const SizedBox(height: 12),

          // Divination Presets Carousel
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _divinations.map((divination) {
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ActionChip(
                    avatar: Text(divination.icon, style: const TextStyle(fontSize: 13)),
                    label: Text(divination.name, style: const TextStyle(fontSize: 12, color: SeleneTheme.textPrimary)),
                    backgroundColor: SeleneTheme.surface,
                    side: const BorderSide(color: SeleneTheme.border),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    onPressed: () {
                      _promptController.text = divination.prompt;
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
            style: const TextStyle(color: SeleneTheme.textPrimary, fontSize: 13.5),
            maxLines: 2,
            minLines: 1,
            decoration: InputDecoration(
              hintText: 'Seek divination from the Pythia (prose, formulas, architecture)...',
              hintStyle: const TextStyle(color: SeleneTheme.textMuted, fontSize: 12.5),
              filled: true,
              fillColor: SeleneTheme.surface,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
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
                borderSide: const BorderSide(color: SeleneTheme.purpleMystic),
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
            const SizedBox(height: 12),
            Flexible(
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: SeleneTheme.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: SeleneTheme.purpleMystic.withValues(alpha: 0.4)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.auto_awesome, size: 14, color: SeleneTheme.purpleMystic),
                            SizedBox(width: 6),
                            Text(
                              'Pythian Revelation',
                              style: TextStyle(
                                color: SeleneTheme.purpleMystic,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        ElevatedButton.icon(
                          icon: const Icon(Icons.input, size: 14),
                          label: const Text('Insert into Canvas'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: SeleneTheme.purpleMystic.withValues(alpha: 0.25),
                            foregroundColor: SeleneTheme.purpleMystic,
                            elevation: 0,
                            side: const BorderSide(color: SeleneTheme.purpleMystic),
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            visualDensity: VisualDensity.compact,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          onPressed: () {
                            widget.onInsertResult(_response!);
                            Navigator.pop(context);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Oracle divination appended to document'),
                                duration: Duration(seconds: 1),
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                    const Divider(height: 16, color: SeleneTheme.border),
                    Expanded(
                      child: SingleChildScrollView(
                        child: SelectableText(
                          _response!,
                          style: const TextStyle(
                            color: SeleneTheme.textPrimary,
                            fontSize: 13,
                            height: 1.5,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
