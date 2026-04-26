import { Spacecraft } from 'models';
import {
  loadSpacecrafts,
  getAllspacecrafts,
  setSelectedSpacecraft
} from 'store/spacecrafts';
import { AppState } from 'store';
import { loadAllUpgrades } from 'store/upgrades';

export interface StateProps {
  isLoadingSpacecrafts: boolean;
  isLoadingUpgrades: boolean;
  spacecrafts: Spacecraft[];
}

export const mapStateToProps = (state: AppState) => ({
  isLoadingUpgrades: state.upgrades.isLoading,
  isLoadingSpacecrafts: state.spacecrafts.isLoading,
  spacecrafts: getAllspacecrafts(state)
});

export interface DispatchProps {
  setSelectedSpacecraft: (id: string) => void;
  loadSpacecrafts: () => void;
  loadAllUpgrades: () => void;
}

export const mapDispatchToProps = {
  loadSpacecrafts,
  loadAllUpgrades,
  setSelectedSpacecraft
};

export type Props = StateProps & DispatchProps;
