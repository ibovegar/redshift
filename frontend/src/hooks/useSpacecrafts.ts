import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import * as spacecraftApi from 'api/spacecraft'
import type { CargoItem } from 'models/spacecraft'
import { queryKeys } from './queryKeys'

export const useSpacecrafts = () =>
  useSuspenseQuery({
    queryKey: queryKeys.spacecrafts,
    queryFn: spacecraftApi.getAll
  })

export const useSpacecraft = (id: string) =>
  useSuspenseQuery({
    queryKey: queryKeys.spacecraft(id),
    queryFn: () => spacecraftApi.get(id)
  })

export const useUpdateCargo = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ spacecraftId, cargo }: { spacecraftId: string; cargo: CargoItem[] }) =>
      spacecraftApi.updateCargo(spacecraftId, cargo),
    onSuccess: (_data, { spacecraftId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.spacecraft(spacecraftId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.spacecrafts })
    }
  })
}
