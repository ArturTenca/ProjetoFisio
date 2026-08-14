import { Link } from 'react-router-dom'

const sizeMap = {
  sm: {
    mark: 'h-10 w-10 text-lg',
    title: 'text-lg leading-none',
    tagline: 'text-[9px] tracking-[0.16em]',
  },
  md: {
    mark: 'h-12 w-12 text-xl',
    title: 'text-2xl leading-none',
    tagline: 'text-[10px] tracking-[0.18em]',
  },
  lg: {
    mark: 'h-16 w-16 text-3xl',
    title: 'text-4xl leading-none sm:text-5xl',
    tagline: 'text-xs tracking-[0.22em]',
  },
} as const

interface BrandWordmarkProps {
  size?: keyof typeof sizeMap
  variant?: 'onDark' | 'onLight'
  asLink?: boolean
  to?: string
  className?: string
  showTagline?: boolean
  onClick?: () => void
}

export function BrandWordmark({
  size = 'md',
  variant = 'onDark',
  asLink = false,
  to = '/',
  className = '',
  showTagline = true,
  onClick,
}: BrandWordmarkProps) {
  const scale = sizeMap[size]
  const onDark = variant === 'onDark'

  const content = (
    <span className={['inline-flex items-center gap-3', className].filter(Boolean).join(' ')}>
      <span
        className={[
          'inline-flex shrink-0 items-center justify-center rounded-2xl font-display font-semibold',
          scale.mark,
          onDark ? 'bg-white/10 text-white' : 'bg-forest text-white',
        ].join(' ')}
        aria-hidden
      >
        F
      </span>
      <span className="flex min-w-0 flex-col">
        <span
          className={[
            'font-display font-semibold tracking-tight',
            scale.title,
            onDark ? 'text-white' : 'text-forest',
          ].join(' ')}
        >
          Fisio
        </span>
        {showTagline ? (
          <span
            className={[
              'mt-1 font-sans font-medium uppercase',
              scale.tagline,
              onDark ? 'text-white/55' : 'text-muted',
            ].join(' ')}
          >
            Fisioterapia
          </span>
        ) : null}
      </span>
    </span>
  )

  if (asLink) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className="inline-flex transition-opacity hover:opacity-90"
        aria-label="Fisio"
      >
        {content}
      </Link>
    )
  }

  return content
}
