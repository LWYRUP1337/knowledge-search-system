import { useCallback, useRef } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { toast } from 'sonner'
import { FileDoc, FilePdf, UploadSimple } from '@phosphor-icons/react'
import { ACCEPTED_LABEL, ACCEPTED_MIME, MAX_FILE_SIZE } from '@/lib/constants'
import { formatBytes } from '@/lib/format'
import { cn } from '@/lib/cn'
import styles from './Dropzone.module.css'

export interface DropzoneProps {
  onFiles: (files: File[]) => void
}

export function Dropzone({ onFiles }: DropzoneProps) {
  const root = useRef<HTMLDivElement>(null)

  const onDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      if (rejections.length > 0) {
        const names = rejections.map((rejection) => rejection.file.name).join(', ')
        toast.error('Некоторые файлы отклонены', {
          description: `${names}. Допустимы только ${ACCEPTED_LABEL} размером до ${formatBytes(MAX_FILE_SIZE)}.`,
        })
      }
      if (accepted.length > 0) onFiles(accepted)
    },
    [onFiles],
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_MIME,
    multiple: true,
    maxSize: MAX_FILE_SIZE,
  })

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from(root.current, { y: 16, autoAlpha: 0, duration: 0.5, ease: 'power3.out' })
      })
    },
    { scope: root },
  )

  return (
    <div ref={root}>
      <div
        {...getRootProps({
          role: 'button',
          className: cn(styles.zone, isDragActive && styles.active, isDragReject && styles.reject),
          'aria-label': `Область загрузки. Перетащите файлы ${ACCEPTED_LABEL} или нажмите, чтобы выбрать.`,
        })}
      >
        <input {...getInputProps()} />

        <div className={styles.illustration} aria-hidden>
          <span className={cn(styles.fileBadge, styles.pdf)}>
            <FilePdf weight="fill" />
          </span>
          <span className={styles.uploadMark}>
            <UploadSimple weight="bold" />
          </span>
          <span className={cn(styles.fileBadge, styles.doc)}>
            <FileDoc weight="fill" />
          </span>
        </div>

        <h2 className={styles.title}>
          {isDragActive ? 'Отпустите файлы для загрузки' : 'Перетащите документы сюда'}
        </h2>
        <p className={styles.hint}>
          {ACCEPTED_LABEL} · до {formatBytes(MAX_FILE_SIZE)} · можно несколько файлов сразу
        </p>
        <span className={styles.cta}>
          <UploadSimple weight="bold" />
          Выбрать файлы
        </span>
      </div>
    </div>
  )
}
