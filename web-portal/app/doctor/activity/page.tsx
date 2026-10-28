'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

interface AuditLog {
  id: string
  action: string
  target_type?: string
  patient_id?: string
  metadata?: Record<string, unknown>
  created_at: string
}

const ACTION_META: Record<string, { icon: string; label: string; color: string }> = {
  document_viewed:    { icon: '👁️',  label: 'Viewed Records',    color: '#4fc3f7' },
  consent_requested:  { icon: '📋',  label: 'Requested Access',  color: '#ffb74d' },
  consent_approved:   { icon: '✅',  label: 'Access Approved',   color: '#00c9a7' },
  consent_revoked:    { icon: '🚫',  label: 'Access Revoked',    color: '#ff6b6b' },
  document_uploaded:  { icon: '📤',  label: 'Document Uploaded', color: '#ce93d8' },
}

function getActionMeta(action: string) {
  return ACTION_META[action] ?? { icon: '📌', label: action.replace(/_/g, ' '), color: '#8ba0b8' }
}

export default function DoctorActivityPage() {
  const router = useRouter()
  const supabase = createClient()
  const [doctorName, setDoctorName] = useState('')
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('doctor_profiles').select('full_name').eq('user_id', user.id).single()
      setDoctorName(profile?.full_name || user.email!)

      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('actor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(200)

      setLogs(data || [])
      setLoading(false)
    }
    init()
  }, [])

  const filteredLogs = filter === 'all' ? logs : logs.filter(l => l.action === filter)
  const uniqueActions = ['all', ...Array.from(new Set(logs.map(l => l.action)))]

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--muted)' }}>Loading activity...</div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar role="doctor" userName={doctorName} />
      <main style={{ flex: 1, marginLeft: '240px', padding: '32px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px' }}>My Activity</h1>
          <p style={{ color: 'var(--muted)', margin: 0, fontSize: '14px' }}>Your complete audit trail of actions on the platform</p>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {uniqueActions.map(action => {
            const meta = action === 'all' ? { icon: '📋', label: 'All', color: 'var(--primary)' } : getActionMeta(action)
            const active = filter === action
            return (
              <button key={action} onClick={() => setFilter(action)} style={{
                background: active ? 'rgba(0,201,167,0.12)' : 'var(--card)',
                color: active ? 'var(--primary)' : 'var(--muted)',
                border: `1px solid ${active ? 'rgba(0,201,167,0.4)' : 'var(--border)'}`,
                borderRadius: '20px', padding: '6px 14px', fontSize: '12px',
                fontWeight: active ? 700 : 400, cursor: 'pointer', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}>
                <span>{meta.icon}</span> {meta.label}
              </button>
            )
          })}
        </div>

        {/* Log list */}
        {filteredLogs.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
            <div style={{ fontWeight: 600 }}>No activity found</div>
            <div style={{ fontSize: '13px', marginTop: '6px' }}>Actions you take on the platform will appear here.</div>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '15px' }}>Activity Log</span>
              <span style={{ color: 'var(--muted)', fontSize: '12px' }}>{filteredLogs.length} event{filteredLogs.length !== 1 ? 's' : ''}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredLogs.map((log, i) => {
                const meta = getActionMeta(log.action)
                const isLast = i === filteredLogs.length - 1
                return (
                  <div key={log.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '16px',
                    padding: '16px 20px',
                    borderBottom: isLast ? 'none' : '1px solid var(--border)',
                  }}>
                    {/* Icon */}
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                      background: `${meta.color}18`, border: `1px solid ${meta.color}33`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                    }}>
                      {meta.icon}
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px', color: meta.color }}>{meta.label}</span>
                        <span style={{ color: 'var(--muted)', fontSize: '12px', flexShrink: 0 }}>
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      {log.patient_id && (
                        <div style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '3px' }}>
                          Patient: <code style={{ color: 'var(--text)', fontSize: '11px' }}>#{log.patient_id.slice(0, 8)}</code>
                        </div>
                      )}
                      {log.target_type && (
                        <div style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '2px' }}>
                          Target: {log.target_type}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
