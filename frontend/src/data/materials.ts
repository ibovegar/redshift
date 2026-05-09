import type { AsteroidMaterial } from 'models/asteroid'

export const MATERIAL_STORAGE_COST: Record<AsteroidMaterial, number> = {
  iron: 2,
  carbon: 2,
  silicates: 2,
  copper: 3,
  water_ice: 3,
  titanium: 4,
  gold: 5,
  uranium: 6,
  helium3: 6,
  antimatter: 8
}

export const MATERIAL_NAMES: Record<AsteroidMaterial, string> = {
  iron: 'Iron',
  titanium: 'Titanium',
  copper: 'Copper',
  carbon: 'Carbon',
  silicates: 'Silicates',
  water_ice: 'Water Ice',
  antimatter: 'Antimatter',
  uranium: 'Uranium',
  helium3: 'Helium-3',
  gold: 'Gold'
}

export const MATERIAL_SYMBOLS: Record<AsteroidMaterial, string> = {
  iron: 'Fe',
  titanium: 'Ti',
  copper: 'Cu',
  carbon: 'C',
  silicates: 'Si',
  water_ice: 'H₂O',
  antimatter: 'ā',
  uranium: 'U',
  helium3: 'He³',
  gold: 'Au'
}

export const MATERIAL_ICONS: Record<AsteroidMaterial, string> = {
  iron: '/images/materials/material-1.png',
  titanium: '/images/materials/material-2.png',
  copper: '/images/materials/material-3.png',
  carbon: '/images/materials/material-4.png',
  silicates: '/images/materials/material-5.png',
  water_ice: '/images/materials/material-6.png',
  antimatter: '/images/materials/material-7.png',
  uranium: '/images/materials/material-8.png',
  helium3: '/images/materials/material-9.png',
  gold: '/images/materials/material-10.png'
}
