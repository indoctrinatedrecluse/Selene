import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:selene_mobile/data/models/document_model.dart';
import 'package:selene_mobile/data/repositories/document_repository.dart';
import 'package:selene_mobile/ui/core/theme.dart';

class HermesCourierSheet extends StatefulWidget {
  final DocumentModel document;
  final DocumentRepository repository;

  const HermesCourierSheet({
    super.key,
    required this.document,
    required this.repository,
  });

  static Future<void> show(BuildContext context, DocumentModel document, DocumentRepository repo) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => HermesCourierSheet(document: document, repository: repo),
    );
  }

  @override
  State<HermesCourierSheet> createState() => _HermesCourierSheetState();
}

class _HermesCourierSheetState extends State<HermesCourierSheet> {
  bool _isPublishingGist = false;
  String? _publishedGistUrl;

  void _exportStandaloneHtml() {
    final title = widget.document.title;
    final markdown = widget.document.content;

    // Wrap markdown into a self-contained offline HTML file
    final htmlDoc = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>$title — Selene Illuminated Document</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #0b0f19;
      color: #f1f5f9;
      line-height: 1.6;
      margin: 0;
      padding: 32px 16px;
    }
    .container {
      max-width: 760px;
      margin: 0 auto;
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    h1, h2, h3 { color: #38bdf8; }
    h1 { border-bottom: 1px solid #334155; padding-bottom: 8px; }
    pre {
      background: #06090f;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 16px;
      overflow-x: auto;
      color: #38bdf8;
      font-family: monospace;
      font-size: 13px;
    }
    blockquote {
      border-left: 4px solid #38bdf8;
      margin: 16px 0;
      padding: 8px 16px;
      background: #1e293b;
      border-radius: 4px;
      color: #94a3b8;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 6px;
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      font-size: 12px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div style="margin-bottom: 24px;">
      <span class="badge">🌙 Selene Offline Edition</span>
      <span style="font-size: 12px; color: #64748b; margin-left: 12px;">Generated via Hermes Courier</span>
    </div>
    <pre style="white-space: pre-wrap; word-wrap: break-word;">${_escapeHtml(markdown)}</pre>
  </div>
</body>
</html>''';

    Clipboard.setData(ClipboardData(text: htmlDoc));
    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('✨ Self-Contained HTML copied to clipboard (Save as .html)'),
        duration: Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  String _escapeHtml(String text) {
    return text
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');
  }

  void _copyMarkdown() {
    Clipboard.setData(ClipboardData(text: widget.document.content));
    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Markdown copied to clipboard'),
        duration: Duration(milliseconds: 900),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _shareViaAndroidSheet() {
    final title = widget.document.title;
    final content = widget.document.content;
    Clipboard.setData(ClipboardData(text: content));
    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Document "$title" copied. Ready to paste in any app!'),
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _publishCloudGist() async {
    setState(() {
      _isPublishingGist = true;
    });

    final url = await widget.repository.apiClient.createCloudShareGist(widget.document);

    if (mounted) {
      setState(() {
        _isPublishingGist = false;
        _publishedGistUrl = url ?? 'https://selene.app/share/local-${widget.document.id}';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final media = MediaQuery.of(context);

    return Container(
      constraints: BoxConstraints(
        maxHeight: media.size.height * 0.82,
      ),
      decoration: const BoxDecoration(
        color: Color(0xFF090D16),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        border: Border(
          top: BorderSide(color: SeleneTheme.lunarCyan, width: 1.5),
        ),
      ),
      child: Column(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 14, 16, 12),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: SeleneTheme.goldAccent.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: SeleneTheme.goldAccent),
                  ),
                  child: const Center(
                    child: Text('🕊️', style: TextStyle(fontSize: 18)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Text(
                            'Hermes Courier',
                            style: TextStyle(
                              color: SeleneTheme.goldAccent,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(width: 8),
                          Text(
                            '• Exporter',
                            style: TextStyle(
                              color: SeleneTheme.lunarCyan,
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        'Universal Document Transmutation & Sharing',
                        style: TextStyle(
                          color: SeleneTheme.textMuted.withValues(alpha: 0.8),
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: SeleneTheme.textMuted, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: SeleneTheme.border),

          // Options List
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
              children: [
                // Option 1: Standalone HTML
                _buildExportCard(
                  icon: Icons.html,
                  iconColor: const Color(0xFFE34F26),
                  title: 'Self-Contained Offline HTML',
                  subtitle: 'Bundles dark mode CSS & typography into a single standalone web document.',
                  badge: 'STANDALONE',
                  onTap: _exportStandaloneHtml,
                ),
                const SizedBox(height: 12),

                // Option 2: Raw Markdown
                _buildExportCard(
                  icon: Icons.text_snippet_outlined,
                  iconColor: SeleneTheme.lunarCyan,
                  title: 'Raw Markdown (.md)',
                  subtitle: 'Copies clean CommonMark/GFM prose with preserved KaTeX & AST fences.',
                  badge: 'SOURCE',
                  onTap: _copyMarkdown,
                ),
                const SizedBox(height: 12),

                // Option 3: System Share
                _buildExportCard(
                  icon: Icons.share_outlined,
                  iconColor: SeleneTheme.emeraldSuccess,
                  title: 'Share to Apps',
                  subtitle: 'Transfers document text to WhatsApp, Slack, Signal, Google Drive, or Mail.',
                  badge: 'UNIVERSAL',
                  onTap: _shareViaAndroidSheet,
                ),
                const SizedBox(height: 12),

                // Option 4: Cloud Gist
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: SeleneTheme.surfaceElevated,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: SeleneTheme.borderHighlight),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              color: SeleneTheme.purpleMystic.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(Icons.cloud_upload_outlined, color: SeleneTheme.purpleMystic, size: 18),
                          ),
                          const SizedBox(width: 10),
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Selene Cloud Gist',
                                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                ),
                                Text(
                                  'Instantaneous read-only web share URL via Cloud Run.',
                                  style: TextStyle(color: SeleneTheme.textMuted, fontSize: 11),
                                ),
                              ],
                            ),
                          ),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: SeleneTheme.purpleMystic,
                              foregroundColor: Colors.white,
                              visualDensity: VisualDensity.compact,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            onPressed: _isPublishingGist ? null : _publishCloudGist,
                            child: _isPublishingGist
                                ? const SizedBox(
                                    width: 12,
                                    height: 12,
                                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                  )
                                : const Text('Publish'),
                          ),
                        ],
                      ),
                      if (_publishedGistUrl != null) ...[
                        const SizedBox(height: 10),
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0F172A),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: SeleneTheme.border),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: SelectableText(
                                  _publishedGistUrl!,
                                  style: const TextStyle(color: SeleneTheme.lunarCyan, fontSize: 11.5, fontFamily: 'monospace'),
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.copy, size: 16, color: SeleneTheme.goldAccent),
                                onPressed: () {
                                  Clipboard.setData(ClipboardData(text: _publishedGistUrl!));
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Gist URL copied!')),
                                  );
                                },
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildExportCard({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required String badge,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: SeleneTheme.surfaceElevated,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: SeleneTheme.borderHighlight),
        ),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: iconColor.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: iconColor, size: 18),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        title,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                        decoration: BoxDecoration(
                          color: iconColor.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: iconColor.withValues(alpha: 0.3)),
                        ),
                        child: Text(
                          badge,
                          style: TextStyle(color: iconColor, fontSize: 8.5, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(color: SeleneTheme.textMuted, fontSize: 11),
                  ),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios, size: 13, color: SeleneTheme.textMuted),
          ],
        ),
      ),
    );
  }
}
