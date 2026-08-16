import { Link, Navigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Bell,
  Check,
  ClipboardList,
  Flag,
  Sparkles,
  Stethoscope,
  Target,
} from 'lucide-react'
import { PatientAvatar } from '@/components/ui/PatientAvatar'
import { usePatient } from '@/hooks/usePatients'
import { statusLabels, type PatientPainLog } from '@/types/patient'

function EvaChart({ series }: { series: PatientPainLog[] }) {
  if (series.length === 0) {
    return <p className="mt-4 text-sm text-muted">Sem registros de dor ainda.</p>
  }

  const width = 320
  const height = 140
  const max = 10
  const points = series.map((point, index) => {
    const x = series.length === 1 ? width / 2 : 16 + (index * (width - 32)) / (series.length - 1)
    const y = 16 + ((max - point.value) / max) * (height - 40)
    return { ...point, x, y }
  })
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full">
      <path d={path} fill="none" stroke="#3db86a" strokeWidth="2.5" strokeLinejoin="round" />
      {points.map((point) => (
        <g key={point.date}>
          <circle cx={point.x} cy={point.y} r="4" fill="#0e271c" />
          <text x={point.x} y={height - 4} textAnchor="middle" className="fill-muted text-[9px]">
            {point.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

function BodyFocus() {
  return (
    <svg viewBox="0 0 140 220" className="h-44 w-auto text-forest">
      <g fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="70" cy="18" r="12" />
        <path d="M70 30 v18" />
        <path d="M48 52 h44" />
        <path d="M48 52 v38" />
        <path d="M92 52 v38" />
        <rect x="54" y="48" width="32" height="58" rx="10" />
        <path d="M60 106 v70" />
        <path d="M80 106 v70" />
        <path d="M60 176 l-8 22" />
        <path d="M80 176 l8 22" />
      </g>
      <circle cx="80" cy="132" r="9" fill="#3db86a" fillOpacity="0.35" stroke="#3db86a" strokeWidth="2" />
      <circle cx="80" cy="108" r="7" fill="#3db86a" fillOpacity="0.25" stroke="#3db86a" />
    </svg>
  )
}

export function PatientPage() {
  const { id } = useParams()
  const { data: patient, isLoading, isError } = usePatient(id)

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-forest border-t-transparent" />
      </div>
    )
  }

  if (isError) {
    return (
      <article className="rounded-2xl border border-error/20 bg-error/5 px-6 py-8 text-sm text-error">
        Não foi possível carregar a ficha. Confira se o script SQL já foi executado no Supabase.
      </article>
    )
  }

  if (!patient) {
    return <Navigate to="/pacientes" replace />
  }

  const primaryGoal = patient.goals.find((goal) => !goal.isDone) ?? patient.goals[0]
  const next = patient.nextSession

  return (
    <section className="mx-auto max-w-7xl">
      <Link
        to="/pacientes"
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-forest"
      >
        <ArrowLeft size={16} />
        Voltar
      </Link>

      <div className="mt-5 flex min-w-0 items-start gap-4">
        <PatientAvatar name={patient.name} tone={patient.photoTone} initials={patient.initials} size="lg" />
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-ink">{patient.name}</h1>
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-forest">
              {statusLabels[patient.status]}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted">
            {patient.code} · {patient.age} anos · nasc. {patient.birthDate} · {patient.phone}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Início do tratamento', value: patient.startDate },
          { label: 'Total de sessões', value: `${patient.sessionsDone} / ${patient.sessionsTotal}` },
          { label: 'Frequência', value: patient.frequency },
        ].map((item) => (
          <article key={item.label} className="rounded-2xl border border-line bg-surface px-4 py-3">
            <p className="text-xs text-muted">{item.label}</p>
            <p className="mt-1 text-sm font-semibold text-ink">{item.value}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-1">
          <article className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Resumo IA</p>
              <Sparkles size={16} className="text-accent" />
            </div>
            <p className="mt-3 text-sm leading-6 text-ink/80">{patient.aiSummary || 'Sem resumo ainda.'}</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex gap-3">
                <Stethoscope size={16} className="mt-0.5 shrink-0 text-accent" />
                <span>
                  <span className="block text-xs text-muted">Diagnóstico</span>
                  {patient.diagnosis}
                </span>
              </li>
              <li className="flex gap-3">
                <ClipboardList size={16} className="mt-0.5 shrink-0 text-accent" />
                <span>
                  <span className="block text-xs text-muted">Evolução geral</span>
                  {patient.evolutionSummary || '—'}
                </span>
              </li>
              <li className="flex gap-3">
                <Target size={16} className="mt-0.5 shrink-0 text-accent" />
                <span>
                  <span className="block text-xs text-muted">Dor (EVA)</span>
                  {patient.eva}/10 na última sessão
                </span>
              </li>
              <li className="flex gap-3">
                <Flag size={16} className="mt-0.5 shrink-0 text-accent" />
                <span>
                  <span className="block text-xs text-muted">Objetivo</span>
                  {primaryGoal?.title ?? '—'}
                </span>
              </li>
            </ul>
          </article>

          <article className="rounded-2xl border border-line bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Programa atual</p>
            <h2 className="mt-2 text-sm font-semibold text-ink">{patient.program}</h2>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-canvas">
              <div className="h-full rounded-full bg-accent" style={{ width: `${patient.programProgress}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted">{patient.programProgress}% concluído</p>
          </article>
        </div>

        <div className="space-y-4 xl:col-span-1">
          <article className="rounded-2xl border border-line bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Última evolução</p>
            <p className="mt-3 text-xs text-muted">Queixa principal</p>
            <p className="text-sm text-ink">{patient.complaint}</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-forest">
                {patient.eva}/10
              </span>
              <span className="text-sm text-muted">EVA na sessão de {patient.lastVisit}</span>
            </div>
            <p className="mt-4 text-xs text-muted">Condutas realizadas</p>
            <p className="text-sm text-ink">{patient.lastConducts || '—'}</p>
            <p className="mt-4 text-xs text-muted">Próxima sessão</p>
            <p className="text-sm text-ink">{patient.nextSessionPlan || '—'}</p>
          </article>

          <article className="rounded-2xl border border-line bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Dor (EVA) — evolução</p>
            <EvaChart series={patient.painSeries} />
          </article>

          <article className="rounded-2xl border border-line bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Áreas de foco</p>
            <div className="mt-3 flex items-center gap-5">
              <BodyFocus />
              <ul className="space-y-2 text-sm">
                {patient.focusAreas.length === 0 ? (
                  <li className="text-muted">Sem áreas registradas.</li>
                ) : (
                  patient.focusAreas.map((area) => (
                    <li key={area.id} className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${area.isActive ? 'bg-accent' : 'bg-line'}`} />
                      {area.label}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </article>
        </div>

        <div className="space-y-4 xl:col-span-1">
          <article className="rounded-2xl border border-line bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Objetivos</p>
            <ul className="mt-4 space-y-3 text-sm">
              {patient.goals.length === 0 ? (
                <li className="text-muted">Sem objetivos cadastrados.</li>
              ) : (
                patient.goals.map((goal) => (
                  <li key={goal.id} className="flex items-start gap-3">
                    <span
                      className={[
                        'mt-0.5 flex h-5 w-5 items-center justify-center rounded-full',
                        goal.isDone ? 'bg-accent text-white' : 'border border-line text-transparent',
                      ].join(' ')}
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span className={goal.isDone ? 'text-muted line-through' : 'text-ink'}>{goal.title}</span>
                  </li>
                ))
              )}
            </ul>
          </article>

          <article className="rounded-2xl border border-line bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Alertas e lembretes</p>
            <ul className="mt-4 space-y-3 text-sm">
              {patient.alerts.length === 0 ? (
                <li className="text-muted">Nenhum alerta.</li>
              ) : (
                patient.alerts.map((alert) => (
                  <li key={alert.id} className="flex gap-3">
                    <Bell
                      size={16}
                      className={[
                        'mt-0.5',
                        alert.tone === 'warning'
                          ? 'text-amber-500'
                          : alert.tone === 'success'
                            ? 'text-accent'
                            : 'text-forest',
                      ].join(' ')}
                    />
                    <span>{alert.message}</span>
                  </li>
                ))
              )}
            </ul>
          </article>

          <article className="rounded-2xl border border-line bg-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Próxima sessão</p>
            {next ? (
              <>
                <p className="mt-3 text-lg font-semibold text-ink">
                  {next.dateLabel} · {next.timeLabel}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={[
                      'rounded-full px-2.5 py-1 text-xs font-medium',
                      next.status === 'confirmada'
                        ? 'bg-accent-soft text-forest'
                        : 'bg-amber-100 text-amber-800',
                    ].join(' ')}
                  >
                    {next.status === 'confirmada' ? 'Confirmado' : 'Pendente'}
                  </span>
                  <span className="text-xs text-muted">{next.type}</span>
                </div>
                <p className="mt-2 text-sm text-muted">{next.place}</p>
              </>
            ) : (
              <p className="mt-3 text-sm text-muted">{patient.nextSessionPlan || 'Nenhuma sessão agendada.'}</p>
            )}
          </article>
        </div>
      </div>
    </section>
  )
}
