import { useRef, useState, type FormEvent } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { CheckCircle, Lock, MagnifyingGlass, User } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { useLogin } from '@/hooks/useAuth'
import { ApiError } from '@/api/client'
import styles from './LoginPage.module.css'

const FEATURES = [
  'Загрузка PDF и DOCX перетаскиванием',
  'Полнотекстовый поиск с ранжированием',
  'Подсветка совпадений и история запросов',
]

export default function LoginPage() {
  const [login, setLogin] = useState('demo')
  const [password, setPassword] = useState('demo')
  const loginMutation = useLogin()
  const root = useRef<HTMLDivElement>(null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!login.trim() || !password.trim()) return
    loginMutation.mutate({ login: login.trim(), password })
  }

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-reveal]', {
          y: 18,
          autoAlpha: 0,
          duration: 0.5,
          ease: 'power3.out',
          stagger: 0.08,
        })
      })
    },
    { scope: root },
  )

  const errorMessage = loginMutation.isError
    ? loginMutation.error instanceof ApiError
      ? loginMutation.error.message
      : 'Не удалось войти. Попробуйте ещё раз.'
    : null

  return (
    <div className={styles.screen} ref={root}>
      <div className={styles.themeToggle}>
        <ThemeToggle />
      </div>

      <div className={styles.layout}>
        <aside className={styles.panel}>
          <div className={styles.brand}>
            <span className={styles.brandMark}>
              <MagnifyingGlass weight="bold" />
            </span>
            Документный поиск
          </div>
          <h2 className={styles.panelTitle}>Находите нужное в документах за секунды</h2>
          <ul className={styles.features}>
            {FEATURES.map((feature) => (
              <li key={feature}>
                <CheckCircle weight="fill" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </aside>

        <div className={styles.formCard}>
          <div className={styles.formHead} data-reveal>
            <span className={styles.mobileBrand} aria-hidden>
              <MagnifyingGlass weight="bold" />
            </span>
            <h1 className={styles.title}>Вход в систему</h1>
            <p className={styles.subtitle}>Введите логин и пароль, чтобы продолжить.</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.group} data-reveal>
              <label className={styles.label} htmlFor="login">
                Логин
              </label>
              <div className={styles.inputWrap}>
                <User weight="bold" className={styles.inputIcon} aria-hidden />
                <input
                  id="login"
                  className={styles.input}
                  value={login}
                  onChange={(event) => setLogin(event.target.value)}
                  autoComplete="username"
                  placeholder="demo"
                />
              </div>
            </div>

            <div className={styles.group} data-reveal>
              <label className={styles.label} htmlFor="password">
                Пароль
              </label>
              <div className={styles.inputWrap}>
                <Lock weight="bold" className={styles.inputIcon} aria-hidden />
                <input
                  id="password"
                  type="password"
                  className={styles.input}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••"
                />
              </div>
            </div>

            {errorMessage && (
              <p className={styles.error} role="alert">
                {errorMessage}
              </p>
            )}

            <Button type="submit" fullWidth loading={loginMutation.isPending} data-reveal>
              Войти
            </Button>
          </form>

          <p className={styles.hint} data-reveal>
            Демо-режим: подойдут любые логин и пароль.
          </p>
        </div>
      </div>
    </div>
  )
}
