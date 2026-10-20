import 'package:flutter/material.dart';

/// Selene Celestial Theme System
/// Replicates the deep midnight obsidian and lunar mythos aesthetic of the desktop app.
class SeleneTheme {
  // Midnight Obsidian Color Palette
  static const Color background = Color(0xFF030712); // Deep space black
  static const Color surface = Color(0xFF0B0F17);    // Dark slate obsidian
  static const Color surfaceElevated = Color(0xFF111827); // Card / Sheet surface
  static const Color border = Color(0xFF1E293B);     // Subtle lunar perimeter
  static const Color borderHighlight = Color(0xFF334155);

  // Celestial Accents
  static const Color lunarCyan = Color(0xFF38BDF8);  // Lunar torch radiance
  static const Color lunarSilver = Color(0xFFE2E8F0);// Moonlight silver
  static const Color starlightBlue = Color(0xFF0284C7);
  static const Color goldAccent = Color(0xFFF59E0B); // Titan Apollo gold
  static const Color emeraldSuccess = Color(0xFF10B981);
  static const Color roseDanger = Color(0xFFF43F5E);
  static const Color purpleMystic = Color(0xFFA855F7); // Delphic Pythia purple

  // Text Colors
  static const Color textPrimary = Color(0xFFF8FAFC);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textMuted = Color(0xFF64748B);

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: background,
      primaryColor: lunarCyan,
      colorScheme: const ColorScheme.dark(
        primary: lunarCyan,
        secondary: goldAccent,
        surface: surface,
        error: roseDanger,
        onPrimary: background,
        onSurface: textPrimary,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: surface,
        foregroundColor: textPrimary,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: textPrimary,
          letterSpacing: -0.2,
        ),
      ),
      cardTheme: CardThemeData(
        color: surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: border, width: 1),
        ),
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: surfaceElevated,
        modalBackgroundColor: surfaceElevated,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: surfaceElevated,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: border, width: 1),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: border,
        thickness: 1,
        space: 1,
      ),
    );
  }
}
