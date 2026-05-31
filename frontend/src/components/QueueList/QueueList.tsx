import { Stack, Typography } from '@mui/material'
import { SectionHeader } from 'components/StationBuildGrid/SectionHeader'
import type { QueueItem as QueueItemData } from 'models/queue'
import type { PropsWithChildren } from 'react'
import { QueueItem } from '~/components/QueueList/QueueItem/QueueItem'

const Container = ({ title, children }: PropsWithChildren<{ title: string }>) => (
  <Stack
    sx={{
      backgroundColor: 'hud.listRest',
      mt: 1,
      borderRadius: '2px',
      px: 3,
      pb: 2,
      pt: 3
    }}
  >
    <SectionHeader sx={{ mb: 1 }}>{title}</SectionHeader>
    {children}
  </Stack>
)

interface Props {
  queue: QueueItemData[]
  onCancel: (id: string) => void
  isCancelling?: boolean
  /** Header label for the panel — e.g. "Build Queue" or "Research Queue". Defaults to "Queue". */
  title?: string
}

// Work-queue panel: renders each item as a QueueItem row (active rows with live progress, pending
// rows labelled Queued). Pass a filtered queue (e.g. just research items) to scope the panel.
export const QueueList = ({ queue, onCancel, isCancelling, title = 'Queue' }: Props) => {
  if (queue.length === 0) {
    return (
      <Container title={title}>
        <Typography variant="hud-data" sx={{ color: 'hud.textBrightDim' }}>
          Idle
        </Typography>
      </Container>
    )
  }
  return (
    <Container title={title}>
      <Stack spacing={1.5} sx={{ mt: 1 }}>
        {queue.map((item) => (
          <QueueItem key={item.id} item={item} onCancel={onCancel} disableCancel={!!isCancelling} />
        ))}
      </Stack>
    </Container>
  )
}
