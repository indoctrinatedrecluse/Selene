import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';

class UpdateInfo {
  final String currentVersion;
  final String latestVersion;
  final bool isUpdateAvailable;
  final String releaseName;
  final String releaseTag;
  final String releaseUrl;
  final String releaseNotes;
  final String? apkDownloadUrl;
  final int? apkSize;
  final DateTime? publishedAt;
  final String? errorMessage;

  const UpdateInfo({
    required this.currentVersion,
    required this.latestVersion,
    required this.isUpdateAvailable,
    required this.releaseName,
    required this.releaseTag,
    required this.releaseUrl,
    required this.releaseNotes,
    this.apkDownloadUrl,
    this.apkSize,
    this.publishedAt,
    this.errorMessage,
  });

  factory UpdateInfo.upToDate(String currentVersion) {
    return UpdateInfo(
      currentVersion: currentVersion,
      latestVersion: currentVersion,
      isUpdateAvailable: false,
      releaseName: 'Selene v$currentVersion',
      releaseTag: 'v$currentVersion',
      releaseUrl: 'https://github.com/indoctrinatedrecluse/Selene/releases',
      releaseNotes: 'Your mobile canvas is running the latest version.',
    );
  }

  factory UpdateInfo.error(String currentVersion, String error) {
    return UpdateInfo(
      currentVersion: currentVersion,
      latestVersion: currentVersion,
      isUpdateAvailable: false,
      releaseName: 'Selene v$currentVersion',
      releaseTag: 'v$currentVersion',
      releaseUrl: 'https://github.com/indoctrinatedrecluse/Selene/releases',
      releaseNotes: '',
      errorMessage: error,
    );
  }
}

class UpdateService {
  static const String currentAppVersion = '0.6.0';
  static const String githubRepo = 'indoctrinatedrecluse/Selene';
  static const String latestReleaseApi =
      'https://api.github.com/repos/$githubRepo/releases/latest';
  static const String releasesWebUrl =
      'https://github.com/$githubRepo/releases';

  // Toggle this flag when deploying to Google Play Store in the future
  static const bool usePlayStore = false;
  static const String playStorePackage = 'com.selene.selene_mobile';

  /// Compare two semantic version strings (e.g., '0.6.1' vs '0.6.0')
  static int compareSemver(String remote, String current) {
    List<int> parse(String v) {
      final clean = v.replaceFirst(RegExp(r'^v'), '').split(RegExp(r'[-+]'))[0];
      return clean.split('.').map((p) => int.tryParse(p) ?? 0).toList();
    }

    final rParts = parse(remote);
    final cParts = parse(current);
    final maxLen = rParts.length > cParts.length ? rParts.length : cParts.length;

    for (int i = 0; i < maxLen; i++) {
      final r = i < rParts.length ? rParts[i] : 0;
      final c = i < cParts.length ? cParts[i] : 0;
      if (r > c) return 1;
      if (r < c) return -1;
    }
    return 0;
  }

  /// Checks GitHub Releases for the latest mobile update
  static Future<UpdateInfo> checkForUpdate() async {
    try {
      final response = await http.get(
        Uri.parse(latestReleaseApi),
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'SeleneMobile-Updater-$currentAppVersion',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 404) {
        return UpdateInfo.upToDate(currentAppVersion);
      }

      if (response.statusCode != 200) {
        return UpdateInfo.error(
          currentAppVersion,
          'Release server returned ${response.statusCode}',
        );
      }

      final Map<String, dynamic> data =
          jsonDecode(response.body) as Map<String, dynamic>;

      final rawTag = (data['tag_name'] as String?) ?? 'v$currentAppVersion';
      final cleanTag = rawTag.replaceFirst(RegExp(r'^v'), '').trim();
      final isNewer = compareSemver(cleanTag, currentAppVersion) > 0;

      String? apkUrl;
      int? apkSize;

      final assets = data['assets'] as List<dynamic>?;
      if (assets != null) {
        for (final asset in assets) {
          final assetMap = asset as Map<String, dynamic>;
          final name = (assetMap['name'] as String? ?? '').toLowerCase();
          if (name.endsWith('.apk')) {
            apkUrl = assetMap['browser_download_url'] as String?;
            apkSize = assetMap['size'] as int?;
            break;
          }
        }
      }

      DateTime? publishedAt;
      if (data['published_at'] != null) {
        publishedAt = DateTime.tryParse(data['published_at'] as String);
      }

      return UpdateInfo(
        currentVersion: currentAppVersion,
        latestVersion: cleanTag,
        isUpdateAvailable: isNewer,
        releaseName: (data['name'] as String?) ?? rawTag,
        releaseTag: rawTag,
        releaseUrl: (data['html_url'] as String?) ?? releasesWebUrl,
        releaseNotes: (data['body'] as String?) ?? '',
        apkDownloadUrl: apkUrl,
        apkSize: apkSize,
        publishedAt: publishedAt,
      );
    } catch (e) {
      if (kDebugMode) {
        print('Error checking for updates: $e');
      }
      return UpdateInfo.error(currentAppVersion, e.toString());
    }
  }

  /// Launches the update download (either Play Store or GitHub Direct APK)
  static Future<bool> launchUpdate(UpdateInfo info) async {
    if (usePlayStore) {
      final playStoreUri =
          Uri.parse('market://details?id=$playStorePackage');
      final playStoreWebUri = Uri.parse(
          'https://play.google.com/store/apps/details?id=$playStorePackage');

      if (await canLaunchUrl(playStoreUri)) {
        return await launchUrl(playStoreUri,
            mode: LaunchMode.externalApplication);
      }
      return await launchUrl(playStoreWebUri,
          mode: LaunchMode.externalApplication);
    }

    // Direct GitHub release APK download
    if (info.apkDownloadUrl != null && info.apkDownloadUrl!.isNotEmpty) {
      final uri = Uri.parse(info.apkDownloadUrl!);
      return await launchUrl(uri, mode: LaunchMode.externalApplication);
    }

    // Fallback to release web page
    final webUri = Uri.parse(info.releaseUrl);
    return await launchUrl(webUri, mode: LaunchMode.externalApplication);
  }

  /// Launches GitHub Releases in the external browser
  static Future<bool> launchReleasesPage() async {
    final uri = Uri.parse(releasesWebUrl);
    return await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  /// Format file size for human display
  static String formatBytes(int? bytes) {
    if (bytes == null || bytes <= 0) return '';
    if (bytes < 1024 * 1024) {
      return '${(bytes / 1024).toStringAsFixed(1)} KB';
    }
    return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
  }
}
