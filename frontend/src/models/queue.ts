import type { BuildTask, ResearchTask } from './blueprint'
import type { SectionType } from './station-section'

// A single queued unit of work. The station runs at most one active research and one active build
// at a time (the first of each kind in the list); items gain start/complete timestamps only while
// active. Pending items have no timestamps. `targetId` is a blueprintId (research) or a
// SectionType (build).
export interface QueueItem {
  id: string
  kind: 'research' | 'build'
  targetId: string
  startedAt?: string
  completesAt?: string
}

const isActive = (item: QueueItem): boolean => !!item.startedAt && !!item.completesAt

// The active research/build tasks, mapped to the existing task shapes so consumers (research cards,
// grid cells, progress blocks) stay unchanged.
export const activeResearchTask = (queue: QueueItem[]): ResearchTask | null => {
  const item = queue.find((i) => i.kind === 'research' && isActive(i))
  if (!item?.startedAt || !item.completesAt) return null
  return { blueprintId: item.targetId, startedAt: item.startedAt, completesAt: item.completesAt }
}

export const activeBuildTask = (queue: QueueItem[]): BuildTask | null => {
  const item = queue.find((i) => i.kind === 'build' && isActive(i))
  if (!item?.startedAt || !item.completesAt) return null
  return { sectionType: item.targetId as SectionType, startedAt: item.startedAt, completesAt: item.completesAt }
}

// Count of build items (active + pending) targeting a section type — used for the repeatable caps.
export const queuedBuildCount = (queue: QueueItem[], sectionType: SectionType): number =>
  queue.filter((i) => i.kind === 'build' && i.targetId === sectionType).length

// blueprintIds of every research item in the queue (active + pending) — a card for one of these
// reads as in-progress so it can't be queued twice.
export const queuedResearchIds = (queue: QueueItem[]): string[] =>
  queue.filter((i) => i.kind === 'research').map((i) => i.targetId)

// Earliest completion time among active items — drives the safety-net refetch.
export const nextQueueCompletion = (queue: QueueItem[]): string | undefined =>
  queue
    .filter((i) => i.completesAt)
    .map((i) => i.completesAt as string)
    .sort()[0]
