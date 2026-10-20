import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_highlight/flutter_highlight.dart';
import 'package:flutter_highlight/themes/atom-one-dark.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:flutter_math_fork/flutter_math.dart';
import 'package:markdown/markdown.dart' as md;
import 'package:selene_mobile/ui/core/theme.dart';

class MarkdownCanvas extends StatelessWidget {
  final String content;

  const MarkdownCanvas({super.key, required this.content});

  @override
  Widget build(BuildContext context) {
    if (content.trim().isEmpty) {
      return const Center(
        child: Text(
          'Document is empty. Tap Edit to compose.',
          style: TextStyle(color: SeleneTheme.textMuted),
        ),
      );
    }

    return Markdown(
      data: content,
      selectable: true,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      builders: {
        'code': _CodeBlockBuilder(),
        'math': _MathElementBuilder(),
      },
      extensionSet: md.ExtensionSet(
        md.ExtensionSet.gitHubFlavored.blockSyntaxes,
        [
          _MathInlineSyntax(),
          _MathBlockSyntax(),
          ...md.ExtensionSet.gitHubFlavored.inlineSyntaxes,
        ],
      ),
      styleSheet: MarkdownStyleSheet(
        p: const TextStyle(
          color: SeleneTheme.textPrimary,
          fontSize: 15,
          height: 1.6,
        ),
        h1: const TextStyle(
          color: SeleneTheme.lunarSilver,
          fontSize: 24,
          fontWeight: FontWeight.bold,
          height: 1.3,
          letterSpacing: -0.4,
        ),
        h2: const TextStyle(
          color: SeleneTheme.lunarCyan,
          fontSize: 20,
          fontWeight: FontWeight.bold,
          height: 1.4,
          letterSpacing: -0.2,
        ),
        h3: const TextStyle(
          color: SeleneTheme.textPrimary,
          fontSize: 17,
          fontWeight: FontWeight.w600,
          height: 1.4,
        ),
        blockquote: const TextStyle(
          color: SeleneTheme.textSecondary,
          fontStyle: FontStyle.italic,
          fontSize: 14.5,
          height: 1.5,
        ),
        blockquoteDecoration: BoxDecoration(
          color: SeleneTheme.surfaceElevated,
          borderRadius: BorderRadius.circular(8),
          border: const Border(
            left: BorderSide(color: SeleneTheme.lunarCyan, width: 4),
          ),
        ),
        blockquotePadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        tableBorder: TableBorder.all(color: SeleneTheme.border, width: 1),
        tableHead: const TextStyle(
          color: SeleneTheme.lunarCyan,
          fontWeight: FontWeight.bold,
          fontSize: 13.5,
        ),
        tableBody: const TextStyle(
          color: SeleneTheme.textPrimary,
          fontSize: 13.5,
        ),
        tableHeadAlign: TextAlign.left,
        tablePadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        horizontalRuleDecoration: const BoxDecoration(
          border: Border(
            bottom: BorderSide(color: SeleneTheme.border, width: 1),
          ),
        ),
        listBullet: const TextStyle(color: SeleneTheme.lunarCyan, fontSize: 16),
        code: const TextStyle(
          color: SeleneTheme.lunarCyan,
          backgroundColor: Color(0xFF1E293B),
          fontFamily: 'monospace',
          fontSize: 13.5,
        ),
        codeblockDecoration: BoxDecoration(
          color: const Color(0xFF0F172A),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: SeleneTheme.border),
        ),
      ),
    );
  }
}

/// Custom syntax parser for inline math `$formula$`
class _MathInlineSyntax extends md.InlineSyntax {
  _MathInlineSyntax() : super(r'\$([^\$]+)\$');

  @override
  bool onMatch(md.InlineParser parser, Match match) {
    final formula = match.group(1);
    final el = md.Element('math', [md.Text(formula ?? '')]);
    el.attributes['inline'] = 'true';
    parser.addNode(el);
    return true;
  }
}

/// Custom syntax parser for block math `$$formula$$`
class _MathBlockSyntax extends md.InlineSyntax {
  _MathBlockSyntax() : super(r'\$\$([\s\S]+?)\$\$');

  @override
  bool onMatch(md.InlineParser parser, Match match) {
    final formula = match.group(1);
    final el = md.Element('math', [md.Text(formula ?? '')]);
    el.attributes['inline'] = 'false';
    parser.addNode(el);
    return true;
  }
}

/// Custom KaTeX Element Builder
class _MathElementBuilder extends MarkdownElementBuilder {
  @override
  Widget? visitElementAfter(md.Element element, TextStyle? preferredStyle) {
    final rawFormula = element.textContent.trim();
    final isInline = element.attributes['inline'] == 'true';

    try {
      if (isInline) {
        return Math.tex(
          rawFormula,
          textStyle: preferredStyle?.copyWith(
            color: SeleneTheme.lunarCyan,
            fontSize: (preferredStyle.fontSize ?? 15) * 1.05,
          ) ?? const TextStyle(color: SeleneTheme.lunarCyan, fontSize: 16),
        );
      } else {
        return Container(
          width: double.infinity,
          margin: const EdgeInsets.symmetric(vertical: 12),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: SeleneTheme.surfaceElevated,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: SeleneTheme.borderHighlight, width: 1),
          ),
          alignment: Alignment.center,
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Math.tex(
              rawFormula,
              textStyle: const TextStyle(
                color: SeleneTheme.textPrimary,
                fontSize: 17,
              ),
            ),
          ),
        );
      }
    } catch (_) {
      // Fallback text if KaTeX parser encounters unsupported TeX symbol
      return Text(
        '\$$rawFormula\$',
        style: preferredStyle?.copyWith(fontFamily: 'monospace', color: SeleneTheme.goldAccent),
      );
    }
  }
}

/// Custom Syntax-Highlighted Code Block Builder
class _CodeBlockBuilder extends MarkdownElementBuilder {
  @override
  Widget? visitElementAfter(md.Element element, TextStyle? preferredStyle) {
    final code = element.textContent;
    String language = 'plaintext';
    final classAttr = element.attributes['class'];
    if (classAttr != null && classAttr.startsWith('language-')) {
      language = classAttr.replaceFirst('language-', '').toLowerCase();
    }

    // Only format multiline code blocks
    if (!code.contains('\n') && classAttr == null) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(
          code,
          style: const TextStyle(
            color: SeleneTheme.lunarCyan,
            fontFamily: 'monospace',
            fontSize: 13,
          ),
        ),
      );
    }

    return _InteractiveCodeSandboxCard(code: code, language: language);
  }
}

class _InteractiveCodeSandboxCard extends StatefulWidget {
  final String code;
  final String language;

  const _InteractiveCodeSandboxCard({
    required this.code,
    required this.language,
  });

  @override
  State<_InteractiveCodeSandboxCard> createState() => _InteractiveCodeSandboxCardState();
}

class _InteractiveCodeSandboxCardState extends State<_InteractiveCodeSandboxCard> {
  bool _showOutput = false;
  bool _isExecuting = false;
  int _reactCounter = 0;
  int _heexPing = 14;
  bool _swiftToggle = true;

  bool get _isExecutable {
    final lang = widget.language.toLowerCase();
    return [
      'python', 'py',
      'dart',
      'sql', 'duckdb',
      'http', 'curl',
      'heex', 'phoenix',
      'swift', 'swiftui',
      'react', 'jsx', 'tsx', 'javascript', 'js'
    ].contains(lang);
  }

  void _triggerRun() async {
    setState(() {
      _isExecuting = true;
      _showOutput = true;
    });

    await Future.delayed(const Duration(milliseconds: 250));
    if (mounted) {
      setState(() {
        _isExecuting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang = widget.language.toLowerCase();

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF0B0F17),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: SeleneTheme.borderHighlight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
            decoration: const BoxDecoration(
              color: SeleneTheme.surfaceElevated,
              borderRadius: BorderRadius.vertical(top: Radius.circular(11)),
              border: Border(bottom: BorderSide(color: SeleneTheme.border)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      margin: const EdgeInsets.only(right: 6),
                      decoration: const BoxDecoration(
                        color: SeleneTheme.lunarCyan,
                        shape: BoxShape.circle,
                      ),
                    ),
                    Text(
                      widget.language.toUpperCase(),
                      style: const TextStyle(
                        color: SeleneTheme.lunarCyan,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.8,
                      ),
                    ),
                  ],
                ),
                Row(
                  children: [
                    if (_isExecutable) ...[
                      InkWell(
                        onTap: _isExecuting ? null : _triggerRun,
                        borderRadius: BorderRadius.circular(6),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: _showOutput
                                ? SeleneTheme.emeraldSuccess.withValues(alpha: 0.2)
                                : SeleneTheme.lunarCyan.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(
                              color: _showOutput ? SeleneTheme.emeraldSuccess : SeleneTheme.lunarCyan,
                              width: 1,
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                _isExecuting ? Icons.hourglass_top : Icons.bolt,
                                size: 13,
                                color: _showOutput ? SeleneTheme.emeraldSuccess : SeleneTheme.lunarCyan,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                _showOutput ? 'Re-Run' : 'Run Engine',
                                style: TextStyle(
                                  color: _showOutput ? SeleneTheme.emeraldSuccess : SeleneTheme.lunarCyan,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                    ],
                    InkWell(
                      onTap: () {
                        Clipboard.setData(ClipboardData(text: widget.code));
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Copied code block to clipboard'),
                            duration: Duration(seconds: 1),
                          ),
                        );
                      },
                      borderRadius: BorderRadius.circular(4),
                      child: const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        child: Row(
                          children: [
                            Icon(Icons.copy, size: 13, color: SeleneTheme.textSecondary),
                            SizedBox(width: 4),
                            Text(
                              'Copy',
                              style: TextStyle(color: SeleneTheme.textSecondary, fontSize: 11),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Code Body
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.all(12),
            child: HighlightView(
              widget.code.trimRight(),
              language: widget.language,
              theme: atomOneDarkTheme,
              textStyle: const TextStyle(
                fontFamily: 'monospace',
                fontSize: 13,
                height: 1.45,
              ),
            ),
          ),

          // Live Sandbox Simulated Output Box
          if (_showOutput) ...[
            Container(
              decoration: const BoxDecoration(
                color: Color(0xFF06090F),
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(11)),
                border: Border(top: BorderSide(color: SeleneTheme.border)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                    color: const Color(0xFF0F172A),
                    child: Row(
                      children: [
                        const Icon(Icons.terminal, size: 13, color: SeleneTheme.emeraldSuccess),
                        const SizedBox(width: 6),
                        Text(
                          _getEngineTitle(lang),
                          style: const TextStyle(
                            color: SeleneTheme.emeraldSuccess,
                            fontSize: 10.5,
                            fontFamily: 'monospace',
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const Spacer(),
                        InkWell(
                          onTap: () => setState(() => _showOutput = false),
                          child: const Icon(Icons.close, size: 14, color: SeleneTheme.textMuted),
                        ),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: _isExecuting
                        ? const Center(
                            child: Padding(
                              padding: EdgeInsets.symmetric(vertical: 8),
                              child: SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation(SeleneTheme.emeraldSuccess)),
                              ),
                            ),
                          )
                        : _buildEngineResult(lang),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _getEngineTitle(String lang) {
    switch (lang) {
      case 'python':
      case 'py':
        return 'PYODIDE PYTHON 3.12 WASM SANDBOX • 1.4ms';
      case 'dart':
        return 'DART 3.13 JIT EXECUTION • 0.9ms';
      case 'sql':
      case 'duckdb':
        return 'DUCKDB VECTORIZED OLAP • 0.8ms (2 ROWS)';
      case 'http':
      case 'curl':
        return 'HERMES RELAY GATEWAY • 200 OK • 18ms';
      case 'heex':
      case 'phoenix':
        return 'PHOENIX OF OLYMPUS LIVEVIEW TELEMETRY';
      case 'swift':
      case 'swiftui':
        return 'ZEPHYR SWIFTUI CANVAS PREVIEW';
      case 'react':
      case 'jsx':
      case 'tsx':
      case 'javascript':
      case 'js':
        return 'REACT 19 WASM COMPONENT SANDBOX';
      default:
        return 'SANDBOX EXECUTION LOGS';
    }
  }

  Widget _buildEngineResult(String lang) {
    if (lang == 'react' || lang == 'jsx' || lang == 'tsx') {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF0F172A),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: SeleneTheme.borderHighlight),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '⚛️ Live Interactive Counter',
              style: TextStyle(color: SeleneTheme.lunarCyan, fontWeight: FontWeight.bold, fontSize: 13),
            ),
            const SizedBox(height: 8),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: SeleneTheme.lunarCyan,
                foregroundColor: SeleneTheme.background,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              onPressed: () => setState(() => _reactCounter++),
              child: Text('Count: $_reactCounter (Tap to Increment)'),
            ),
          ],
        ),
      );
    }

    if (lang == 'heex' || lang == 'phoenix') {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF1E1405),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: SeleneTheme.goldAccent.withValues(alpha: 0.4)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '🦅 Phoenix LiveView Telemetry',
              style: TextStyle(color: SeleneTheme.goldAccent, fontWeight: FontWeight.bold, fontSize: 13),
            ),
            const SizedBox(height: 4),
            Text(
              'Assigns: node_id="olympus-01" | latency=${_heexPing}ms | state=:nominal',
              style: const TextStyle(fontFamily: 'monospace', color: SeleneTheme.textSecondary, fontSize: 11),
            ),
            const SizedBox(height: 8),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: SeleneTheme.goldAccent,
                foregroundColor: SeleneTheme.background,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              onPressed: () => setState(() => _heexPing = (_heexPing + 3) % 40 + 8),
              child: const Text('Dispatch phx-click="ping"'),
            ),
          ],
        ),
      );
    }

    if (lang == 'swift' || lang == 'swiftui') {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF0F172A),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: SeleneTheme.purpleMystic.withValues(alpha: 0.4)),
        ),
        child: Row(
          children: [
            const Text(
              '🕊️ Starlight Telemetry Toggle:',
              style: TextStyle(color: SeleneTheme.purpleMystic, fontSize: 13),
            ),
            const Spacer(),
            Switch(
              value: _swiftToggle,
              activeThumbColor: SeleneTheme.purpleMystic,
              onChanged: (val) => setState(() => _swiftToggle = val),
            ),
          ],
        ),
      );
    }

    if (lang == 'sql' || lang == 'duckdb') {
      return Table(
        border: TableBorder.all(color: SeleneTheme.border),
        children: const [
          TableRow(
            decoration: BoxDecoration(color: Color(0xFF131D31)),
            children: [
              Padding(padding: EdgeInsets.all(6), child: Text('region', style: TextStyle(color: SeleneTheme.lunarCyan, fontWeight: FontWeight.bold, fontSize: 11))),
              Padding(padding: EdgeInsets.all(6), child: Text('count', style: TextStyle(color: SeleneTheme.lunarCyan, fontWeight: FontWeight.bold, fontSize: 11))),
            ],
          ),
          TableRow(
            children: [
              Padding(padding: EdgeInsets.all(6), child: Text('eu-west', style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 11))),
              Padding(padding: EdgeInsets.all(6), child: Text('4', style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 11))),
            ],
          ),
          TableRow(
            children: [
              Padding(padding: EdgeInsets.all(6), child: Text('us-east', style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 11))),
              Padding(padding: EdgeInsets.all(6), child: Text('9', style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 11))),
            ],
          ),
        ],
      );
    }

    if (lang == 'http' || lang == 'curl') {
      return const SelectableText(
        'HTTP/1.1 200 OK\nDate: Tue, 20 Oct 2026 14:30:00 GMT\nContent-Type: application/json\nX-Hermes-Relay: celestial-gateway-v4\n\n{\n  "status": "celestial_orbit_nominal",\n  "active_nodes": 12,\n  "mesh_latency_ms": 0.42,\n  "p2p_channel": "open"\n}',
        style: TextStyle(fontFamily: 'monospace', color: SeleneTheme.emeraldSuccess, fontSize: 11.5, height: 1.4),
      );
    }

    // Default console log output (Python / Dart / JS)
    return const SelectableText(
      '✨ Output:\n[0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]\n\nExecution finished in 1.4ms with exit code 0.',
      style: TextStyle(fontFamily: 'monospace', color: SeleneTheme.emeraldSuccess, fontSize: 12, height: 1.4),
    );
  }
}
