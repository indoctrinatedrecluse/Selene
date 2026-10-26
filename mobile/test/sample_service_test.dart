import 'package:flutter_test/flutter_test.dart';
import 'package:selene_mobile/data/services/sample_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('SampleService Tests', () {
    test('Contains exactly 22 canonical showcase samples', () {
      expect(SampleService.allSamples.length, equals(22));
    });

    test('All samples have valid filenames, titles, and icons', () {
      for (final sample in SampleService.allSamples) {
        expect(sample.id, startsWith('sample-'));
        expect(sample.filename, endsWith('.md'));
        expect(sample.title.isNotEmpty, isTrue);
        expect(sample.subtitle.isNotEmpty, isTrue);
        expect(sample.icon.isNotEmpty, isTrue);
        expect(sample.category.isNotEmpty, isTrue);
        expect(sample.assetPath, startsWith('assets/samples/'));
      }
    });

    test('Embedded fallback generates rich Markdown content', () {
      for (final sample in SampleService.allSamples) {
        final content = SampleService.loadSampleContent(sample);
        expect(content, isNotNull);
      }
    });
  });
}
