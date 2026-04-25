# 🌍 EcoPlay — Ecological Conservation Learning Games
## Ground Rules & Design Specification

---

## Overview

**EcoPlay** is a suite of browser-based, single-file interactive learning games centered around ecological conservation. Each game is thematically distinct, teaches a specific conservation concept, and is playable without any external dependencies beyond Google Fonts and native browser APIs.

---

## The Games

| # | Title | Theme | Core Concept |
|---|-------|-------|-------------|
| 1 | **Carbon Crunch** | Industrial city skyline | Carbon footprint tracking & green swaps |
| 2 | **Reef Rescue** | Underwater coral reef | Ocean acidification & coral restoration |
| 3 | **Forest Defender** | Canopy tower-defense | Deforestation & biodiversity protection |
| 4 | **Waste Wizard** | Retro sorting arcade | Waste segregation & recycling |
| 5 | **Migration Map** | World map puzzle | Climate-driven animal migration |

---

## Ground Rules

### 1. Educational Integrity
- Every game mechanic must directly mirror a **real conservation concept**.
- Each game must display at least **one real ecological fact** per round or significant action.
- Difficulty scaling should reflect real-world urgency (e.g., more pollution = harder gameplay).

### 2. Interaction Design
- All games must be **fully playable with mouse/touch only** — no keyboard required.
- Each game must include a **Start screen** (with rules), **Play state**, and **End screen** (with score + fact learned).
- Games must be **completable in under 5 minutes** per session.
- Feedback must be **immediate and clear** — every action gets a visual + textual response.

### 3. Visual & Audio Design
- Each game must have a **unique visual theme and color palette** — no two games may share an aesthetic.
- Animations must feel **alive and organic**, not robotic or stiff.
- All emojis and icons used must be **thematically consistent** within each game.
- No external audio libraries — use the **Web Audio API** for any sound effects.

### 4. Scoring & Progress
- All games must have a **visible score or progress tracker**.
- Final scores must map to a **conservation impact metaphor** (e.g., "You saved 3 hectares of forest!").
- Encourage replay through **randomized content** (shuffled questions, randomized spawn positions, etc.).

### 5. Code Standards
- Each game is a **single self-contained HTML file** with inline CSS and JS.
- No external JS frameworks or game engines.
- All files must be **under 500KB** (uncompressed).
- Must render correctly on **desktop and mobile** (min 320px width).

### 6. Accessibility
- All interactive elements must have **visible focus states**.
- Color choices must maintain **4.5:1 contrast ratio** for text.
- Emoji usage must have **aria-label equivalents** for screen readers.
- Font sizes must be **minimum 14px** for body text.

### 7. Content Guidelines
- Frame conservation as **empowering and hopeful**, not doom-and-gloom.
- Always show the **positive impact** of the player's correct choices.
- Include **one actionable real-world tip** on the end screen.

---

## Ecological Facts Pool

Each game draws from this verified fact pool:

- 1 million plant and animal species face extinction due to human activity (IPBES, 2019).
- Coral reefs support 25% of all marine life despite covering less than 1% of the ocean floor.
- Tropical forests absorb ~2.6 billion tonnes of CO₂ per year.
- Only 9% of all plastic ever produced has been recycled.
- Over 1,000 bird species are threatened by climate-driven habitat loss.
- The ocean has absorbed 90% of excess heat from global warming since 1970.
- Restoring 30% of degraded ecosystems could prevent 70% of projected extinctions.
- The average American produces 4.4 lbs (2 kg) of trash per day.
- Mangrove forests store up to 10x more carbon per hectare than terrestrial forests.
- Since 1970, monitored wildlife populations have declined by an average of 69% (WWF).

---

## File Naming Convention

```
carbon-crunch.html
reef-rescue.html
forest-defender.html
waste-wizard.html
migration-map.html
```

---

## Delivery Checklist

- [ ] Start screen with game name, brief rules, and "Play" button
- [ ] Core gameplay loop functional
- [ ] Score/progress displayed during gameplay
- [ ] At least 1 ecological fact shown during/after play
- [ ] End screen with score, conservation metaphor, real-world tip
- [ ] Mobile responsive
- [ ] Unique visual theme distinct from other games in the suite
- [ ] Single self-contained HTML file

---

*EcoPlay — Learning through play, protecting through understanding.*
