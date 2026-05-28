# Station Modules

Your station is made up of **modules** (also called sections). Each one has a job,
a build cost, and a place in the dependency chain — you cannot build a module until
the module it depends on is operational *and* its blueprint has been researched.

## Module states

Every module is always in one of three states:

- **Locked** — prerequisites are not met yet. You cannot build it.
- **Available** — researched and unlocked; ready to build if you can afford it.
- **Operational** — built and running.

## The modules

### Command Module
The central hub of the station. It coordinates docking, logistics, and the
construction of every other module. It is operational from the very start and is
the root of the whole tech tree.

### Research Lab
A dedicated facility for developing blueprints — ships, ship add-ons, and advanced
station modules. It produces no raw materials; its only job is research. Unlocking
it opens the rest of the tree.

- **Build cost:** 20 Iron, 10 Copper
- **Requires:** Command Module operational

### Engineering Bay
A heavy fabrication bay for manufacturing ships and ship upgrades. It also performs
structural repairs on docked spacecraft. This module gates the entire ship tree.

- **Build cost:** 30 Iron, 15 Titanium
- **Requires:** Research Lab operational

### Power Core
A reactor that provides additional power capacity to the station. High-draw modules
depend on it to stay online.

- **Build cost:** 20 Copper, 5 Uranium
- **Requires:** Engineering Bay operational

### Storage Hub
The station's central cargo hub. It holds all of your refined ores and processed
materials, and displays your running total capacity. The Hub itself is
pre-researched and pre-built, so you always have somewhere to put materials.

- **Build cost:** 25 Iron, 15 Carbon
- **Requires:** Engineering Bay operational

### Storage Extension
An add-on cargo pod that grows the station's total storage capacity. Each one you
build adds **+500 capacity** and reveals a new cargo pod on the station model.

- **Build cost:** 20 Iron, 15 Carbon
- **Requires:** Storage Hub operational + Storage Extension blueprint researched

## Building takes time

Construction is not instant. When you start a build, the station charges the cost
up front and the module enters a timed construction (a few seconds for now). Only
**one build can run at a time** — the grid will block other Build buttons until the
current one finishes. When it completes, the module flips to *operational* and any
bonuses (such as the storage-capacity bump) are applied.
