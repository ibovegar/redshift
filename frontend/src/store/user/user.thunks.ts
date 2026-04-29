import * as API from 'api/user.api'
import type { Dispatch } from 'redux'
import type { AppState } from 'store'
import * as actions from './user.actions'

export const loadUserStats = () => async (dispatch: Dispatch) => {
  dispatch(actions.loadUserRequest())
  try {
    const response = await API.get()
    dispatch(actions.loadUserSuccess(response))
  } catch (error) {
    dispatch(actions.loadUserFailure(error))
  }
}

export const subtractCredits = (amount: number) => async (dispatch: Dispatch, getState: () => AppState) => {
  const state: AppState = getState()
  const credits = state.user.credits - amount

  try {
    await API.updateCredits(credits)
    dispatch(actions.updateCreditsSuccess(credits))
  } catch {
    console.log('failed to update credits')
  }
}

export const addCredits = (amount: number) => async (dispatch: Dispatch, getState: () => AppState) => {
  const state: AppState = getState()
  const credits = state.user.credits + amount

  try {
    await API.updateCredits(credits)
    dispatch(actions.updateCreditsSuccess(credits))
  } catch {
    console.log('failed to update credits')
  }
}
