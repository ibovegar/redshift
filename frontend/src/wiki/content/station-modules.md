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
A reactor that adds **+50 power capacity** to the station. Power Cores are
**repeatable** (like Storage Extensions): each one is a new grid item stacked below
the Power Core slot, capped at **four**, and every module you run draws on the
shared power pool they feed.

Cores fill the column from the top — the first slot is **unavailable** until the
blueprint is researched, then **available**; building one reveals the next slot down.
Because building a Power Core *adds* capacity, it is the **only** thing you can build
when the station is at max power.

- **Build cost:** 10 Copper, 2 Uranium (per core)
- **Requires:** Power Core blueprint researched
- **Maximum:** 4 cores

### Storage Hub
The station's central cargo hub. It holds all of your refined ores and processed
materials, and displays your running total capacity. The Hub itself is
pre-researched and pre-built, so you always have somewhere to put materials.

- **Build cost:** 25 Iron, 15 Carbon
- **Requires:** Engineering Bay operational

### Storage Extension
An add-on cargo pod that grows the station's total storage capacity. Each one you
build adds **+500 capacity** and reveals a new cargo pod on the station model.

Storage Extensions stack **below the Storage Hub** in the Station Layout grid. You
can build **up to three** of them, and the column fills in from the top:

- Only the first slot beneath the hub is shown at the start — **unavailable** until
  the blueprint is researched, then **available** to build. The slots below it stay
  empty.
- Building a pod reveals the rest of the column: the remaining slots appear as
  **unavailable**, the built pod becomes its own **operational** cell, and the next
  slot down turns **available**.
- Each pod is a new grid item — you fill the stack from the top rather than
  re-building the same cell. After the third is built, the column is full.

- **Build cost:** 20 Iron, 15 Carbon (per extension)
- **Requires:** Storage Hub operational + Storage Extension blueprint researched
- **Maximum:** 3 extensions

## Managing storage

Selecting the **Storage Hub** opens the storage view in place of the build grid. It
breaks your cargo down by section so you can see exactly where everything sits:

- **Internal Storage** — the base capacity that ships with the Storage Hub. It is
  always present, even with no extensions built.
- **Storage Extension 1, 2, …** — one section for every Storage Extension you have
  built, each adding its own block of capacity.

Each section shows a **vertical fill bar** and a condensed list of the materials
held in it. The bar colour tells you how full that section is:

- **Green** — plenty of room.
- **Amber** — filling up (around 70% and above).
- **Red** — nearly or completely full (around 90% and above).

Cargo fills **Internal Storage first**. Once it is full, the overflow spills into
the first extension, then the next, and so on — so the lower sections fill before
the higher ones. If a single material crosses a section boundary, you will see part
of it in one section and the remainder in the next.

## Managing power

Every operational module **draws power** from the station's shared pool. The station
starts with a base capacity and each built **Power Core** adds more. Selecting the
**Power Core** module opens the power view, which shows your total capacity, current
consumption, and a breakdown of what is producing and drawing power.

As you bring modules online, consumption climbs toward capacity. When **consumption
reaches capacity**, the station is at max power and **cannot**:

- perform research,
- build ships or upgrades in the Engineering Bay,
- or build new modules.

The one exception is **Power Cores** — you can always build another core to raise
capacity and unlock everything again. (The Power Core blueprint can also still be
researched at max power, so you can never get stuck.) Balancing expansion against
power is part of the game: build cores ahead of demand so a build never strands you.

## Building takes time

Construction is not instant. When you start a build, the station charges the cost
up front and the module enters a timed construction (a few seconds for now).
Different module types build **independently and in parallel** — for example a Power
Core and a Storage Extension can be under construction at the same time. You just
can't start a second build of the *same* type until the current one finishes. When a
build completes, the module flips to *operational* and any bonuses (such as the
storage- or power-capacity bump) are applied.
