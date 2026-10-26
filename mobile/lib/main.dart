import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'data/repositories/document_repository.dart';
import 'data/services/license_service.dart';
import 'data/services/selene_api_client.dart';
import 'ui/core/theme.dart';
import 'ui/features/editor/views/editor_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final licenseService = LicenseService();
  await licenseService.initialize();
  runApp(SeleneMobileApp(licenseService: licenseService));
}

class SeleneMobileApp extends StatefulWidget {
  final DocumentRepository? repository;
  final LicenseService? licenseService;

  const SeleneMobileApp({super.key, this.repository, this.licenseService});

  @override
  State<SeleneMobileApp> createState() => _SeleneMobileAppState();
}

class _SeleneMobileAppState extends State<SeleneMobileApp> {
  late final LicenseService _licenseService;
  late final DocumentRepository _repository;

  @override
  void initState() {
    super.initState();
    _licenseService = widget.licenseService ?? LicenseService();
    final apiClient = SeleneApiClient(licenseService: _licenseService);
    _repository = widget.repository ?? DocumentRepository(apiClient: apiClient);
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<LicenseService>.value(value: _licenseService),
        ChangeNotifierProvider<DocumentRepository>.value(value: _repository),
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
