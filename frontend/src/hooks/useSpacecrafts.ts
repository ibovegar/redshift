import { useSuspenseQuery } from '@tanstack/react-query'
import * as spacecraftApi from 'api/spacecraft'
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
