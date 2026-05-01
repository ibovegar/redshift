import Box from '@mui/material/Box'
import { UpgradeControls, Viewer } from 'components'
import {
  getAttachedUpgrades,
  getAvailableUpgrades,
  useAttachUpgrade,
  useDetachUpgrade,
  useSpacecraft,
  useUpgrades
} from 'hooks'
import type { Upgrade } from 'models'
import { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router'

export const SpacecraftBuilder = () => {
  const { spacecraftId } = useParams<{ spacecraftId: string }>()
  const { data: spacecraft } = useSpacecraft(spacecraftId as string)
  const { data: upgrades } = useUpgrades()
  const attachMutation = useAttachUpgrade()
  const detachMutation = useDetachUpgrade()

  const [previewType, setPreviewType] = useState<string | null>(null)

  const attachedUpgrades = useMemo(() => getAttachedUpgrades(upgrades, spacecraft), [upgrades, spacecraft])
  const availableUpgrades = useMemo(() => getAvailableUpgrades(upgrades, spacecraft), [upgrades, spacecraft])

  const handleSelectUpgrade = useCallback(
    (oldUpgrade: Upgrade, newUpgrade: Upgrade) => {
      if (oldUpgrade) detachMutation.mutate({ spacecraftId: spacecraft.id, upgradeId: oldUpgrade.id })
      attachMutation.mutate({ spacecraftId: spacecraft.id, upgradeId: newUpgrade.id })
    },
    [spacecraft, detachMutation, attachMutation]
  )

  const handleDeselectUpgrade = useCallback(
    (upgrade: Upgrade) => {
      detachMutation.mutate({ spacecraftId: spacecraft.id, upgradeId: upgrade.id })
    },
    [spacecraft, detachMutation]
  )

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Box sx={{ flex: 1, width: 900, ml: 6 }}>
        <Viewer
          key={spacecraft.id}
          spacecraft={spacecraft}
          attachedUpgrades={attachedUpgrades}
          previewType={previewType}
        />
      </Box>
      <Box sx={{ width: 300, ml: 6 }}>
        <UpgradeControls
          spacecraft={spacecraft}
          attachedUpgrades={attachedUpgrades}
          availableUpgrades={availableUpgrades}
          onDeselectUpgrade={handleDeselectUpgrade}
          onSelectUpgrade={handleSelectUpgrade}
          onHoverUpgrade={(type) => setPreviewType(type)}
          onHoverEnd={() => setPreviewType(null)}
        />
      </Box>
    </Box>
  )
}
