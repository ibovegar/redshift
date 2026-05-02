import { MissionTag } from 'components'
import { useMissions } from 'hooks'
import type { Mission } from 'models'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ExpandModal } from '../../components/ExpandModal/ExpandModal'
import { useCardExpandAnimation } from '../../hooks/useCardExpandAnimation'
import { MissionViewer } from './MissionViewer/MissionViewer'
import { tagPositions } from './tag-positions'

export const Tactical = () => {
  const { data: missions } = useMissions()
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const originElementRef = useRef<HTMLElement | null>(null)

  const animation = useCardExpandAnimation(() => {
    setSelectedMission(null)
  })

  const hasOpenedRef = useRef(false)

  useEffect(() => {
    if (animation.isOpen && !animation.isClosing) {
      hasOpenedRef.current = true
    }
    if (!hasOpenedRef.current) return
    const bg = document.getElementById('app-background')
    if (bg) {
      bg.style.transform = animation.isOpen && !animation.isClosing ? 'scale(1.15)' : ''
    }
    return () => {
      if (bg) bg.style.transform = ''
    }
  }, [animation.isOpen, animation.isClosing])

  const handleSelectMission = useCallback(
    (mission: Mission, element: HTMLElement) => {
      originElementRef.current = element
      setSelectedMission(mission)
      animation.open(element)
    },
    [animation.open]
  )

  return (
    <>
      {missions.map((mission: Mission, index: number) => (
        <MissionTag
          key={mission.id}
          mission={mission}
          position={tagPositions[index]}
          disabled={(animation.isOpen && !animation.isClosing) || mission.completed}
          onSelect={(element) => handleSelectMission(mission, element)}
        />
      ))}
      {animation.isOpen && selectedMission && (
        <ExpandModal
          isClosing={animation.isClosing}
          animationStyle={animation.animationStyle}
          modalRef={animation.modalRef}
          onAnimationEnd={animation.onAnimationEnd}
          onClose={animation.close}
        >
          <MissionViewer mission={selectedMission} onClose={animation.close} />
        </ExpandModal>
      )}
    </>
  )
}
