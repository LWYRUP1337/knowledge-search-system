import { Fragment, type ReactNode } from 'react'

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function tokenizeQuery(query: string): string[] {
  return Array.from(
    new Set(
      query
        .toLowerCase()
        .split(/[\s,.;:!?()"'«»-]+/u)
        .map((token) => token.trim())
        .filter((token) => token.length >= 2),
    ),
  )
}

export function highlight(text: string, query: string): ReactNode {
  const tokens = tokenizeQuery(query)
  if (tokens.length === 0) return text

  const pattern = new RegExp(`(${tokens.map(escapeRegExp).join('|')})`, 'giu')
  const tokenSet = new Set(tokens)
  const parts = text.split(pattern)

  return parts.map((part, index) => {
    if (part === '') return null
    if (tokenSet.has(part.toLowerCase())) {
      return (
        <mark className="hl" key={index}>
          {part}
        </mark>
      )
    }
    return <Fragment key={index}>{part}</Fragment>
  })
}
