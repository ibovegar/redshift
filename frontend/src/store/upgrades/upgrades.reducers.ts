import type { Upgrade } from 'models'
import { toEntities, upsertEntities } from 'utils/helpers'
import type { ActionTypes } from './upgrades.actions'
import type State from './upgrades.interfaces'

const initialState: State = {
  ids: [],
  entities: {},
  isLoading: true
}

export function reducer(state: State = initialState, action: ActionTypes): State {
  switch (action.type) {
    case 'LOAD_UPGRADES_REQUEST': {
      return {
        ...state,
        isLoading: true
      }
    }

    case 'LOAD_UPGRADES_SUCCESS': {
      return {
        ...state,
        isLoading: false,
        entities: upsertEntities(state.entities, toEntities(action.upgrades, 'id')),
        ids: action.upgrades.map((upgrade: Upgrade) => upgrade.id)
      }
    }

    case 'LOAD_UPGRADES_FAILURE': {
      return {
        ...state,
        isLoading: false
      }
    }

    case 'DETACH_UPGRADE_SUCCESS':
    case 'ATTACH_UPGRADE_SUCCESS': {
      const entities: Record<string, Upgrade> = { ...state.entities }
      entities[action.upgrade.id] = action.upgrade

      return {
        ...state,
        entities
      }
    }

    default:
      return state
  }
}
