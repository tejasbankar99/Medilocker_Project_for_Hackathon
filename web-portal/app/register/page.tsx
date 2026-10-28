'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'

const SPECIALTIES = ['General Physician', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'Dermatology', 'Ophthalmology', 'ENT', 'Psychiatry', 'Radiology', 'Oncology', 'Endocrinology', 'Gastroenterology', 'Pulmonology', 'Other']

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    specialty: '', hospital: '', license: '', phone: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/register-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName, email: form.email, password: form.password,
          specialty: form.specialty, hospital: form.hospital,
          license: form.license, phone: form.phone,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Registration failed.'); setLoading(false); return }
      setSuccess(true)
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '24px' }}>
        <div className="card" style={{ maxWidth: '440px', width: '100%', textAlign: 'center', padding: '48px 36px' }}>
          <div style={{ width: '72px', height: '72px', background: 'rgba(0,201,167,0.15)', border: '2px solid var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '32px' }}>✅</div>
          <h2 style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '20px', margin: '0 0 12px' }}>Registration Submitted!</h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6, margin: '0 0 28px' }}>
            Your account is <strong style={{ color: 'var(--text)' }}>pending admin review</strong>. You will be able to log in once an administrator approves your registration.
          </p>
          <a href="/login" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', padding: '12px 32px' }}>Back to Login</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '540px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, var(--primary), #00a589)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '26px' }}>🏥</div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)', margin: '0 0 6px' }}>Doctor Registration</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>Submit your details for admin approval</p>
        </div>

        <div className="card" style={{ padding: '28px' }}>

          {error && (
            <div role="alert" aria-live="assertive" style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px', color: 'var(--error)', fontSize: '13px', display: 'flex', gap: '8px' }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleRegister} aria-label="Doctor Registration Form">

            {/* Section: Personal */}
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.08em', margin: '0 0 12px', textTransform: 'uppercase' }}>Personal Information</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label htmlFor="reg-fullname" style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginBottom: '5px', letterSpacing: '0.04em' }}>FULL NAME *</label>
                <input id="reg-fullname" name="fullName" autoComplete="name" value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Dr. First Last" required aria-required="true" />
              </div>
              <div>
                <label htmlFor="reg-email" style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginBottom: '5px', letterSpacing: '0.04em' }}>EMAIL ADDRESS *</label>
                <input id="reg-email" name="email" type="email" autoComplete="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="doctor@hospital.com" required aria-required="true" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label htmlFor="reg-password" style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginBottom: '5px', letterSpacing: '0.04em' }}>PASSWORD *</label>
                  <input id="reg-password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 8 chars" required aria-required="true" />
                </div>
                <div>
                  <label htmlFor="reg-confirmPassword" style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginBottom: '5px', letterSpacing: '0.04em' }}>CONFIRM *</label>
                  <input id="reg-confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="Repeat password" required aria-required="true" />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'var(--border)', margin: '0 0 20px' }} />

            {/* Section: Professional */}
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.08em', margin: '0 0 12px', textTransform: 'uppercase' }}>Professional Details</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div>
                <label htmlFor="reg-specialty" style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginBottom: '5px', letterSpacing: '0.04em' }}>SPECIALTY</label>
                <select id="reg-specialty" name="specialty" value={form.specialty} onChange={e => set('specialty', e.target.value)} aria-label="Select your medical specialty">
                  <option value="">Select specialty...</option>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="reg-hospital" style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginBottom: '5px', letterSpacing: '0.04em' }}>HOSPITAL / CLINIC</label>
                <input id="reg-hospital" name="hospital" value={form.hospital} onChange={e => set('hospital', e.target.value)} placeholder="Name of hospital or clinic" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label htmlFor="reg-license" style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginBottom: '5px', letterSpacing: '0.04em' }}>LICENSE NO.</label>
                  <input id="reg-license" name="license" value={form.license} onChange={e => set('license', e.target.value)} placeholder="MCI-XXXXX" />
                </div>
                <div>
                  <label htmlFor="reg-phone" style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginBottom: '5px', letterSpacing: '0.04em' }}>PHONE</label>
                  <input id="reg-phone" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
                </div>
              </div>
            </div>

            {/* Notice */}
            <div role="status" style={{ background: 'rgba(255,183,77,0.06)', border: '1px solid rgba(255,183,77,0.2)', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px', display: 'flex', gap: '10px', fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>
              <span aria-hidden="true" style={{ flexShrink: 0 }}>🔔</span>
              Your registration will be reviewed by an admin. Once approved, you can log in and request access to patient records.
            </div>

            <button type="submit" className="btn-primary" disabled={loading} aria-busy={loading} style={{ width: '100%', justifyContent: 'center', fontSize: '15px', padding: '14px' }}>
              {loading ? '⏳ Submitting...' : '📋 Submit for Approval'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: 'var(--muted)', margin: '16px 0 0' }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign In →</a>
          </p>
        </div>
      </div>
    </div>
  )
}
