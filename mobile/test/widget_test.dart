import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:selene_mobile/main.dart';

void main() {
  testWidgets('Selene Mobile App smoke test', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});

    await tester.pumpWidget(const SeleneMobileApp());
    await tester.pump(const Duration(milliseconds: 500));

    // Verify that the title and lunar elements render
    expect(find.textContaining('Selene'), findsWidgets);
  });
}
