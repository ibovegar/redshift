import { MissionTag } from 'components/ui'
import type { Mission, Spacecraft } from 'models'
import { useCallback, useEffect } from 'react'
import { connect } from 'react-redux'
import { Route, Routes, useLocation, useNavigate } from 'react-router'
import type { AppState } from 'store'
import { getAllMissions, loadMissions } from 'store/missions'
import { getAllspacecrafts, loadSpacecrafts } from 'store/spacecrafts'
import MissionViewer from './MissionViewer/MissionViewer'

const tagPositions: { x: number; y: number }[] = [
  {
    x: 5,
    y: 20
  },
  {
    x: 32,
    y: 35
  },
  {
    x: 26,
    y: 65
  },
  {
    x: 70,
    y: 30
  },
  {
    x: 100,
    y: 100
  }
]

interface Props {
  isLoading: boolean
  spacecrafts: Spacecraft[]
  missions: Mission[]
  loadSpacecrafts: () => void
  loadMissions: () => void
}

const Tactical = (props: Props) => {
  const { missions, loadSpacecrafts, loadMissions } = props
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    loadSpacecrafts()
    loadMissions()
  }, [loadSpacecrafts, loadMissions])

  const handleSelectMission = useCallback(
    (missionId: string) => {
      navigate(missionId)
    },
    [navigate]
  )

  const isWatchingMission = location.pathname !== '/tactical'

  return (
    <>
      {missions.map((mission: Mission, index: number) => (
        <MissionTag
          key={mission.id}
          mission={mission}
          position={tagPositions[index]}
          disabled={isWatchingMission || mission.completed}
          onSelect={() => handleSelectMission(mission.id)}
        />
      ))}
      <Routes>
        <Route path=":missionId" element={<MissionViewer />} />
      </Routes>
    </>
  )
}

const mapStateToProps = (state: AppState) => ({
  isLoading: state.spacecrafts.isLoading,
  spacecrafts: getAllspacecrafts(state),
  missions: getAllMissions(state)
})

const mapDispatchToProps = {
  loadSpacecrafts,
  loadMissions
}

export default connect(mapStateToProps, mapDispatchToProps)(Tactical)
