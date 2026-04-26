import React, { Component } from 'react';
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

class SpacecraftViewer extends Component<Props, any> {
  state = {
    isLoading: true
  };

  handleLoaded = () => {
    this.setState({ isLoading: false });
  };

  render() {
    const { spacecraft, attachedUpgrades } = this.props;

    return (
      <Widget>
        <Crosses>
          {this.state.isLoading ? (
            <div>LOADING ASSETS. PLEASE WAIT... </div>
          ) : (
            <Stats
              spacecraft={spacecraft}
              attachedUpgrades={attachedUpgrades}
            />
          )}
          <Canvas
            spacecraft={spacecraft}
            attachedUpgrades={attachedUpgrades}
            previewType={this.props.previewType}
            onLoaded={this.handleLoaded}
          />
        </Crosses>
      </Widget>
    );
  }
}

export default SpacecraftViewer;
