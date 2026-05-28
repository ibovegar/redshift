import gettingStarted from './content/getting-started.md?raw'
import interfaceGuide from './content/interface.md?raw'
import materials from './content/materials.md?raw'
import mining from './content/mining.md?raw'
import overview from './content/overview.md?raw'
import research from './content/research.md?raw'
import ships from './content/ships.md?raw'
import stationModules from './content/station-modules.md?raw'

export interface WikiSection {
  id: string
  title: string
  content: string
}

export const WIKI_SECTIONS: WikiSection[] = [
  { id: 'overview', title: 'Overview', content: overview },
  { id: 'getting-started', title: 'Getting Started', content: gettingStarted },
  { id: 'station-modules', title: 'Station Modules', content: stationModules },
  { id: 'research', title: 'Research & Blueprints', content: research },
  { id: 'mining', title: 'Mining & Asteroids', content: mining },
  { id: 'materials', title: 'Materials', content: materials },
  { id: 'ships', title: 'Ships & Upgrades', content: ships },
  { id: 'interface', title: 'Interface & Controls', content: interfaceGuide }
]
