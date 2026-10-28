const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('Web Portal: Secure Signed URL API Validation', () => {
  const validateSignedUrlRequest = (headers, body) => {
    const authHeader = headers['authorization'] || headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { status: 401, error: 'Unauthorized: Missing or malformed token' };
    }
    const { fileUrl, patientId } = body || {};
    if (!fileUrl || !patientId) {
      return { status: 400, error: 'fileUrl and patientId are required' };
    }
    return { status: 200, valid: true };
  };

  it('rejects unauthenticated requests without bearer token with 401', () => {
    const res = validateSignedUrlRequest({}, { fileUrl: 'docs/test.pdf', patientId: 'p-123' });
    assert.strictEqual(res.status, 401);
    assert.match(res.error, /Unauthorized/);
  });

  it('rejects requests missing patientId with 400', () => {
    const res = validateSignedUrlRequest(
      { authorization: 'Bearer mock_jwt_token' },
      { fileUrl: 'docs/test.pdf' }
    );
    assert.strictEqual(res.status, 400);
    assert.match(res.error, /required/);
  });

  it('rejects requests missing fileUrl with 400', () => {
    const res = validateSignedUrlRequest(
      { authorization: 'Bearer mock_jwt_token' },
      { patientId: 'p-123' }
    );
    assert.strictEqual(res.status, 400);
    assert.match(res.error, /required/);
  });

  it('accepts valid authenticated requests with all required parameters', () => {
    const res = validateSignedUrlRequest(
      { authorization: 'Bearer valid_jwt_token_doctor' },
      { fileUrl: 'patient-vault/cardiology_report.pdf', patientId: 'patient-uuid-456' }
    );
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.valid, true);
  });
});
