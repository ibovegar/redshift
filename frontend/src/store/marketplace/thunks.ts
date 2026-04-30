import * as API from 'api/store.api'
import type { Spacecraft, Upgrade } from 'models'
import type { AnyAction, Dispatch } from 'redux'
import type { ThunkDispatch } from 'redux-thunk'
import type { AppState } from 'store'
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

export const purchase =
  (cart: (Spacecraft | Upgrade)[]) => async (dispatch: ThunkDispatch<AppState, unknown, AnyAction>) => {
    const totalPrice = cart.reduce((sum, i) => {
      return sum + i.price
    }, 0)

    dispatch(actions.purchaseRequest())

    API.purchase(cart)
      .then(() => {
        dispatch(actions.purchaseSuccess())
        dispatch(fromUserStore.subtractCredits(totalPrice))
      })
      .catch((error) => {
        dispatch(actions.purchaseFailure(error))
      })
  }
