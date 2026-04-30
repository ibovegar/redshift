import type { ActionTypes } from './actions'
import type State from './interfaces'

const initialState: State = {
  isLoading: true,
  credits: 0
}

export function reducer(state: State = initialState, action: ActionTypes): State {
  switch (action.type) {
    case 'LOAD_USER_REQUEST': {
      return {
        ...state,
        isLoading: true
      }
    }

    case 'LOAD_USER_SUCCESS': {
      return {
        ...state,
        isLoading: false,
        credits: action.user.credits
      }
    }

    case 'LOAD_USER_FAILURE': {
      return {
        ...state,
        isLoading: false
      }
    }

    case 'UPDATE_CREDITS_SUCCESS': {
      return {
        ...state,
        credits: action.credits
      }
    }

    default:
      return state
  }
}
