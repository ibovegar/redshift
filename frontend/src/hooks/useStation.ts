import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import * as stationApi from 'api/station'
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
  // Safety-net refetch covering whichever task finishes first — research or any concurrent section
  // build. The mutations also schedule their own refetch, so this just guards against a task that
  // started outside a mutation (e.g. a cache write from another tab/read).
  const research = query.data.researchInProgress
  const buildTimes = query.data.buildInProgress.map((b) => b.completesAt)
  const nextCompletesAt = [research?.completesAt, ...buildTimes].filter((t): t is string => !!t).sort()[0]

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

// Section builds are timed now: the backend returns a station with `buildInProgress` set (rather
// than the section already operational). Write it into cache for an immediate progress bar, then
// schedule a refetch just after `completesAt` so the cell flips to operational without polling.
export const useBuildSection = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (type: SectionType) => stationApi.buildSection(type),
    onSuccess: (station, type) => {
      queryClient.setQueryData(queryKeys.station, station)
      // Schedule the refetch for the build we just started; useStation's safety-net covers the rest.
      const task = station.buildInProgress.find((b) => b.sectionType === type)
      if (task) {
        const delay = Math.max(0, Date.parse(task.completesAt) - Date.now())
        setTimeout(
          () => queryClient.invalidateQueries({ queryKey: queryKeys.station }),
          delay + TASK_COMPLETION_GRACE_MS
        )
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.station })
      }
    }
  })
}
