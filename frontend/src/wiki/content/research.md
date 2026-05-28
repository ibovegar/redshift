# Research & Blueprints

Before you can build most things, you have to **research** their blueprint in the
Research Lab. Research costs materials and takes time, and blueprints are arranged
in a dependency tree — each one unlocks the next.

## The research tree

```
Command Module
└── Research Lab
      ├── Engineering Bay
      │     ├── Tellus RX 5   (support)     → engine, stabilizer, weapons
      │     ├── Cygnus F-35   (fighter)     → deflector, stabilizer, weapons
      │     ├── Drax 22       (interceptor) → engine, stabilizer, weapons
      │     ├── Hammerhead 2  (scout)       → deflector, stabilizer, weapons
      │     └── Vanguard      (bomber)      → engine, plating, stabilizer, weapons
      ├── Power Core
      └── Storage Hub
            └── Storage Extension
```

**Command Module**, **Research Lab**, and **Storage Hub** are pre-researched on a
fresh station — you start with them already unlocked.

## How research works

1. Open the **Research Tree** and pick a blueprint that is unlocked (its parent
   must already be researched).
2. Spend the listed materials to start the research.
3. Wait for the timer. Research runs in the background while you do other things.
4. When it finishes, the blueprint is **researched** — you can now build whatever it
   targets (a module in the Station Layout, or a ship/upgrade in the Engineering Bay).

Only **one research task can run at a time**. The queue capacity is 1, so you finish
(or cancel) the current research before starting another.

## Module blueprint costs

| Blueprint | Cost | Research time |
| --- | --- | --- |
| Command Module | Free | Instant (pre-researched) |
| Research Module | Free | Instant (pre-researched) |
| Storage Hub | Free | Instant (pre-researched) |
| Engineering Bay | 15 Iron, 5 Copper | ~3s |
| Power Core | 10 Copper, 2 Uranium | ~3s |
| Storage Extension | 15 Iron, 8 Carbon | ~3s |

Note that the **research cost** of a module's blueprint is separate from the
**build cost** of the module itself (see *Station Modules*). You pay both: first to
unlock the schematic, then to construct the section.

## Ship & upgrade blueprints

Ship blueprints branch off the Engineering Bay, and each ship's add-ons branch off
that ship. Researching a ship lets you manufacture it; researching an add-on lets
you attach that upgrade. See **Ships & Upgrades** for the full roster.
