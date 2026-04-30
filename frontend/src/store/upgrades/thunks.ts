import * as API from 'api/upgrades.api'
import type { Upgrade } from 'models'
import type { Dispatch } from 'redux'
import * as actions from './actions'

export const loadUpgrades = (spacecraftId: string) => async (dispatch: Dispatch) => {
  dispatch(actions.loadUpgradesRequest())
  try {
    const response: Upgrade[] = await API.get(spacecraftId)
    dispatch(actions.loadUpgradesSuccess(response))
  } catch (error) {
    dispatch(actions.loadUpgradesFailure(error))
  }
}

export const loadAllUpgrades = () => async (dispatch: Dispatch) => {
  dispatch(actions.loadUpgradesRequest())
  try {
    const response: Upgrade[] = await API.getAll()
    dispatch(actions.loadUpgradesSuccess(response))
  } catch (error) {
    dispatch(actions.loadUpgradesFailure(error))
  }
}

export const detachUpgrade = (spacecraftId: string, upgradeId: string) => async (dispatch: Dispatch) => {
  try {
    const upgrade = await API.detach(spacecraftId, upgradeId)
    dispatch(actions.detachUpgradeSuccess(upgrade))
  } catch (error) {
    console.log(error)
  }
}

export const attachUpgrade = (spacecraftId: string, upgradeId: string) => async (dispatch: Dispatch) => {
  try {
    const upgrade = await API.attach(spacecraftId, upgradeId)
    dispatch(actions.attachUpgradeSuccess(upgrade))
  } catch (error) {
    console.log(error)
  }
}
