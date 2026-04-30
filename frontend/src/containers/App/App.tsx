import Layout from 'components/Layout/Layout'
import { Engineering, Inventory, Marketplace, Tactical } from 'containers'
import { useEffect } from 'react'
import { connect } from 'react-redux'
import { Navigate, Route, Routes } from 'react-router'
import type { AppState } from 'store'
import { loadUserStats } from 'store/user'

interface Props {
  credits: number
  loadUserStats: () => void
}

const App = (props: Props) => {
  const { credits, loadUserStats } = props

  useEffect(() => {
    loadUserStats()
  }, [loadUserStats])

  return (
    <Layout authenticated credits={credits}>
      <Routes>
        <Route path="/" element={<Navigate to="/tactical" replace />} />
        <Route path="/tactical/*" element={<Tactical />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/engineering/*" element={<Engineering />} />
      </Routes>
    </Layout>
  )
}

const mapStateToProps = (state: AppState) => ({
  credits: state.user.credits
})

const mapDispatchToProps = {
  loadUserStats
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
