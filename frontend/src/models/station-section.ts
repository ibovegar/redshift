import type { AsteroidMaterial } from './asteroid'

export type SectionType = 'command' | 'research' | 'engineering' | 'storage' | 'power'
export type SectionStatus = 'operational' | 'available' | 'locked'

export interface StationSection {
  type: SectionType
  status: SectionStatus
}

export const SECTION_COSTS: Record<SectionType, Partial<Record<AsteroidMaterial, number>>> = {
  command: {},
  research: { iron: 20, copper: 10 },
  engineering: { iron: 30, titanium: 15 },
  storage: { iron: 25, carbon: 15 },
  power: { copper: 20, uranium: 5 }
}

export const SECTION_NAMES: Record<SectionType, string> = {
  command: 'Command Module',
  research: 'Research Lab',
  engineering: 'Engineering Bay',
  storage: 'Storage Module',
  power: 'Power Core'
}

// Descriptions are written to wrap to ~3 lines at the InfoPanel width (≈280px content) so the
// layout doesn't jitter when the user switches between modules. Pair with a `minHeight` on the
// description Typography for an exact lock.
export const SECTION_DESCRIPTIONS: Record<SectionType, string> = {
  command:
    'Central hub responsible for constructing every other station module. Coordinates docking, logistics, and the overall station systems.',
  research:
    'Dedicated research facility for developing blueprints — ships, ship addons, and advanced station modules. Does not produce raw materials.',
  engineering:
    'Heavy fabrication bay for manufacturing ships and ship upgrades. Performs structural repairs on docked spacecraft using bulk materials.',
  storage:
    'Expanded cargo bay holding refined ores and processed materials. Total capacity grows with each additional storage module attached.',
  power:
    'Reactor module providing additional power capacity to the station. Required by manufacturing and other high-draw modules to stay online.'
}

export const SECTION_COLORS: Record<SectionType, number> = {
  command: 0x66ccff,
  research: 0x88ffcc,
  engineering: 0xff8844,
  storage: 0x44ff88,
  power: 0xffdd44
}

// Which module must be operational to unlock this one (its "blueprint" source)
export const SECTION_BLUEPRINT: Record<SectionType, SectionType | null> = {
  command: null,
  research: 'command',
  engineering: 'research',
  power: 'engineering',
  storage: 'engineering'
}

export const SECTION_ORDER: readonly SectionType[] = ['command', 'engineering', 'research', 'power', 'storage']

export const SECTION_IMAGES: Record<SectionType, string> = {
  command: '/images/modules/command.png',
  research: '/images/modules/research.png',
  engineering: '/images/modules/engineering_1.png',
  storage: '/images/modules/storage.png',
  power: '/images/modules/power_1.png'
}

export const SECTION_ICONS: Record<SectionType, string> = {
  command: '/icons/modules/module-1.svg',
  engineering: '/icons/modules/module-2.svg',
  research: '/icons/modules/module-3.svg',
  power: '/icons/modules/module-4.svg',
  storage: '/icons/modules/module-5.svg',
}
