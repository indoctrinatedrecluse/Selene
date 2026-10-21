import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:selene_mobile/ui/features/editor/widgets/markdown_canvas.dart';

void main() {
  group('MarkdownCanvas Code Execution & Visual Rendering Tests', () {
    testWidgets('Visual formats (chart, mermaid, math, glsl) auto-render and show Hide Visual action', (tester) async {
      const markdown = '''
# Showcase
```chart
{
  "type": "donut",
  "title": "Power Breakdown",
  "xKey": "subsystem",
  "yKey": "kw",
  "data": [{"subsystem": "Life Support", "kw": 40}]
}
```

```mermaid
flowchart TD
  A[Client] --> B[Gateway]
```
''';

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: MarkdownCanvas(content: markdown),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Verify action buttons exist for visual formats
      expect(find.text('Hide Visual'), findsNWidgets(2));
      expect(find.text('CHART'), findsOneWidget);
      expect(find.text('MERMAID'), findsOneWidget);
    });

    testWidgets('Executable code blocks (python, tsx, vue, rust) show Run Engine action', (tester) async {
      const markdown = '''
# Code Blocks
```python
print("Hello Titan")
```

```tsx
export default function Card() { return <div>Live</div>; }
```
''';

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: MarkdownCanvas(content: markdown),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Verify Run Engine buttons exist
      expect(find.text('Run Engine'), findsNWidgets(2));
      expect(find.text('PYTHON'), findsOneWidget);
      expect(find.text('TSX'), findsOneWidget);

      // Tap Run Engine on python block
      await tester.tap(find.text('Run Engine').first);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      // After running, button transitions to Re-Run
      expect(find.text('Re-Run'), findsOneWidget);
    });
  });
}
