import { MissionTag } from 'components'
import { useMissions, useSpacecrafts } from 'hooks'
import type { Mission } from 'models'
import { useCallback } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router'
import { MissionViewer } from './MissionViewer/MissionViewer'

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

export const Tactical = () => {
  const { data: missions = [] } = useMissions()
  useSpacecrafts()
  const navigate = useNavigate()
  const location = useLocation()

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
