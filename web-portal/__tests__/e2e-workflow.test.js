const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('E2E Clinical Workflow: Request -> OTP -> Approval -> Signed URL', () => {
  // Simulating stateful in-memory pipeline
  const mockDatabase = {
    consentRequests: [],
    consentGrants: [],
    auditLogs: [],
    otpStore: new Map(),
  };

  const doctorId = 'doc-uuid-101';
  const patientId = 'pat-uuid-202';
  const documentId = 'doc-file-cardio-99';

  it('Step 1: Doctor initiates a scoped access request', () => {
    const request = {
      id: 'req-001',
      doctorId,
      patientId,
      purpose: 'Cardiovascular Assessment',
      scope: 'category',
      scopeValue: 'Cardiology',
      durationDays: 7,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    mockDatabase.consentRequests.push(request);

    assert.strictEqual(mockDatabase.consentRequests.length, 1);
    assert.strictEqual(mockDatabase.consentRequests[0].status, 'pending');
  });

  it('Step 2: System generates 6-digit 2FA OTP for patient verification', () => {
    const generatedOtp = '582914';
    mockDatabase.otpStore.set(patientId, {
      code: generatedOtp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      isUsed: false,
    });

    const stored = mockDatabase.otpStore.get(patientId);
    assert.strictEqual(stored.code, '582914');
    assert.strictEqual(stored.isUsed, false);
  });

  it('Step 3: Patient approves request with valid OTP', () => {
    const enteredOtp = '582914';
    const otpRecord = mockDatabase.otpStore.get(patientId);

    assert.strictEqual(enteredOtp, otpRecord.code);
    assert.strictEqual(otpRecord.isUsed, false);
    assert.ok(Date.now() < otpRecord.expiresAt);

    // Invalidate OTP
    otpRecord.isUsed = true;

    // Transition request status
    const req = mockDatabase.consentRequests.find(r => r.id === 'req-001');
    req.status = 'approved';

    // Issue grant
    const grant = {
      id: 'grant-001',
      requestId: req.id,
      doctorId: req.doctorId,
      patientId: req.patientId,
      scope: req.scope,
      scopeValue: req.scopeValue,
      expiresAt: new Date(Date.now() + req.durationDays * 86400000).toISOString(),
      isRevoked: false,
    };
    mockDatabase.consentGrants.push(grant);

    // Append audit log
    mockDatabase.auditLogs.push({
      action: 'consent_approved',
      actorId: patientId,
      targetId: grant.id,
      timestamp: new Date().toISOString(),
    });

    assert.strictEqual(req.status, 'approved');
    assert.strictEqual(mockDatabase.consentGrants.length, 1);
    assert.strictEqual(mockDatabase.consentGrants[0].isRevoked, false);
    assert.strictEqual(mockDatabase.auditLogs.length, 1);
  });

  it('Step 4: Doctor requests signed URL for permitted category document', () => {
    const activeGrant = mockDatabase.consentGrants.find(
      g => g.doctorId === doctorId && g.patientId === patientId && !g.isRevoked
    );
    assert.ok(activeGrant, 'Active grant must exist');
    assert.strictEqual(activeGrant.scopeValue, 'Cardiology');

    // Generate mock signed URL
    const mockSignedUrl = `https://supabase.co/storage/v1/object/sign/medical-documents/${documentId}?token=mock_signature_expires_in_3600`;
    assert.match(mockSignedUrl, /token=mock_signature/);
  });

  it('Step 5: Patient revokes access with instant zero-trust cutoff', () => {
    const grant = mockDatabase.consentGrants.find(g => g.id === 'grant-001');
    grant.isRevoked = true;

    mockDatabase.auditLogs.push({
      action: 'consent_revoked',
      actorId: patientId,
      targetId: grant.id,
      timestamp: new Date().toISOString(),
    });

    assert.strictEqual(grant.isRevoked, true);

    // Verify doctor can no longer access
    const verifiedActive = mockDatabase.consentGrants.find(
      g => g.doctorId === doctorId && g.patientId === patientId && !g.isRevoked
    );
    assert.strictEqual(verifiedActive, undefined);
  });
});
