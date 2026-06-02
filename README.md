# 🌿 EcoQuest: The Immersive Retro Sustainability Edu-OS

```
            ___ ____ ___   ___  _  _ ____ ____ ___
            |__ |    |  \  |  \ |  | |___ [__   |
            |___ |___ |__/  |__/ |__| |___ ___]  |
```

![EcoQuest Preview](./demo.png)

> **"Pioneering the future of environmental education through self-paced, interactive mastery."**

**EcoQuest** is a next-generation gamified learning environment built as a retro-inspired "Edu-OS." It bridges retro operating system aesthetics with modern, data-driven educational mechanics. By transforming complex sustainability concepts into interactive, LeetCode-style progressions, dynamic desktop widgets, and simulated strategy games, EcoQuest makes environmental education highly engaging, accessible, and rewarding.

---

## 🖥️ The Retro "Edu-OS" Desktop Experience

EcoQuest hosts its entire learning interface inside a custom-themed retro operating system environment that mimics desktop applications from the late 20th century.

### 1. The CRT Window Manager
*   **Draggable & Layered Windows**: Uses `React Draggable` to support fully movable window panels (Games, Dashboard, Quizzes, Settings).
*   **CRT Aesthetics**: Styled with CRT monitor scanner lines, phosphor glow effects, custom screen flickers, and vintage retro-bezel frames.
*   **Z-Index Focus**: Focuses active windows dynamically on-click, moving them to the front layer.
*   **Instant Navigation**: All screen transitions and app windows load instantly without distracting loading screens or opening/closing animations, providing an extremely fast, responsive, and glitch-free user interface.

### 2. Multi-Theme Engine
Players can toggle themes from the taskbar, modifying CSS custom variables instantly:
*   **The TVA Archives**: Parchment textures, sepia accents, warm amber temporal hues.
*   **The Vault-Ed Program**: Traditional terminal green phosphor display with high-contrast scanlines.
*   **The Lumon Method**: Minimalist, clinical blue-and-white retro-corporate aesthetic.

### 3. Unified Widgeting & Ultra-Minimal Control Panel (WIDGET_DOCK.SYS)
*   **Unified Widget Shells**: All widgets are framed in a standardized pixel-bezel wrapper that controls dragging, pinning, and closing. The widgets themselves are streamlined—stripped of redundant titlebars, double borders, and duplicate buttons for a highly polished, unified look.
*   **Ultra-Minimal Right-Sidebar Library**: Access the widget controller via a slim, high-contrast right-sidebar control panel (`WIDGET_DOCK.SYS`). Its space-efficient profile lets you toggle widgets on/off instantly while maintaining full visibility and control of your active desktop.
*   **Overlapping Prevention**: Desktop widgets possess coordinate restrictions to ensure they always spawn safely at or below `y: 120px`—vertical clearance that completely prevents clashing with the horizontal desktop icons grid.

---

## 🤖 EcoBot: Chat-Based Onboarding & Terminal Authentication

Rather than filling out traditional forms, registration and login are designed as a conversational command-line interface:
*   **Interactive State Machine**: Guided conversation prompts returning or new recruits step-by-step.
*   **Validation**: Real-time checking of email patterns, username availability, and password lengths.
*   **System Commands**: Supports entering `restart` or `clear` in the input field to reset the session.

---

## 🖱️ Immersive Desktop Widgets

EcoQuest provides interactive desktop widgets that calculate metrics, update states, and let users track environmental tasks in real-time.

### 1. Eco Tiles Calendar Widget
A GitHub-style daily heatmap that logs eco-activity:
*   **Heatmap Intensity**: Tiles color-code from dark zinc to bright lime based on the player's logged XP and carbon savings.
*   **Quick Log Actions**: Users can quick-log daily real-world activities to earn points instantly:
    *   `Ride` (Bike Commute): **+12 XP**, **0.70kg CO₂** saved.
    *   `Recycle` (Waste Sort): **+10 XP**, **0.45kg CO₂** saved.
    *   `Save` (Energy Conservation): **+15 XP**, **0.90kg CO₂** saved.
*   **Streak Tracker**: Displays consecutive days of completed tasks.
*   **Playback Simulation**: Animates through historical logs in a sequence to visualize progression.
*   **Predictive Models**: Forecasts upcoming tiles with expected XP/carbon gains based on past averages.

### 2. Eco Garden Widget (`ECO_GARDEN.SYS`)
A real-time plant care simulation reflecting user learning efforts:
*   **Growth Lifecycle**: Grows a seedling across five distinct phases: Sprout (🌱) ➔ Seedling (🌿) ➔ Sapling (☘️) ➔ Flowering Sprout (🌸) ➔ Mighty Oak (🌳).
*   **Decay Loops**: Hydration decays by 2% per hour. If hydration hits 0%, the plant becomes withered (🥀).
*   **Actions & Point Economics**:
    *   *Water*: Costs **10 XP** ➔ **+25% Hydration**, **+12% Growth**.
    *   *Fertilize*: Costs **20 XP** ➔ **+10% Hydration**, **+30% Growth**.
    *   *Revive*: Costs **40 XP** ➔ **60% Hydration**, **-15% Growth** penalty.
    *   *Harvest*: Available only at Stage 5 (Mighty Oak). Awards **+250 XP**, resets stage to Sprout, and increments the permanent "Trees Harvested" counter.

### 3. Fact Widget (`ECO_FACT.SYS`)
A double-sided flip card displaying verified ecological facts loaded from `/api/eco-facts`:
*   **Front Side**: Features categories (waste, ocean, energy, forests, transport, etc.), difficulty levels (easy, medium, hard), and the raw fact.
*   **Back Side**: Flips to reveal "Why It Matters" (scientific explanation) and "Your Action" (actionable everyday tip).

### 4. Pixel Weather Widget
An environmental status indicator matching the selected desktop skin:
*   **Themed Layouts**: Forest/Clear (TVA), Ocean/Clouds (Lumon), City/Rain (Vault-Ed) with parallax background layers.
*   **Micro-Facts**: Displays relevant regional micro-facts that cycle on refresh.

---

## 🎮 The Game Suite (EcoPlay Subsystem)

EcoQuest includes six interactive, data-driven games configured under `src/lib/games.ts` and loaded dynamically into the OS window manager:

| Game | Internal Route | Gameplay Mechanics | Educational Concept |
| :--- | :--- | :--- | :--- |
| **Eco City Builder** | `/play/eco-city-builder` | Balances population growth, happiness, green energy %, and clean air level against policy cards. Real-time trend graphs. | Sustainable urban planning, resource management, and grid planning. |
| **Reef Rescue** | `/play/ocean-explorer` | A 12-cell coral reef grid affected by thermal spikes. Spend points to apply Antidote, Cool Water, or Restore Coral before cells die. | Ocean acidification, coral bleaching, and biodiversity. |
| **Carbon Crunch** | `/play/carbon-quest` | 8 rounds of real-world lifestyle choices (transport, food, energy) with a 15s timer. Manages district carbon level (0-100%). | Carbon footprints, green consumer alternatives, and emission factors. |
| **Forest Defender** | `/play/forest-guardian` | REST API / local event model. Plant trees, clean streams, and clear weeds. Defend against random events like wildfires and pests. | Deforestation, ecosystem restoration, and habitat protection. |
| **Waste Wizard** | `/play/recycle-rally` | Sort waste items into Recycle, Compost, Landfill, or E-Waste in 30s. Streak multipliers reward consecutive correct answers. | Waste segregation, circular economy, and recycling rules. |
| **Migration Map** | `/play/migration-map` | World map expedition tracing wildlife migration routes. Answer questions about migration cues under a 14s timer. | Climate-driven animal migration, habitat fragmentation, and biomes. |
| **Physical Archive** | `/play/physical-archive` | 3D interactive cartridge shelf built with React Three Fiber and Framer Motion. Select cartridges with fly-to-front animations. | Immersive game selection hub with retro physical media aesthetics. |

*Session Tracker Hook (`useGameSessionTracker`)*: Automatically tracks game session time, player scores, and custom metadata, syncs it to MongoDB, and updates student profiles.

---

## 🧠 Educational Quiz & Assessment Engine

*   **Dynamic Question Banks**: Loads quiz content from modular JSON pools located in `/lib/game-data`.
*   **Contextual Styles**: Utilizes accessible, high-contrast states (`quiz-correct` / `quiz-incorrect` styles maintaining a 4.5:1 contrast ratio) to indicate answer validity.
*   **Progression Tracking**: Rewards players with XP, streaks, and custom badges on completion.

---

## 📊 Student Dashboard & Leaderboards

*   **XP Ranks**: Ranks are calculated at 500 XP steps, mapping to themed titles:
    1.  *Seedling*
    2.  *Sprout*
    3.  *Sapling*
    4.  *Eco Warrior*
    5.  *Green Knight*
    6.  *Earth Guardian*
    7.  *Planet Protector*
*   **Badges Achievement Panel**: Renders earned badges dynamically with descriptive cards.
*   **Global Leaderboards**: Displays competitive brackets (weekly/monthly) syncing user ranks globally.

---

## 🛠️ Technical Stack & Architecture

EcoQuest is built using a modern, scalable web stack optimized for rapid builds and high performance:

*   **Framework**: [Next.js 15.3](https://nextjs.org/) (App Router, Turbopack, Server Actions)
*   **Language**: [TypeScript](https://www.typescriptlang.org/) (Type-safe schemas, props, and states)
*   **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) for collections:
    *   *Users*: Profiles, login hashes, roles (student/teacher).
    *   *Progress*: Cumulative XP, streaks, badges earned, activity logs.
    *   *GameSessions*: Tracking play times, scores, and metadata.
*   **Authentication**: [NextAuth.js v5](https://next-auth.js.org/) (Beta) for secure session management.
*   **State Syncing**: [SWR](https://swr.vercel.app/) for client-side queries and updates.
*   **Styling**: [Tailwind CSS v3.4](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/) (Radix Primitives).
*   **Utilities**: React Draggable, Lucide React, Recharts.

---

## 🔌 Offline / Standalone HTML Games Spec

For offline environments or simple iframe wrappers, the `/games` directory contains standalone, lightweight single-file HTML implementations:
*   **Standalones**: `carbon-crunch.html`, `forest-defender.html`, `migration-map.html`, `physical-archive.html`, `reef-rescue.html`, `waste-wizard.html`.
*   **Specs**: Zero-dependency bundles under 500KB. Playable with mouse/touch only. Uses Web Audio API for synthetic retro SFX, Google Fonts for styling, and includes start/play/end screens with actionable green tips.

---

## ⚡ Getting Started (Local Development)

### 1. Prerequisites
*   Node.js (v18.0.0 or higher)
*   MongoDB (v6.0 or higher, local instance or Atlas URI)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/IshanG2111/EcoQuest.git
cd EcoQuest
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root folder using this schema:
```env
# MongoDB Connection
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/ecoquest?retryWrites=true&w=majority"

# NextAuth Config
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="use-a-32-byte-hexadecimal-secret-key-here"

# App Ports & Environment
PORT=3000
NODE_ENV="development"
```

### 4. Database Setup
The application uses Mongoose to automatically generate schemas. However, it is recommended to set up the following index in your MongoDB shell for optimal performance:
```javascript
db.users.createIndex({ email: 1 }, { unique: true });
db.progress.createIndex({ userId: 1 });
```

### 5. Running the Application
*   **Development**: Run the Next.js development server with Turbopack:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.
*   **Production**: Build and run optimized bundles:
    ```bash
    npm run build
    npm run start
    ```

---

## 📂 Project Directory Structure

```
EcoQuest/
├── docs/                       # Architectural specs & rulebooks
│   ├── ARCHITECT.md            # Original UI design and specifications
│   ├── GAMERULES.md            # Mechanics & equations for play subsystem
│   ├── OVERVIEW.md             # High-level software demonstration script
│   └── TECHSTACK.md            # Technical decisions & third-party libraries
├── games/                      # Standalone single-file HTML games
├── public/                     # Static assets (images, videos, icons)
├── src/
│   ├── app/                    # Next.js App Router (Pages, APIs, Layouts)
│   │   ├── (app)/              # Session-protected routes
│   │   │   ├── dashboard/      # Student profile & suggestions panel
│   │   │   ├── desktop/        # OS home workspace layout
│   │   │   ├── leaderboard/    # Rankings & global stats
│   │   │   ├── play/           # The six interactive games
│   │   │   └── quizzes/        # Assessments list
│   │   ├── api/                # Backend routes (auth, progress, facts)
│   │   ├── login/ & signup/    # EcoBot chatbot authentication forms
│   │   └── globals.css         # Global tailwind imports & CSS theme vars
│   ├── components/             # Reusable UI widgets and containers
│   │   ├── ui/                 # ShadCN primitives
│   │   └── widgets/            # OS desktop widgets (Calendar, Garden, Fact, Weather)
│   ├── hooks/                  # Custom state hooks (auth, SWR wrappers, trackers)
│   └── lib/                    # Shared configurations, database clients, static data
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Developed with ❤️ by [IshanG2111](https://github.com/IshanG2111).
