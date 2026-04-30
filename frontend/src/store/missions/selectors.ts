import type { Mission } from 'models'
import { createSelector, type Selector } from 'reselect'
import type { AppState } from 'store'
import { toArray } from 'utils/helpers'

const getMissionEnities = (state: AppState) => state.missions.entities
const selectMissionId = (_state: AppState, missionId: string) => missionId

export const getAllMissions: Selector<AppState, Mission[]> = createSelector(getMissionEnities, (entities) =>
  toArray(entities)
)

export const getMissionById = createSelector([getMissionEnities, selectMissionId], (items, itemId) => items[itemId])
