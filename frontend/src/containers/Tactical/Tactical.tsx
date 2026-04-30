import { MissionTag } from 'components'
import { useMissions } from 'hooks'
import type { Mission } from 'models'
import { useCallback } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router'
import { MissionViewer } from './MissionViewer/MissionViewer'
import { tagPositions } from './tag-positions'

export const Tactical = () => {
  const { data: missions } = useMissions()
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
