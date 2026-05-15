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

export const SECTION_DESCRIPTIONS: Record<SectionType, string> = {
  command: 'Central hub for station operations, docking, and construction.',
  research: 'Research new ship blueprints, upgrades, and station sections.',
  engineering: 'Manufacture equipment and perform advanced ship repairs.',
  storage: 'Expanded cargo storage for resources and equipment.',
  power: 'Provides additional power capacity for all station modules.'
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
  storage: 'research',
  power: 'engineering'
}

export const SECTION_ORDER: readonly SectionType[] = ['command', 'research', 'engineering', 'storage', 'power']

export const SECTION_IMAGES: Record<SectionType, string> = {
  command: '/images/modules/command.jpg',
  research: '/images/modules/research.jpg',
  engineering: '/images/modules/engineering_1.jpg',
  storage: '/images/modules/storage.jpg',
  power: '/images/modules/power_1.jpg'
}
