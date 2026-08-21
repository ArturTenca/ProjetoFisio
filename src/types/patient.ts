export type PatientStatus = 'em_tratamento' | 'avaliacao' | 'alta' | 'inativo'
export type SessionStatus = 'agendada' | 'confirmada' | 'realizada' | 'cancelada' | 'faltou'
export type AlertTone = 'info' | 'warning' | 'success'

export const statusLabels: Record<PatientStatus, string> = {
  em_tratamento: 'Em tratamento',
  avaliacao: 'Avaliação',
  alta: 'Alta',
  inativo: 'Inativo',
}

export interface PatientGoal {
  id: string
  title: string
  isDone: boolean
}

export interface PatientFocusArea {
  id: string
  label: string
  isActive: boolean
}

export interface PatientPainLog {
  date: string
  label: string
  value: number
}

export interface PatientSession {
  id: string
  scheduledAt: string | null
  dateLabel: string
  timeLabel: string
  type: string
  place: string
  status: SessionStatus
  notes: string | null
}

export interface PatientAlert {
  id: string
  message: string
  tone: AlertTone
}

/** Lista enxuta — sem histórico clínico completo (LGPD + performance). */
export interface PatientListItem {
  id: string
  name: string
  initials: string
  photoTone: string
  status: PatientStatus
  code: string
  phone: string
  program: string
  sessionsDone: number
  sessionsTotal: number
  nextSession: PatientSession | null
}

export interface Patient {
  id: string
  name: string
  initials: string
  photoTone: string
  status: PatientStatus
  code: string
  age: number | null
  birthDate: string
  birthDateRaw: string | null
  phone: string
  email: string
  profession: string
  emergencyName: string
  emergencyPhone: string
  emergencyRelation: string
  adminNotes: string
  referralSource: string
  startDate: string
  sessionsDone: number
  sessionsTotal: number
  frequency: string
  therapist: string
  program: string
  programProgress: number
  complaint: string
  diagnosis: string
  eva: number
  lastVisit: string
  aiSummary: string
  evolutionSummary: string
  lastConducts: string
  nextSessionPlan: string
  goals: PatientGoal[]
  focusAreas: PatientFocusArea[]
  painSeries: PatientPainLog[]
  alerts: PatientAlert[]
  nextSession: PatientSession | null
}

export interface CreatePatientInput {
  fullName: string
  phone?: string
  email?: string
  birthDate?: string
  profession?: string
  emergencyName?: string
  emergencyPhone?: string
  emergencyRelation?: string
  adminNotes?: string
  referralSource?: string
  therapistName?: string
}

export interface UpdatePatientInput extends CreatePatientInput {
  status?: PatientStatus
  code?: string
}
