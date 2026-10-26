import 'dart:convert';
import 'dart:math' as math;
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
  late bool _showOutput;
  bool _isExecuting = false;
  late String _currentCode;
  late TextEditingController _codeController;
  bool _isEditing = false;

  // Stateful interactive sandbox properties
  int _reactCounter = 42;
  int _vueCounter = 12;
  int _angularSignal = 7;
  int _rustSignal = 99;
  int _flutterSamples = 14;
  int _heexPing = 14;
  bool _swiftToggle = true;
  String _chartViewMode = 'bar'; // bar, line, metrics
  int _watArgA = 24;
  int _watArgB = 18;
  int? _watResult;

  bool get _isVisualFormat {
    final l = widget.language.toLowerCase();
    return [
      'chart', 'vega', 'vegalite',
      'mermaid',
      'math', 'katex', 'latex',
      'glsl', 'shader', 'wgsl',
      'wavedrom', 'waveform', 'regview',
      'd2', 'd2lang',
    ].contains(l);
  }

  @override
  void initState() {
    super.initState();
    _currentCode = widget.code;
    _codeController = TextEditingController(text: _currentCode);
    // Visual non-code formats (charts, diagrams, math, shaders) are displayed by default!
    _showOutput = _isVisualFormat;
  }

  @override
  void didUpdateWidget(covariant _InteractiveCodeSandboxCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.code != widget.code && !_isEditing) {
      _currentCode = widget.code;
      _codeController.text = _currentCode;
    }
  }

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  void _triggerRun() async {
    setState(() {
      _isExecuting = true;
      _showOutput = true;
    });

    await Future.delayed(const Duration(milliseconds: 200));
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
                      decoration: BoxDecoration(
                        color: _isVisualFormat ? SeleneTheme.goldAccent : SeleneTheme.lunarCyan,
                        shape: BoxShape.circle,
                      ),
                    ),
                    Text(
                      widget.language.toUpperCase(),
                      style: TextStyle(
                        color: _isVisualFormat ? SeleneTheme.goldAccent : SeleneTheme.lunarCyan,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.8,
                      ),
                    ),
                  ],
                ),
                Row(
                  children: [
                    // Primary Action: Run Engine OR Display/Hide Visual
                    InkWell(
                      onTap: _isExecuting
                          ? null
                          : () {
                              if (_isVisualFormat) {
                                setState(() => _showOutput = !_showOutput);
                              } else {
                                _triggerRun();
                              }
                            },
                      borderRadius: BorderRadius.circular(6),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: _showOutput
                              ? (_isVisualFormat
                                  ? SeleneTheme.goldAccent.withValues(alpha: 0.2)
                                  : SeleneTheme.emeraldSuccess.withValues(alpha: 0.2))
                              : SeleneTheme.lunarCyan.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(
                            color: _showOutput
                                ? (_isVisualFormat ? SeleneTheme.goldAccent : SeleneTheme.emeraldSuccess)
                                : SeleneTheme.lunarCyan,
                            width: 1,
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              _isVisualFormat
                                  ? (_showOutput ? Icons.visibility_off_outlined : Icons.visibility_outlined)
                                  : (_isExecuting ? Icons.hourglass_top : Icons.bolt),
                              size: 13,
                              color: _showOutput
                                  ? (_isVisualFormat ? SeleneTheme.goldAccent : SeleneTheme.emeraldSuccess)
                                  : SeleneTheme.lunarCyan,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              _isVisualFormat
                                  ? (_showOutput ? 'Hide Visual' : 'Display Visual')
                                  : (_showOutput ? 'Re-Run' : 'Run Engine'),
                              style: TextStyle(
                                color: _showOutput
                                    ? (_isVisualFormat ? SeleneTheme.goldAccent : SeleneTheme.emeraldSuccess)
                                    : SeleneTheme.lunarCyan,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),

                    // In-Situ Code Editor Toggle
                    InkWell(
                      onTap: () {
                        setState(() {
                          _isEditing = !_isEditing;
                          if (_isEditing) {
                            _codeController.text = _currentCode;
                          }
                        });
                      },
                      borderRadius: BorderRadius.circular(4),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: _isEditing ? SeleneTheme.goldAccent.withValues(alpha: 0.2) : Colors.transparent,
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(
                            color: _isEditing ? SeleneTheme.goldAccent : SeleneTheme.border,
                            width: 1,
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              _isEditing ? Icons.check_circle_outline : Icons.edit_note,
                              size: 13,
                              color: _isEditing ? SeleneTheme.goldAccent : SeleneTheme.textSecondary,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              _isEditing ? 'Editing' : 'Edit',
                              style: TextStyle(
                                color: _isEditing ? SeleneTheme.goldAccent : SeleneTheme.textSecondary,
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),

                    // Copy Code
                    InkWell(
                      onTap: () {
                        Clipboard.setData(ClipboardData(text: _currentCode));
                        ScaffoldMessenger.of(context).clearSnackBars();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Copied code block to clipboard'),
                            duration: Duration(milliseconds: 900),
                            behavior: SnackBarBehavior.floating,
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

          // Code Body (HighlightView OR In-Situ Monospace Scratchpad)
          if (_isEditing) ...[
            Container(
              padding: const EdgeInsets.all(12),
              color: const Color(0xFF070B12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.code, size: 14, color: SeleneTheme.goldAccent),
                      const SizedBox(width: 6),
                      const Text(
                        'In-Situ Code Scratchpad',
                        style: TextStyle(color: SeleneTheme.goldAccent, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                      const Spacer(),
                      if (_currentCode != widget.code)
                        InkWell(
                          onTap: () {
                            setState(() {
                              _currentCode = widget.code;
                              _codeController.text = widget.code;
                            });
                          },
                          child: const Padding(
                            padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            child: Text('Reset to Sample', style: TextStyle(color: SeleneTheme.textMuted, fontSize: 10)),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _codeController,
                    maxLines: null,
                    style: const TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 12.5,
                      color: SeleneTheme.textPrimary,
                      height: 1.45,
                    ),
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: const Color(0xFF0F172A),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: SeleneTheme.borderHighlight),
                      ),
                      contentPadding: const EdgeInsets.all(10),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      TextButton(
                        onPressed: () => setState(() => _isEditing = false),
                        child: const Text('Cancel', style: TextStyle(color: SeleneTheme.textMuted, fontSize: 11)),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton.icon(
                        icon: const Icon(Icons.play_arrow, size: 14),
                        label: const Text('Apply & Run'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: SeleneTheme.emeraldSuccess,
                          foregroundColor: SeleneTheme.background,
                          visualDensity: VisualDensity.compact,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                        ),
                        onPressed: () {
                          setState(() {
                            _currentCode = _codeController.text;
                            _isEditing = false;
                          });
                          _triggerRun();
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ] else ...[
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.all(12),
              child: HighlightView(
                _currentCode.trimRight(),
                language: widget.language,
                theme: atomOneDarkTheme,
                textStyle: const TextStyle(
                  fontFamily: 'monospace',
                  fontSize: 12.5,
                  height: 1.45,
                ),
              ),
            ),
          ],

          // Executed Sandbox or Rendered Visual View
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
                        Icon(
                          _isVisualFormat ? Icons.auto_awesome : Icons.terminal,
                          size: 13,
                          color: _isVisualFormat ? SeleneTheme.goldAccent : SeleneTheme.emeraldSuccess,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          _getEngineTitle(lang),
                          style: TextStyle(
                            color: _isVisualFormat ? SeleneTheme.goldAccent : SeleneTheme.emeraldSuccess,
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
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation(SeleneTheme.emeraldSuccess),
                                ),
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
      case 'chart':
      case 'vega':
      case 'vegalite':
        return 'SELENE VECTOR CHART ENGINE • 60 FPS CANVAS';
      case 'mermaid':
        return 'AST FLOWCHART & MERMAID RENDERER';
      case 'math':
      case 'katex':
      case 'latex':
        return 'KATEX VECTOR MATHEMATICAL ENGINE';
      case 'glsl':
      case 'shader':
      case 'wgsl':
        return 'GLSL WEBGL SHADER PIPELINE • 60 FPS';
      case 'vue':
        return 'VUE 3.5 COMPOSITION API WASM SANDBOX';
      case 'svelte':
        return 'SVELTE 5 RUNES REACTIVE SANDBOX';
      case 'angular':
        return 'ANGULAR 19 SIGNALS COMPONENT RUNTIME';
      case 'flutter':
      case 'dart':
        return 'FLUTTER 3.29 COMPONENT RUNTIME';
      case 'python':
      case 'py':
        return 'PYODIDE PYTHON 3.12 WASM SANDBOX • 1.4ms';
      case 'blade':
      case 'php':
        return 'LARAVEL 11 BLADE ARTISAN RUNTIME • 0.7ms';
      case 'erb':
      case 'ruby':
        return 'RUBY ON RAILS 8.0 HOTWIRE TURBO FRAME';
      case 'go':
      case 'gotemplate':
      case 'hugo':
        return 'GO 1.23 TEMPLATE ENGINE • HUGO RUNTIME';
      case 'django':
      case 'jinja2':
        return 'DJANGO 5.1 & JINJA2 WASM EVALUATOR';
      case 'rust':
      case 'leptos':
      case 'yew':
        return 'RUST WASM32 LEPTOS REACTIVE ENGINE';
      case 'sql':
      case 'sqlite':
      case 'libsql':
        return 'LIBSQL / SQLITE IN-MEMORY ENGINE • 0.6ms';
      case 'duckdb':
        return 'DUCKDB VECTORIZED OLAP ENGINE • 0.8ms';
      case 'heex':
      case 'phoenix':
      case 'liveview':
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
      case 'bash':
      case 'sh':
      case 'shell':
      case 'zsh':
        return 'POSIX SHELL CLI RUNTIME • EXIT 0';
      case 'http':
      case 'curl':
      case 'graphql':
      case 'rest':
        return 'HERMES RELAY GATEWAY • 200 OK • 18ms';
      case 'wavedrom':
      case 'waveform':
      case 'regview':
        return 'WAVEDROM DIGITAL TIMING & REGISTER ENGINE';
      case 'd2':
      case 'd2lang':
        return 'D2 MODERN ARCHITECTURE DAG ENGINE';
      case 'wat':
      case 'wast':
        return 'WASM32 TEXT BYTECODE STACK RUNNER • 0.01ms';
      default:
        return '${lang.toUpperCase()} EXECUTION SANDBOX • 0.9ms';
    }
  }

  Widget _buildEngineResult(String lang) {
    // WaveDrom Digital Timing / Register View
    if (lang == 'wavedrom' || lang == 'waveform' || lang == 'regview') {
      return _buildWaveDromWidget();
    }

    // D2 Architecture Diagram
    if (lang == 'd2' || lang == 'd2lang') {
      return _buildD2Widget();
    }

    // WebAssembly Text Bytecode (WAT)
    if (lang == 'wat' || lang == 'wast') {
      return _buildWatWidget();
    }

    // 1. Declarative Vector Charts (Sample 13)
    if (lang == 'chart' || lang == 'vega' || lang == 'vegalite') {
      return _buildChartWidget();
    }

    // 2. Mermaid Diagrams (Samples 01, 05, 15)
    if (lang == 'mermaid') {
      return _buildMermaidWidget();
    }

    // 3. KaTeX Formula Blocks (Samples 01, 05, 15)
    if (lang == 'math' || lang == 'katex' || lang == 'latex') {
      return _buildMathWidget();
    }

    // 4. GLSL / Shader Canvas (Sample 12)
    if (lang == 'glsl' || lang == 'shader' || lang == 'wgsl') {
      return _buildShaderWidget();
    }

    // 5. React / TSX Component (Samples 01, 02, 05, 15, 19, 20)
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
            const Row(
              children: [
                Text('⚛️', style: TextStyle(fontSize: 16)),
                SizedBox(width: 8),
                Text(
                  'Live Interactive Component Sandbox',
                  style: TextStyle(color: SeleneTheme.lunarCyan, fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                ElevatedButton.icon(
                  icon: const Icon(Icons.favorite, size: 14, color: Colors.pinkAccent),
                  label: Text('Likes: $_reactCounter'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: SeleneTheme.lunarCyan.withValues(alpha: 0.2),
                    foregroundColor: SeleneTheme.lunarCyan,
                    side: const BorderSide(color: SeleneTheme.lunarCyan),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: () => setState(() => _reactCounter++),
                ),
                const SizedBox(width: 10),
                TextButton(
                  onPressed: () => setState(() => _reactCounter = 42),
                  child: const Text('Reset', style: TextStyle(color: SeleneTheme.textMuted, fontSize: 12)),
                ),
              ],
            ),
          ],
        ),
      );
    }

    // 6. Vue 3.5 & Svelte 5 (Sample 02)
    if (lang == 'vue' || lang == 'svelte') {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF0F1F17),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: SeleneTheme.emeraldSuccess.withValues(alpha: 0.4)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(lang == 'vue' ? '🟢 Vue 3.5 ref()' : '🟠 Svelte 5 \$state()',
                    style: const TextStyle(color: SeleneTheme.emeraldSuccess, fontWeight: FontWeight.bold, fontSize: 13)),
                const Spacer(),
                const Text('HMR Active', style: TextStyle(color: SeleneTheme.textMuted, fontSize: 11)),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: SeleneTheme.emeraldSuccess,
                    foregroundColor: SeleneTheme.background,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: () => setState(() => _vueCounter++),
                  child: Text('Reactive State: $_vueCounter'),
                ),
                const SizedBox(width: 10),
                Text(
                  'Computed: ${_vueCounter * 2} • 60 FPS',
                  style: const TextStyle(color: SeleneTheme.textSecondary, fontSize: 12, fontFamily: 'monospace'),
                ),
              ],
            ),
          ],
        ),
      );
    }

    // 7. Angular 19 Signals (Sample 03)
    if (lang == 'angular') {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF1E0A14),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: SeleneTheme.roseDanger.withValues(alpha: 0.4)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('🅰️ Angular 19 Signals Architecture',
                style: TextStyle(color: SeleneTheme.roseDanger, fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 8),
            Row(
              children: [
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: SeleneTheme.roseDanger,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: () => setState(() => _angularSignal++),
                  child: Text('signal.update() => $_angularSignal'),
                ),
                const SizedBox(width: 10),
                const Text('Zoneless Change Detection', style: TextStyle(color: SeleneTheme.textMuted, fontSize: 11)),
              ],
            ),
          ],
        ),
      );
    }

    // 8. Flutter & Dart Components (Sample 03)
    if (lang == 'flutter' || lang == 'dart') {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF0C1929),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: const Color(0xFF38BDF8)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Text('💙', style: TextStyle(fontSize: 16)),
                SizedBox(width: 8),
                Text('Flutter Material 3 Live Widget',
                    style: TextStyle(color: Color(0xFF38BDF8), fontWeight: FontWeight.bold, fontSize: 13)),
              ],
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: SeleneTheme.border),
              ),
              child: Row(
                children: [
                  const Icon(Icons.rocket_launch, size: 18, color: SeleneTheme.goldAccent),
                  const SizedBox(width: 10),
                  Text('Regolith Samples Logged: $_flutterSamples',
                      style: const TextStyle(color: SeleneTheme.textPrimary, fontSize: 12.5)),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.add_circle, color: SeleneTheme.lunarCyan, size: 22),
                    tooltip: 'Collect Sample',
                    onPressed: () => setState(() => _flutterSamples++),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    // 9. PHP & Laravel Blade (Sample 06)
    if (lang == 'blade' || lang == 'php') {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF161226),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: SeleneTheme.purpleMystic.withValues(alpha: 0.4)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('🐘 Laravel 11 Blade Template Rendered',
                style: TextStyle(color: SeleneTheme.purpleMystic, fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: SeleneTheme.surfaceElevated,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                '✓ Compiled in 0.72ms\nHTTP/1.1 200 OK • Content-Type: text/html\n<div class="titan-card">Mission Telemetry: NOMINAL</div>',
                style: TextStyle(fontFamily: 'monospace', color: SeleneTheme.emeraldSuccess, fontSize: 11),
              ),
            ),
          ],
        ),
      );
    }

    // 10. Ruby on Rails & ERB (Sample 07)
    if (lang == 'erb' || lang == 'ruby') {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF1E0E0E),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: Colors.redAccent.withValues(alpha: 0.4)),
        ),
        child: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('💎 Rails 8.0 Hotwire Turbo Frame',
                style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 13)),
            SizedBox(height: 6),
            Text(
              '<turbo-frame id="lunar_metrics">\n  ⚡ ActionView Partial rendered 200 OK (0.4ms)\n  Status: Hotwire Stream Connected\n</turbo-frame>',
              style: TextStyle(fontFamily: 'monospace', color: SeleneTheme.emeraldSuccess, fontSize: 11),
            ),
          ],
        ),
      );
    }

    // 11. Go Templates & Hugo (Sample 08)
    if (lang == 'go' || lang == 'gotemplate' || lang == 'hugo') {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF0A1B24),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: const Color(0xFF00ADD8)),
        ),
        child: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('🐹 Go 1.23 Template / Hugo Pipeline',
                style: TextStyle(color: Color(0xFF00ADD8), fontWeight: FontWeight.bold, fontSize: 13)),
            SizedBox(height: 6),
            Text(
              'Total in 14 ms • Static HTML generated\n{{ .Title | upper }} => "SELENE TITAN ARCHITECTURE"\nPages: 24 | Static files synced to public/',
              style: TextStyle(fontFamily: 'monospace', color: SeleneTheme.textSecondary, fontSize: 11),
            ),
          ],
        ),
      );
    }

    // 12. Django & Jinja2 (Sample 09)
    if (lang == 'django' || lang == 'jinja2') {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF0B1F14),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: SeleneTheme.emeraldSuccess.withValues(alpha: 0.4)),
        ),
        child: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('🌐 Django 5.1 / Jinja2 Template Response',
                style: TextStyle(color: SeleneTheme.emeraldSuccess, fontWeight: FontWeight.bold, fontSize: 13)),
            SizedBox(height: 6),
            Text(
              'Rendered with 2 database queries in 1.1ms\nContext: {"mission": "Titan-IV", "status": "active"}\nOutput: HTTP 200 text/html (1.4 KB)',
              style: TextStyle(fontFamily: 'monospace', color: SeleneTheme.textPrimary, fontSize: 11),
            ),
          ],
        ),
      );
    }

    // 13. Rust WASM & Leptos (Sample 10)
    if (lang == 'rust' || lang == 'leptos' || lang == 'yew') {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF1E1005),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: SeleneTheme.goldAccent.withValues(alpha: 0.4)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('🦀 Rust WASM32 Leptos Reactive Engine',
                style: TextStyle(color: SeleneTheme.goldAccent, fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 8),
            Row(
              children: [
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: SeleneTheme.goldAccent,
                    foregroundColor: SeleneTheme.background,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: () => setState(() => _rustSignal++),
                  child: Text('Signal: $_rustSignal (Tap to Mutate)'),
                ),
                const SizedBox(width: 10),
                const Text('Zero-Cost Abstraction', style: TextStyle(color: SeleneTheme.textMuted, fontSize: 11)),
              ],
            ),
          ],
        ),
      );
    }

    // 14. SQL, SQLite, LibSQL (Sample 11)
    if (lang == 'sql' || lang == 'sqlite' || lang == 'libsql') {
      return Table(
        border: TableBorder.all(color: SeleneTheme.border),
        children: const [
          TableRow(
            decoration: BoxDecoration(color: Color(0xFF131D31)),
            children: [
              Padding(padding: EdgeInsets.all(6), child: Text('mission_id', style: TextStyle(color: SeleneTheme.lunarCyan, fontWeight: FontWeight.bold, fontSize: 11))),
              Padding(padding: EdgeInsets.all(6), child: Text('destination', style: TextStyle(color: SeleneTheme.lunarCyan, fontWeight: FontWeight.bold, fontSize: 11))),
              Padding(padding: EdgeInsets.all(6), child: Text('status', style: TextStyle(color: SeleneTheme.lunarCyan, fontWeight: FontWeight.bold, fontSize: 11))),
            ],
          ),
          TableRow(
            children: [
              Padding(padding: EdgeInsets.all(6), child: Text('SLN-01', style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 11))),
              Padding(padding: EdgeInsets.all(6), child: Text('Mare Tranquillitatis', style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 11))),
              Padding(padding: EdgeInsets.all(6), child: Text('COMPLETED', style: TextStyle(color: SeleneTheme.emeraldSuccess, fontSize: 11, fontWeight: FontWeight.bold))),
            ],
          ),
          TableRow(
            children: [
              Padding(padding: EdgeInsets.all(6), child: Text('SLN-02', style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 11))),
              Padding(padding: EdgeInsets.all(6), child: Text('Oceanus Procellarum', style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 11))),
              Padding(padding: EdgeInsets.all(6), child: Text('ORBIT_SYNC', style: TextStyle(color: SeleneTheme.lunarCyan, fontSize: 11, fontWeight: FontWeight.bold))),
            ],
          ),
        ],
      );
    }

    // 15. DuckDB Columnar OLAP (Sample 14)
    if (lang == 'duckdb') {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFF131D31),
              borderRadius: BorderRadius.circular(6),
            ),
            child: const Text('🦆 42,000 Rows Scanned in 0.81ms (SIMD Vectorized)',
                style: TextStyle(color: SeleneTheme.goldAccent, fontSize: 11, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(height: 8),
          Table(
            border: TableBorder.all(color: SeleneTheme.border),
            children: const [
              TableRow(
                decoration: BoxDecoration(color: Color(0xFF0F172A)),
                children: [
                  Padding(padding: EdgeInsets.all(6), child: Text('bucket', style: TextStyle(color: SeleneTheme.lunarCyan, fontWeight: FontWeight.bold, fontSize: 11))),
                  Padding(padding: EdgeInsets.all(6), child: Text('avg_throughput_mb', style: TextStyle(color: SeleneTheme.lunarCyan, fontWeight: FontWeight.bold, fontSize: 11))),
                  Padding(padding: EdgeInsets.all(6), child: Text('p99_latency_ms', style: TextStyle(color: SeleneTheme.lunarCyan, fontWeight: FontWeight.bold, fontSize: 11))),
                ],
              ),
              TableRow(
                children: [
                  Padding(padding: EdgeInsets.all(6), child: Text('synodic_orbit', style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 11))),
                  Padding(padding: EdgeInsets.all(6), child: Text('412.8', style: TextStyle(color: SeleneTheme.textPrimary, fontSize: 11))),
                  Padding(padding: EdgeInsets.all(6), child: Text('0.34', style: TextStyle(color: SeleneTheme.emeraldSuccess, fontSize: 11))),
                ],
              ),
            ],
          ),
        ],
      );
    }

    // 16. Elixir Phoenix LiveView (Sample 16)
    if (lang == 'heex' || lang == 'phoenix' || lang == 'liveview') {
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
              '🦅 Phoenix LiveView 1.0 Real-Time Telemetry',
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

    // 17. Swift & SwiftUI (Sample 17)
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
              '🕊️ Starlight SwiftUI Canvas Toggle:',
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

    // 18. Python Data Science & Matplotlib / Pandas / Monte Carlo (Sample 04)
    if (lang == 'python' || lang == 'py') {
      if (_currentCode.contains('matplotlib') || _currentCode.contains('plt.')) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              height: 125,
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: SeleneTheme.border),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: CustomPaint(
                  painter: _OrbitalMechanicsPainter(),
                ),
              ),
            ),
            const SizedBox(height: 8),
            const SelectableText(
              '✓ Orbital mechanics computation completed with 500 integration steps.\n✓ Target lunar insertion delta-V: 1,024 m/s (Nominal).',
              style: TextStyle(fontFamily: 'monospace', color: SeleneTheme.emeraldSuccess, fontSize: 11),
            ),
          ],
        );
      }
      if (_currentCode.contains('Monte Carlo') || _currentCode.contains('pi_estimate')) {
        return const SelectableText(
          '==================================================\n  Selene Computational Mathematics Kernel        \n==================================================\nSimulation Samples  : 200,000\nEstimated Value of π : 3.141852\nTrue Value of π      : 3.141593\nRelative Error       : 0.0082%\nCrater Density Score : 157,092 impacts within lunar disk',
          style: TextStyle(fontFamily: 'monospace', color: SeleneTheme.emeraldSuccess, fontSize: 11),
        );
      }
      if (_currentCode.contains('telemetry') || _currentCode.contains('DataFrame')) {
        return const SelectableText(
          '=== LUNAR ROVER ARTEMIS IV TELEMETRY LOG ===\n                     Regolith Temp (°C)  Solar Array (Watts)  Radiation (mSv/h)  Battery SoC (%) Rover Subsystem\n2026-10-18 00:00:00               -123.4                452.0              0.038               98           Core\n2026-10-18 00:10:00               -118.2                465.0              0.041               95            Nav\n2026-10-18 00:20:00               -127.1                438.0              0.029               91          Drill\n2026-10-18 00:30:00               -115.8                472.0              0.044               88          Radio\n2026-10-18 00:40:00               -121.6                449.0              0.033               86         Camera\n2026-10-18 00:50:00               -119.5                458.0              0.036               82        Spectro',
          style: TextStyle(fontFamily: 'monospace', color: SeleneTheme.emeraldSuccess, fontSize: 10),
        );
      }
    }

    // 19. Bash / Shell CLI
    if (lang == 'bash' || lang == 'sh' || lang == 'shell' || lang == 'zsh') {
      return Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: const Color(0xFF0F172A),
          borderRadius: BorderRadius.circular(8),
        ),
        child: const SelectableText(
          '\$ selene-cli build --release --profile=production\n[1/3] Parsing AST nodes: 20 canonical documents... OK (12ms)\n[2/3] Compiling WebAssembly & Native Shaders... OK (48ms)\n[3/3] Packaging assets into standalone artifact... DONE\n\nProcess finished with exit code 0 (0.06s).',
          style: TextStyle(fontFamily: 'monospace', color: SeleneTheme.emeraldSuccess, fontSize: 11),
        ),
      );
    }

    // 20. GraphQL Gateway
    if (lang == 'graphql') {
      return const SelectableText(
        'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  "data": {\n    "mission": {\n      "id": "selene-artemis-4",\n      "name": "Apollo-Zephyr-IX",\n      "trajectory": "Free-Return Lunar Insertion",\n      "fuelReserveKg": 4820,\n      "telemetry": {\n        "velocityKmS": 10.84,\n        "angularMomentum": 3.42,\n        "thermalShieldStatus": "nominal"\n      },\n      "crewManifest": [\n        { "name": "Commander Selene", "role": "Chief Pilot" },\n        { "name": "Dr. Daedalus", "role": "Systems Architect" }\n      ]\n    }\n  }\n}',
        style: TextStyle(fontFamily: 'monospace', color: SeleneTheme.emeraldSuccess, fontSize: 11, height: 1.4),
      );
    }

    // 21. HTTP & cURL & REST Hermes Gateway (Sample 18)
    if (lang == 'http' || lang == 'curl' || lang == 'rest') {
      return const SelectableText(
        'HTTP/1.1 200 OK\nDate: Tue, 21 Oct 2026 05:45:00 GMT\nContent-Type: application/json\nX-Hermes-Relay: celestial-gateway-v4\n\n{\n  "status": "success",\n  "data": {\n    "celestial_status": "nominal",\n    "active_orbit_nodes": 12,\n    "mesh_latency_ms": 0.42,\n    "encryption": "HMAC-SHA256"\n  }\n}',
        style: TextStyle(fontFamily: 'monospace', color: SeleneTheme.emeraldSuccess, fontSize: 11.5, height: 1.4),
      );
    }

    // Default console log output (JS / others)
    return const SelectableText(
      '✨ Output:\n[0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]\nSimulation finished in 1.4ms with exit code 0.',
      style: TextStyle(fontFamily: 'monospace', color: SeleneTheme.emeraldSuccess, fontSize: 12, height: 1.4),
    );
  }

  Widget _buildChartWidget() {
    String chartTitle = 'Telemetry Vector Chart';
    String chartType = _chartViewMode;
    List<double> data = const [45.0, 78.0, 52.0, 92.0, 68.0, 85.0];
    List<String> labels = const ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    List<Color> colors = [
      SeleneTheme.lunarCyan,
      const Color(0xFF818CF8),
      SeleneTheme.emeraldSuccess,
      SeleneTheme.goldAccent,
      const Color(0xFFF472B6),
    ];

    try {
      final parsed = jsonDecode(_currentCode);
      if (parsed is Map) {
        if (parsed['title'] != null) chartTitle = parsed['title'].toString();
        if (parsed['type'] != null) {
          final declaredType = parsed['type'].toString().toLowerCase();
          if (_chartViewMode == 'bar' && (declaredType == 'donut' || declaredType == 'pie' || declaredType == 'area' || declaredType == 'line')) {
            chartType = declaredType;
          }
        }
        if (parsed['data'] is List) {
          final list = parsed['data'] as List;
          final xKey = parsed['xKey']?.toString() ?? '';
          final dynamic yKey = parsed['yKey'];
          List<double> parsedVals = [];
          List<String> parsedLabels = [];

          for (var item in list) {
            if (item is Map) {
              final label = item[xKey]?.toString() ?? '';
              parsedLabels.add(label.replaceAll(RegExp(r'\s*\([^)]*\)'), ''));
              if (yKey is List && yKey.isNotEmpty) {
                final firstKey = yKey.first.toString();
                final numVal = num.tryParse(item[firstKey]?.toString() ?? '0') ?? 0;
                parsedVals.add(numVal.toDouble());
              } else if (yKey is String) {
                final numVal = num.tryParse(item[yKey]?.toString() ?? '0') ?? 0;
                parsedVals.add(numVal.toDouble());
              } else {
                for (var v in item.values) {
                  if (v is num) {
                    parsedVals.add(v.toDouble());
                    break;
                  }
                }
              }
            }
          }
          if (parsedVals.isNotEmpty) {
            data = parsedVals;
            labels = parsedLabels;
          }
        }
      }
    } catch (_) {}

    final isDonut = chartType == 'donut' || chartType == 'pie';

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: SeleneTheme.borderHighlight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              const Icon(Icons.bar_chart, size: 16, color: SeleneTheme.lunarCyan),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  chartTitle,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: SeleneTheme.lunarCyan, fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ),
              const SizedBox(width: 6),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'bar', label: Text('Bar', style: TextStyle(fontSize: 10))),
                  ButtonSegment(value: 'line', label: Text('Line', style: TextStyle(fontSize: 10))),
                  ButtonSegment(value: 'donut', label: Text('Donut', style: TextStyle(fontSize: 10))),
                ],
                selected: {isDonut ? 'donut' : (chartType == 'line' || chartType == 'area' ? 'line' : 'bar')},
                onSelectionChanged: (s) => setState(() => _chartViewMode = s.first),
                style: SegmentedButton.styleFrom(
                  visualDensity: VisualDensity.compact,
                  backgroundColor: SeleneTheme.surface,
                  selectedBackgroundColor: SeleneTheme.lunarCyan.withValues(alpha: 0.2),
                  selectedForegroundColor: SeleneTheme.lunarCyan,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 120,
            child: isDonut
                ? Row(
                    children: [
                      Expanded(
                        flex: 1,
                        child: CustomPaint(
                          painter: _DonutChartPainter(values: data, colors: colors),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        flex: 1,
                        child: SingleChildScrollView(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              for (int i = 0; i < math.min(labels.length, colors.length); i++)
                                Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 2),
                                  child: Row(
                                    children: [
                                      Container(width: 8, height: 8, decoration: BoxDecoration(color: colors[i], shape: BoxShape.circle)),
                                      const SizedBox(width: 6),
                                      Expanded(
                                        child: Text(
                                          '${labels[i]}: ${data[i].toInt()}',
                                          style: const TextStyle(color: SeleneTheme.textSecondary, fontSize: 10.5),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  )
                : CustomPaint(
                    painter: _VectorChartPainter(
                      mode: chartType,
                      data: data,
                      labels: labels,
                    ),
                  ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Peak: ${data.reduce(math.max).toInt()}', style: const TextStyle(color: SeleneTheme.emeraldSuccess, fontSize: 11)),
              Text('Avg: ${(data.reduce((a, b) => a + b) / data.length).toInt()}', style: const TextStyle(color: SeleneTheme.textMuted, fontSize: 11)),
              const Text('60 FPS Vector', style: TextStyle(color: SeleneTheme.goldAccent, fontSize: 11)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMermaidWidget() {
    final lines = _currentCode.split('\n');
    final isSequence = _currentCode.toLowerCase().contains('sequencediagram');
    List<Map<String, String>> parsedNodes = [];

    if (isSequence) {
      for (var l in lines) {
        final trimmed = l.trim();
        if (trimmed.startsWith('actor ') || trimmed.startsWith('participant ')) {
          if (trimmed.contains(' as ')) {
            final parts = trimmed.split(' as ');
            final id = parts[0].replaceAll(RegExp(r'^(actor|participant)\s+'), '').trim();
            final name = parts[1].trim();
            parsedNodes.add({'title': id, 'subtitle': name});
          } else {
            final id = trimmed.replaceAll(RegExp(r'^(actor|participant)\s+'), '').trim();
            parsedNodes.add({'title': id, 'subtitle': id});
          }
        }
      }
    } else {
      final re = RegExp(r'(\w+)\[([^\]]+)\]');
      for (final match in re.allMatches(_currentCode)) {
        parsedNodes.add({'title': match.group(1)!, 'subtitle': match.group(2)!});
      }
    }

    final colors = [
      SeleneTheme.lunarCyan,
      SeleneTheme.purpleMystic,
      SeleneTheme.goldAccent,
      SeleneTheme.emeraldSuccess,
      const Color(0xFF38BDF8),
    ];

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: SeleneTheme.goldAccent.withValues(alpha: 0.4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              const Icon(Icons.account_tree_outlined, size: 16, color: SeleneTheme.goldAccent),
              const SizedBox(width: 8),
              Text(
                isSequence ? 'Mermaid Sequence Diagram' : 'Mermaid Architecture Flowchart',
                style: const TextStyle(color: SeleneTheme.goldAccent, fontWeight: FontWeight.bold, fontSize: 13),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (parsedNodes.isNotEmpty)
            Wrap(
              spacing: 8,
              runSpacing: 8,
              alignment: WrapAlignment.center,
              children: [
                for (int i = 0; i < parsedNodes.length; i++) ...[
                  if (i > 0)
                    const Padding(
                      padding: EdgeInsets.only(top: 8),
                      child: Icon(Icons.arrow_forward, size: 14, color: SeleneTheme.textMuted),
                    ),
                  _buildMermaidNode(
                    parsedNodes[i]['title']!,
                    parsedNodes[i]['subtitle']!,
                    colors[i % colors.length],
                  ),
                ],
              ],
            )
          else
            Wrap(
              spacing: 8,
              runSpacing: 8,
              alignment: WrapAlignment.center,
              children: [
                _buildMermaidNode('Client UI', 'Flutter Native', SeleneTheme.lunarCyan),
                const Icon(Icons.arrow_forward, size: 14, color: SeleneTheme.textMuted),
                _buildMermaidNode('Gateway', 'Hermes Relay', SeleneTheme.purpleMystic),
                const Icon(Icons.arrow_forward, size: 14, color: SeleneTheme.textMuted),
                _buildMermaidNode('Engine', 'AST Nodes', SeleneTheme.goldAccent),
                const Icon(Icons.arrow_forward, size: 14, color: SeleneTheme.textMuted),
                _buildMermaidNode('Security', 'HMAC Anchor', SeleneTheme.emeraldSuccess),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildMermaidNode(String title, String subtitle, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.6)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(title, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold)),
          Text(subtitle, style: const TextStyle(color: SeleneTheme.textMuted, fontSize: 9)),
        ],
      ),
    );
  }

  Widget _buildMathWidget() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: SeleneTheme.lunarCyan.withValues(alpha: 0.4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Row(
            children: [
              Icon(Icons.functions, size: 16, color: SeleneTheme.lunarCyan),
              SizedBox(width: 8),
              Text('KaTeX Mathematical Formulation Proof',
                  style: TextStyle(color: SeleneTheme.lunarCyan, fontWeight: FontWeight.bold, fontSize: 13)),
            ],
          ),
          const SizedBox(height: 10),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Math.tex(
              _currentCode.trim(),
              textStyle: const TextStyle(color: Colors.white, fontSize: 18),
              onErrorFallback: (err) => Text(
                _currentCode.trim(),
                style: const TextStyle(fontFamily: 'monospace', color: SeleneTheme.goldAccent, fontSize: 14),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildShaderWidget() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF0B132B),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: SeleneTheme.purpleMystic.withValues(alpha: 0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Row(
            children: [
              Icon(Icons.waves, size: 16, color: SeleneTheme.purpleMystic),
              SizedBox(width: 8),
              Text('GLSL Fragment Shader Simulation',
                  style: TextStyle(color: SeleneTheme.purpleMystic, fontWeight: FontWeight.bold, fontSize: 13)),
              Spacer(),
              Text('60 FPS GLSL', style: TextStyle(color: SeleneTheme.textMuted, fontSize: 10.5)),
            ],
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: SizedBox(
              height: 110,
              child: _AnimatedShaderPreview(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWaveDromWidget() {
    bool isReg = _currentCode.contains('"reg"') || _currentCode.contains("'reg'");
    
    if (isReg) {
      final fieldMatches = RegExp(r'\{[^{}]*\}').allMatches(_currentCode);
      final fields = <Map<String, dynamic>>[];
      int totalBits = 32;
      
      for (final m in fieldMatches) {
        final text = m.group(0) ?? '';
        final nameMatch = RegExp(r'["\x27]name["\x27]\s*:\s*["\x27]([^"\x27]+)["\x27]').firstMatch(text);
        final bitsMatch = RegExp(r'["\x27]bits["\x27]\s*:\s*(\d+)').firstMatch(text);
        final attrMatch = RegExp(r'["\x27]attr["\x27]\s*:\s*["\x27]([^"\x27]+)["\x27]').firstMatch(text);
        if (bitsMatch != null) {
          final bits = int.tryParse(bitsMatch.group(1) ?? '1') ?? 1;
          final name = nameMatch?.group(1) ?? 'RESERVED';
          final attr = attrMatch?.group(1) ?? (name == 'RESERVED' ? '—' : 'RW');
          fields.add({'name': name, 'bits': bits, 'attr': attr});
        }
      }
      if (fields.isEmpty) {
        fields.addAll([
          {'name': 'ENABLE', 'bits': 1, 'attr': 'RW'},
          {'name': 'MODE', 'bits': 3, 'attr': 'RW'},
          {'name': 'RESERVED', 'bits': 4, 'attr': '—'},
          {'name': 'STATUS', 'bits': 8, 'attr': 'RO'},
          {'name': 'DIVIDER', 'bits': 16, 'attr': 'RW'},
        ]);
      }
      
      final colors = [
        SeleneTheme.lunarCyan,
        const Color(0xFF818CF8),
        SeleneTheme.emeraldSuccess,
        const Color(0xFFF472B6),
        SeleneTheme.goldAccent,
      ];

      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF090D18),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: SeleneTheme.lunarCyan.withValues(alpha: 0.4)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                const Icon(Icons.memory, size: 16, color: SeleneTheme.lunarCyan),
                const SizedBox(width: 8),
                Text('$totalBits-Bit Register Bitfield Map',
                    style: const TextStyle(color: SeleneTheme.lunarCyan, fontWeight: FontWeight.bold, fontSize: 13)),
                const Spacer(),
                const Text('WaveDrom RegView', style: TextStyle(color: SeleneTheme.textMuted, fontSize: 10.5)),
              ],
            ),
            const SizedBox(height: 12),
            Container(
              height: 48,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: SeleneTheme.borderHighlight),
              ),
              child: Row(
                children: [
                  for (int i = 0; i < fields.length; i++) ...[
                    Expanded(
                      flex: fields[i]['bits'] as int,
                      child: Container(
                        decoration: BoxDecoration(
                          color: colors[i % colors.length].withValues(alpha: 0.18),
                          border: Border(
                            right: i < fields.length - 1
                                ? BorderSide(color: colors[i % colors.length].withValues(alpha: 0.5))
                                : BorderSide.none,
                          ),
                        ),
                        alignment: Alignment.center,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              fields[i]['name'] as String,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                color: colors[i % colors.length],
                                fontWeight: FontWeight.bold,
                                fontSize: 10.5,
                                fontFamily: 'monospace',
                              ),
                            ),
                            Text(
                              '${fields[i]['bits']}b • ${fields[i]['attr']}',
                              style: const TextStyle(color: SeleneTheme.textMuted, fontSize: 8.5),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      );
    }

    final signalMatches = RegExp(r'\{[^{}]*\}').allMatches(_currentCode);
    final sigs = <Map<String, String>>[];
    for (final m in signalMatches) {
      final text = m.group(0) ?? '';
      final nameMatch = RegExp(r'["\x27]name["\x27]\s*:\s*["\x27]([^"\x27]+)["\x27]').firstMatch(text);
      final waveMatch = RegExp(r'["\x27]wave["\x27]\s*:\s*["\x27]([^"\x27]+)["\x27]').firstMatch(text);
      if (nameMatch != null && waveMatch != null) {
        sigs.add({'name': nameMatch.group(1)!, 'wave': waveMatch.group(1)!});
      }
    }
    if (sigs.isEmpty) {
      sigs.addAll([
        {'name': 'CLK', 'wave': 'p.......|...'},
        {'name': 'CS#', 'wave': '10......|..1'},
        {'name': 'MOSI', 'wave': 'x3.4.5..|..x'},
        {'name': 'MISO', 'wave': 'z...6.7.|.z.'},
        {'name': 'READY', 'wave': '0...1...|0..'},
      ]);
    }

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF090D18),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: SeleneTheme.lunarCyan.withValues(alpha: 0.4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Row(
            children: [
              Icon(Icons.show_chart, size: 16, color: SeleneTheme.lunarCyan),
              SizedBox(width: 8),
              Text('WaveDrom Digital Timing Waveform',
                  style: TextStyle(color: SeleneTheme.lunarCyan, fontWeight: FontWeight.bold, fontSize: 13)),
              Spacer(),
              Text('Vector Clock Pulses', style: TextStyle(color: SeleneTheme.textMuted, fontSize: 10.5)),
            ],
          ),
          const SizedBox(height: 10),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: SizedBox(
              width: math.max(380.0, sigs.first['wave']!.length * 36.0 + 90.0),
              height: sigs.length * 32.0 + 30.0,
              child: CustomPaint(
                painter: _WaveDromPainter(signals: sigs),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildD2Widget() {
    final lines = _currentCode.split('\n');
    final nodes = <String, String>{};
    final conns = <Map<String, String>>[];

    for (var l in lines) {
      l = l.trim();
      if (l.isEmpty || l.startsWith('#')) continue;
      if (l.contains('->') || l.contains('<->') || l.contains('--')) {
        final parts = l.split(RegExp(r'->|<->|--'));
        if (parts.length >= 2) {
          final from = parts[0].trim();
          final rightPart = parts[1].split(':');
          final to = rightPart[0].trim();
          final label = rightPart.length > 1 ? rightPart[1].trim() : '';
          conns.add({'from': from, 'to': to, 'label': label});
        }
      } else if (l.contains(':')) {
        final parts = l.split(':');
        final id = parts[0].trim();
        final label = parts[1].replaceAll('{', '').trim();
        if (id != 'direction' && id != 'style.fill' && id != 'shape') {
          nodes[id] = label.isNotEmpty ? label : id;
        }
      }
    }

    if (nodes.isEmpty) {
      nodes.addAll({
        'client': 'Client App (Web & Mobile)',
        'gateway': 'Selene API Gateway',
        'engine': 'Computation Engine',
        'db': 'Primary Aurora DB',
      });
      conns.addAll([
        {'from': 'client', 'to': 'gateway', 'label': 'HTTPS'},
        {'from': 'gateway', 'to': 'engine', 'label': 'gRPC'},
        {'from': 'engine', 'to': 'db', 'label': 'SQL Query'},
      ]);
    }

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF090E1E),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF818CF8).withValues(alpha: 0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              const Icon(Icons.hub_outlined, size: 16, color: Color(0xFF818CF8)),
              const SizedBox(width: 8),
              const Text('D2 Modern Architecture DAG',
                  style: TextStyle(color: Color(0xFF818CF8), fontWeight: FontWeight.bold, fontSize: 13)),
              const Spacer(),
              Text('${nodes.length} Nodes • ${conns.length} Edges',
                  style: const TextStyle(color: SeleneTheme.textMuted, fontSize: 10.5)),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 180,
            child: CustomPaint(
              painter: _D2Painter(nodes: nodes, connections: conns),
              size: Size.infinite,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWatWidget() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF08140F),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: SeleneTheme.emeraldSuccess.withValues(alpha: 0.4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Row(
            children: [
              Icon(Icons.data_object, size: 16, color: SeleneTheme.emeraldSuccess),
              SizedBox(width: 8),
              Text('WebAssembly Text (WAT) Stack Evaluator',
                  style: TextStyle(color: SeleneTheme.emeraldSuccess, fontWeight: FontWeight.bold, fontSize: 13)),
              Spacer(),
              Text('WASM32 Stack', style: TextStyle(color: SeleneTheme.textMuted, fontSize: 10.5)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: TextField(
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'param \$a (i32)',
                    labelStyle: const TextStyle(color: SeleneTheme.textMuted, fontSize: 11),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    filled: true,
                    fillColor: SeleneTheme.surfaceElevated,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  style: const TextStyle(color: SeleneTheme.textPrimary, fontSize: 13, fontFamily: 'monospace'),
                  controller: TextEditingController(text: '$_watArgA'),
                  onChanged: (val) {
                    _watArgA = int.tryParse(val) ?? 0;
                  },
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: TextField(
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'param \$b (i32)',
                    labelStyle: const TextStyle(color: SeleneTheme.textMuted, fontSize: 11),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    filled: true,
                    fillColor: SeleneTheme.surfaceElevated,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  style: const TextStyle(color: SeleneTheme.textPrimary, fontSize: 13, fontFamily: 'monospace'),
                  controller: TextEditingController(text: '$_watArgB'),
                  onChanged: (val) {
                    _watArgB = int.tryParse(val) ?? 0;
                  },
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton.icon(
                icon: const Icon(Icons.bolt, size: 14),
                label: const Text('Call WASM', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: SeleneTheme.emeraldSuccess,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                onPressed: () {
                  setState(() {
                    _watResult = _watArgA + _watArgB;
                  });
                },
              ),
            ],
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF030A06),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: SeleneTheme.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      _watResult != null
                          ? 'Return: i32.const $_watResult'
                          : 'Return: i32.const 42',
                      style: const TextStyle(
                        color: SeleneTheme.emeraldSuccess,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'monospace',
                        fontSize: 12.5,
                      ),
                    ),
                    const Text('Telemetry: 0.012 ms • Exit: 0x0',
                        style: TextStyle(color: SeleneTheme.textMuted, fontSize: 10, fontFamily: 'monospace')),
                  ],
                ),
                const SizedBox(height: 4),
                const Text(
                  'Stack: [local.get \$a] -> [local.get \$b] -> [i32.add] -> return',
                  style: TextStyle(color: SeleneTheme.textMuted, fontSize: 10, fontFamily: 'monospace'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _WaveDromPainter extends CustomPainter {
  final List<Map<String, String>> signals;

  _WaveDromPainter({required this.signals});

  @override
  void paint(Canvas canvas, Size size) {
    const labelW = 60.0;
    const stepW = 34.0;
    const rowH = 30.0;

    final linePaint = Paint()
      ..color = SeleneTheme.lunarCyan
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.6;

    final clockPaint = Paint()
      ..color = SeleneTheme.goldAccent
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.6;

    final gridPaint = Paint()
      ..color = const Color(0xFF1E293B)
      ..strokeWidth = 0.8;

    int maxLen = 0;
    for (final s in signals) {
      maxLen = math.max(maxLen, s['wave']!.length);
    }

    for (int c = 0; c < maxLen; c++) {
      final x = labelW + c * stepW;
      canvas.drawLine(Offset(x, 18), Offset(x, size.height), gridPaint);

      final tp = TextPainter(
        text: TextSpan(text: 'T$c', style: const TextStyle(color: SeleneTheme.textMuted, fontSize: 9, fontFamily: 'monospace')),
        textDirection: TextDirection.ltr,
      )..layout();
      tp.paint(canvas, Offset(x + stepW / 2 - tp.width / 2, 4));
    }

    for (int i = 0; i < signals.length; i++) {
      final sig = signals[i];
      final yTop = 24.0 + i * rowH;
      final yMid = yTop + rowH / 2;
      final yHigh = yTop + 4.0;
      final yLow = yTop + rowH - 6.0;

      final tp = TextPainter(
        text: TextSpan(text: sig['name']!, style: const TextStyle(color: SeleneTheme.textPrimary, fontSize: 10.5, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
        textDirection: TextDirection.ltr,
      )..layout();
      tp.paint(canvas, Offset(labelW - tp.width - 8, yMid - tp.height / 2));

      final wave = sig['wave']!;
      for (int c = 0; c < wave.length; c++) {
        final x1 = labelW + c * stepW;
        final x2 = x1 + stepW;
        final char = wave[c];

        if (char == 'p' || char == 'P') {
          final midX = x1 + stepW / 2;
          final path = Path()
            ..moveTo(x1, yLow)
            ..lineTo(x1, yHigh)
            ..lineTo(midX, yHigh)
            ..lineTo(midX, yLow)
            ..lineTo(x2, yLow);
          canvas.drawPath(path, clockPaint);
        } else if (char == '1' || char == 'h' || char == 'H') {
          canvas.drawLine(Offset(x1, yHigh), Offset(x2, yHigh), linePaint);
        } else if (char == '0' || char == 'l' || char == 'L') {
          canvas.drawLine(Offset(x1, yLow), Offset(x2, yLow), linePaint);
        } else if (char == 'z' || char == 'Z') {
          canvas.drawLine(Offset(x1, yMid), Offset(x2, yMid), Paint()..color = const Color(0xFF64748B)..strokeWidth = 1.0);
        } else {
          final busPath = Path()
            ..moveTo(x1, yMid)
            ..lineTo(x1 + 4, yHigh)
            ..lineTo(x2 - 4, yHigh)
            ..lineTo(x2, yMid)
            ..lineTo(x2 - 4, yLow)
            ..lineTo(x1 + 4, yLow)
            ..close();
          canvas.drawPath(busPath, Paint()..color = SeleneTheme.purpleMystic.withValues(alpha: 0.2)..style = PaintingStyle.fill);
          canvas.drawPath(busPath, Paint()..color = SeleneTheme.purpleMystic..style = PaintingStyle.stroke..strokeWidth = 1.2);
        }
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _D2Painter extends CustomPainter {
  final Map<String, String> nodes;
  final List<Map<String, String>> connections;

  _D2Painter({required this.nodes, required this.connections});

  @override
  void paint(Canvas canvas, Size size) {
    if (nodes.isEmpty) return;

    final nodeKeys = nodes.keys.toList();
    final nodeCount = nodeKeys.length;
    final nodePositions = <String, Rect>{};

    final nodeW = math.min(130.0, (size.width - 40) / math.max(1, (nodeCount / 2).ceil()));
    final nodeH = 46.0;

    for (int i = 0; i < nodeCount; i++) {
      final key = nodeKeys[i];
      final col = i % 2;
      final row = i ~/ 2;
      final x = 20.0 + col * (size.width / 2.0);
      final y = 20.0 + row * 80.0;
      nodePositions[key] = Rect.fromLTWH(x, y, nodeW, nodeH);
    }

    final edgePaint = Paint()
      ..color = const Color(0xFF818CF8)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.6;

    for (final conn in connections) {
      final fromR = nodePositions[conn['from']];
      final toR = nodePositions[conn['to']];
      if (fromR != null && toR != null) {
        final p1 = Offset(fromR.right, fromR.top + fromR.height / 2);
        final p2 = Offset(toR.left, toR.top + toR.height / 2);

        final path = Path()
          ..moveTo(p1.dx, p1.dy)
          ..cubicTo((p1.dx + p2.dx) / 2, p1.dy, (p1.dx + p2.dx) / 2, p2.dy, p2.dx, p2.dy);
        canvas.drawPath(path, edgePaint);
      }
    }

    for (int i = 0; i < nodeCount; i++) {
      final key = nodeKeys[i];
      final rect = nodePositions[key]!;
      final rrect = RRect.fromRectAndRadius(rect, const Radius.circular(8));

      canvas.drawRRect(rrect, Paint()..color = const Color(0xFF0F172A));
      canvas.drawRRect(rrect, Paint()..color = const Color(0xFF818CF8)..style = PaintingStyle.stroke..strokeWidth = 1.4);

      final label = nodes[key]!;
      final tp = TextPainter(
        text: TextSpan(
          text: label,
          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
        ),
        maxLines: 2,
        ellipsis: '...',
        textDirection: TextDirection.ltr,
      )..layout(maxWidth: rect.width - 12);
      tp.paint(canvas, Offset(rect.left + 6, rect.top + (rect.height - tp.height) / 2));
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _VectorChartPainter extends CustomPainter {
  final String mode;
  final List<double> data;
  final List<String> labels;

  _VectorChartPainter({
    required this.mode,
    required this.data,
    required this.labels,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (data.isEmpty) return;
    final maxVal = (data.reduce(math.max) > 0 ? data.reduce(math.max) : 100.0) * 1.15;
    final w = size.width;
    final h = size.height;

    if (mode == 'bar') {
      final barWidth = (w / data.length) * 0.55;
      final step = w / data.length;

      for (int i = 0; i < data.length; i++) {
        final val = data[i];
        final barHeight = (val / maxVal) * (h - 22);
        final x = (i * step) + (step - barWidth) / 2;
        final y = h - 22 - barHeight;

        final rect = Rect.fromLTWH(x, y, barWidth, barHeight);
        final paint = Paint()
          ..shader = const LinearGradient(
            colors: [SeleneTheme.lunarCyan, Color(0xFF3B82F6)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ).createShader(rect);

        canvas.drawRRect(RRect.fromRectAndRadius(rect, const Radius.circular(4)), paint);

        if (i < labels.length) {
          final textPainter = TextPainter(
            text: TextSpan(
              text: labels[i],
              style: const TextStyle(color: SeleneTheme.textMuted, fontSize: 9.5),
            ),
            textDirection: TextDirection.ltr,
          )..layout();
          textPainter.paint(canvas, Offset(x + (barWidth - textPainter.width) / 2, h - 14));
        }
      }
    } else {
      // Line or Area mode
      final step = data.length > 1 ? w / (data.length - 1) : w;
      final path = Path();
      final fillPath = Path();

      for (int i = 0; i < data.length; i++) {
        final x = i * step;
        final y = h - 22 - (data[i] / maxVal) * (h - 22);

        if (i == 0) {
          path.moveTo(x, y);
          fillPath.moveTo(x, h - 22);
          fillPath.lineTo(x, y);
        } else {
          path.lineTo(x, y);
          fillPath.lineTo(x, y);
        }
      }

      fillPath.lineTo(w, h - 22);
      fillPath.close();

      final fillPaint = Paint()
        ..shader = LinearGradient(
          colors: [SeleneTheme.lunarCyan.withValues(alpha: 0.35), Colors.transparent],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ).createShader(Rect.fromLTWH(0, 0, w, h));
      canvas.drawPath(fillPath, fillPaint);

      final linePaint = Paint()
        ..color = SeleneTheme.lunarCyan
        ..strokeWidth = 2.5
        ..style = PaintingStyle.stroke;
      canvas.drawPath(path, linePaint);

      final pointPaint = Paint()..color = const Color(0xFF38BDF8);
      for (int i = 0; i < data.length; i++) {
        final x = i * step;
        final y = h - 22 - (data[i] / maxVal) * (h - 22);
        canvas.drawCircle(Offset(x, y), 3.5, pointPaint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _VectorChartPainter oldDelegate) =>
      oldDelegate.mode != mode || oldDelegate.data != data;
}

class _DonutChartPainter extends CustomPainter {
  final List<double> values;
  final List<Color> colors;

  _DonutChartPainter({required this.values, required this.colors});

  @override
  void paint(Canvas canvas, Size size) {
    final total = values.fold<double>(0, (a, b) => a + b);
    if (total <= 0) return;

    final center = Offset(size.width / 2, size.height / 2);
    final radius = math.min(size.width, size.height) / 2 - 8;
    final innerRadius = radius * 0.6;
    final strokeWidth = radius - innerRadius;

    double startAngle = -math.pi / 2;
    for (int i = 0; i < values.length; i++) {
      final sweepAngle = (values[i] / total) * 2 * math.pi;
      final paint = Paint()
        ..color = colors[i % colors.length]
        ..style = PaintingStyle.stroke
        ..strokeWidth = strokeWidth;

      canvas.drawArc(
        Rect.fromCircle(center: center, radius: (radius + innerRadius) / 2),
        startAngle,
        sweepAngle,
        false,
        paint,
      );
      startAngle += sweepAngle;
    }
  }

  @override
  bool shouldRepaint(covariant _DonutChartPainter oldDelegate) => true;
}

class _OrbitalMechanicsPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    // Earth (Gaia)
    final earthCenter = Offset(w * 0.22, h * 0.55);
    final earthPaint = Paint()..color = const Color(0xFF38BDF8);
    canvas.drawCircle(earthCenter, 14, earthPaint);

    // Earth label
    final earthText = TextPainter(
      text: const TextSpan(text: 'Earth (Gaia)', style: TextStyle(color: Color(0xFF38BDF8), fontSize: 9)),
      textDirection: TextDirection.ltr,
    )..layout();
    earthText.paint(canvas, Offset(earthCenter.dx - earthText.width / 2, earthCenter.dy + 16));

    // Moon (Selene)
    final moonCenter = Offset(w * 0.78, h * 0.35);
    final moonPaint = Paint()..color = const Color(0xFFFBBF24);
    canvas.drawCircle(moonCenter, 9, moonPaint);

    // Moon label
    final moonText = TextPainter(
      text: const TextSpan(text: 'Moon (Selene)', style: TextStyle(color: Color(0xFFFBBF24), fontSize: 9)),
      textDirection: TextDirection.ltr,
    )..layout();
    moonText.paint(canvas, Offset(moonCenter.dx - moonText.width / 2, moonCenter.dy + 12));

    // Lunar orbit path (dashed / thin)
    final orbitPaint = Paint()
      ..color = const Color(0xFF475569)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.2;
    canvas.drawOval(
      Rect.fromCenter(center: earthCenter, width: w * 0.85, height: h * 0.7),
      orbitPaint,
    );

    // Free return trajectory (purple/cyan)
    final trajPath = Path();
    trajPath.moveTo(earthCenter.dx, earthCenter.dy);
    trajPath.cubicTo(
      w * 0.45, h * 0.05,
      moonCenter.dx + 25, moonCenter.dy - 20,
      moonCenter.dx, moonCenter.dy,
    );
    trajPath.cubicTo(
      moonCenter.dx - 25, moonCenter.dy + 35,
      w * 0.45, h * 0.85,
      earthCenter.dx, earthCenter.dy,
    );

    final trajPaint = Paint()
      ..color = const Color(0xFFA855F7)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5;
    canvas.drawPath(trajPath, trajPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _AnimatedShaderPreview extends StatefulWidget {
  @override
  State<_AnimatedShaderPreview> createState() => _AnimatedShaderPreviewState();
}

class _AnimatedShaderPreviewState extends State<_AnimatedShaderPreview>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(seconds: 4))..repeat();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (context, _) {
        return CustomPaint(
          painter: _ShaderPainter(time: _ctrl.value * 2 * math.pi),
          size: Size.infinite,
        );
      },
    );
  }
}

class _ShaderPainter extends CustomPainter {
  final double time;

  _ShaderPainter({required this.time});

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;
    final paint = Paint()
      ..shader = RadialGradient(
        center: Alignment(math.sin(time) * 0.4, math.cos(time) * 0.4),
        radius: 1.1,
        colors: const [
          Color(0xFF38BDF8),
          Color(0xFF8B5CF6),
          Color(0xFF0F172A),
        ],
      ).createShader(rect);
    canvas.drawRect(rect, paint);
  }

  @override
  bool shouldRepaint(covariant _ShaderPainter oldDelegate) => oldDelegate.time != time;
}
