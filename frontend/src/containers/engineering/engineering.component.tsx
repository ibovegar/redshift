import React, { useEffect, useCallback } from 'react';
import { Routes, Route, Link } from 'react-router';
import { connect } from 'react-redux';
import SpacecraftBuilder from './spacecraft-builder/spacecraft-builder.component';
import { SpacecraftList } from 'components';
import Box from '@mui/material/Box';
import * as interfaces from './engineering.interface';
import { Placeholder } from 'components/ui';
import { Button } from '@mui/material';

const Engineering = (props: interfaces.Props) => {
  const {
    spacecrafts,
    isLoadingSpacecrafts,
    isLoadingUpgrades,
    loadSpacecrafts,
    loadAllUpgrades,
    setSelectedSpacecraft
  } = props;

  useEffect(() => {
    loadSpacecrafts();
    loadAllUpgrades();
  }, [loadSpacecrafts, loadAllUpgrades]);

  const handleSelectSpacecraft = useCallback(
    (event: React.MouseEvent) => {
      setSelectedSpacecraft(event.currentTarget.id);
    },
    [setSelectedSpacecraft]
  );

  if (!spacecrafts.length) {
    return (
      <Placeholder
        message="INVENTORY IS EMPTY"
        action={
          <Button
            color="primary"
            variant="contained"
            component={Link}
            to="/marketplace"
          >
            GO TO STORE
          </Button>
        }
      />
    );
  }

  if (isLoadingSpacecrafts || isLoadingUpgrades) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Box
        sx={{
          width: 340,
          height: '100%',
          border: 1,
          borderColor: 'grey.700'
        }}
      >
        <SpacecraftList
          spacecrafts={spacecrafts}
          onSpacecraftClick={handleSelectSpacecraft}
        />
      </Box>
      <Box sx={{ flex: 1, height: '100%' }}>
        <Routes>
          <Route path=":spacecraftId" element={<SpacecraftBuilder />} />
          <Route
            path="/"
            element={<Placeholder message="PLEASE SELECT A SPACECRAFT" />}
          />
        </Routes>
      </Box>
    </Box>
  );
};

export default connect(
  interfaces.mapStateToProps,
  interfaces.mapDispatchToProps
)(Engineering);
