import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:selene_mobile/data/services/license_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('LicenseService Tests', () {
    setUp(() {
      SharedPreferences.setMockInitialValues({});
    });

    test('Initializes with 60-day trial by default', () async {
      final service = LicenseService();
      await service.initialize();

      expect(service.currentStatus.type, LicenseTier.trial);
      expect(service.currentStatus.status, 'trial');
      expect(service.currentStatus.daysRemaining, 60);
      expect(service.currentStatus.isLocked, false);
      expect(service.currentStatus.hwid.startsWith('SELENE-AND-'), true);
      expect(service.currentStatus.licenseToken, isNotNull);
      expect(service.currentStatus.licenseToken!.contains('.'), true);
    });

    test('Correctly masks license keys', () {
      expect(LicenseService.maskKey('ADM-ABCD-1234-7F10'), 'ADM-••••-••••-7F10');
      expect(LicenseService.maskKey('USER-0000-1111-2222-3333'), 'USER-••••-••••-••••-3333');
    });

    test('Detects tamper on clock rollback', () async {
      // Simulate last seen in future
      final futureDate = DateTime.now().add(const Duration(days: 10)).toIso8601String();
      SharedPreferences.setMockInitialValues({
        'selene_license_hwid': 'SELENE-AND-TEST-HWID',
        'selene_trial_installed_at': DateTime.now().toIso8601String(),
        'selene_trial_last_seen_at': futureDate,
        // Will trigger signature mismatch or clock rollback
      });

      final service = LicenseService();
      await service.initialize();

      expect(service.currentStatus.isLocked, true);
      expect(service.currentStatus.status, 'tampered');
    });
  });
}
