import { ErrorBoundary } from 'components'
import { Layout } from 'components/Layout/Layout'
import { Engineering, Inventory, Marketplace, Tactical } from 'containers'
import { useUser } from 'hooks'
import { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'

export const App = () => {
  const { data: user } = useUser()

  return (
    <Layout authenticated credits={user.credits}>
      <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/tactical" replace />} />
            <Route path="/tactical/*" element={<Tactical />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/engineering/*" element={<Engineering />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Layout>
  )
}
