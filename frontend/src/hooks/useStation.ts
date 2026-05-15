import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import * as stationApi from 'api/station'
import type { SectionType } from 'models/station-section'
import type { CargoItem } from 'models/spacecraft'
import { queryKeys } from './queryKeys'

export const useStation = () =>
  useSuspenseQuery({
    queryKey: queryKeys.station,
    queryFn: stationApi.get
  })

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
