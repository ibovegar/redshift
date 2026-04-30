import type { Mission } from 'models'
import { toEntities, upsertEntities } from 'utils/helpers'
import type { ActionTypes } from './actions'
import type State from './interfaces'

const initialState: State = {
  ids: [],
  entities: {},
  isLoading: true
}

export function reducer(state: State = initialState, action: ActionTypes): State {
  switch (action.type) {
    case 'LOAD_MISSIONS_REQUEST': {
      return {
        ...state,
        isLoading: true
      }
    }

    case 'LOAD_MISSIONS_SUCCESS': {
      return {
        ...state,
        isLoading: false,
        entities: upsertEntities(state.entities, toEntities(action.missions, 'id')),
        ids: action.missions.map((mission: Mission) => mission.id)
      }
    }

    case 'LOAD_MISSIONS_FAILURE': {
      return {
        ...state,
        isLoading: false
      }
    }

    case 'COMPLETE_MISSION_SUCCESS': {
      const entities: Record<string, Mission> = { ...state.entities }
      entities[action.mission.id] = action.mission

      return {
        ...state,
        entities
      }
    }

    default:
      return state
  }
}
