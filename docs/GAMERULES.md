# EcoQuest: Game Rules & Logic (Enhanced)

Each EcoQuest game has been refined to be dynamic, data-driven, and progressively challenging. Instead of repeating the same tasks, games now use randomized scenarios and difficulty scaling. Under the hood, each game loads its content from JSON data (no external API calls), shuffles events or items, and updates challenge levels based on player progress. This keeps the gameplay fresh and educational.

## 1. Forest Guardian

**Objective:** Restore a degraded virtual forest. The player increases the "Ecosystem Health" meter to 100% by taking conservation actions and earns "Guardian Points" for each success.

### Game State:
- **Ecosystem Health:** 0–100% (starts at 50%).
- **Guardian Points:** Total score (starts at 0).
- **Challenge Events:** Occasionally, random events occur (e.g., wildfires, pest outbreaks) that temporarily lower Ecosystem Health unless addressed.

### Gameplay Loop:
1. The screen shows various problem areas (e.g., an "Empty Patch," "Invasive Weeds," or "Polluted Stream") that need fixing.
2. The player selects an action from a toolbar (e.g., "Plant Tree," "Remove Weeds," "Clean Stream") or directly clicks on a problem area.
3. Correct actions instantly improve the forest. Example: planting a tree in an empty area raises health and points; removing weeds or cleaning water yields larger gains.

### Actions & Effects:
- **Plant Tree** (on "Empty Patch"): +5% health, +10 points.
- **Remove Weeds** (on "Invasive Weeds"): +10% health, +20 points.
- **Clean Stream** (on "Polluted Stream"): +3% health, +5 points.
(Newly added actions: as difficulty increases, additional tasks like building a "Rainwater System" or "Wildlife Habitat" appear, with higher costs and bigger benefits.)

### Dynamic Enhancements:
- Every few actions, the game triggers a random "Event" from the data (e.g., a sudden storm or forest fire). The player must quickly use the appropriate tool (provided in the toolbar) to mitigate it. For example, a fire event might require repeatedly clicking a “Water Extinguisher” action to stop health from falling. This unpredictability keeps the game engaging.
- As the player’s points grow, the game subtly increases difficulty: problem areas regenerate faster, and new problem types (e.g., "Erosion" zones) appear. This automatic scaling prevents monotony and ensures steady challenge.

### Data (JSON):
The game logic uses internal data. A sample structure might be:
```json
{
  "areas": [
    {"type": "EmptyPatch",    "action": "PlantTree",   "healthGain": 5,  "points": 10},
    {"type": "InvasiveWeeds", "action": "RemoveWeeds", "healthGain": 10, "points": 20},
    {"type": "PollutedStream","action": "CleanStream", "healthGain": 3,  "points": 5}
  ],
  "events": [
    {"name": "Wildfire", "responseAction": "UseWaterExtinguisher", "healthChange": -20, "probability": 0.1},
    {"name": "PestInfestation", "responseAction": "SprayPesticide", "healthChange": -15, "probability": 0.1},
    {"name": "Storm", "responseAction": "PlantTrees", "healthChange": 0, "probability": 0.05}
  ],
  "difficultyScale": [
    {"scoreThreshold": 100, "newAreas": ["Erosion"], "regenRateMultiplier": 1.2},
    {"scoreThreshold": 200, "newAreas": ["DroughtPatch"], "regenRateMultiplier": 1.5}
  ]
}
```
In this design, the game randomly chooses problems and events from the lists above. The `probability` field controls event frequency. When the player’s score crosses a threshold, new challenges unlock, and timers speed up (increased `regenRateMultiplier`), implementing dynamic difficulty.

---

## 2. Ocean Explorer

**Objective:** Clean up a polluted coral reef. Raise the "Marine Health" meter to 100% by using the correct tools on reef problems.

### Game State:
- **Marine Health:** 0–100% (starts at 40%).
- **Current Tool:** One of several cleanup tools (initially "Grabber Claw").
- **Trash Items:** The reef is populated by random items (trash, old nets, bleached coral, oil patches) that appear over time.

### Gameplay Loop:
1. The player rotates through tools on a tool-wheel (e.g., "Grabber Claw," "Net Cutter," "Algae Applicator," "Skimmer").
2. A problem item floats into view (from the data list, randomized order).
3. The player selects the appropriate tool and clicks the item before it drifts away. Success increases Marine Health; mistakes or delays have no benefit.

### Actions & Effects:
- **Grabber Claw** (for "Trash"): +10% health, earns points.
- **Net Cutter** (for "Fishing Net"): +20% health.
- **Algae Applicator** (for "Bleached Coral"): +15% health.
- **Skimmer** (for "Oil Patch"): +5% health.
(The data includes many trash types, not just one “Trash” entity. For example, items like "Plastic Bottle," "Soda Can," "Oil Spill," "Fishing Net," etc., each mapping to a correct tool. This variety uses data-driven design to keep each round different.)

### Dynamic Enhancements:
- Items appear with increasing speed or frequency as time goes on, shortening the response window (dynamic difficulty).
- New tools and corresponding hazards unlock at higher levels. For example, a "Chemical Dispenser" tool might appear to neutralize a chemical spill event.
- Periodically, a special event (like a rare “Poisonous Spill” or “Endangered Species Rescue”) challenges the player to act quickly, adding novelty.

### Data (JSON):
Example structure:
```json
{
  "tools": [
    {"id": "grabber", "name": "Grabber Claw"},
    {"id": "cutter", "name": "Net Cutter"},
    {"id": "algae", "name": "Algae Applicator"},
    {"id": "skimmer", "name": "Skimmer"}
  ],
  "hazards": [
    {"name": "PlasticBag",       "tool": "grabber", "healthGain": 10},
    {"name": "FishingNet",       "tool": "cutter",  "healthGain": 20},
    {"name": "BleachedCoral",    "tool": "algae",   "healthGain": 15},
    {"name": "OilSpill",         "tool": "skimmer", "healthGain": 5},
    {"name": "Battery",          "tool": "grabber", "healthGain": 8},
    {"name": "MicroplasticPile", "tool": "grabber", "healthGain": 5}
  ],
  "difficultyScale": [
    {"healthThreshold": 50,  "spawnRate": 1.5},
    {"healthThreshold": 80,  "spawnRate": 2.0, "newHazards": ["ToxicWaste"]}
  ]
}
```
The game randomly spawns items from the `hazards` list. The "tool" field ensures only the correct tool fixes it. As `MarineHealth` rises, the game increases `spawnRate` and may add new hazard types.

---

## 3. Eco City Builder

**Objective:** Grow a sustainable city by balancing population growth, green energy, citizen happiness, and CO₂ emissions. The player enacts policies to maintain a thriving, eco-friendly city.

### Game State:
- **Population:** Current city population (resource; starts at 500).
- **Happiness:** 0–100% (starts at 40%).
- **Green Energy:** Percentage of power from renewables (0–100%, starts at 20%).
- **Clean Air:** A meter representing 100 – CO₂% (starts at 80, meaning 20% pollution).
- **Year:** Advances each turn (for flavor, though not required).
- **Alerts:** Random events (e.g., "Heatwave," "Economic Boom," "Protests") appear as alerts affecting stats.

### Gameplay Loop:
1. An alert/event is shown (e.g., “Heatwave is causing drought” or “Budget surplus available!”).
2. The player chooses one policy or project from multiple options. Each has a Population cost and affects other stats.
3. The effects apply immediately, then new alerts or events appear in the next turn.

### Actions & Effects (Example Policies):
- **Build Solar Farm:** Cost: 50 population. Effects: +10 Green Energy, –5 CO₂, +5 Happiness.
- **Build Wind Turbines:** Cost: 100 population. Effects: +15 Green Energy, –10 CO₂, +10 Happiness.
- **Create City Park:** Cost: 20 population. Effects: +0 Green Energy, –2 CO₂, +15 Happiness.
- **Promote Public Transit:** Cost: 30 population. Effects: +5 Green Energy, –8 CO₂, +10 Happiness.
- **Congestion Charge:** Cost: 10 population. Effects: +0 Green Energy, –5 CO₂, +8 Happiness.
- **(Negative option) Permit New Factory:** Gain: –20 population (people move out), Effects: –5 Green Energy, +10 CO₂, +15 budget.
(These are examples; the game loads policy data from a JSON list. New policies appear as the city grows, allowing a dynamic city simulation.)

### Constraints:
The player can only enact policies if they have enough population (the population acts like “currency”). If population drops too low or happiness hits 0, the game warns the player or ends in a failure state.

### Dynamic Enhancements:
- After each turn, random events from data may trigger additional effects (e.g., a "Tech Innovation" event that boosts green energy, or a "Pollution Spike" that reduces clean air). This randomness ensures no two games play exactly alike.
- As the population grows, more ambitious projects unlock in the data (e.g., "Nuclear Plant," "Vertical Farms"). These have higher costs and bigger impacts, scaling difficulty with progress.
- The UI clearly shows interactive graphs (population, energy, CO₂) that update in real time, helping players make strategic decisions.

### Data (JSON):
Sample:
```json
{
  "policies": [
    {"name": "Build Solar Farm",      "costPop": 50,  "greenEnergy": 10, "co2Change": -5,  "happiness": 5},
    {"name": "Build Wind Turbines",   "costPop": 100, "greenEnergy": 15, "co2Change": -10, "happiness": 10},
    {"name": "Create City Park",      "costPop": 20,  "greenEnergy": 0,  "co2Change": -2,  "happiness": 15},
    {"name": "Promote Public Transit","costPop": 30,  "greenEnergy": 5,  "co2Change": -8,  "happiness": 10},
    {"name": "Congestion Charge",     "costPop": 10,  "greenEnergy": 0,  "co2Change": -5,  "happiness": 8},
    {"name": "Permit New Factory",    "costPop": -20, "greenEnergy": 0,  "co2Change": 10,  "happiness": -5, "budget": 50}
  ],
  "events": [
    {"name": "Heatwave",    "happiness": -10, "co2Change": 5},
    {"name": "TechInnovation", "greenEnergy": 5, "budget": 20},
    {"name": "Protest",    "happiness": -15, "co2Change": -3}
  ],
  "difficultyScale": [
    {"population": 1000, "unlockPolicies": ["Build Nuclear Plant"], "eventFrequency": 1.2},
    {"population": 2000, "unlockPolicies": ["Implement Carbon Tax"], "eventFrequency": 1.5}
  ]
}
```
This data drives the game: policies are shown as choices, events happen randomly (with a certain chance each turn), and new options unlock as the city grows, adding complexity.

---

## 4. Recycle Rally

**Objective:** Sort waste correctly to build recycling habits. Score as many points as possible by dragging items to the right bin within 30 seconds.

### Game State:
- **Score:** In-game points (starts at 0).
- **Time Left:** 30-second countdown.
- **Current Item:** The waste object to sort.
- **Streak:** Number of consecutive correct sorts (starting at 0).

### Gameplay Loop:
1. When the timer starts, waste items appear one by one (randomly chosen from a list).
2. The player clicks (or drags) the current item into one of four bins: "Recycle," "Compost," "Landfill," "E-Waste."
3. Correct placement increases score and streak; incorrect placement resets the streak (and subtracts points).

### Scoring Rules:
- **Correct Sort:** `score += 10 × (streak + 1)`; then `streak++`. (Rewards longer combos.)
- **Incorrect Sort:** `score = max(score - 10, 0)`; `streak = 0`.

Example items (the game actually uses a larger pool, defined in data): "Apple Core" → "Compost," "Glass Bottle" → "Recycle," "Battery" → "E-Waste," "Pizza Box" → "Landfill," etc.

### Dynamic Enhancements:
- The list of items is randomized each playthrough to keep it fresh. Later levels can introduce harder-to-categorize items (e.g., a dirty pizza box that goes in compost, or a light bulb → E-Waste) to increase challenge.
- As time passes, items spawn faster or even stack up, forcing quicker decisions. This gradual speed-up is a form of dynamic difficulty.
- **Power-ups:** Occasionally, a golden item appears (e.g., a "Compost King" banana peel) that grants extra time or double points if sorted correctly.

### Data (JSON):
Example:
```json
{
  "items": [
    {"name": "AppleCore",    "bin": "Compost"},
    {"name": "GlassBottle",  "bin": "Recycle"},
    {"name": "Newspaper",    "bin": "Recycle"},
    {"name": "PizzaBox",     "bin": "Landfill"},
    {"name": "Battery",      "bin": "E-Waste"},
    {"name": "MetalCan",     "bin": "Recycle"},
    {"name": "BananaPeel",   "bin": "Compost"},
    {"name": "LampBulb",     "bin": "E-Waste"}
  ],
  "powerUps": [
    {"name": "GoldenBanana", "bin": "Compost", "effect": {"extraTime": 5}},
    {"name": "Shield",       "bin": "N/A", "effect": {"noPenalty": true}, "chance": 0.02}
  ],
  "difficultyScale": [
    {"scoreThreshold": 100, "spawnRate": 1.2},
    {"scoreThreshold": 200, "spawnRate": 1.5}
  ]
}
```
The `items` array contains all waste types and correct bins. The game logic selects items at random. The `powerUps` offer occasional bonuses. As the player’s score increases, `spawnRate` (items per second) rises, making sorting faster and more challenging.

---

## 5. Carbon Quest

**Objective:** As a global policymaker, balance a national budget, public approval, and atmospheric CO₂ to avert climate crisis. Each turn is one year where you enact policies.

### Game State:
- **Year:** Calendar year (starts at 2024).
- **Budget:** Funds in billions (starts at 100).
- **CO₂ Level:** Atmospheric CO₂ in ppm (starts at 420).
- **Public Approval:** 0–100% (starts at 50).
- **Event Log:** Narrative description of last year’s policy outcome.

### Gameplay Loop:
1. Each year, the player is offered 3–4 random "Policy Cards" from the data list. Each card shows its effects on CO₂, approval, and cost.
2. The player chooses one policy to implement (as long as the budget covers its cost).
3. The chosen policy’s effects apply: CO₂ adjusts, approval shifts, and the budget is spent or gained. The annual budget also increases by a fixed 50 (economic growth). Year increments by 1. The event log updates with the policy name and its outcomes.

### Policy Examples:
- **Invest in Reforestation:** Effects: CO₂ –10 ppm, Approval +5%, Cost 20.
- **Implement Carbon Tax:** Effects: CO₂ –20 ppm, Approval –10%, Cost 0.
- **Subsidize EVs:** Effects: CO₂ –5 ppm, Approval +10%, Cost 30.
- **Build Coal Plant:** Effects: CO₂ +25 ppm, Approval –15%, Cost –10 (budget gain).
(A larger, data-driven list of policies is available; each has a name, CO₂ effect, approval effect, and cost. For example, policies like "Upgrade Public Transit," "Ban Single-Use Plastics," "Expand National Park," etc.)

### Constraints:
A policy can only be chosen if `Budget + yearlyIncrease >= cost`. If CO₂ rises too high or approval plummets too low (custom breakpoints from data), the game ends. Otherwise, the game continues indefinitely as a sandbox simulation.

### Dynamic Enhancements:
- The game randomly shuffles policy choices each turn, so players can’t rely on always picking the same card. New policies appear as the year increases (e.g., "Green New Deal" in 2030).
- Random Global Events can occur (from data), such as a "Heatwave" (causes a sudden +5 ppm CO₂ and –5 approval) or an "Economic Boom" (budget +20). These require the player to adapt their strategy.
- Difficulty scales with time: as years go on, the negative consequences of high CO₂ (e.g., approval drop from a heatwave) become larger, reflecting the urgency of climate action.

### Data (JSON):
Example:
```json
{
  "policies": [
    {"title": "Invest in Reforestation",    "co2": -10, "approval": 5,  "cost": 20},
    {"title": "Implement Carbon Tax",       "co2": -20, "approval": -10,"cost": 0},
    {"title": "Subsidize EVs",              "co2": -5,  "approval": 10, "cost": 30},
    {"title": "Build New Coal Plant",       "co2": 25,  "approval": -15,"cost": -10},
    {"title": "Expand Solar Infrastructure", "co2": -15, "approval": 3,  "cost": 25},
    {"title": "Ban Single-Use Plastics",    "co2": -3,  "approval": 8,  "cost": 5}
  ],
  "events": [
    {"name": "Heatwave",   "year": 2025, "co2": 5,  "approval": -5},
    {"name": "EconomicBoom","year": 2030,"budget": 20},
    {"name": "Climate Accord","year": 2027,"co2": -8, "approval": 10, "cost": 0}
  ],
  "difficultyScale": [
    {"year": 2030, "co2GrowthRate": 1.1},
    {"year": 2040, "co2GrowthRate": 1.3}
  ]
}
```
Here, each turn the game randomly selects a few policies from `policies`. The `events` list triggers special occurrences in specific years. As time passes, a higher `co2GrowthRate` simulates worsening baseline emissions if no action is taken, forcing players to prioritize stronger measures.
