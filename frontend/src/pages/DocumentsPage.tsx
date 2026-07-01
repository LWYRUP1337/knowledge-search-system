import { PageHeader } from '@/components/ui/PageHeader'
import { Dropzone } from '@/components/upload/Dropzone'
import { UploadQueue } from '@/components/upload/UploadQueue'
import { DocumentList } from '@/components/documents/DocumentList'
import { useUploadDocuments } from '@/hooks/useDocuments'
import styles from './page.module.css'

export default function DocumentsPage() {
  const upload = useUploadDocuments()

  return (
    <div className={styles.stack}>
      <PageHeader
        title="Документы"
        subtitle="Загружайте PDF и DOCX, отслеживайте индексацию и ищите по содержимому."
      />
      <Dropzone onFiles={upload} />
      <UploadQueue />
      <DocumentList />
    </div>
  )
}
