import { useRef, useState, type FormEvent } from 'react'
import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import styles from './SearchBar.module.css'

export interface SearchBarProps {
  initialValue?: string
  onSearch: (query: string) => void
  autoFocus?: boolean
}

export function SearchBar({ initialValue = '', onSearch, autoFocus }: SearchBarProps) {
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSearch(value.trim())
  }

  return (
    <form className={styles.form} role="search" onSubmit={handleSubmit}>
      <div className={styles.field}>
        <MagnifyingGlass weight="bold" className={styles.leadingIcon} aria-hidden />
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder="Введите запрос, например: договор оплата"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-label="Поисковый запрос"
          autoFocus={autoFocus}
          enterKeyHint="search"
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            className={styles.clear}
            aria-label="Очистить запрос"
            onClick={() => {
              setValue('')
              inputRef.current?.focus()
            }}
          >
            <X weight="bold" />
          </button>
        )}
      </div>
      <Button type="submit" className={styles.submit} icon={<MagnifyingGlass weight="bold" />}>
        Найти
      </Button>
    </form>
  )
}
