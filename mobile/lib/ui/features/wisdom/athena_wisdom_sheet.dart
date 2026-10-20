import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:selene_mobile/ui/core/theme.dart';

class AthenaWisdomSheet extends StatelessWidget {
  const AthenaWisdomSheet({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
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
                  color: SeleneTheme.goldAccent.withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: SeleneTheme.goldAccent.withValues(alpha: 0.4)),
                ),
                child: const Text('💡', style: TextStyle(fontSize: 18)),
              ),
              const SizedBox(width: 12),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Athena's Wisdom",
                    style: TextStyle(
                      color: SeleneTheme.textPrimary,
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    'Olympian Master Guide & Mobile Ergonomics',
                    style: TextStyle(color: SeleneTheme.textSecondary, fontSize: 12),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 16),

          Flexible(
            child: ListView(
              shrinkWrap: true,
              children: const [
                _WisdomCard(
                  icon: '🧮',
                  title: 'KaTeX Mathematical Proofs',
                  description: 'Wrap expressions in single \$ for inline math (\$E = mc^2\$) or double \$\$ on their own lines for centered display equations.',
                  snippet: r'$$\oint_{\partial \Sigma} \mathbf{B} \cdot d\boldsymbol{\ell} = \mu_0 I_{\text{enc}}$$ ',
                ),
                _WisdomCard(
                  icon: '💻',
                  title: 'Polyglot Syntax Intelligence',
                  description: 'Create code fences with your language of choice (```python, ```dart, ```rust, ```sql) to trigger high-contrast syntax highlighting.',
                  snippet: "```dart\nvoid main() => print('✨ Selene');\n```",
                ),
                _WisdomCard(
                  icon: '🎨',
                  title: "Daedalus's Drawing Board",
                  description: 'Tap the palette icon to draw directly over documents with Calliope’s Stylus or Apollo’s Arrow. Toggle the hand icon to interact underneath.',
                ),
                _WisdomCard(
                  icon: '⏳',
                  title: 'Chronos Epoch Snapshots',
                  description: 'Tag critical milestones before big refactors. If an experiment goes awry, use safe time-warp rollbacks with 1 tap.',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _WisdomCard extends StatelessWidget {
  final String icon;
  final String title;
  final String description;
  final String? snippet;

  const _WisdomCard({
    required this.icon,
    required this.title,
    required this.description,
    this.snippet,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: SeleneTheme.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: SeleneTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(icon, style: const TextStyle(fontSize: 16)),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  color: SeleneTheme.lunarCyan,
                  fontWeight: FontWeight.bold,
                  fontSize: 13.5,
                ),
              ),
              const Spacer(),
              if (snippet != null)
                InkWell(
                  onTap: () {
                    Clipboard.setData(ClipboardData(text: snippet!));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Copied specimen snippet'),
                        duration: Duration(seconds: 1),
                      ),
                    );
                  },
                  child: const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                    child: Text(
                      'Copy Specimen',
                      style: TextStyle(color: SeleneTheme.goldAccent, fontSize: 11),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            description,
            style: const TextStyle(
              color: SeleneTheme.textPrimary,
              fontSize: 12.5,
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }
}
