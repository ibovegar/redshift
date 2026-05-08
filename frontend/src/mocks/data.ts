import type { Mission, Spacecraft, Upgrade, UserStats } from 'models'

export const user: UserStats = {
  credits: 998999999
}

export const spacecrafts: Spacecraft[] = [
  {
    name: 'Cygnia F35',
    spacecraftRegistry: 'cygf35',
    manufacturer: 'Cygnia Corporation',
    manufactured: 2157,
    storeType: 'spacecraft',
    type: 'fighter',
    height: 219,
    length: 456,
    price: 4550000,
    baseStats: {
      speed: 60,
      hull: 50,
      shield: 10,
      damage: 0,
      manuvrability: 10
    },
    condition: 95,
    fuel: 88,
    id: '1',
    attachedUpgrades: []
  },
  {
    name: 'Draxon SA-22',
    spacecraftRegistry: 'drax22',
    manufacturer: 'Epsilon Laboratories',
    manufactured: 2191,
    storeType: 'spacecraft',
    type: 'interceptor',
    height: 12,
    length: 80,
    price: 3055555,
    baseStats: {
      speed: 10,
      hull: 30,
      shield: 80,
      damage: 60,
      manuvrability: 80
    },
    condition: 71,
    fuel: 42,
    id: '2',
    attachedUpgrades: []
  },
  {
    name: 'Tellus RX 5',
    spacecraftRegistry: 'tellrx5',
    manufacturer: 'Cygnia Corporation',
    manufactured: 2157,
    storeType: 'spacecraft',
    type: 'support',
    height: 219,
    length: 456,
    price: 5000000,
    baseStats: {
      speed: 45,
      hull: 70,
      shield: 55,
      damage: 20,
      manuvrability: 35
    },
    condition: 82,
    fuel: 64,
    id: '3',
    attachedUpgrades: []
  }
]

export const upgrades: Upgrade[] = [
  {
    name: 'Cryson Particle Booster IA-2',
    upgradeRegistry: 'cygf35_stabilizer',
    spacecraftRegistry: 'cygf35',
    manufacturer: 'Cryson & Billard Engineering',
    storeType: 'stabilizer',
    price: 200000,
    gain: 52,
    id: '1',
    isAttached: true,
    spacecraftId: '1'
  },
  {
    name: 'Shield Aggregator AUT1',
    upgradeRegistry: 'cygf35_deflector',
    spacecraftRegistry: 'cygf35',
    manufacturer: 'Epsilon-X Laboratories',
    storeType: 'deflector',
    price: 350000,
    gain: 10,
    id: '2',
    isAttached: true,
    spacecraftId: '1'
  },
  {
    name: 'Cylino BEAM-CBE',
    upgradeRegistry: 'cygf35_weapons',
    spacecraftRegistry: 'cygf35',
    manufacturer: 'Cryson & Billard Engineering',
    storeType: 'weapons',
    price: 800000,
    gain: 21,
    id: '3',
    isAttached: true,
    spacecraftId: '1'
  },
  {
    name: 'Gentec FF Fieler',
    upgradeRegistry: 'drax22_stabilizer',
    spacecraftRegistry: 'drax22',
    manufacturer: 'Gentech MIL Corp.',
    storeType: 'stabilizer',
    price: 1000000,
    gain: 24,
    id: '4',
    isAttached: true,
    spacecraftId: '2'
  },
  {
    name: 'Crystalin Turret',
    upgradeRegistry: 'drax22_weapons',
    spacecraftRegistry: 'drax22',
    manufacturer: 'Gentech MIL Corp.',
    storeType: 'weapons',
    price: 500000,
    gain: 27,
    id: '5',
    isAttached: true,
    spacecraftId: '2'
  },
  {
    name: 'Alpha-stream Enhancer MKI',
    upgradeRegistry: 'drax22_engine',
    spacecraftRegistry: 'drax22',
    manufacturer: 'ANTEC Laboratories',
    storeType: 'engine',
    price: 500000,
    gain: 20,
    id: '6',
    isAttached: true,
    spacecraftId: '2'
  },
  {
    name: 'Gentec FF Fieler',
    upgradeRegistry: 'drax22_stabilizer',
    spacecraftRegistry: 'drax22',
    manufacturer: 'Gentech MIL Corp.',
    storeType: 'stabilizer',
    price: 1000000,
    gain: 24,
    id: 'b6M0A8L1EJ0',
    isAttached: true,
    spacecraftId: '2'
  }
]

export const missions: Mission[] = [
  {
    id: 'm1',
    type: 'salvage',
    inProgress: false,
    completed: false,
    title: 'Daemolous wreckage',
    description:
      'Gravity beam warp core single molecule transcription nebula cloaking device seismic detector, proton bursts level 3 diagnostic black star dalekanium. Macrobinoculars data sphere matter condensation android coolant, positronic network, piller-filler airlock jigowatt thermal detonator. Warp drive wormhole soul extractor plutonium antiproton quantum torpedos, shields phaser banks temporal stabiliser servomotors. Thermal detonator gunstick subspace dimension vault, antiproton, cloaking device soul extractor phaser banks tachyon particles shields. Sonic screwdriver transporters visualiser coolant plasma coolant antiproton weapon, warp nacelle, plutonium temporal stabiliser Kirk Gibson Jr. Slugger 2000 adjustable bat. Warp core breech dilithium crystal matter-antimatter implosion macrobinoculars thought-cube graviton burst warp drive android matter condensation stellar cartography.',
    shortDescription: 'Lorem ipsum dolor sit amet',
    credits: 4000000,
    difficulty: 'medium',
    constellation: 'Corvus',
    distance: 45,
    ascention: '12h 01m 53.0s',
    declination: '−18° 52′ 10″'
  },
  {
    id: 'm2',
    type: 'mining',
    inProgress: false,
    completed: false,
    title: 'Asteroid XBF-1342',
    description:
      'Jigowatt deflector dish sporocystian lifeform temporal displacement homing beacon psycho-kinetic threshold manipulator psychic paper, The Scenery Channel single molecule transcription matter-antimatter implosion. Cloaking field antiproton weapon quantum torpedos progenitor black star plutonium quarantine beacon temporal paradox gunstick turbolift. Temporal vortex tachyon particles skeletoid dilithium crystal thermal exhaust port cloaking device mobile emitter inverse phasing polycarbide chronoforge. Ripple effect visualiser gravity well hover conversion, The Scenery Channel psycho-kinetic threshold manipulator schizoid accelerator temporal paradox power drain matter-antimatter implosion. Truth field macrobinoculars temporal vortex ryetalyn tachyon particles transwarp conduits carbon scoring mobile emitter warp core dalekanium. Time circuits seismic detector Kirk Gibson Jr. Slugger 2000 adjustable bat hydrator temporal displacement gravity beam thermal exhaust port level 3 diagnostic probes timeship.',
    shortDescription: 'Lorem ipsum dolor sit amet',
    credits: 4000000,
    difficulty: 'medium',
    constellation: 'Corvus',
    distance: 17.3,
    ascention: '12h 56m 43.696s',
    declination: '+21° 40′ 57.57″'
  },
  {
    id: 'm3',
    type: 'rescue',
    inProgress: false,
    completed: true,
    title: 'NCC-Triton emergancy broadcast',
    description:
      'Antiproton crucible energy core interplexing beacon depolarised Midochlorians temporal paradox airlock progenitor dalekanium space-time continuum. Psychic paper warp core single molecule transcription carbon scoring transwarp coil data sphere, telepathic-barrier mobile emitter train locomotive truth field. Wormhole turbolift homing beacon coolant plasma torpedo subspace replicator temporal shift energy field macrobinoculars. Chameleon arch matter condensation warp drive deflector grille replicator seismic detector, cochranes hydrator hoverboard schizoid accelerator. Ripple effect crucible energy core voltoscope transmat time machine warp engine, dilithium crystal space-time continuum time windows soul extractor. Deuterium stasis cube temporal paradox turbolift mobile emitter, non-corporeal hover conversion nanoprobes gravity beam tachyon beam.',
    shortDescription: 'Lorem ipsum dolor sit amet',
    credits: 1000000,
    difficulty: 'easy',
    constellation: 'Corvus',
    distance: 11.1,
    ascention: '09h 55m 33.2s',
    declination: '+69° 3′ 55″'
  },
  {
    id: 'm4',
    type: 'tactical',
    inProgress: false,
    completed: false,
    title: 'Prevent cygvin harvest',
    description:
      'Gravity bubble antiproton weapon android stasis cube deflector grille, bio-electric dampening field power converter, space-time continuum airlock phototropic shielding. Truth field polycarbide plasma coolant thought-cube, relativity map, gravity beam data sphere, soul extractor quantum torpedos scene screen. Transwarp conduits time vortex dalekanium sporocystian lifeform, chameleon arch phaser banks jigowatt, time corridor Kirk Gibson Jr. Slugger 2000 adjustable bat energy field. Phaser banks black star truth field warp drive gravity beam quantum slipstream drive hyperspace wormhole, mobile emitter phototropic shielding neutrino emissions. Antiproton Theta radiation telepathic-barrier restraining bolt replicator ripple effect moisture vaporators, proton bursts quantum phase wormhole. Subsonic field emitter sensor beam transwarp conduits scene screen android dalekanium, progenitor plutonium navcomputer temporal displacement.',
    shortDescription: 'Lorem ipsum dolor sit amet',
    credits: 8000000,
    difficulty: 'hard',
    constellation: 'Corvus',
    distance: 33,
    ascention: '12h 36m 34.3s',
    declination: '+11° 14′ 17″'
  },
  {
    id: 'm5',
    type: 'exploration',
    inProgress: false,
    completed: false,
    title: 'Investigate unknown broadcast',
    description:
      'Progenitor antiproton weapon transwarp coil temporal stabiliser paradox cloaking field, computer sphere warp drive wormhole transwarp conduits. Hyperspace wormhole warp nacelle impulse engines piller-filler Theta radiation, sporocystian lifeform positronic network psychic paper macrobinoculars jigowatt. Cloaking device inverse phasing carbon scoring phaser banks time corridor quarantine beacon homing beacon tachyon particles soul extractor timeship. Gravity beam subsonic field emitter matter condensation non-corporeal airlock probes, bio-electric dampening field deflector dish dalekanium plasma torpedo. Restraining bolt tachyon beam replicator paradox, temporal stabiliser nebula transmat, stellar cartography gravity well gunstick. Plasma coolant seismic detector psycho-kinetic threshold manipulator homing beacon temporal displacement scene screen schizoid accelerator reverse tachyon-chronon deflector grille time machine.',
    shortDescription: 'Lorem ipsum dolor sit amet',
    credits: 100,
    difficulty: 'unknown',
    constellation: 'Corvus',
    distance: 120,
    ascention: '126h 10m 73.1s',
    declination: '+91° 10′ 89.5″'
  }
]

export const store: (Spacecraft | Upgrade)[] = [
  {
    name: 'Draxon SA-22',
    spacecraftRegistry: 'drax22',
    manufacturer: 'Epsilon Laboratories',
    manufactured: 2191,
    storeType: 'spacecraft',
    type: 'interceptor',
    height: 12,
    length: 80,
    price: 3055555,
    baseStats: {
      speed: 10,
      hull: 30,
      shield: 80,
      damage: 60,
      manuvrability: 80
    },
    id: 'xlx_JF5wn2s',
    condition: 100,
    fuel: 100,
    attachedUpgrades: []
  },
  {
    name: 'Cygnia F35',
    spacecraftRegistry: 'cygf35',
    manufacturer: 'Cygnia Corporation',
    manufactured: 2157,
    storeType: 'spacecraft',
    type: 'fighter',
    height: 219,
    length: 456,
    price: 4550000,
    baseStats: {
      speed: 60,
      hull: 50,
      shield: 10,
      damage: 0,
      manuvrability: 10
    },
    id: 'ZlxiBZwJNzQ',
    condition: 100,
    fuel: 100,
    attachedUpgrades: []
  },
  {
    name: 'Hammerhead 2',
    spacecraftRegistry: 'hamm2',
    manufacturer: 'Cygnia Corporation',
    manufactured: 2157,
    storeType: 'spacecraft',
    type: 'scout',
    height: 219,
    length: 456,
    price: 2999999,
    baseStats: {
      speed: 60,
      hull: 50,
      shield: 10,
      damage: 0,
      manuvrability: 10
    },
    id: '7HPjuzsjfqA',
    condition: 100,
    fuel: 100,
    attachedUpgrades: []
  },
  {
    name: 'Vanguard SAR',
    spacecraftRegistry: 'vanguard',
    manufacturer: 'Cygnia Corporation',
    manufactured: 2157,
    storeType: 'spacecraft',
    type: 'bomber',
    height: 219,
    length: 456,
    price: 1900000,
    baseStats: {
      speed: 60,
      hull: 50,
      shield: 10,
      damage: 0,
      manuvrability: 10
    },
    id: '2xicbh7qnyM',
    condition: 100,
    fuel: 100,
    attachedUpgrades: []
  },
  {
    name: 'Tellus R X5',
    spacecraftRegistry: 'tellrx5',
    manufacturer: 'Cygnia Corporation',
    manufactured: 2157,
    storeType: 'spacecraft',
    type: 'support',
    height: 219,
    length: 456,
    price: 5000000,
    baseStats: {
      speed: 60,
      hull: 50,
      shield: 10,
      damage: 0,
      manuvrability: 10
    },
    id: '91jnAAKoBKg',
    condition: 100,
    fuel: 100,
    attachedUpgrades: []
  },
  {
    name: 'Gentec FF Fieler',
    upgradeRegistry: 'drax22_stabilizer',
    spacecraftRegistry: 'drax22',
    manufacturer: 'Gentech MIL Corp.',
    storeType: 'stabilizer',
    price: 1000000,
    gain: 24,
    id: 'z8sz9Dm0xPw'
  },
  {
    name: 'Alpha-stream Enhancer MKI',
    upgradeRegistry: 'drax22_engine',
    spacecraftRegistry: 'drax22',
    manufacturer: 'ANTEC Laboratories',
    storeType: 'engine',
    price: 500000,
    gain: 20,
    id: 'MY387pb0WYE'
  },
  {
    name: 'Crystalin Turret',
    upgradeRegistry: 'drax22_weapons',
    spacecraftRegistry: 'drax22',
    manufacturer: 'Gentech MIL Corp.',
    storeType: 'weapons',
    price: 500000,
    gain: 27,
    id: '8V2xMXiTQu4'
  },
  {
    name: 'Cylino BEAM-CBE',
    upgradeRegistry: 'cygf35_weapons',
    spacecraftRegistry: 'cygf35',
    manufacturer: 'Cryson & Billard Engineering',
    storeType: 'weapons',
    price: 800000,
    gain: 21,
    id: '2k2cMXz83Sw'
  },
  {
    name: 'Cryson Particle Booster IA-2',
    upgradeRegistry: 'cygf35_stabilizer',
    spacecraftRegistry: 'cygf35',
    manufacturer: 'Cryson & Billard Engineering',
    storeType: 'stabilizer',
    price: 200000,
    gain: 52,
    id: 'Atcrfn3KAHE'
  },
  {
    name: 'Shield Aggregator AUT1',
    upgradeRegistry: 'cygf35_deflector',
    spacecraftRegistry: 'cygf35',
    manufacturer: 'Epsilon-X Laboratories',
    storeType: 'deflector',
    price: 350000,
    gain: 10,
    id: 'Cz582zPM0do'
  },
  {
    name: 'Sungrazer MOD-1',
    upgradeRegistry: 'tellrx5_engine',
    spacecraftRegistry: 'tellrx5',
    manufacturer: 'Pritech Industries',
    storeType: 'engine',
    price: 420000,
    gain: 52,
    id: 'RPoYzLNLcg4'
  },
  {
    name: 'GXX Ion-tracker',
    upgradeRegistry: 'tellrx5_stabilizer',
    spacecraftRegistry: 'tellrx5',
    manufacturer: 'Pritech Industries',
    storeType: 'stabilizer',
    price: 390000,
    gain: 52,
    id: 'EAwUvkJ-ynw'
  },
  {
    name: 'Advanced Weapons System',
    upgradeRegistry: 'tellrx5_weapons',
    spacecraftRegistry: 'tellrx5',
    manufacturer: 'Cryson & Billard Engineering',
    storeType: 'weapons',
    price: 560000,
    gain: 52,
    id: 'O5ZeVbCHmlM'
  },
  {
    name: 'Precision DEX-Wing ',
    upgradeRegistry: 'hamm2_stabilizer',
    spacecraftRegistry: 'hamm2',
    manufacturer: 'Pratney Mechanical',
    storeType: 'stabilizer',
    price: 790500,
    gain: 52,
    id: '2DuNXJWLPfc'
  },
  {
    name: 'Craft Lazer MIL22',
    upgradeRegistry: 'hamm2_weapons',
    spacecraftRegistry: 'hamm2',
    manufacturer: 'Pratney Mechanical',
    storeType: 'weapons',
    price: 810000,
    gain: 52,
    id: 'otwCJwqS300'
  },
  {
    name: 'Pratney Shield Generator',
    upgradeRegistry: 'hamm2_deflector',
    spacecraftRegistry: 'hamm2',
    manufacturer: 'Cygnia Corporation',
    storeType: 'deflector',
    price: 390100,
    gain: 52,
    id: 'B0h5dCvNf4g'
  },
  {
    name: 'Gentec Puls Dampener',
    upgradeRegistry: 'hamm2_deflector',
    spacecraftRegistry: 'hamm2',
    manufacturer: 'Gentech MIL Corp.',
    storeType: 'deflector',
    price: 370500,
    gain: 16,
    id: '3MpWtNPsli8'
  },
  {
    name: 'Alpha-stream Enhancer BX-22',
    upgradeRegistry: 'vanguard_engine',
    spacecraftRegistry: 'vanguard',
    manufacturer: 'Epsilon Laboratories',
    storeType: 'engine',
    price: 410200,
    gain: 52,
    id: 'UDLQfzXirF8'
  },
  {
    name: 'GXS Ion-subductor',
    upgradeRegistry: 'vanguard_stabilizer',
    spacecraftRegistry: 'vanguard',
    manufacturer: 'ANTEC Laboratories',
    storeType: 'stabilizer',
    price: 133700,
    gain: 52,
    id: 'InvL-I0xqN0'
  },
  {
    name: 'Gatling-rail enforcer',
    upgradeRegistry: 'vanguard_weapons',
    spacecraftRegistry: 'vanguard',
    manufacturer: 'ANTEC Laboratories',
    storeType: 'weapons',
    price: 390400,
    gain: 52,
    id: 'fJoDOMXdxPI'
  },
  {
    name: 'Tritinum-Boron plating ',
    upgradeRegistry: 'vanguard_plating',
    spacecraftRegistry: 'vanguard',
    manufacturer: 'Gentech MIL Corp.',
    storeType: 'plating',
    price: 412000,
    gain: 52,
    id: 'A5Q93DaDFw0'
  }
]
