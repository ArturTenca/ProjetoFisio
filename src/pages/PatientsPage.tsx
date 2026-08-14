import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { usePatients } from '@/hooks/usePatients'
import { statusLabels } from '@/types/patient'

export function PatientsPage() {
  const { data: patients = [], isLoading, isError } = usePatients()

  return (
    <section className="mx-auto max-w-6xl">
      <PageHeader
        title="Pacientes"
        description="Cadastros da clínica. Clique em um nome para abrir a ficha completa."
      />

      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center rounded-2xl border border-line bg-surface">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-forest border-t-transparent" />
        </div>
      ) : null}

      {isError ? (
        <article className="rounded-2xl border border-error/20 bg-error/5 px-6 py-8 text-sm text-error">
          Não foi possível carregar os pacientes. Confira se o script SQL já foi executado no Supabase.
        </article>
      ) : null}

      {!isLoading && !isError && patients.length === 0 ? (
        <article className="rounded-2xl border border-line bg-surface px-6 py-10 text-center text-sm text-muted">
          Nenhum paciente cadastrado ainda.
        </article>
      ) : null}

      {!isLoading && !isError && patients.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-canvas text-[11px] uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Paciente</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Programa</th>
                <th className="px-5 py-3 font-medium">Sessões</th>
                <th className="px-5 py-3 font-medium">Próxima</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-b border-line last:border-0 hover:bg-canvas/80">
                  <td className="px-5 py-3.5">
                    <Link to={`/pacientes/${patient.id}`} className="flex items-center gap-3">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white ${patient.photoTone}`}
                      >
                        {patient.initials}
                      </span>
                      <span>
                        <span className="block font-medium text-ink">{patient.name}</span>
                        <span className="block text-xs text-muted">{patient.code}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-forest">
                      {statusLabels[patient.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted">{patient.program}</td>
                  <td className="px-5 py-3.5 text-muted">
                    {patient.sessionsDone}/{patient.sessionsTotal}
                  </td>
                  <td className="px-5 py-3.5 text-muted">
                    {patient.nextSession
                      ? `${patient.nextSession.dateLabel} · ${patient.nextSession.timeLabel}`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}
