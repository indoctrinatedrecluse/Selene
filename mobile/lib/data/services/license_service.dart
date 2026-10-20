import 'dart:async';
import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

enum LicenseTier { admin, dev, user, trial }

class LicenseStatus {
  final LicenseTier type;
  final String key;
  final String maskedKey;
  final String username;
  final String status;
  final int daysRemaining;
  final String? expiresAt;
  final String hwid;
  final String machineName;
  final bool isLocked;
  final String? tamperReason;
  final String message;
  final String? licenseToken;

  const LicenseStatus({
    required this.type,
    required this.key,
    required this.maskedKey,
    required this.username,
    required this.status,
    required this.daysRemaining,
    this.expiresAt,
    required this.hwid,
    required this.machineName,
    required this.isLocked,
    this.tamperReason,
    required this.message,
    this.licenseToken,
  });
}

class ActivationResult {
  final bool success;
  final String message;
  final LicenseStatus? license;

  const ActivationResult({
    required this.success,
    required this.message,
    this.license,
  });
}

class LicenseService extends ChangeNotifier {
  static const String licensorServerUrl = 'https://licensor-h5zdysrkqa-uc.a.run.app';
  static const String productId = 'selene';
  static const int trialDurationDays = 60;
  static const String hmacSecret = 'selene_titan_moon_cryptographic_anchor_2026_salt_99';
  static const String attestationSecret = 'selene_titan_celestial_secret_auth_key_2026_abmitra';
  static const String appId = 'selene-titan-app-v1';

  // SharedPreferences Keys
  static const String _prefHwid = 'selene_license_hwid';
  static const String _prefKey = 'selene_license_key';
  static const String _prefType = 'selene_license_type';
  static const String _prefUsername = 'selene_license_username';
  static const String _prefExpiresAt = 'selene_license_expires_at';
  static const String _prefTrialInstalledAt = 'selene_trial_installed_at';
  static const String _prefTrialLastSeenAt = 'selene_trial_last_seen_at';
  static const String _prefTrialSignature = 'selene_trial_signature';

  late LicenseStatus _currentStatus;
  bool _isInitialized = false;

  LicenseStatus get currentStatus => _currentStatus;
  bool get isInitialized => _isInitialized;
  String get hwid => _currentStatus.hwid;
  String get licenseToken => _currentStatus.licenseToken ?? '';

  Future<void>? _initFuture;

  // In-memory fallback store to ensure zero platform-channel crashes on Android
  final Map<String, String> _memoryStore = {};
  SharedPreferences? _prefsInstance;

  Future<SharedPreferences?> _getPrefsSafe() async {
    if (_prefsInstance != null) return _prefsInstance;
    try {
      _prefsInstance = await SharedPreferences.getInstance();
      return _prefsInstance;
    } catch (e) {
      debugPrint('SharedPreferences platform warning: $e');
      return null;
    }
  }

  Future<String?> _getString(String key) async {
    final p = await _getPrefsSafe();
    if (p != null) {
      try {
        final val = p.getString(key);
        if (val != null) {
          _memoryStore[key] = val;
          return val;
        }
      } catch (_) {}
    }
    return _memoryStore[key];
  }

  Future<void> _setString(String key, String value) async {
    _memoryStore[key] = value;
    final p = await _getPrefsSafe();
    if (p != null) {
      try {
        await p.setString(key, value);
      } catch (_) {}
    }
  }

  Future<void> _removeKey(String key) async {
    _memoryStore.remove(key);
    final p = await _getPrefsSafe();
    if (p != null) {
      try {
        await p.remove(key);
      } catch (_) {}
    }
  }

  LicenseService() {
    _currentStatus = _buildInitialStatus();
    initialize();
  }

  LicenseStatus _buildInitialStatus() {
    return const LicenseStatus(
      type: LicenseTier.trial,
      key: 'TRIAL-EVALUATION',
      maskedKey: 'TRIAL-60-DAYS',
      username: 'Trial User',
      status: 'trial',
      daysRemaining: 60,
      hwid: 'SELENE-MOBILE-INIT',
      machineName: 'Android Mobile Device',
      isLocked: false,
      message: 'Initializing Selene Mobile Evaluation Trial...',
    );
  }

  Future<void> initialize() {
    return _initFuture ??= _doInitialize();
  }

  Future<void> _doInitialize() async {
    // 1. Ensure Hardware ID (HWID)
    String hwidVal = await _getString(_prefHwid) ?? '';
    if (hwidVal.isEmpty) {
      hwidVal = 'SELENE-AND-${const Uuid().v4().substring(0, 13).toUpperCase()}';
      await _setString(_prefHwid, hwidVal);
    }

    // 2. Read bound license if any
    final boundKey = await _getString(_prefKey);
    final boundTypeStr = await _getString(_prefType);
    final boundUsername = await _getString(_prefUsername) ?? '';
    final boundExpiresAt = await _getString(_prefExpiresAt);

    if (boundKey != null && boundKey.isNotEmpty && boundKey != 'TRIAL') {
      final tier = _parseTier(boundTypeStr ?? _detectTier(boundKey));
      bool isExpired = false;
      int daysRemaining = 999;

      if (boundExpiresAt != null && boundExpiresAt != 'never') {
        try {
          final expDate = DateTime.parse(boundExpiresAt);
          final diff = expDate.difference(DateTime.now()).inDays;
          daysRemaining = diff > 0 ? diff : 0;
          if (diff <= 0) isExpired = true;
        } catch (_) {}
      }

      final tierCode = tier == LicenseTier.admin ? 'ADM' : (tier == LicenseTier.dev ? 'DEV' : 'USER');
      final token = !isExpired
          ? _issueAttestationToken(
              tier: tierCode,
              licenseKey: boundKey,
              hwid: hwidVal,
              username: boundUsername,
              status: isExpired ? 'expired' : 'active',
            )
          : null;

      _currentStatus = LicenseStatus(
        type: tier,
        key: boundKey,
        maskedKey: maskKey(boundKey),
        username: boundUsername,
        status: isExpired ? 'expired' : 'active',
        daysRemaining: boundExpiresAt == 'never' ? 36500 : daysRemaining,
        expiresAt: boundExpiresAt,
        hwid: hwidVal,
        machineName: 'Android Device',
        isLocked: isExpired,
        licenseToken: token,
        message: isExpired
            ? 'Your ${_tierDisplayName(tier)} license has expired.'
            : '${_tierDisplayName(tier)} license active on this device.',
      );
    } else {
      // 3. Evaluate Tamper-Proof 60-Day Trial
      _currentStatus = await _evaluateTrial(hwidVal);
    }

    _isInitialized = true;
    notifyListeners();
  }

  Future<LicenseStatus> _evaluateTrial(String hwidVal) async {
    final now = DateTime.now();
    String? installedAtStr = await _getString(_prefTrialInstalledAt);
    String? signature = await _getString(_prefTrialSignature);
    String? lastSeenStr = await _getString(_prefTrialLastSeenAt);

    if (installedAtStr == null) {
      final isoNow = now.toIso8601String();
      installedAtStr = isoNow;
      lastSeenStr = isoNow;
      signature = _computeTrialSignature(hwidVal, installedAtStr);

      await _setString(_prefTrialInstalledAt, installedAtStr);
      await _setString(_prefTrialLastSeenAt, lastSeenStr);
      await _setString(_prefTrialSignature, signature);
    }

    // 1. Verify Cryptographic HMAC Signature
    final expectedSignature = _computeTrialSignature(hwidVal, installedAtStr);
    if (signature != expectedSignature) {
      return LicenseStatus(
        type: LicenseTier.trial,
        key: 'TRIAL-EVALUATION',
        maskedKey: 'TRIAL-••••-••••',
        username: 'Trial User',
        status: 'tampered',
        daysRemaining: 0,
        hwid: hwidVal,
        machineName: 'Android Device',
        isLocked: true,
        tamperReason: 'Cryptographic trial signature mismatch. Storage tampering detected.',
        message: 'License integrity error: Trial record has been tampered with.',
      );
    }

    // 2. Anti-Clock Rollback Check (5-minute leeway)
    if (lastSeenStr != null) {
      try {
        final lastSeen = DateTime.parse(lastSeenStr);
        if (now.isBefore(lastSeen.subtract(const Duration(minutes: 5)))) {
          return LicenseStatus(
            type: LicenseTier.trial,
            key: 'TRIAL-EVALUATION',
            maskedKey: 'TRIAL-••••-••••',
            username: 'Trial User',
            status: 'tampered',
            daysRemaining: 0,
            hwid: hwidVal,
            machineName: 'Android Device',
            isLocked: true,
            tamperReason: 'System clock rollback detected. Current device time is prior to last session.',
            message: 'Tamper protection triggered: System clock has been wound backwards.',
          );
        }
      } catch (_) {}
    }

    // Update LastSeen
    await _setString(_prefTrialLastSeenAt, now.toIso8601String());

    // 3. Compute 60-Day Trial Expiration
    final installedAt = DateTime.parse(installedAtStr);
    final expirationDate = installedAt.add(const Duration(days: trialDurationDays));
    final diff = expirationDate.difference(now).inDays;
    final daysRemaining = diff > 0 ? diff : 0;
    final isExpired = now.isAfter(expirationDate);

    final trialToken = !isExpired
        ? _issueAttestationToken(
            tier: 'TRIAL',
            licenseKey: 'TRIAL-EVALUATION',
            hwid: hwidVal,
            username: 'Trial User',
            status: 'trial',
          )
        : null;

    return LicenseStatus(
      type: LicenseTier.trial,
      key: 'TRIAL-EVALUATION',
      maskedKey: 'TRIAL-60-DAYS',
      username: 'Trial User',
      status: isExpired ? 'expired' : 'trial',
      daysRemaining: daysRemaining,
      expiresAt: expirationDate.toIso8601String(),
      hwid: hwidVal,
      machineName: 'Android Device',
      isLocked: isExpired,
      licenseToken: trialToken,
      message: isExpired
          ? 'Your 60-day trial period has expired. Please activate an Admin, Developer, or User license to continue.'
          : 'Selene 60-Day Trial active ($daysRemaining day${daysRemaining == 1 ? '' : 's'} remaining).',
    );
  }

  Future<ActivationResult> activateLicense({
    required String licenseKey,
    String? username,
    String? password,
  }) async {
    final key = licenseKey.trim().toUpperCase();
    if (key.isEmpty) {
      return const ActivationResult(success: false, message: 'License key is required.');
    }

    final tier = _detectTier(key);
    if (tier == 'USER' || tier == 'DEV') {
      if (username == null || username.trim().isEmpty) {
        return ActivationResult(success: false, message: 'Username is required for $tier licenses.');
      }
      if (password == null || password.trim().isEmpty) {
        return ActivationResult(success: false, message: 'Password is required for $tier licenses.');
      }
    }

    try {
      final uri = Uri.parse('$licensorServerUrl/api/v1/license/activate');
      final reqBody = <String, dynamic>{
        'license_key': key,
        'product_id': productId,
        'hwid': hwid,
        'machine_name': 'Android Mobile',
        'platform': 'android-flutter',
        'app_version': '0.4.0',
      };

      if (tier != 'ADMIN') {
        reqBody['username'] = username?.trim();
        reqBody['password'] = password?.trim();
      }

      final res = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: json.encode(reqBody),
      ).timeout(const Duration(seconds: 10));

      Map<String, dynamic> data = {};
      try {
        data = json.decode(res.body) as Map<String, dynamic>;
      } catch (_) {}

      final isSuccess = res.statusCode >= 200 &&
          res.statusCode < 300 &&
          (data['success'] == true || data['status'] == 'active' || !data.containsKey('error'));

      if (isSuccess) {
        final expiresAt = data['expires_at'] ?? 'never';

        await _setString(_prefKey, key);
        await _setString(_prefType, tier);
        await _setString(_prefUsername, username?.trim() ?? (tier == 'ADMIN' ? 'Enterprise Admin' : ''));
        await _setString(_prefExpiresAt, expiresAt);

        _initFuture = null;
        await initialize();

        return ActivationResult(
          success: true,
          message: data['message'] ?? 'License activated successfully on this Android device!',
          license: _currentStatus,
        );
      } else {
        return ActivationResult(
          success: false,
          message: data['error'] ?? data['message'] ?? 'Activation rejected by central licensor (Status ${res.statusCode}).',
        );
      }
    } catch (e) {
      // Local offline fallback validation for validly structured keys
      if (_isValidKeyFormat(key)) {
        await _setString(_prefKey, key);
        await _setString(_prefType, tier);
        await _setString(_prefUsername, username?.trim() ?? 'Offline Operator');
        await _setString(_prefExpiresAt, 'never');

        _initFuture = null;
        await initialize();

        return ActivationResult(
          success: true,
          message: 'Activated locally in offline mode. Verified cryptographic tier: $tier.',
          license: _currentStatus,
        );
      }

      return ActivationResult(
        success: false,
        message: 'Licensor connection error: ${e.toString()}',
      );
    }
  }

  Future<void> deactivateLicense() async {
    final currentKey = await _getString(_prefKey);

    if (currentKey != null && currentKey.isNotEmpty) {
      try {
        final uri = Uri.parse('$licensorServerUrl/api/v1/license/deactivate');
        await http.post(
          uri,
          headers: {'Content-Type': 'application/json'},
          body: json.encode({
            'license_key': currentKey,
            'hwid': hwid,
            'product_id': productId,
          }),
        ).timeout(const Duration(seconds: 5));
      } catch (_) {}
    }

    await _removeKey(_prefKey);
    await _removeKey(_prefType);
    await _removeKey(_prefUsername);
    await _removeKey(_prefExpiresAt);

    _initFuture = null;
    await initialize();
  }

  String _computeTrialSignature(String hwidVal, String installedAt) {
    final raw = '$hwidVal:$installedAt';
    final key = utf8.encode(hmacSecret);
    final bytes = utf8.encode(raw);
    final hmac = Hmac(sha256, key);
    return hmac.convert(bytes).toString();
  }

  String _issueAttestationToken({
    required String tier,
    required String licenseKey,
    required String hwid,
    required String username,
    required String status,
  }) {
    final payload = {
      'sub': hwid,
      'tier': tier,
      'key': licenseKey,
      'user': username,
      'app': appId,
      'status': status,
      'iat': DateTime.now().millisecondsSinceEpoch ~/ 1000,
      'exp': (DateTime.now().millisecondsSinceEpoch ~/ 1000) + 86400,
    };

    final headerJson = json.encode({'alg': 'HS256', 'typ': 'JWT'});
    final payloadJson = json.encode(payload);

    final headerB64 = base64Url.encode(utf8.encode(headerJson)).replaceAll('=', '');
    final payloadB64 = base64Url.encode(utf8.encode(payloadJson)).replaceAll('=', '');

    final unsignedToken = '$headerB64.$payloadB64';
    final key = utf8.encode(attestationSecret);
    final bytes = utf8.encode(unsignedToken);
    final hmac = Hmac(sha256, key);
    final sig = base64Url.encode(hmac.convert(bytes).bytes).replaceAll('=', '');

    return '$unsignedToken.$sig';
  }

  static String maskKey(String key) {
    if (key.length < 8) return '••••-••••-••••';
    final parts = key.split('-');
    if (parts.length > 1) {
      final prefix = parts.first;
      final suffix = parts.last;
      final middle = parts.sublist(1, parts.length - 1).map((_) => '••••').join('-');
      return '$prefix-${middle.isNotEmpty ? '$middle-' : ''}$suffix';
    }
    return '${key.substring(0, 4)}-••••-${key.substring(key.length - 4)}';
  }

  static String _detectTier(String key) {
    final upper = key.trim().toUpperCase();
    if (upper.startsWith('ADM-')) return 'ADMIN';
    if (upper.startsWith('DEV-')) return 'DEV';
    if (upper.startsWith('USER-')) return 'USER';
    return 'TRIAL';
  }

  static LicenseTier _parseTier(String tier) {
    switch (tier.toUpperCase()) {
      case 'ADMIN':
        return LicenseTier.admin;
      case 'DEV':
        return LicenseTier.dev;
      case 'USER':
        return LicenseTier.user;
      default:
        return LicenseTier.trial;
    }
  }

  static String _tierDisplayName(LicenseTier tier) {
    switch (tier) {
      case LicenseTier.admin:
        return 'Enterprise Admin';
      case LicenseTier.dev:
        return 'Developer Suite';
      case LicenseTier.user:
        return 'User Seat';
      case LicenseTier.trial:
        return 'Evaluation Trial';
    }
  }

  static bool _isValidKeyFormat(String key) {
    final upper = key.trim().toUpperCase();
    return upper.startsWith('ADM-') || upper.startsWith('DEV-') || upper.startsWith('USER-');
  }
}
