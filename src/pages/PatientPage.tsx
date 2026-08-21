import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Check,
  ClipboardList,
  CreditCard,
  Dumbbell,
  FileText,
  Flag,
  Pencil,
  Sparkles,
  Stethoscope,
  Target,
} from 'lucide-react'
import { PatientAvatar } from '@/components/ui/PatientAvatar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { usePatient, useUpdatePatient } from '@/hooks/usePatients'
import {
  patientStatusOptions,
  updatePatientSchema,
  type UpdatePatientFormData,
} from '@/schemas/patient.schema'
import { statusLabels, type Patient, type PatientPainLog } from '@/types/patient'

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

function displayValue(value: string) {
  return value && value !== '—' ? value : '—'
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-ink">{displayValue(value)}</p>
    </div>
  )
}

const hubItems = [
  { label: 'Avaliações', detail: 'Em breve', icon: ClipboardList, soon: true },
  { label: 'Evoluções', detail: 'Em breve', icon: Stethoscope, soon: true },
  { label: 'Documentos', detail: 'Em breve', icon: FileText, soon: true },
  { label: 'Exercícios', detail: 'Em breve', icon: Dumbbell, soon: true },
  { label: 'Pagamentos', detail: 'Em breve', icon: CreditCard, soon: true },
  { label: 'Agendamentos', detail: 'Abrir agenda', icon: CalendarDays, soon: false, to: '/agenda' },
] as const

function EditPatientModal({
  open,
  patient,
  onClose,
}: {
  open: boolean
  patient: Patient
  onClose: () => void
}) {
  const update = useUpdatePatient()
  const form = useForm<UpdatePatientFormData>({
    resolver: zodResolver(updatePatientSchema),
    defaultValues: {
      fullName: patient.name,
      phone: patient.phone === '—' ? '' : patient.phone,
      email: patient.email === '—' ? '' : patient.email,
      birthDate: patient.birthDateRaw ?? '',
      profession: patient.profession === '—' ? '' : patient.profession,
      emergencyName: patient.emergencyName === '—' ? '' : patient.emergencyName,
      emergencyPhone: patient.emergencyPhone === '—' ? '' : patient.emergencyPhone,
      emergencyRelation: patient.emergencyRelation === '—' ? '' : patient.emergencyRelation,
      adminNotes: patient.adminNotes,
      referralSource: patient.referralSource === '—' ? '' : patient.referralSource,
      therapistName: patient.therapist === '—' ? '' : patient.therapist,
      status: patient.status,
      code: patient.code,
    },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      fullName: patient.name,
      phone: patient.phone === '—' ? '' : patient.phone,
      email: patient.email === '—' ? '' : patient.email,
      birthDate: patient.birthDateRaw ?? '',
      profession: patient.profession === '—' ? '' : patient.profession,
      emergencyName: patient.emergencyName === '—' ? '' : patient.emergencyName,
      emergencyPhone: patient.emergencyPhone === '—' ? '' : patient.emergencyPhone,
      emergencyRelation: patient.emergencyRelation === '—' ? '' : patient.emergencyRelation,
      adminNotes: patient.adminNotes,
      referralSource: patient.referralSource === '—' ? '' : patient.referralSource,
      therapistName: patient.therapist === '—' ? '' : patient.therapist,
      status: patient.status,
      code: patient.code,
    })
  }, [open, patient, form])

  function onSubmit(values: UpdatePatientFormData) {
    update.mutate(
      {
        id: patient.id,
        input: {
          fullName: values.fullName,
          phone: values.phone,
          email: values.email,
          birthDate: values.birthDate,
          profession: values.profession,
          emergencyName: values.emergencyName,
          emergencyPhone: values.emergencyPhone,
          emergencyRelation: values.emergencyRelation,
          adminNotes: values.adminNotes,
          referralSource: values.referralSource,
          therapistName: values.therapistName,
          status: values.status,
          code: values.code,
        },
      },
      { onSuccess: () => onClose() },
    )
  }

  return (
    <Modal
      open={open}
      wide
      title="Editar ficha"
      description="Complete os dados pessoais, contato, emergência e informações administrativas."
      onClose={onClose}
    >
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-accent">Dados pessoais</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome completo" error={form.formState.errors.fullName?.message} {...form.register('fullName')} />
            <Input label="Data de nascimento" type="date" error={form.formState.errors.birthDate?.message} {...form.register('birthDate')} />
            <Input label="Profissão" error={form.formState.errors.profession?.message} {...form.register('profession')} />
            <Input label="Código" error={form.formState.errors.code?.message} {...form.register('code')} />
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-accent">Contato</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Telefone" type="tel" error={form.formState.errors.phone?.message} {...form.register('phone')} />
            <Input label="E-mail" type="email" error={form.formState.errors.email?.message} {...form.register('email')} />
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-accent">Contato de emergência</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Nome" error={form.formState.errors.emergencyName?.message} {...form.register('emergencyName')} />
            <Input label="Telefone" type="tel" error={form.formState.errors.emergencyPhone?.message} {...form.register('emergencyPhone')} />
            <Input
              label="Parentesco"
              error={form.formState.errors.emergencyRelation?.message}
              {...form.register('emergencyRelation')}
            />
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-accent">Administrativo</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Status"
              options={patientStatusOptions}
              error={form.formState.errors.status?.message}
              {...form.register('status')}
            />
            <Input
              label="Fisioterapeuta"
              error={form.formState.errors.therapistName?.message}
              {...form.register('therapistName')}
            />
            <Input
              label="Origem / indicação"
              error={form.formState.errors.referralSource?.message}
              {...form.register('referralSource')}
            />
            <div className="sm:col-span-2">
              <Textarea
                label="Observações administrativas"
                error={form.formState.errors.adminNotes?.message}
                {...form.register('adminNotes')}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={update.isPending}>
            Salvar ficha
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export function PatientPage() {
  const { id } = useParams()
  const { data: patient, isLoading, isError } = usePatient(id)
  const [editOpen, setEditOpen] = useState(false)

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
        Não foi possível carregar a ficha. Execute o script supabase/patients-req01.sql no Supabase se ainda não rodou.
      </article>
    )
  }

  if (!patient) {
    return <Navigate to="/pacientes" replace />
  }

  const primaryGoal = patient.goals.find((goal) => !goal.isDone) ?? patient.goals[0]
  const next = patient.nextSession
  const ageLabel = patient.age != null ? `${patient.age} anos` : 'Idade —'

  return (
    <section className="mx-auto max-w-7xl">
      <div className="dash-in flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/pacientes"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-forest"
        >
          <ArrowLeft size={16} />
          Voltar
        </Link>
        <Button variant="secondary" onClick={() => setEditOpen(true)}>
          <Pencil size={16} />
          Editar ficha
        </Button>
      </div>

      <div className="dash-in mt-5 flex min-w-0 items-start gap-4" style={{ animationDelay: '60ms' }}>
        <PatientAvatar name={patient.name} tone={patient.photoTone} initials={patient.initials} size="lg" />
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-ink">{patient.name}</h1>
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-forest">
              {statusLabels[patient.status]}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted">
            {patient.code} · {ageLabel} · nasc. {patient.birthDate} · {patient.phone}
          </p>
        </div>
      </div>

      <div className="dash-in mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" style={{ animationDelay: '100ms' }}>
        <article className="rounded-2xl border border-line bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Pessoais</p>
          <div className="mt-3 space-y-3">
            <Field label="Profissão" value={patient.profession} />
            <Field label="E-mail" value={patient.email} />
          </div>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Emergência</p>
          <div className="mt-3 space-y-3">
            <Field label="Nome" value={patient.emergencyName} />
            <Field label="Telefone" value={patient.emergencyPhone} />
            <Field label="Parentesco" value={patient.emergencyRelation} />
          </div>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Administrativo</p>
          <div className="mt-3 space-y-3">
            <Field label="Fisioterapeuta" value={patient.therapist} />
            <Field label="Origem" value={patient.referralSource} />
          </div>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Tratamento</p>
          <div className="mt-3 space-y-3">
            <Field label="Início" value={patient.startDate} />
            <Field label="Sessões" value={`${patient.sessionsDone} / ${patient.sessionsTotal}`} />
            <Field label="Frequência" value={patient.frequency} />
          </div>
        </article>
      </div>

      {patient.adminNotes ? (
        <article className="dash-in mt-4 rounded-2xl border border-line bg-surface p-4" style={{ animationDelay: '140ms' }}>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Observações administrativas</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink">{patient.adminNotes}</p>
        </article>
      ) : null}

      <div className="dash-in mt-4" style={{ animationDelay: '160ms' }}>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Registros vinculados</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {hubItems.map((item) => {
            const Icon = item.icon
            const className =
              'dash-card flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 text-left'
            const body = (
              <>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-forest">
                  <Icon size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">{item.label}</span>
                  <span className="block text-xs text-muted">{item.detail}</span>
                </span>
              </>
            )
            if ('to' in item && item.to) {
              return (
                <Link key={item.label} to={item.to} className={className}>
                  {body}
                </Link>
              )
            }
            return (
              <div key={item.label} className={`${className} opacity-80`}>
                {body}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-1">
          <article className="dash-in rounded-2xl border border-line bg-surface p-5" style={{ animationDelay: '200ms' }}>
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

          <article className="dash-in rounded-2xl border border-line bg-surface p-5" style={{ animationDelay: '240ms' }}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Programa atual</p>
            <h2 className="mt-2 text-sm font-semibold text-ink">{patient.program}</h2>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-canvas">
              <div className="h-full rounded-full bg-accent" style={{ width: `${patient.programProgress}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted">{patient.programProgress}% concluído</p>
          </article>
        </div>

        <div className="space-y-4 xl:col-span-1">
          <article className="dash-in rounded-2xl border border-line bg-surface p-5" style={{ animationDelay: '280ms' }}>
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

          <article className="dash-in rounded-2xl border border-line bg-surface p-5" style={{ animationDelay: '320ms' }}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Dor (EVA) — evolução</p>
            <EvaChart series={patient.painSeries} />
          </article>

          <article className="dash-in rounded-2xl border border-line bg-surface p-5" style={{ animationDelay: '360ms' }}>
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
          <article className="dash-in rounded-2xl border border-line bg-surface p-5" style={{ animationDelay: '400ms' }}>
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

          <article className="dash-in rounded-2xl border border-line bg-surface p-5" style={{ animationDelay: '440ms' }}>
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

          <article className="dash-in rounded-2xl border border-line bg-surface p-5" style={{ animationDelay: '480ms' }}>
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

      <EditPatientModal open={editOpen} patient={patient} onClose={() => setEditOpen(false)} />
    </section>
  )
}
