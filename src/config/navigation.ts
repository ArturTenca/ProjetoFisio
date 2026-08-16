import { CalendarDays, Home, LayoutDashboard, SquareKanban, Users, type LucideIcon } from 'lucide-react'

export interface NavigationItem {
  label: string
  path: string
  icon: LucideIcon
}

export const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', path: '/painel', icon: LayoutDashboard },
  { label: 'Pacientes', path: '/pacientes', icon: Users },
  { label: 'Agenda', path: '/agenda', icon: CalendarDays },
  { label: 'Quadro', path: '/quadro', icon: SquareKanban },
]

export const mobileNavItems: NavigationItem[] = [
  { label: 'Início', path: '/painel', icon: Home },
  { label: 'Pacientes', path: '/pacientes', icon: Users },
  { label: 'Agenda', path: '/agenda', icon: CalendarDays },
  { label: 'Quadro', path: '/quadro', icon: SquareKanban },
]
