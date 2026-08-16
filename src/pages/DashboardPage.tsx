import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react'

const stats = [
  { label: 'Pacientes ativos', value: 12, display: '12', delta: '+8%', up: true, to: '/pacientes' },
  { label: 'Sessões no mês', value: 36, display: '36', delta: '+12%', up: true, to: '/agenda' },
  { label: 'Novas avaliações', value: 4, display: '4', delta: '-1', up: false, to: '/pacientes' },
]

const activity = [
  { day: 'Seg', value: 6 },
  { day: 'Ter', value: 9 },
  { day: 'Qua', value: 5 },
  { day: 'Qui', value: 11 },
  { day: 'Sex', value: 8 },
  { day: 'Sáb', value: 4 },
  { day: 'Dom', value: 2 },
]

const upcoming = [
  { initials: 'JS', name: 'João Silva', detail: 'Joelho · 09:30', progress: '60%', tone: '#0e271c' },
  { initials: 'MC', name: 'Maria Costa', detail: 'Lombar · 14:00', progress: '45%', tone: '#1a3d2c' },
  { initials: 'PA', name: 'Pedro Alves', detail: 'Ombro · 11:00', progress: '8%', tone: '#1f4a36' },
]

const areas = [
  { name: 'Ortopedia', detail: '7 pacientes', change: '+18%' },
  { name: 'Esportiva', detail: '3 pacientes', change: '+9%' },
  { name: 'Neurológica', detail: '1 paciente', change: '-3%' },
  { name: 'Pilates', detail: '4 pacientes', change: '+5%' },
]

function useCountUp(target: number) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setValue(target)
      return
    }
    const start = performance.now()
    const duration = 900
    let frame = 0
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      setValue(Math.round(target * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target])

  return value
}

function StatCard({
  label,
  target,
  delta,
  up,
  to,
  delay,
}: {
  label: string
  target: number
  delta: string
  up: boolean
  to: string
  delay: string
}) {
  const value = useCountUp(target)

  return (
    <Link
      to={to}
      className="dash-card dash-in flex min-h-[148px] flex-col justify-between rounded-[1.5rem] bg-accent-soft p-5"
      style={{ animationDelay: delay }}
    >
      <p className="text-sm font-medium text-forest">{label}</p>
      <div className="flex items-end justify-between gap-3">
        <p className="font-display text-5xl font-semibold leading-none text-ink">{value}</p>
        <span
          className={[
            'mb-1 inline-flex items-center gap-0.5 text-xs font-medium',
            up ? 'text-accent' : 'text-error',
          ].join(' ')}
        >
          {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {delta}
        </span>
      </div>
    </Link>
  )
}

function ActivityChart() {
  const [hover, setHover] = useState<number | null>(null)
  const width = 560
  const height = 220
  const pad = { l: 28, r: 16, t: 36, b: 36 }
  const max = 12
  const innerW = width - pad.l - pad.r
  const innerH = height - pad.t - pad.b
  const points = activity.map((item, index) => {
    const x = pad.l + (index * innerW) / (activity.length - 1)
    const y = pad.t + innerH - (item.value / max) * innerH
    return { ...item, x, y }
  })
  const first = points[0]
  const last = points[points.length - 1]
  if (!first || !last) return null
  const line = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const area = `${line} L ${last.x} ${pad.t + innerH} L ${first.x} ${pad.t + innerH} Z`
  const hovered = hover === null ? undefined : points[hover]
  const active = hovered ?? points.reduce((best, point) => (point.value > best.value ? point : best), first)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="dash-chart h-56 w-full">
      {[0, 4, 8, 12].map((tick) => {
        const y = pad.t + innerH - (tick / max) * innerH
        return (
          <g key={tick}>
            <line x1={pad.l} x2={width - pad.r} y1={y} y2={y} stroke="#e2ebe6" strokeWidth="1" />
            <text x={4} y={y + 4} className="fill-muted text-[10px]">
              {tick}
            </text>
          </g>
        )
      })}
      <path d={area} fill="#3db86a" fillOpacity="0.08" />
      <path
        className="dash-line"
        d={line}
        fill="none"
        stroke="#3db86a"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {points.map((point, index) => (
        <g key={point.day} onMouseEnter={() => setHover(index)} onMouseLeave={() => setHover(null)} className="cursor-pointer">
          <circle cx={point.x} cy={point.y} r="14" fill="transparent" />
          <circle
            cx={point.x}
            cy={point.y}
            r={active === point ? 6 : 3.5}
            fill={active === point ? '#0e271c' : '#3db86a'}
            className="transition-all duration-200"
          />
          <text x={point.x} y={height - 10} textAnchor="middle" className="fill-muted text-[11px]">
            {point.day}
          </text>
        </g>
      ))}
      <g>
        <rect x={Math.min(active.x - 52, width - 120)} y={active.y - 40} width="104" height="28" rx="10" fill="#0e271c" />
        <text
          x={Math.min(active.x, width - 68)}
          y={active.y - 22}
          textAnchor="middle"
          className="fill-white text-[10px] font-medium"
        >
          {active.value} sessões
        </text>
      </g>
    </svg>
  )
}

export function DashboardPage() {
  return (
    <section className="mx-auto max-w-7xl">
      <div className="mb-8 dash-in">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Dashboard</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            target={stat.value}
            delta={stat.delta}
            up={stat.up}
            to={stat.to}
            delay={`${index * 80}ms`}
          />
        ))}

        <article
          className="dash-card dash-in flex min-h-[148px] flex-col justify-between rounded-[1.5rem] bg-accent-soft p-5"
          style={{ animationDelay: '240ms' }}
        >
          <div>
            <p className="text-sm font-medium text-forest">Hoje na clínica</p>
            <p className="mt-1 text-xs text-forest/70">8 sessões confirmadas</p>
          </div>
          <div className="flex items-end justify-between">
            <svg viewBox="0 0 88 88" className="dash-ring h-16 w-16">
              <circle cx="44" cy="44" r="34" fill="none" stroke="#0e271c" strokeOpacity="0.12" strokeWidth="8" />
              <circle
                className="dash-ring-arc"
                cx="44"
                cy="44"
                r="34"
                fill="none"
                stroke="#3db86a"
                strokeWidth="8"
                strokeDasharray="160 214"
                strokeLinecap="round"
                transform="rotate(-90 44 44)"
              />
              <circle
                className="dash-ring-arc"
                cx="44"
                cy="44"
                r="22"
                fill="none"
                stroke="#0e271c"
                strokeWidth="6"
                strokeDasharray="80 138"
                strokeLinecap="round"
                transform="rotate(20 44 44)"
              />
            </svg>
            <Link
              to="/agenda"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-forest text-[11px] font-bold tracking-wide text-white transition hover:scale-105 hover:bg-forest-mid active:scale-95"
            >
              VER
            </Link>
          </div>
        </article>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <article className="dash-in rounded-[1.5rem] border border-line bg-surface p-5" style={{ animationDelay: '280ms' }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-ink">Atividade</h2>
              <p className="mt-1 text-xs text-muted">Sessões da semana · passe o mouse nos pontos</p>
            </div>
            <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">10–16 ago</span>
          </div>
          <ActivityChart />
        </article>

        <article className="dash-in rounded-[1.5rem] border border-line bg-surface p-5" style={{ animationDelay: '360ms' }}>
          <h2 className="text-lg font-semibold text-ink">Próximas sessões</h2>
          <ul className="mt-5 space-y-4">
            {upcoming.map((item) => (
              <li key={item.name}>
                <Link
                  to="/agenda"
                  className="flex items-center gap-3 rounded-2xl p-1 transition hover:bg-canvas"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: item.tone }}
                  >
                    {item.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                    <p className="truncate text-xs text-muted">{item.detail}</p>
                  </div>
                  <span className="text-sm font-medium text-forest">{item.progress}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/pacientes" className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-forest">
            Ver pacientes
            <ArrowRight size={14} />
          </Link>
        </article>
      </div>

      <article className="dash-in mt-4 rounded-[1.5rem] bg-accent-soft p-5 sm:p-6" style={{ animationDelay: '420ms' }}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="lg:w-48 lg:shrink-0">
            <h2 className="text-lg font-semibold text-forest">Especialidades</h2>
            <p className="mt-1 text-xs leading-5 text-forest/70">Distribuição dos pacientes em atendimento nesta semana.</p>
          </div>
          <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {areas.map((area) => (
              <div key={area.name} className="dash-card rounded-2xl bg-surface px-4 py-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-forest">
                  {area.name.slice(0, 1)}
                </span>
                <p className="mt-4 text-sm font-medium text-ink">{area.name}</p>
                <p className="text-xs text-muted">{area.detail}</p>
                <p className="mt-3 text-lg font-semibold text-forest">{area.change}</p>
              </div>
            ))}
            <Link
              to="/pacientes"
              className="dash-card flex min-h-36 flex-col justify-between rounded-2xl bg-forest px-4 py-4 text-white"
            >
              <p className="text-sm font-medium">Ver fichas</p>
              <span className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-white text-forest">
                <ArrowRight size={16} />
              </span>
            </Link>
          </div>
        </div>
      </article>
    </section>
  )
}
