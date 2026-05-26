import { CommandInfo } from './CommandInfo/CommandInfo'
import { EngineeringInfo } from './EngineeringInfo/EngineeringInfo'
import { PowerInfo } from './PowerInfo/PowerInfo'
import { ResearchInfo } from './ResearchInfo/ResearchInfo'
import { StorageInfo } from './StorageInfo/StorageInfo'
import type { InfoPanelProps } from './types'

// Dispatcher only — each module type has its own view in a sibling folder. Each view renders
// its own Status row off `status`, so the same component handles locked / available / operational.
export const InfoPanel = (props: InfoPanelProps) => {
  switch (props.type) {
    case 'command':
      return <CommandInfo {...props} />
    case 'engineering':
      return <EngineeringInfo {...props} />
    case 'power':
      return <PowerInfo {...props} />
    case 'storage':
      return <StorageInfo {...props} />
    case 'research':
      return <ResearchInfo {...props} />
  }
}
