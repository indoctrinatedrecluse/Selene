import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'data/repositories/document_repository.dart';
import 'data/services/selene_api_client.dart';
import 'ui/core/theme.dart';
import 'ui/features/editor/views/editor_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const SeleneMobileApp());
}

class SeleneMobileApp extends StatelessWidget {
  final DocumentRepository? repository;

  const SeleneMobileApp({super.key, this.repository});

  @override
  Widget build(BuildContext context) {
    final repo = repository ?? DocumentRepository(apiClient: SeleneApiClient());

    return ChangeNotifierProvider<DocumentRepository>.value(
      value: repo,
      child: MaterialApp(
        title: 'Selene Mobile',
        debugShowCheckedModeBanner: false,
        theme: SeleneTheme.darkTheme,
        home: const EditorScreen(),
      ),
    );
  }
}
