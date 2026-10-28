const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('Web Portal: Authentication & Role Guard Tests', () => {
  // Logic mirroring login page role checks
  const validateLoginPayload = (email, password) => {
    if (!email || !email.includes('@')) return { valid: false, error: 'Invalid email' };
    if (!password || password.length < 6) return { valid: false, error: 'Password too short' };
    return { valid: true };
  };

  const determineRedirectRoute = (role) => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'doctor':
        return '/doctor';
      default:
        return null; // Deny access (patients must use mobile app)
    }
  };

  it('validates correct email and password inputs', () => {
    const res = validateLoginPayload('doctor@hospital.com', 'SecurePass123!');
    assert.strictEqual(res.valid, true);
  });

  it('rejects invalid or malformed email inputs', () => {
    const res = validateLoginPayload('notanemail', 'SecurePass123!');
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.error, 'Invalid email');
  });

  it('rejects passwords shorter than 6 characters', () => {
    const res = validateLoginPayload('doctor@hospital.com', '123');
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.error, 'Password too short');
  });

  it('routes admin user to /admin dashboard', () => {
    const route = determineRedirectRoute('admin');
    assert.strictEqual(route, '/admin');
  });

  it('routes doctor user to /doctor portal', () => {
    const route = determineRedirectRoute('doctor');
    assert.strictEqual(route, '/doctor');
  });

  it('blocks patient accounts from web professional portal', () => {
    const route = determineRedirectRoute('patient');
    assert.strictEqual(route, null);
  });
});
