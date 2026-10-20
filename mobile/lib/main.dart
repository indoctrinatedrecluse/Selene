import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'data/repositories/document_repository.dart';
import 'data/services/license_service.dart';
import 'data/services/selene_api_client.dart';
import 'ui/core/theme.dart';
import 'ui/features/editor/views/editor_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const SeleneMobileApp());
}

class SeleneMobileApp extends StatelessWidget {
  final DocumentRepository? repository;
  final LicenseService? licenseService;

  const SeleneMobileApp({super.key, this.repository, this.licenseService});

  @override
  Widget build(BuildContext context) {
    final license = licenseService ?? LicenseService();
    final apiClient = SeleneApiClient(licenseService: license);
    final repo = repository ?? DocumentRepository(apiClient: apiClient);

    return MultiProvider(
      providers: [
        ChangeNotifierProvider<LicenseService>.value(value: license),
        ChangeNotifierProvider<DocumentRepository>.value(value: repo),
      ],
      child: MaterialApp(
        title: 'Selene Mobile',
        debugShowCheckedModeBanner: false,
        theme: SeleneTheme.darkTheme,
        home: const EditorScreen(),
      ),
    );
  }
}
