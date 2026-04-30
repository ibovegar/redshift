import type { Upgrade } from 'models'

type UpgradeType = Upgrade['storeType']
type MeshMap = Record<string, Record<UpgradeType, string[]>>

export const meshMap: MeshMap = {
  cygf35: {
    engine: [],
    stabilizer: ['GXX_L-Wing-A001', 'GXX_L-Wing-A002'],
    weapons: ['GXX_L-Prop-A001', 'GXX_L-Prop-A002'],
    deflector: ['GXX_L-Prop-E001', 'GXX_L-Prop-E002'],
    plating: ['GXX_L-LaserX003', 'GXX_L-LaserX004']
  },
  drax22: {
    engine: ['GXX_L-Prop-B001', 'GXX_L-Prop-B002'],
    stabilizer: ['GXX_L-Wing-B001', 'GXX_L-Wing-B002'],
    weapons: ['GXX_L-Prop-F001', 'GXX_L-Prop-F002'],
    deflector: ['GXX_L-M-Launcher001', 'GXX_L-M-Launcher002'],
    plating: []
  },
  tellrx5: {
    engine: ['GXX_L-Prop-A003', 'GXX_L-Prop-A004'],
    stabilizer: ['GXX_L-Wing-C001', 'GXX_L-Wing-C002', 'GXX_L-Prop-E003', 'GXX_L-Prop-E004'],
    weapons: ['GXX_L-Laser-Ion001', 'GXX_L-Laser-Ion002'],
    deflector: [],
    plating: []
  },
  hamm2: {
    engine: [],
    stabilizer: ['GXX_L-Wing-D001', 'GXX_L-Wing-D002'],
    weapons: ['GXX_L-LaserX005', 'GXX_L-LaserX006'],
    deflector: ['GXX_L-Prop-B003', 'GXX_L-Prop-B004'],
    plating: []
  },
  vanguard: {
    engine: ['GXX_L-Prop-D001', 'GXX_L-Prop-D002'],
    stabilizer: ['GXX_L-Wing-A005', 'GXX_L-Wing-A007'],
    weapons: ['GXX_L-LaserX007', 'GXX_L-LaserX008'],
    deflector: [],
    plating: [
      'GXX_L-Rack001',
      'GXX_L-Rack002',
      'GXX_L-MissileB001',
      'GXX_L-MissileB002',
      'GXX_L-MissileA001',
      'GXX_L-MissileA002'
    ]
  }
}
