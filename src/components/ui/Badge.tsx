const tones = {
  caramel: 'bg-accent-soft text-forest border-accent/20',
  success: 'bg-accent-soft text-success border-accent/20',
  error: 'bg-error/10 text-error border-error/20',
  muted: 'bg-canvas text-muted border-line',
  info: 'bg-accent-soft text-forest border-accent/20',
} as const

interface BadgeProps {
  children: React.ReactNode
  tone?: keyof typeof tones
}

export function Badge({ children, tone = 'muted' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
      ].join(' ')}
    >
      {children}
    </span>
  )
}
