import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:http/http.dart' as http;
import '../models/document_model.dart';
import 'license_service.dart';

class SeleneApiClient {
  final String baseUrl;
  final String sharedSecret;
  final String deviceHwid;
  final LicenseService? licenseService;

  SeleneApiClient({
    this.baseUrl = 'https://selene-h5zdysrkqa-uc.a.run.app',
    this.sharedSecret = 'selene_titan_celestial_secret_auth_key_2026_abmitra',
    this.deviceHwid = 'mobile-android-client',
    this.licenseService,
  });

  /// Computes the HMAC-SHA256 attestation headers required by Next.js middleware
  Map<String, String> _generateAttestationHeaders(String path, {String method = 'GET'}) {
    final effectiveHwid = licenseService?.hwid ?? deviceHwid;
    final effectiveToken = (licenseService != null && licenseService!.licenseToken.isNotEmpty)
        ? licenseService!.licenseToken
        : 'TRIAL-ACTIVE-MOBILE-SEAT';

    final timestamp = DateTime.now().toUtc().toIso8601String();
    final normalizedMethod = method.toUpperCase();
    final message = 'selene-titan-app-v1:$normalizedMethod:$path:$timestamp:$effectiveHwid';
    final key = utf8.encode(sharedSecret);
    final bytes = utf8.encode(message);
    final hmac = Hmac(sha256, key);
    final signature = hmac.convert(bytes).toString();

    return {
      'Content-Type': 'application/json',
      'X-Selene-App-ID': 'selene-titan-app-v1',
      'X-Selene-Client': 'mobile-android',
      'X-Selene-Timestamp': timestamp,
      'X-Selene-HWID': effectiveHwid,
      'X-Selene-Signature': signature,
      'X-Selene-License-Token': effectiveToken,
    };
  }

  /// Probes backend health endpoint
  Future<Map<String, dynamic>> checkHealth() async {
    try {
      final uri = Uri.parse('$baseUrl/api/health');
      final res = await http.get(uri, headers: _generateAttestationHeaders('/api/health', method: 'GET'));
      if (res.statusCode == 200) {
        return json.decode(res.body) as Map<String, dynamic>;
      }
      return {'status': 'error', 'statusCode': res.statusCode};
    } catch (e) {
      return {'status': 'error', 'message': e.toString()};
    }
  }

  /// Queries the Delphic Oracle AI copilot for text or code continuation
  Future<String> askDelphicOracle({
    required String prompt,
    String context = '',
    String language = 'markdown',
    String mode = 'prose',
  }) async {
    try {
      final path = '/api/ai/complete';
      final uri = Uri.parse('$baseUrl$path');
      final headers = _generateAttestationHeaders(path, method: 'POST');
      final body = json.encode({
        'contextBefore': prompt.isNotEmpty ? prompt : context,
        'contextAfter': '',
        'language': language,
        'mode': mode,
        // Fallbacks for legacy/alternative servers
        'prompt': prompt,
        'context': context,
      });

      final res = await http.post(uri, headers: headers, body: body).timeout(const Duration(seconds: 12));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        return data['completion'] ?? data['result'] ?? 'The Oracle remains in contemplative silence.';
      }
      return 'Oracle connection error (Status ${res.statusCode})';
    } catch (e) {
      return 'Oracle dispatch error: ${e.toString()}';
    }
  }

  /// Explains and auto-fixes a code block with the Delphic Oracle
  Future<Map<String, dynamic>> fixCodeWithOracle({
    required String code,
    required String language,
    String? errorDetail,
    String? stackContext,
  }) async {
    try {
      final path = '/api/ai/fix';
      final uri = Uri.parse('$baseUrl$path');
      final headers = _generateAttestationHeaders(path, method: 'POST');
      final err = errorDetail ?? 'Code syntax or execution error';
      final body = json.encode({
        'code': code,
        'language': language,
        'errorMessage': err,
        'stackContext': stackContext ?? '',
        // Fallback for legacy servers
        'error': err,
      });

      final res = await http.post(uri, headers: headers, body: body).timeout(const Duration(seconds: 15));
      if (res.statusCode == 200) {
        return json.decode(res.body) as Map<String, dynamic>;
      }
      return {'success': false, 'message': 'Fix request returned status ${res.statusCode}'};
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  /// Synthesizes UI components, diagrams, or math formulas with the Delphic Oracle
  Future<String?> generateWithOracle({
    required String prompt,
    String category = 'ui',
    String stack = 'tsx',
    String diagramType = 'flowchart',
  }) async {
    try {
      final path = '/api/ai/generate';
      final uri = Uri.parse('$baseUrl$path');
      final headers = _generateAttestationHeaders(path, method: 'POST');
      final body = json.encode({
        'prompt': prompt,
        'category': category,
        'stack': stack,
        'diagramType': diagramType,
      });

      final res = await http.post(uri, headers: headers, body: body).timeout(const Duration(seconds: 15));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        return data['content'] ?? data['code'] ?? data['result'];
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  /// Syncs document to cloud share gist
  Future<String?> createCloudShareGist(DocumentModel doc) async {
    try {
      final path = '/api/share';
      final uri = Uri.parse('$baseUrl$path');
      final headers = _generateAttestationHeaders(path, method: 'POST');
      final body = json.encode({
        'title': doc.title,
        'contentMarkdown': doc.content,
        'content': doc.content,
        'author': 'Selene Mobile Titan',
      });

      final res = await http.post(uri, headers: headers, body: body).timeout(const Duration(seconds: 10));
      if (res.statusCode == 200 || res.statusCode == 201) {
        final data = json.decode(res.body);
        if (data['url'] != null && (data['url'] as String).isNotEmpty) {
          return data['url'] as String;
        }
        final shareId = data['id'] ?? data['shareId'];
        if (shareId != null) {
          return '$baseUrl/share/$shareId';
        }
        return data['shareUrl'] as String?;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  /// Fetches all active documents from the cloud vault
  Future<List<DocumentModel>> fetchRemoteDocuments() async {
    try {
      final path = '/api/documents';
      final uri = Uri.parse('$baseUrl$path');
      final headers = _generateAttestationHeaders(path, method: 'GET');
      final res = await http.get(uri, headers: headers).timeout(const Duration(seconds: 10));
      if (res.statusCode == 200) {
        final List data = json.decode(res.body);
        return data.map((item) {
          final map = item as Map<String, dynamic>;
          final createdMs = map['createdAt'] is int ? map['createdAt'] as int : 0;
          final updatedMs = map['updatedAt'] is int ? map['updatedAt'] as int : 0;
          return DocumentModel(
            id: map['id']?.toString() ?? '',
            title: map['title']?.toString() ?? 'Untitled Document',
            content: (map['contentMarkdown'] ?? map['content'] ?? '').toString(),
            createdAt: createdMs > 0 ? DateTime.fromMillisecondsSinceEpoch(createdMs) : DateTime.now(),
            updatedAt: updatedMs > 0 ? DateTime.fromMillisecondsSinceEpoch(updatedMs) : DateTime.now(),
            tags: [if (map['folder'] != null) map['folder'].toString() else 'documents'],
          );
        }).toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  /// Pushes a document update or new document to the cloud vault
  Future<bool> pushDocumentToCloud(DocumentModel doc) async {
    try {
      final path = '/api/documents/${doc.id}';
      final uri = Uri.parse('$baseUrl$path');
      final headers = _generateAttestationHeaders(path, method: 'PUT');
      final body = json.encode({
        'id': doc.id,
        'title': doc.title,
        'contentMarkdown': doc.content,
        'folder': doc.tags.isNotEmpty ? doc.tags.first : 'documents',
      });
      final res = await http.put(uri, headers: headers, body: body).timeout(const Duration(seconds: 10));
      if (res.statusCode == 200 || res.statusCode == 201) {
        return true;
      }
      // If document does not exist remotely yet, create it via POST
      if (res.statusCode == 404) {
        final createPath = '/api/documents';
        final createUri = Uri.parse('$baseUrl$createPath');
        final createHeaders = _generateAttestationHeaders(createPath, method: 'POST');
        final createRes = await http.post(createUri, headers: createHeaders, body: body).timeout(const Duration(seconds: 10));
        return createRes.statusCode == 200 || createRes.statusCode == 201;
      }
      return false;
    } catch (_) {
      return false;
    }
  }
}
