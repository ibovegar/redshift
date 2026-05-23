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
    // The mock backend now returns the updated Station synchronously, so we set it into the cache
    // directly for an immediate UI update. Also invalidate to keep things consistent with any
    // background queries (e.g. a future server-driven flow that does long-running research).
    onSuccess: (station) => {
      queryClient.setQueryData(queryKeys.station, station)
      queryClient.invalidateQueries({ queryKey: queryKeys.station })
    },
    onError: (error) => {
      // Surface mutation failures (insufficient materials, parent not researched, etc.) so we can
      // see them in the browser console while iterating on the click-to-research flow.
      console.error('startResearch failed:', error)
    }
  })
}
