import { File as FileGeneric, FileDoc, FilePdf } from '@phosphor-icons/react'
import { cn } from '@/lib/cn'
import styles from './FileIcon.module.css'

export function FileIcon({ mimeType, className }: { mimeType: string; className?: string }) {
  const isPdf = mimeType.includes('pdf')
  const isDoc = mimeType.includes('word') || mimeType.includes('document')
  const Glyph = isPdf ? FilePdf : isDoc ? FileDoc : FileGeneric

  return (
    <span className={cn(styles.icon, isPdf && styles.pdf, isDoc && styles.doc, className)} aria-hidden>
      <Glyph weight="fill" />
    </span>
  )
}
