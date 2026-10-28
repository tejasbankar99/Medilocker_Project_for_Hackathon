const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('Admin Moderation & Doctor Verification Tests', () => {
  const evaluateDoctorModeration = (doctorRecord, decision) => {
    if (!['approved', 'rejected'].includes(decision)) {
      return { success: false, error: 'Invalid decision' };
    }
    if (!doctorRecord.license || !doctorRecord.license.startsWith('MCI-')) {
      return { success: false, error: 'License verification format failed' };
    }
    return {
      success: true,
      newStatus: decision,
      isActiveRole: decision === 'approved',
      timestamp: new Date().toISOString(),
    };
  };

  it('approves doctor with verified medical license', () => {
    const doctor = { id: 'd-1', fullName: 'Dr. Jane Roe', license: 'MCI-554433' };
    const result = evaluateDoctorModeration(doctor, 'approved');

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.newStatus, 'approved');
    assert.strictEqual(result.isActiveRole, true);
  });

  it('rejects doctor with invalid or unverified license format', () => {
    const doctor = { id: 'd-2', fullName: 'Fake Doctor', license: 'INVALID-123' };
    const result = evaluateDoctorModeration(doctor, 'approved');

    assert.strictEqual(result.success, false);
    assert.match(result.error, /License/);
  });

  it('handles admin rejection and maintains inactive role', () => {
    const doctor = { id: 'd-3', fullName: 'Dr. Suspended', license: 'MCI-998877' };
    const result = evaluateDoctorModeration(doctor, 'rejected');

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.newStatus, 'rejected');
    assert.strictEqual(result.isActiveRole, false);
  });
});
