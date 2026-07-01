import { useNavigate } from 'react-router-dom'
import { Compass } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <EmptyState
      icon={<Compass weight="bold" />}
      title="Страница не найдена"
      description="Возможно, ссылка устарела или была введена неверно."
      action={<Button onClick={() => navigate('/')}>На главную</Button>}
    />
  )
}
