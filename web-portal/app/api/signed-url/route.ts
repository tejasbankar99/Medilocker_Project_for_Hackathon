import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createUserClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { fileUrl, patientId } = await req.json()

    if (!fileUrl || !patientId) {
      return NextResponse.json({ error: 'fileUrl and patientId are required.' }, { status: 400 })
    }

    // ── 1. Verify the requesting doctor is authenticated ────────────────────
    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authErr } = await supabaseUser.auth.getUser(token)
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    // ── 2. Verify the doctor has an active consent grant for this patient ───
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: grant, error: grantErr } = await supabaseAdmin
      .from('consent_grants')
      .select('id, scope, scope_value')
      .eq('doctor_id', user.id)
      .eq('patient_id', patientId)
      .eq('is_revoked', false)
      .gt('expires_at', new Date().toISOString())
      .limit(1)
      .single()

    if (grantErr || !grant) {
      return NextResponse.json({ error: 'No active consent grant for this patient.' }, { status: 403 })
    }

    // ── 3. Extract storage path from fileUrl ────────────────────────────────
    let storagePath = fileUrl
    if (fileUrl.startsWith('http')) {
      const url = new URL(fileUrl)
      const parts = url.pathname.split('/')
      const bucketIdx = parts.indexOf('medical-documents')
      if (bucketIdx !== -1) {
        storagePath = parts.slice(bucketIdx + 1).join('/')
      }
    }

    // ── 4. Generate signed URL using service role (bypasses storage RLS) ────
    const { data, error: signErr } = await supabaseAdmin.storage
      .from('medical-documents')
      .createSignedUrl(storagePath, 3600) // 1 hour

    if (signErr || !data?.signedUrl) {
      console.error('[signed-url] storage error:', signErr)
      return NextResponse.json({ error: 'Could not generate signed URL.' }, { status: 500 })
    }

    return NextResponse.json({ signedUrl: data.signedUrl })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[signed-url] unexpected error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
