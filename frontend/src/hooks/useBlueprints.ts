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
    // Backend now returns a station with `researchInProgress` set (start/complete timestamps);
    // it doesn't finalize until a subsequent read. Write the new station into cache for an
    // immediate UI update, then schedule a refetch right after the task's `completesAt` so the
    // UI picks up the freshly-added researchedBlueprints entry without polling.
    onSuccess: (station) => {
      queryClient.setQueryData(queryKeys.station, station)
      const task = station.researchInProgress
      if (task) {
        const delay = Math.max(0, Date.parse(task.completesAt) - Date.now())
        setTimeout(() => queryClient.invalidateQueries({ queryKey: queryKeys.station }), delay + 50)
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.station })
      }
    },
    onError: (error) => {
      // Surface mutation failures (insufficient materials, parent not researched, etc.) so we can
      // see them in the browser console while iterating on the click-to-research flow.
      console.error('startResearch failed:', error)
    }
  })
}
