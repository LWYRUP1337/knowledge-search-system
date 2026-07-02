import { NavLink } from 'react-router-dom'
import { ClockCounterClockwise, Files, MagnifyingGlass, SignOut } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { IconButton } from '@/components/ui/IconButton'
import { ThemeToggle } from './ThemeToggle'
import { useLogout } from '@/hooks/useAuth'
import { useAppStore } from '@/store/app-store'
import { cn } from '@/lib/cn'
import styles from './Header.module.css'

interface NavItem {
  to: string
  label: string
  Glyph: Icon
  end: boolean
}

const NAV: NavItem[] = [
  { to: '/', label: 'Документы', Glyph: Files, end: true },
  { to: '/search', label: 'Поиск', Glyph: MagnifyingGlass, end: false },
  { to: '/history', label: 'История', Glyph: ClockCounterClockwise, end: false },
]

export function Header() {
  const user = useAppStore((state) => state.user)
  const logout = useLogout()

  return (
    <>
      <header className={styles.header}>
        <div className={cn('container', styles.inner)}>
          <NavLink to="/" className={styles.brand} aria-label="Документный поиск, на главную">
            <span className={styles.brandMark} aria-hidden>
              <MagnifyingGlass weight="bold" />
            </span>
            <span className={styles.brandName}>
              Документный<span className={styles.brandAccent}>&nbsp;поиск</span>
            </span>
          </NavLink>

          <nav className={styles.nav} aria-label="Основная навигация">
            {NAV.map(({ to, label, Glyph, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => cn(styles.navLink, isActive && styles.active)}
              >
                <Glyph weight="bold" className={styles.navIcon} aria-hidden />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className={styles.actions}>
            {user && (
              <span className={styles.user} title={user.login}>
                {user.name}
              </span>
            )}
            <ThemeToggle />
            <IconButton label="Выйти" onClick={() => logout.mutate()} disabled={logout.isPending}>
              <SignOut weight="bold" />
            </IconButton>
          </div>
        </div>
      </header>

      <nav className={styles.bottomNav} aria-label="Нижняя навигация">
        {NAV.map(({ to, label, Glyph, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => cn(styles.bottomLink, isActive && styles.bottomActive)}
          >
            <Glyph weight="bold" className={styles.bottomIcon} aria-hidden />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
