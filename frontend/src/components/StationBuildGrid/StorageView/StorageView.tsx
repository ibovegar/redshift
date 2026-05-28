import { Box } from '@mui/material'
import { DottedBackground } from 'components/DottedBackground/DottedBackground'
import type { CargoItem } from 'models/spacecraft'
import { SectionHeader } from '../SectionHeader'
import { allocateStorage } from './allocate'
import { StorageSection } from './StorageSection/StorageSection'

interface Props {
  storage: CargoItem[]
  storageCapacity: number
}

export const StorageView = ({ storage, storageCapacity }: Props) => {
  const sections = allocateStorage(storage, storageCapacity)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <SectionHeader>Storage</SectionHeader>
      <DottedBackground sx={{ flex: 1, overflow: 'auto' }}>
        <Box sx={{ display: 'flex', gap: 2, width: '100%', alignItems: 'flex-start' }}>
          {sections.map((section) => (
            <StorageSection key={section.title} data={section} />
          ))}
        </Box>
      </DottedBackground>
    </Box>
  )
}
