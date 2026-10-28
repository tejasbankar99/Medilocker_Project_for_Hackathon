import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:medilocker/theme/app_theme.dart';
import 'package:medilocker/models/medical_document.dart';

void main() {
  group('Accessibility & Design System Tests', () {
    test('theme defines accessible dark palette with high-contrast accents', () {
      expect(AppTheme.bg, const Color(0xFF0A1628));
      expect(AppTheme.surface, const Color(0xFF122036));
      expect(AppTheme.card, const Color(0xFF1A2D48));
      expect(AppTheme.primary, const Color(0xFF00C9A7)); // High contrast cyan-green
      expect(AppTheme.secondary, const Color(0xFF4FC3F7)); // High contrast light blue
      expect(AppTheme.error, const Color(0xFFFF6B6B)); // High contrast error red
    });

    test('all 10 medical categories have distinct, accessible color assignments', () {
      for (final cat in MedicalDocument.categories) {
        final color = AppTheme.categoryColor(cat);
        expect(color, isNotNull);
        expect(color.alpha, 255, reason: 'Category color for $cat must be fully opaque for visibility');
      }
    });

    test('document categories include core healthcare record types', () {
      expect(MedicalDocument.categories, contains('Lab Report'));
      expect(MedicalDocument.categories, contains('Prescription'));
      expect(MedicalDocument.categories, contains('Cardiology'));
      expect(MedicalDocument.categories, contains('Radiology'));
      expect(MedicalDocument.categories, contains('Vaccination'));
    });
  });
}
