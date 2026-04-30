import { useQuery } from '@tanstack/react-query'
import * as spacecraftApi from 'api/spacecraft'
import { queryKeys } from './queryKeys'

export const useSpacecrafts = () =>
  useQuery({
    queryKey: queryKeys.spacecrafts,
    queryFn: spacecraftApi.getAll
  })

export const useSpacecraft = (id: string | undefined) =>
  useQuery({
    queryKey: queryKeys.spacecraft(id ?? ''),
    queryFn: () => spacecraftApi.get(id as string),
    enabled: !!id
  })
