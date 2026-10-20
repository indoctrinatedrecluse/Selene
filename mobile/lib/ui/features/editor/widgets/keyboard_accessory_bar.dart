import 'package:flutter/material.dart';
import 'package:selene_mobile/ui/core/theme.dart';

class KeyboardAccessoryBar extends StatelessWidget {
  final TextEditingController controller;
  final VoidCallback? onOracleRequested;

  const KeyboardAccessoryBar({
    super.key,
    required this.controller,
    this.onOracleRequested,
  });

  void _insertFormatting({required String prefix, String suffix = ''}) {
    final text = controller.text;
    final selection = controller.selection;

    if (!selection.isValid) {
      final newText = text + prefix + suffix;
      controller.value = TextEditingValue(
        text: newText,
        selection: TextSelection.collapsed(offset: newText.length - suffix.length),
      );
      return;
    }

    final start = selection.start;
    final end = selection.end;
    final selectedText = text.substring(start, end);

    final replacement = '$prefix$selectedText$suffix';
    final newText = text.replaceRange(start, end, replacement);

    controller.value = TextEditingValue(
      text: newText,
      selection: TextSelection(
        baseOffset: start + prefix.length,
        extentOffset: end + prefix.length,
      ),
    );
  }

  void _insertBlock(String template) {
    final text = controller.text;
    final selection = controller.selection;
    final offset = selection.isValid ? selection.start : text.length;

    // Ensure leading newline if not at start
    final leading = (offset > 0 && !text.substring(0, offset).endsWith('\n')) ? '\n\n' : '';
    final newText = text.replaceRange(offset, offset, '$leading$template\n\n');

    controller.value = TextEditingValue(
      text: newText,
      selection: TextSelection.collapsed(offset: offset + leading.length + template.length + 1),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      decoration: const BoxDecoration(
        color: SeleneTheme.surfaceElevated,
        border: Border(
          top: BorderSide(color: SeleneTheme.border, width: 1),
          bottom: BorderSide(color: SeleneTheme.border, width: 1),
        ),
      ),
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        children: [
          _ActionButton(
            label: '🔮 Oracle',
            isSpecial: true,
            onTap: onOracleRequested,
          ),
          const VerticalDivider(width: 16, indent: 8, endIndent: 8),
          _ActionButton(
            label: 'H1',
            tooltip: 'Heading 1',
            onTap: () => _insertFormatting(prefix: '# '),
          ),
          _ActionButton(
            label: 'H2',
            tooltip: 'Heading 2',
            onTap: () => _insertFormatting(prefix: '## '),
          ),
          _ActionButton(
            label: 'B',
            isBold: true,
            tooltip: 'Bold (**text**)',
            onTap: () => _insertFormatting(prefix: '**', suffix: '**'),
          ),
          _ActionButton(
            label: 'I',
            isItalic: true,
            tooltip: 'Italic (*text*)',
            onTap: () => _insertFormatting(prefix: '*', suffix: '*'),
          ),
          _ActionButton(
            label: '` `',
            tooltip: 'Inline Code',
            onTap: () => _insertFormatting(prefix: '`', suffix: '`'),
          ),
          _ActionButton(
            label: r'$$',
            tooltip: 'KaTeX Math Equation',
            onTap: () => _insertBlock(r'$$\n\int_{0}^{\infty} f(x) dx\n$$'),
          ),
          _ActionButton(
            label: '```',
            tooltip: 'Code Block',
            onTap: () => _insertBlock('```python\n# Polyglot sandbox code snippet\nprint("Hello, Selene!")\n```'),
          ),
          _ActionButton(
            label: '• List',
            tooltip: 'Bullet List',
            onTap: () => _insertFormatting(prefix: '- '),
          ),
          _ActionButton(
            label: '☑ Task',
            tooltip: 'Checklist Item',
            onTap: () => _insertFormatting(prefix: '- [ ] '),
          ),
          _ActionButton(
            label: '❝ Quote',
            tooltip: 'Blockquote',
            onTap: () => _insertFormatting(prefix: '> '),
          ),
          _ActionButton(
            label: '⊞ Table',
            tooltip: 'Markdown Table',
            onTap: () => _insertBlock('| Header 1 | Header 2 |\n|---|---|\n| Cell 1 | Cell 2 |'),
          ),
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;
  final bool isBold;
  final bool isItalic;
  final bool isSpecial;
  final String? tooltip;

  const _ActionButton({
    required this.label,
    this.onTap,
    this.isBold = false,
    this.isItalic = false,
    this.isSpecial = false,
    this.tooltip,
  });

  @override
  Widget build(BuildContext context) {
    Widget child = Container(
      margin: const EdgeInsets.symmetric(horizontal: 2),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: isSpecial ? SeleneTheme.purpleMystic.withValues(alpha: 0.18) : SeleneTheme.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isSpecial ? SeleneTheme.purpleMystic : SeleneTheme.border,
          width: 1,
        ),
      ),
      child: Center(
        child: Text(
          label,
          style: TextStyle(
            color: isSpecial ? SeleneTheme.purpleMystic : SeleneTheme.textPrimary,
            fontWeight: isBold || isSpecial ? FontWeight.bold : FontWeight.w500,
            fontStyle: isItalic ? FontStyle.italic : FontStyle.normal,
            fontSize: 13,
          ),
        ),
      ),
    );

    if (tooltip != null) {
      child = Tooltip(message: tooltip!, child: child);
    }

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: child,
    );
  }
}
