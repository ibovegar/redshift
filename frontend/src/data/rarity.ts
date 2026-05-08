import type { ResourceRarity } from 'models/asteroid'

export const RARITY_COLORS: Record<ResourceRarity, string> = {
  common: '#aaaaaa',
  uncommon: '#4fc3f7',
  rare: '#ab47bc',
  precious: '#ffa726',
  exotic: '#ef5350'
}

export const RARITY_LABELS: Record<ResourceRarity, string> = {
  common: 'COMMON',
  uncommon: 'UNCOMMON',
  rare: 'RARE',
  precious: 'PRECIOUS',
  exotic: 'EXOTIC'
}
