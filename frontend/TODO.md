Feat:
remove travel line panning when travelling.
refactor static assets and move to a game_data folder. Get suggestions regarding structuring.
Performace fix (use pre created 3d models for ateroids etc.)
Login and splash screens screen

Module hierarchy:

Command module -> Research -> Engineering, power, storage (requires blueprint from research)
Research -> Tellus modules -> next ship with modules -> Next ship repeat
Engineering -> Items are avaiable for contruction when blueprint is researched

Game loop.
This a space survival game where expansion is restricted by the amount of fuel and resources. Find new artifact to research more effecient ways of travel. Mining system is necessary to gather more resource, including fuel. When entering a new system, a checkpoint is made by creating a depot and a manufacturing facility, capable of creating it's own resources like fuel.

1. Start with a single ship with scanner capabilities and only ion thruster and a small home space station. Scan asteroids to gather water to create fuel. Fuel is needed for movement. If empty while moving, use the station tractor beam to get you home. Fuels is always created from a process called ???, but you move a lot faster with dx12 (ion fueld). 
Start by showing the entire planet and asteroid belt. Show a little dot with a fancy UI element that show you ship as selected and a name. WHen press, zoom in an open option, e.g. move. When pressing move, zoom out, and make it possible to select an asteroid. When close, show scanner. Scan eiter comes clean or show resources. If resouces, start mining. Then retur home to collect.
2. Gather enough resources (metal and ???) to build a engineering facility. Use the facility to create a mining ship to speed up roucourse gathering and also gatherig special resource, needed to create a research facilty. Mining sips can be automated.
3. When you have a research facility con can create a scout ship with longer distance. This is when you can start expanding the reach, and introducing more of the solar system, giving more hot spots (shipwreck with special resources and blueprints, big asteroid, alien artifact etc.) to gather resources, and finding new elements needed for advanced research and engineering.

Ship travel & maintenance:
- While traveling, fuel, hull, and shield are slowly reduced
- Shield comes later in the game after research
- Shield is reduced before hull, making maintenance less time-consuming once unlocked
- Requires ongoing maintenance to keep ship operational

Progression & expansion:
- Research and manufacture ships with greater travel distance
- When a new ship tier is built, the map zooms out revealing more of the system
- Planet gets smaller and smaller — feel the scale of expansion
- More points of interest appear: shipwrecks, big asteroids, alien artifacts, etc.

Base building:
- Expand the ship with modular sections (like altars), or build space stations
- Stations serve as checkpoints with depots and manufacturing