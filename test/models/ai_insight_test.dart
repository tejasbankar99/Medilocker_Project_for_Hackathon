import 'package:flutter_test/flutter_test.dart';
import 'package:medilocker/models/ai_insight.dart';

void main() {
  group('AiInsight Model Tests', () {
    test('should verify insight status getters', () {
      final completed = AiInsight(
        id: 'ai-1',
        documentId: 'doc-1',
        userId: 'u-1',
        status: 'completed',
        summary: 'Blood glucose levels within normal limits.',
        keyFindings: 'HbA1c: 5.6%',
        parameterChanges: const {'glucose': 'stable'},
        modelUsed: 'gemini-1.5-flash',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      expect(completed.isCompleted, isTrue);
      expect(completed.isProcessing, isFalse);
      expect(completed.hasFailed, isFalse);

      final processing = AiInsight(
        id: 'ai-2',
        documentId: 'doc-2',
        userId: 'u-1',
        status: 'processing',
        parameterChanges: const {},
        modelUsed: 'gemini-1.5-flash',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      expect(processing.isCompleted, isFalse);
      expect(processing.isProcessing, isTrue);

      final failed = AiInsight(
        id: 'ai-3',
        documentId: 'doc-3',
        userId: 'u-1',
        status: 'failed',
        errorMessage: 'Document image unreadable',
        parameterChanges: const {},
        modelUsed: 'gemini-1.5-flash',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      expect(failed.hasFailed, isTrue);
      expect(failed.errorMessage, 'Document image unreadable');
    });

    test('should parse JSON insight structure with trends and parameters', () {
      final json = {
        'id': 'ai-99',
        'document_id': 'doc-99',
        'user_id': 'user-99',
        'status': 'completed',
        'summary': 'Normal Lipid Panel',
        'key_findings': 'Cholesterol at 180 mg/dL',
        'comparison_with_previous': 'Down 15 mg/dL from last quarter',
        'parameter_changes': {
          'cholesterol': {'old': 195, 'new': 180, 'trend': 'improving'}
        },
        'health_trends': 'Positive cardiovascular improvement',
        'model_used': 'gemini-1.5-flash',
        'created_at': '2026-10-15T08:30:00.000Z',
        'updated_at': '2026-10-15T08:30:00.000Z',
      };

      final insight = AiInsight.fromJson(json);
      expect(insight.id, 'ai-99');
      expect(insight.summary, 'Normal Lipid Panel');
      expect(insight.hasComparison, isTrue);
      expect(insight.parameterChanges['cholesterol']['trend'], 'improving');
      expect(insight.healthTrends, 'Positive cardiovascular improvement');
    });
  });
}
