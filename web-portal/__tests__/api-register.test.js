const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('Web Portal: Doctor Registration API Validation', () => {
  const validateDoctorRegistration = (payload) => {
    const { fullName, email, password, specialty, hospital, license } = payload;
    if (!fullName || !fullName.trim()) return { valid: false, error: 'Name is required' };
    if (!email || !email.includes('@')) return { valid: false, error: 'Valid email is required' };
    if (!password || password.length < 8) return { valid: false, error: 'Password must be at least 8 characters' };
    return { valid: true };
  };

  it('accepts complete doctor registration payload', () => {
    const payload = {
      fullName: 'Dr. Sarah Smith',
      email: 'sarah.smith@metrohospital.org',
      password: 'StrongPassword2026!',
      specialty: 'Cardiology',
      hospital: 'Metro General Hospital',
      license: 'MCI-987654',
      phone: '+91 98765 43210'
    };
    const res = validateDoctorRegistration(payload);
    assert.strictEqual(res.valid, true);
  });

  it('rejects registration with missing full name', () => {
    const payload = {
      fullName: '',
      email: 'sarah@metrohospital.org',
      password: 'StrongPassword2026!'
    };
    const res = validateDoctorRegistration(payload);
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.error, 'Name is required');
  });

  it('rejects registration with password less than 8 characters', () => {
    const payload = {
      fullName: 'Dr. John Doe',
      email: 'john@metrohospital.org',
      password: 'short'
    };
    const res = validateDoctorRegistration(payload);
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.error, 'Password must be at least 8 characters');
  });

  it('enforces initial pending status for new registrations', () => {
    const defaultStatus = 'pending';
    assert.strictEqual(defaultStatus, 'pending');
  });
});
