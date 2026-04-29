import type { Spacecraft } from 'models'
import { createSelector, type Selector } from 'reselect'
import type { AppState } from 'store'
import { toArray } from 'utils/helpers'

const getspacecraftsEnities = (state: AppState) => state.spacecrafts.entities

export const getAllspacecrafts: Selector<AppState, Spacecraft[]> = createSelector(getspacecraftsEnities, (entities) => {
  return toArray(entities)
})
