import { Construction } from 'lucide-react'

export function DashboardPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-forest">
        <Construction size={24} />
      </span>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink">Em construção</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        O dashboard fica para depois. Por agora o foco é a área de pacientes.
      </p>
    </section>
  )
}
