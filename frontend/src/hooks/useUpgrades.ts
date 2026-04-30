import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import * as upgradesApi from 'api/upgrades'
import { AttachedUpgrades, AvailableUpgrades, type Spacecraft, type Upgrade } from 'models'
import { queryKeys } from './queryKeys'

export const useUpgrades = () =>
  useSuspenseQuery({
    queryKey: queryKeys.upgrades,
    queryFn: upgradesApi.getAll
  })

export const useAttachUpgrade = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ spacecraftId, upgradeId }: { spacecraftId: string; upgradeId: string }) =>
      upgradesApi.attach(spacecraftId, upgradeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.upgrades })
    }
  })
}

export const useDetachUpgrade = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ spacecraftId, upgradeId }: { spacecraftId: string; upgradeId: string }) =>
      upgradesApi.detach(spacecraftId, upgradeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.upgrades })
    }
  })
}

export function getAttachedUpgrades(upgrades: Upgrade[], spacecraft: Spacecraft | undefined): AttachedUpgrades {
  const attached = new AttachedUpgrades()
  if (!spacecraft || !upgrades.length) return attached

  for (const upgrade of upgrades) {
    if (upgrade.spacecraftId === spacecraft.id) {
      attached[upgrade.storeType] = upgrade
    }
  }
  return attached
}

export function getAvailableUpgrades(upgrades: Upgrade[], spacecraft: Spacecraft | undefined): AvailableUpgrades {
  const available = new AvailableUpgrades()
  if (!spacecraft) return available

  for (const upgrade of upgrades) {
    if (!upgrade.isAttached && upgrade.spacecraftRegistry === spacecraft.spacecraftRegistry) {
      available[upgrade.storeType].push(upgrade)
    }
  }
  return available
}
