import { Moon, Sun } from '@phosphor-icons/react'
import { IconButton } from '@/components/ui/IconButton'
import { useTheme } from '@/hooks/useTheme'

export function ThemeToggle() {
  const { resolved, toggle } = useTheme()
  const isDark = resolved === 'dark'

  return (
    <IconButton label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'} onClick={toggle}>
      {isDark ? <Sun weight="bold" /> : <Moon weight="bold" />}
    </IconButton>
  )
}
