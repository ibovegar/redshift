import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as storeApi from 'api/store'
import { queryKeys } from './queryKeys'

export const useStoreProducts = () =>
  useQuery({
    queryKey: queryKeys.store,
    queryFn: storeApi.get
  })

export const usePurchase = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: storeApi.purchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user })
      queryClient.invalidateQueries({ queryKey: queryKeys.spacecrafts })
      queryClient.invalidateQueries({ queryKey: queryKeys.upgrades })
    }
  })
}
