import type { AttachedUpgrades, AvailableUpgrades, Spacecraft, Upgrade } from 'models'
import type { AppState } from 'store'
import { setSelectedSpacecraft } from 'store/spacecrafts'
import { attachUpgrade, detachUpgrade, getAttachedUpgrades, getAvailableUpgrades } from 'store/upgrades'

export interface StateProps {
  spacecraft?: Spacecraft
  availableUpgrades: AvailableUpgrades
  attachedUpgrades: AttachedUpgrades
  detachUpgrade: (upgrade: Upgrade) => void
  attachUpgrade: (spacecraft: Spacecraft, upgrade: Upgrade) => void
  setSelectedSpacecraft: (id: string) => void
}

export const mapStateToProps = (state: AppState) => ({
  spacecraft: state.spacecrafts.selected,
  availableUpgrades: getAvailableUpgrades(state),
  attachedUpgrades: getAttachedUpgrades(state)
})

export const mapDispatchToProps = {
  detachUpgrade,
  attachUpgrade,
  setSelectedSpacecraft
}

export type Props = StateProps
