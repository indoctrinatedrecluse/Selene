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
    // Check if parent element had a language hint class, e.g. class="language-python"
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

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF0B0F17),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: SeleneTheme.borderHighlight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: const BoxDecoration(
              color: SeleneTheme.surfaceElevated,
              borderRadius: BorderRadius.vertical(top: Radius.circular(9)),
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
                      language.toUpperCase(),
                      style: const TextStyle(
                        color: SeleneTheme.lunarCyan,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.8,
                      ),
                    ),
                  ],
                ),
                Builder(
                  builder: (context) {
                    return InkWell(
                      onTap: () {
                        Clipboard.setData(ClipboardData(text: code));
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
                    );
                  },
                ),
              ],
            ),
          ),
          // Code Body
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.all(12),
            child: HighlightView(
              code.trimRight(),
              language: language,
              theme: atomOneDarkTheme,
              textStyle: const TextStyle(
                fontFamily: 'monospace',
                fontSize: 13,
                height: 1.45,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
