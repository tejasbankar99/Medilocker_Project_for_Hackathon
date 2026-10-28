import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:medilocker/models/medical_document.dart';
import 'package:medilocker/widgets/document_card.dart';

void main() {
  group('Widget & Accessibility Tests', () {
    testWidgets('DocumentCard renders title, category, and accessible semantics', (WidgetTester tester) async {
      final doc = MedicalDocument(
        id: 'doc-001',
        userId: 'user-001',
        title: 'Blood Test Results',
        category: 'Lab Report',
        fileUrl: 'https://example.com/test.pdf',
        fileType: 'application/pdf',
        fileSize: 1048576,
        doctorName: 'Dr. John Watson',
        hospitalName: 'St. Mary Hospital',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      bool tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: DocumentCard(
              document: doc,
              onTap: () {
                tapped = true;
              },
            ),
          ),
        ),
      );

      // Verify text elements render
      expect(find.text('Blood Test Results'), findsOneWidget);
      expect(find.text('Lab Report'), findsOneWidget);
      expect(find.text('Dr. John Watson'), findsOneWidget);

      // Verify tap works
      await tester.tap(find.byType(DocumentCard));
      expect(tapped, isTrue);

      // Verify Semantics is present for screen readers
      expect(find.byType(Semantics), findsWidgets);
    });
  });
}
