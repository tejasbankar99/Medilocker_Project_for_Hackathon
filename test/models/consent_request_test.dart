import 'package:flutter_test/flutter_test.dart';
import 'package:medilocker/models/consent_request.dart';

void main() {
  group('ConsentRequest Model Tests', () {
    test('should return correct scope labels', () {
      final reqAll = ConsentRequest(
        id: 'req-1',
        doctorId: 'doc-1',
        patientId: 'pat-1',
        purpose: 'General Consultation',
        scope: 'all',
        durationDays: 7,
        status: 'pending',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      expect(reqAll.scopeLabel, 'All Medical Records');

      final reqCategory = ConsentRequest(
        id: 'req-2',
        doctorId: 'doc-1',
        patientId: 'pat-1',
        purpose: 'Heart Check',
        scope: 'category',
        scopeValue: 'Cardiology',
        durationDays: 14,
        status: 'pending',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      expect(reqCategory.scopeLabel, 'Category: Cardiology');

      final reqSpecific = ConsentRequest(
        id: 'req-3',
        doctorId: 'doc-1',
        patientId: 'pat-1',
        purpose: 'Specific Lab Review',
        scope: 'specific',
        durationDays: 3,
        status: 'pending',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      expect(reqSpecific.scopeLabel, 'Specific Documents');
    });

    test('should parse JSON correctly with doctor metadata', () {
      final json = {
        'id': 'req-999',
        'doctor_id': 'doc-999',
        'patient_id': 'pat-999',
        'purpose': 'Pre-op Clearance',
        'scope': 'category',
        'scope_value': 'Lab Report',
        'duration_days': 5,
        'status': 'pending',
        'doctor_message': 'Need to check pre-op labs',
        'created_at': '2026-10-01T10:00:00.000Z',
        'updated_at': '2026-10-01T10:00:00.000Z',
        'doctor_profiles': {
          'full_name': 'Dr. Marcus Vance',
          'specialty': 'Surgery',
          'hospital': 'St. Jude Medical Center',
        },
      };

      final req = ConsentRequest.fromJson(json);
      expect(req.id, 'req-999');
      expect(req.purpose, 'Pre-op Clearance');
      expect(req.durationDays, 5);
      expect(req.status, 'pending');
      expect(req.doctorName, 'Dr. Marcus Vance');
      expect(req.doctorSpecialty, 'Surgery');
      expect(req.doctorHospital, 'St. Jude Medical Center');
    });
  });
}
