import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import * as userApi from 'api/user'
import { queryKeys } from './queryKeys'

export const useUser = () =>
  useSuspenseQuery({
    queryKey: queryKeys.user,
    queryFn: userApi.get
  })

export const useAddCredits = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: userApi.updateCredits,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user })
    }
  })
}

export const usePatchUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: userApi.patchUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user })
    }
  })
}
