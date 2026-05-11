import { ErrorBoundary } from 'components'
import { Layout } from 'components/Layout/Layout'
import { useStation } from 'hooks'
import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'

const Tactical = lazy(() => import('containers/Tactical/Tactical').then((m) => ({ default: m.Tactical })))
const Marketplace = lazy(() => import('containers/Marketplace/Marketplace').then((m) => ({ default: m.Marketplace })))
const Inventory = lazy(() => import('containers/Inventory/Inventory').then((m) => ({ default: m.Inventory })))
const Engineering = lazy(() => import('containers/Engineering/Engineering').then((m) => ({ default: m.Engineering })))

export const App = () => {
  const { data: station } = useStation()

  return (
    <Layout authenticated storage={station.storage}>
      <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/tactical" replace />} />
            <Route path="/tactical" element={<Tactical />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/engineering/*" element={<Engineering />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Layout>
  )
}
