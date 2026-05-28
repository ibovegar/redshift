import type { CargoItem } from 'models/spacecraft'
import { BASE_STORAGE_CAPACITY, STORAGE_EXTENSION_CAPACITY } from 'models/station-section'

export interface StorageSectionData {
  title: string
  capacity: number
  used: number
  items: CargoItem[]
}

// Distributes the flat station cargo list across storage sections in fill order: the Internal
// Storage (BASE capacity) fills first, then each Storage Extension (EXT capacity) in turn. A
// material that straddles a section boundary appears in both sections with its split amounts.
// The number of extension sections is derived from the running storageCapacity.
export const allocateStorage = (storage: CargoItem[], storageCapacity: number): StorageSectionData[] => {
  const extensionCount = Math.max(0, Math.round((storageCapacity - BASE_STORAGE_CAPACITY) / STORAGE_EXTENSION_CAPACITY))

  const sections: StorageSectionData[] = [
    { title: 'Internal Storage', capacity: BASE_STORAGE_CAPACITY, used: 0, items: [] }
  ]
  for (let i = 0; i < extensionCount; i++) {
    sections.push({ title: `Storage Extension ${i + 1}`, capacity: STORAGE_EXTENSION_CAPACITY, used: 0, items: [] })
  }

  let secIdx = 0
  for (const item of storage) {
    let remaining = item.amount
    while (remaining > 0 && secIdx < sections.length) {
      const section = sections[secIdx]
      const free = section.capacity - section.used
      if (free <= 0) {
        secIdx++
        continue
      }
      const take = Math.min(free, remaining)
      section.items.push({ material: item.material, amount: take })
      section.used += take
      remaining -= take
      if (section.used >= section.capacity) secIdx++
    }
    // Any leftover (storage exceeding total capacity) has no section to live in and is dropped
    // from the breakdown — only happens when stored units exceed total capacity.
  }

  return sections
}
