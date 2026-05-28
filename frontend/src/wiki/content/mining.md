# Mining & Asteroids

All of your materials come from the asteroid belts surrounding Gateway Station.
Mining is the supply side of the gameplay loop — everything you research and build
is ultimately paid for with ore you extract here.

## The belts

Asteroids are spread across three regions of the field — a **near** belt, a **far**
belt, and the main **belt**. Each asteroid is a distinct body with its own size,
composition, and physical properties.

## Scanning

Asteroids start **unscanned** — you can see the rock, but not what is inside it.
Scanning an asteroid reveals its full stat profile:

- **Class** — the asteroid's compositional type (see below).
- **Mass & density** — how big and how dense the body is.
- **Surface temperature, rotation period, magnetic field** — physical traits.
- **Deposits** — which materials it holds, and how rich they are.

Always scan before committing a ship to a long extraction run — a barren rock is not
worth the fuel.

## Asteroid classes

| Class | Typical composition |
| --- | --- |
| C | Carbonaceous — carbon, water ice, silicates |
| S | Silicaceous (stony) — iron, silicates, nickel |
| M | Metallic — iron, copper, titanium, gold |
| V | Volatile-rich — water ice, helium-3 |
| X | Exotic — rare and precious materials, antimatter |

## Deposits, abundance & purity

Each deposit on an asteroid has three properties:

- **Abundance** — how much of the material is present (the size of the deposit).
- **Purity** — the quality factor; higher purity yields more usable material per
  unit mined.
- **Rarity** — the tier of the material, from *common* to *exotic* (see *Materials*).

## Extraction & depletion

Once scanned, an asteroid can be mined. Extracted material is loaded into your
ship's cargo hold (limited by the ship's **cargo capacity**), then transferred to
the Storage Hub when the ship returns and docks. Asteroids are a finite resource —
mine one long enough and it becomes **depleted**, after which it yields nothing
further. Keep scanning new rocks to stay ahead of demand.

## Fuel

Deploying a ship to the belt consumes **fuel**. Each ship has a fuel tank
(`maxFuel`) and a `fuelConsumption` rate; plan runs so you do not strand a ship far
from the station. Watch the fuel gauge in the ship status panel.
