import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageLoader } from '@/components/ui/Spinner'
import { useAppStore } from '@/store/app-store'

const LoginPage = lazy(() => import('@/pages/LoginPage'))
const DocumentsPage = lazy(() => import('@/pages/DocumentsPage'))
const SearchPage = lazy(() => import('@/pages/SearchPage'))
const HistoryPage = lazy(() => import('@/pages/HistoryPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function RequireAuth() {
  const token = useAppStore((state) => state.token)
  if (!token) return <Navigate to="/login" replace />
  return <AppLayout />
}

function LoginGate() {
  const token = useAppStore((state) => state.token)
  if (token) return <Navigate to="/" replace />
  return <LoginPage />
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginGate />
      </Suspense>
    ),
  },
  {
    element: <RequireAuth />,
    children: [
      { index: true, element: <DocumentsPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
