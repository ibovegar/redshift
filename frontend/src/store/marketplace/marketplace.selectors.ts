import type { Spacecraft, Upgrade } from 'models'
import { createSelector, type Selector } from 'reselect'
import type { AppState } from 'store'

const getStoreEnities = (state: AppState) => state.marketplace.products

export const getUpgradeList: Selector<AppState, (Upgrade | Spacecraft)[]> = createSelector(
  getStoreEnities,
  (entities) => entities
)
