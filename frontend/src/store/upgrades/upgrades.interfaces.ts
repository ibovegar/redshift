import type { EntityState, Upgrade } from 'models'

export default interface State extends EntityState<Upgrade> {
  isLoading: boolean
}
