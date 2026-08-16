import { initialsFromName, avatarColor } from '@/lib/avatar'

const sizes = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-10 w-10 text-xs',
  lg: 'h-16 w-16 text-lg',
} as const

interface PatientAvatarProps {
  name: string
  tone?: string | null
  initials?: string
  size?: keyof typeof sizes
  className?: string
}

export function PatientAvatar({
  name,
  tone,
  initials,
  size = 'md',
  className = '',
}: PatientAvatarProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${sizes[size]} ${className}`}
      style={{ backgroundColor: avatarColor(tone) }}
    >
      {initials || initialsFromName(name)}
    </span>
  )
}
