import type { AttachedUpgrades, AvailableUpgrades, Spacecraft, Upgrade } from 'models'
import { UpgradeSelect } from './UpgradeSelect/UpgradeSelect'

interface Props {
  spacecraft: Spacecraft
  availableUpgrades: AvailableUpgrades
  attachedUpgrades: AttachedUpgrades
  onDeselectUpgrade: (upgradeType: Upgrade) => void
  onSelectUpgrade: (oldUpgrade: Upgrade, newUpgrade: Upgrade) => void
  onHoverUpgrade?: (upgradeType: string) => void
  onHoverEnd?: () => void
}

export const UpgradeControls = (props: Props) => {
  const {
    availableUpgrades: available,
    attachedUpgrades: attached,
    onSelectUpgrade,
    onDeselectUpgrade,
    onHoverUpgrade,
    onHoverEnd
  } = props

  // TODO: figure out why I render twice
  // console.log('render controls', upgrades);

  return (
    <>
      <UpgradeSelect
        type="Deflector "
        value={attached.deflector}
        options={available.deflector}
        onDeselect={() => onDeselectUpgrade(attached.deflector)}
        onSelect={(option: Upgrade) => onSelectUpgrade(attached.deflector, option)}
        onHover={() => onHoverUpgrade?.('deflector')}
        onHoverEnd={onHoverEnd}
      />
      <UpgradeSelect
        type="Engine"
        value={attached.engine}
        options={available.engine}
        onDeselect={() => onDeselectUpgrade(attached.engine)}
        onSelect={(option: Upgrade) => onSelectUpgrade(attached.engine, option)}
        onHover={() => onHoverUpgrade?.('engine')}
        onHoverEnd={onHoverEnd}
      />
      <UpgradeSelect
        type="Plating"
        value={attached.plating}
        options={available.plating}
        onDeselect={() => onDeselectUpgrade(attached.plating)}
        onSelect={(option: Upgrade) => onSelectUpgrade(attached.plating, option)}
        onHover={() => onHoverUpgrade?.('plating')}
        onHoverEnd={onHoverEnd}
      />
      <UpgradeSelect
        type="Stabilizer"
        value={attached.stabilizer}
        options={available.stabilizer}
        onDeselect={() => onDeselectUpgrade(attached.stabilizer)}
        onSelect={(option: Upgrade) => onSelectUpgrade(attached.stabilizer, option)}
        onHover={() => onHoverUpgrade?.('stabilizer')}
        onHoverEnd={onHoverEnd}
      />
      <UpgradeSelect
        type="Weapons"
        value={attached.weapons}
        options={available.weapons}
        onDeselect={() => onDeselectUpgrade(attached.weapons)}
        onSelect={(option: Upgrade) => onSelectUpgrade(attached.weapons, option)}
        onHover={() => onHoverUpgrade?.('weapons')}
        onHoverEnd={onHoverEnd}
      />
    </>
  )
}
