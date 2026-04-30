import * as API from 'api/store.api'
import type { Spacecraft, Upgrade } from 'models'
import type { Dispatch } from 'redux'
import * as fromUserStore from '../user'
import * as actions from './actions'

export const loadStore = () => async (dispatch: Dispatch) => {
  dispatch(actions.loadStoreRequest())
  try {
    const response = await API.get()
    dispatch(actions.loadStoreSuccess(response))
  } catch (error) {
    dispatch(actions.loadStoreFailure(error))
  }
}

export const purchase = (cart: (Spacecraft | Upgrade)[]) => async (dispatch: Dispatch) => {
  dispatch(actions.purchaseRequest())
  try {
    const { user } = await API.purchase(cart)
    dispatch(actions.purchaseSuccess())
    dispatch(fromUserStore.updateCreditsSuccess(user.credits))
  } catch (error) {
    dispatch(actions.purchaseFailure(error))
  }
}
