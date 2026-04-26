import React, { useState, useCallback } from 'react';
import { Spacecraft, AttachedUpgrades } from 'models';
import Stats from './stats/stats.component';
import Canvas from './canvas/canvas.component';
import { Widget } from 'components';
import { styled } from '@mui/material/styles';
import Plus from 'assets/images/plus.svg';

const Crosses = styled('div')({
  height: '100%',
  backgroundImage: `url(${Plus})`,
  backgroundRepeat: 'repeat'
});

interface Props {
  spacecraft: Spacecraft;
  attachedUpgrades: AttachedUpgrades;
  previewType?: string | null;
}

const SpacecraftViewer = (props: Props) => {
  const { spacecraft, attachedUpgrades, previewType } = props;

  const [isLoading, setIsLoading] = useState(true);

  const handleLoaded = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <Widget>
      <Crosses>
        {isLoading ? (
          <div>LOADING ASSETS. PLEASE WAIT... </div>
        ) : (
          <Stats spacecraft={spacecraft} attachedUpgrades={attachedUpgrades} />
        )}
        <Canvas
          spacecraft={spacecraft}
          attachedUpgrades={attachedUpgrades}
          previewType={previewType}
          onLoaded={handleLoaded}
        />
      </Crosses>
    </Widget>
  );
};

export default SpacecraftViewer;
