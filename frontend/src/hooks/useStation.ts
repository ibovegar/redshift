import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import * as stationApi from 'api/station'
import type { CargoItem } from 'models/spacecraft'
import type { SectionType } from 'models/station-section'
import { useEffect } from 'react'
import { queryKeys } from './queryKeys'

const RESEARCH_COMPLETION_GRACE_MS = 50

export const useStation = () => {
  const query = useSuspenseQuery({
    queryKey: queryKeys.station,
    queryFn: stationApi.get
  })
  const queryClient = useQueryClient()
  const inProgress = query.data.researchInProgress

  useEffect(() => {
    if (!inProgress) return
    const msLeft = Date.parse(inProgress.completesAt) - Date.now()
    const delay = Math.max(0, msLeft) + RESEARCH_COMPLETION_GRACE_MS
    const id = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.station })
    }, delay)
    return () => clearTimeout(id)
  }, [inProgress, queryClient])

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

export const useBuildSection = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (type: SectionType) => stationApi.buildSection(type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.station })
    }
  })
}
