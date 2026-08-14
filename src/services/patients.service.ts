import { supabase } from '@/lib/supabase/client'
import type {
  AlertTone,
  Patient,
  PatientStatus,
  SessionStatus,
} from '@/types/patient'

interface PatientRow {
  id: string
  full_name: string
  code: string
  birth_date: string
  phone: string | null
  email: string | null
  status: PatientStatus
  treatment_started_on: string | null
  sessions_done: number
  sessions_planned: number
  frequency: string | null
  therapist_name: string | null
  program_name: string | null
  program_progress: number
  complaint: string | null
  diagnosis: string | null
  current_eva: number
  last_visit_on: string | null
  ai_summary: string | null
  evolution_summary: string | null
  last_conducts: string | null
  next_session_plan: string | null
  photo_tone: string
}

interface GoalRow {
  id: string
  title: string
  is_done: boolean
  sort_order: number
}

interface FocusRow {
  id: string
  label: string
  is_active: boolean
  sort_order: number
}

interface PainRow {
  recorded_on: string
  eva: number
}

interface SessionRow {
  id: string
  scheduled_at: string | null
  session_type: string | null
  place: string | null
  status: SessionStatus
  notes: string | null
}

interface AlertRow {
  id: string
  message: string
  tone: AlertTone
}

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

function ageFrom(isoDate: string) {
  const birth = new Date(`${isoDate}T00:00:00`)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const month = today.getMonth() - birth.getMonth()
  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) age -= 1
  return age
}

function initialsFrom(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function formatDate(isoDate: string | null) {
  if (!isoDate) return '—'
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${isoDate}T00:00:00`))
}

function formatDateTime(iso: string | null) {
  if (!iso) return { dateLabel: '—', timeLabel: '—' }
  const date = new Date(iso)
  return {
    dateLabel: new Intl.DateTimeFormat('pt-BR').format(date),
    timeLabel: new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date),
  }
}

function mapSession(row: SessionRow): Patient['nextSession'] {
  const { dateLabel, timeLabel } = formatDateTime(row.scheduled_at)
  return {
    id: row.id,
    scheduledAt: row.scheduled_at,
    dateLabel,
    timeLabel,
    type: row.session_type ?? '—',
    place: row.place ?? '—',
    status: row.status,
    notes: row.notes,
  }
}

function mapPatient(
  row: PatientRow,
  extras: {
    goals?: GoalRow[]
    focus?: FocusRow[]
    pain?: PainRow[]
    sessions?: SessionRow[]
    alerts?: AlertRow[]
  } = {},
): Patient {
  const upcoming = (extras.sessions ?? [])
    .filter((session) => session.status === 'agendada' || session.status === 'confirmada')
    .sort((a, b) => (a.scheduled_at ?? '').localeCompare(b.scheduled_at ?? ''))[0]

  return {
    id: row.id,
    name: row.full_name,
    initials: initialsFrom(row.full_name),
    photoTone: row.photo_tone || 'bg-forest',
    status: row.status,
    code: row.code,
    age: ageFrom(row.birth_date),
    birthDate: formatDate(row.birth_date),
    phone: row.phone ?? '—',
    email: row.email ?? '—',
    startDate: formatDate(row.treatment_started_on),
    sessionsDone: row.sessions_done,
    sessionsTotal: row.sessions_planned,
    frequency: row.frequency ?? '—',
    therapist: row.therapist_name ?? '—',
    program: row.program_name ?? '—',
    programProgress: row.program_progress,
    complaint: row.complaint ?? '—',
    diagnosis: row.diagnosis ?? '—',
    eva: row.current_eva,
    lastVisit: formatDate(row.last_visit_on),
    aiSummary: row.ai_summary ?? '',
    evolutionSummary: row.evolution_summary ?? '',
    lastConducts: row.last_conducts ?? '',
    nextSessionPlan: row.next_session_plan ?? '',
    goals: (extras.goals ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((goal) => ({ id: goal.id, title: goal.title, isDone: goal.is_done })),
    focusAreas: (extras.focus ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((area) => ({ id: area.id, label: area.label, isActive: area.is_active })),
    painSeries: (extras.pain ?? [])
      .sort((a, b) => a.recorded_on.localeCompare(b.recorded_on))
      .map((log) => ({
        date: log.recorded_on,
        label: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(
          new Date(`${log.recorded_on}T00:00:00`),
        ),
        value: log.eva,
      })),
    alerts: (extras.alerts ?? []).map((alert) => ({
      id: alert.id,
      message: alert.message,
      tone: alert.tone,
    })),
    nextSession: upcoming ? mapSession(upcoming) : null,
  }
}

export async function listPatients(): Promise<Patient[]> {
  const { data, error } = await supabase
    .from('patients')
    .select(
      'id, full_name, code, birth_date, phone, email, status, treatment_started_on, sessions_done, sessions_planned, frequency, therapist_name, program_name, program_progress, complaint, diagnosis, current_eva, last_visit_on, ai_summary, evolution_summary, last_conducts, next_session_plan, photo_tone',
    )
    .order('full_name', { ascending: true })

  throwIfError(error)

  const rows = (data ?? []) as PatientRow[]
  if (rows.length === 0) return []

  const ids = rows.map((row) => row.id)
  const { data: sessions, error: sessionsError } = await supabase
    .from('patient_sessions')
    .select('id, patient_id, scheduled_at, session_type, place, status, notes')
    .in('patient_id', ids)

  throwIfError(sessionsError)

  const sessionsByPatient = new Map<string, SessionRow[]>()
  for (const session of (sessions ?? []) as Array<SessionRow & { patient_id: string }>) {
    const list = sessionsByPatient.get(session.patient_id) ?? []
    list.push(session)
    sessionsByPatient.set(session.patient_id, list)
  }

  return rows.map((row) => mapPatient(row, { sessions: sessionsByPatient.get(row.id) ?? [] }))
}

export async function getPatientById(id: string): Promise<Patient | null> {
  const { data, error } = await supabase
    .from('patients')
    .select(
      'id, full_name, code, birth_date, phone, email, status, treatment_started_on, sessions_done, sessions_planned, frequency, therapist_name, program_name, program_progress, complaint, diagnosis, current_eva, last_visit_on, ai_summary, evolution_summary, last_conducts, next_session_plan, photo_tone',
    )
    .eq('id', id)
    .maybeSingle()

  throwIfError(error)
  if (!data) return null

  const row = data as PatientRow

  const [goals, focus, pain, sessions, alerts] = await Promise.all([
    supabase.from('patient_goals').select('id, title, is_done, sort_order').eq('patient_id', id),
    supabase.from('patient_focus_areas').select('id, label, is_active, sort_order').eq('patient_id', id),
    supabase.from('patient_pain_logs').select('recorded_on, eva').eq('patient_id', id),
    supabase
      .from('patient_sessions')
      .select('id, scheduled_at, session_type, place, status, notes')
      .eq('patient_id', id),
    supabase.from('patient_alerts').select('id, message, tone').eq('patient_id', id).order('created_at', { ascending: false }),
  ])

  throwIfError(goals.error)
  throwIfError(focus.error)
  throwIfError(pain.error)
  throwIfError(sessions.error)
  throwIfError(alerts.error)

  return mapPatient(row, {
    goals: (goals.data ?? []) as GoalRow[],
    focus: (focus.data ?? []) as FocusRow[],
    pain: (pain.data ?? []) as PainRow[],
    sessions: (sessions.data ?? []) as SessionRow[],
    alerts: (alerts.data ?? []) as AlertRow[],
  })
}
