import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Paleta "brasa": fundo grafite profundo com acentos quentes e verde-menta
/// para tudo que está pronto/livre.
class Palette {
  static const bg = Color(0xFF0C0E13);
  static const surface = Color(0xFF161922);
  static const surfaceHi = Color(0xFF1F2330);
  static const line = Color(0x1FFFFFFF);

  static const ember = Color(0xFFFF7A45);
  static const amber = Color(0xFFFFC857);
  static const mint = Color(0xFF3DDBA4);
  static const sky = Color(0xFF5AA9FF);
  static const rose = Color(0xFFFF5C6C);

  static const text = Color(0xFFF3F4F7);
  static const textDim = Color(0xFF9AA1B2);

  static const emberGradient = LinearGradient(
    colors: [Color(0xFFFF9A5A), Color(0xFFFF5E62)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}

ThemeData buildTheme() {
  final base = ThemeData(brightness: Brightness.dark, useMaterial3: true);
  final textTheme = GoogleFonts.soraTextTheme(base.textTheme).apply(
    bodyColor: Palette.text,
    displayColor: Palette.text,
  );

  return base.copyWith(
    scaffoldBackgroundColor: Palette.bg,
    textTheme: textTheme,
    colorScheme: const ColorScheme.dark(
      primary: Palette.ember,
      secondary: Palette.amber,
      surface: Palette.surface,
      error: Palette.rose,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Palette.surfaceHi,
      contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
      hintStyle: const TextStyle(color: Palette.textDim),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide.none,
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(color: Palette.ember, width: 1.4),
      ),
    ),
    snackBarTheme: SnackBarThemeData(
      behavior: SnackBarBehavior.floating,
      backgroundColor: Palette.surfaceHi,
      contentTextStyle: textTheme.bodyMedium,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
    ),
    dialogTheme: DialogThemeData(
      backgroundColor: Palette.surface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
    ),
    bottomSheetTheme: const BottomSheetThemeData(
      backgroundColor: Palette.surface,
      modalBackgroundColor: Palette.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
    ),
  );
}
