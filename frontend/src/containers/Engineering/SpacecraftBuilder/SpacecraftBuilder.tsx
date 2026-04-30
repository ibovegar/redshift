import Box from '@mui/material/Box'
import { UpgradeControls, Viewer } from 'components'
import type { Upgrade } from 'models'
import { useCallback, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { useParams } from 'react-router'
import * as interfaces from './SpacecraftBuilder.types'

const SpacecraftBuilder = (props: interfaces.Props) => {
  const { spacecraft, attachedUpgrades, availableUpgrades, setSelectedSpacecraft, attachUpgrade, detachUpgrade } = props

  const { spacecraftId } = useParams()
  const [previewType, setPreviewType] = useState<string | null>(null)

  useEffect(() => {
    if (spacecraftId) setSelectedSpacecraft(spacecraftId)
  }, [spacecraftId, setSelectedSpacecraft])

  const handleSelectUpgrade = useCallback(
    (oldUpgrade: Upgrade, newUpgrade: Upgrade) => {
      if (!spacecraft) return
      if (oldUpgrade) detachUpgrade(spacecraft.id, oldUpgrade.id)
      attachUpgrade(spacecraft.id, newUpgrade.id)
    },
    [spacecraft, detachUpgrade, attachUpgrade]
  )

  const handleDeselectUpgrade = useCallback(
    (upgrade: Upgrade) => {
      if (!spacecraft) return
      detachUpgrade(spacecraft.id, upgrade.id)
    },
    [spacecraft, detachUpgrade]
  )

  if (!spacecraft) {
    return <div>Loading...</div>
  }

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Box sx={{ flex: 1, width: 900, ml: 6 }}>
        <Viewer spacecraft={spacecraft} attachedUpgrades={attachedUpgrades} previewType={previewType} />
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

export default connect(interfaces.mapStateToProps, interfaces.mapDispatchToProps)(SpacecraftBuilder)
