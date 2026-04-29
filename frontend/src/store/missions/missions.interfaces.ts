import type { EntityState, Mission } from 'models'

export default interface State extends EntityState<Mission> {
  isLoading: boolean
}
