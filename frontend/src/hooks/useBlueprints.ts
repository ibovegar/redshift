import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import * as blueprintApi from 'api/blueprint'
import { queryKeys } from './queryKeys'

export const useBlueprints = () =>
  useSuspenseQuery({
    queryKey: queryKeys.blueprints,
    queryFn: blueprintApi.list
  })

export const useStartResearch = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (blueprintId: string) => blueprintApi.startResearch(blueprintId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.station })
    }
  })
}
