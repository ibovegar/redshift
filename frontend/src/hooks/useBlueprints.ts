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
    // Enqueues research; the backend returns the station with the updated queue. Write it to cache
    // for an immediate UI update — useStation's effect schedules the refetch off the queue state so
    // completed research lands without polling.
    onSuccess: (station) => {
      queryClient.setQueryData(queryKeys.station, station)
    },
    onError: (error) => {
      // Surface mutation failures (insufficient materials, parent not researched, etc.) so we can
      // see them in the browser console while iterating on the click-to-research flow.
      console.error('startResearch failed:', error)
    }
  })
}
