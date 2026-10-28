# MediLocker Technical Architecture & Engineering Design

## 1. System Context & Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor Patient as 📱 Patient (Flutter App)
    actor Doctor as 🩺 Doctor (Next.js Portal)
    participant Edge as ⚡ Supabase Edge Functions
    participant DB as 🗄️ PostgreSQL + RLS
    participant AI as 🧠 Google Gemini Flash AI
    participant Store as 📦 Encrypted Storage

    Note over Doctor,Patient: 1. Consent Request Lifecycle
    Doctor->>DB: Submit Scoped Access Request (category, duration)
    DB-->>Patient: Realtime Notification (Pending Access)
    Patient->>Edge: Trigger 2FA OTP Request
    Edge-->>Patient: Deliver 6-Digit Verification Token
    Patient->>DB: Submit Approval + Verified OTP
    DB->>DB: Generate Active Record in consent_grants

    Note over Doctor,Store: 2. Zero-Trust Record Decryption
    Doctor->>DB: Query Authorized Medical Documents
    DB-->>Doctor: Return Metadata (RLS Filtered)
    Doctor->>Edge: Request Ephemeral Signed URL
    Edge->>Store: Verify Active Grant & Generate Signed Link
    Store-->>Doctor: Stream Decrypted Record File

    Note over Patient,AI: 3. AI Longitudinal Analysis
    Patient->>Store: Upload Lab Report (PDF/Image)
    Store->>Edge: Trigger analyze-document
    Edge->>AI: Send Extracted Biomarkers & Previous Trends
    AI-->>Edge: Structured Summary + Trend Delta
    Edge->>DB: Upsert into ai_insights Table
    DB-->>Patient: Realtime Insight Available
```

---

## 2. Entity-Relationship Model (PostgreSQL)

```mermaid
erDiagram
    user_roles ||--|| patient_profiles : "1 to 1"
    user_roles ||--|| doctor_profiles : "1 to 1"
    patient_profiles ||--o{ medical_documents : "owns"
    medical_documents ||--o{ ai_insights : "generates"
    doctor_profiles ||--o{ consent_requests : "initiates"
    patient_profiles ||--o{ consent_requests : "receives"
    consent_requests ||--o{ consent_grants : "materializes"
    consent_grants ||--o{ audit_logs : "tracks"
```

---

## 3. Engineering Quality Metrics

- **Modularity:** Separation of concerns across `Client UI`, `State Providers`, `Data Models`, `Edge Compute`, and `Database Policies`.
- **Database Indexing:** Indexed on `(user_id, category)`, `(doctor_id, status)`, `(patient_id, expires_at)`.
- **Zero-Trust Hardening:** Client applications possess no service role tokens; all authorization decisions resolve inside PostgreSQL Row-Level Security policies.
