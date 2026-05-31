import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import * as stationApi from 'api/station'
import { nextQueueCompletion } from 'models/queue'
import type { CargoItem } from 'models/spacecraft'
import type { SectionType } from 'models/station-section'
import { useEffect } from 'react'
import { queryKeys } from './queryKeys'

const TASK_COMPLETION_GRACE_MS = 50

export const useStation = () => {
  const query = useSuspenseQuery({
    queryKey: queryKeys.station,
    queryFn: stationApi.get
  })
  const queryClient = useQueryClient()
  // Safety-net refetch at the earliest active queue completion. The mutations only write the cache;
  // this effect (re-running whenever the queue changes) schedules each successive completion, so the
  // queue auto-advances and finished items resolve without polling.
  const nextCompletesAt = nextQueueCompletion(query.data.queue)

  useEffect(() => {
    if (!nextCompletesAt) return
    const msLeft = Date.parse(nextCompletesAt) - Date.now()
    const delay = Math.max(0, msLeft) + TASK_COMPLETION_GRACE_MS
    const id = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.station })
    }, delay)
    return () => clearTimeout(id)
  }, [nextCompletesAt, queryClient])

  return query
}

export const useTransferCargo = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (cargo: CargoItem[]) => stationApi.transferCargo(cargo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.station })
    }
  })
}

// Enqueues a section build and writes the returned station (with the updated queue) into cache for
// an immediate progress bar. useStation's effect schedules the refetch off the new queue state.
export const useBuildSection = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (type: SectionType) => stationApi.buildSection(type),
    onSuccess: (station) => {
      queryClient.setQueryData(queryKeys.station, station)
    }
  })
}

export const useCancelQueueItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => stationApi.cancelQueueItem(id),
    onSuccess: (station) => {
      queryClient.setQueryData(queryKeys.station, station)
    }
  })
}
