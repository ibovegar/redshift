import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as missionsApi from 'api/missions'
import type { Mission } from 'models'
import { queryKeys } from './queryKeys'

export const useMissions = () =>
  useQuery({
    queryKey: queryKeys.missions,
    queryFn: missionsApi.getAll
  })

export const useCompleteMission = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (mission: Mission) => missionsApi.update({ ...mission, completed: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.missions })
      queryClient.invalidateQueries({ queryKey: queryKeys.user })
    }
  })
}
