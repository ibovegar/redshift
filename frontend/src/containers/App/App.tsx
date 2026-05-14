import { ErrorBoundary } from 'components'
import { Layout } from 'components/Layout/Layout'
import { useStation } from 'hooks'
import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'

const Tactical = lazy(() => import('containers/Tactical/Tactical').then((m) => ({ default: m.Tactical })))

export const App = () => {
  const { data: station } = useStation()

  return (
    <Layout authenticated storage={station.storage}>
      <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/tactical" replace />} />
            <Route path="/tactical" element={<Tactical />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Layout>
  )
}
