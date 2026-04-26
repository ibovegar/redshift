import React, { useEffect, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import { UpgradeControls } from 'components';
import { Viewer } from 'components';
import Box from '@mui/material/Box';
import * as interfaces from './spacecraft-builder.interface';
import { Upgrade } from 'models';

const SpacecraftBuilder = (props: interfaces.Props) => {
  const {
    spacecraft,
    attachedUpgrades,
    availableUpgrades,
    match,
    setSelectedSpacecraft,
    attachUpgrade,
    detachUpgrade
  } = props;

  const [previewType, setPreviewType] = useState<string | null>(null);

  useEffect(() => {
    setSelectedSpacecraft(match.params.spacecraftId);
  }, [match.params.spacecraftId, setSelectedSpacecraft]);

  const handleSelectUpgrade = useCallback(
    (oldUpgrade: Upgrade, newUpgrade: Upgrade) => {
      if (!spacecraft) return;
      if (oldUpgrade) detachUpgrade(oldUpgrade);
      attachUpgrade(spacecraft, newUpgrade);
    },
    [spacecraft, detachUpgrade, attachUpgrade]
  );

  const handleDeselectUpgrade = useCallback(
    (upgrade: Upgrade) => {
      detachUpgrade(upgrade);
    },
    [detachUpgrade]
  );

  if (!spacecraft) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Box sx={{ flex: 1, width: 900, ml: 6 }}>
        <Viewer
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
  );
};

export default connect(
  interfaces.mapStateToProps,
  interfaces.mapDispatchToProps
)(SpacecraftBuilder);
