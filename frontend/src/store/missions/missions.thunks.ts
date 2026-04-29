import * as API from 'api/missions.api'
import type { Mission } from 'models'
import type { Dispatch } from 'redux'
import * as actions from './missions.actions'

export const loadMissions = () => async (dispatch: Dispatch) => {
  dispatch(actions.loadMissionsRequest())
  try {
    const response = await API.getAll()
    dispatch(actions.loadMissionsSuccess(response))
  } catch (error) {
    dispatch(actions.loadMissionsFailure(error))
  }
}

export const completeMission = (mission: Mission) => async (dispatch: Dispatch) => {
  const updatedMission = { ...mission }
  updatedMission.completed = true

  API.update(updatedMission)
    .then(() => {
      dispatch(actions.completeMissionSuccess(updatedMission))
    })
    .catch((error) => {
      dispatch(actions.completeMissionFailure(error))
    })
}
