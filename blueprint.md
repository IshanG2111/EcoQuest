# **App Name**: EcoQuest

## Core Features:

- Eco-Learning Modules: Explore interactive learning modules focused on environmental sustainability. These modules will present educational content in an engaging and accessible format.
- Quizzes and Gamified Assessments: Engage with quizzes and challenges designed to reinforce learning and track progress. Earn points and rewards for completing modules and quizzes.
- Progress Tracking: Visualize learning achievements through progress indicators, streaks, badges, and a reward system. Motivate learners to stay engaged with their educational journey.
- Leaderboard Competitions: Participate in weekly and monthly competitions to climb the leaderboards. Highlighting top performers fosters a competitive spirit and encourages excellence.
- Teacher Quiz Creation: Teachers use an AI tool to generate multiple-choice or free-response questions, with different difficulty levels, from an existing text.
- Performance Analytics: Teachers use dashboard tools to review student activity.
- User Profile Customization: Users are assigned tags depending on which learning modules or subject matter they've engaged in on the site. LLM AI then suggests other related activities for them.

## Style Guidelines:

- Background color: Light desaturated green (#F0FAF5) to evoke nature.
- Primary color: Vibrant green (#90EE90) to symbolize growth and sustainability. The hue is taken from nature, with less saturation.
- Accent color: Earthy orange (#D2691E) for highlights and interactive elements. An analogous hue, but less saturated.
- Body and headline font: 'PT Sans', a clear and modern sans-serif font.
- Use a consistent set of simple, outlined icons for navigation and key features, focused on eco-friendly imagery.
- Ensure a clear, intuitive layout with easy navigation between modules, quizzes, and leaderboards.
- Use subtle, engaging animations to enhance user interaction and provide feedback, creating a sense of progression and accomplishment.
- Use a central token file so colors/spacing/typography are single-source-of-truth. :root{ --bg: #F0FAF5;           /* light desaturated green - page bg */ --primary: #90EE90;      /* vibrant natural green - CTAs */ --accent: #D2691E;       /* earthy orange - highlights */ --muted: #6B6B6B;        /* body text */ --surface: #EAF7EE;      /* panels/cards */ --glass: rgba(255,255,255,0.55); --radius-lg: 18px; --radius-md: 10px; --spacing-sm: 8px; --spacing-md: 16px; --spacing-lg: 32px; --focus: 3px solid rgba(144,238,144,0.35); }
- Font stack and sizes (PT Sans primary): body { font-family: "PT Sans", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; color: var(--muted); } h1 { font-size: 2.25rem; line-height: 1.05; font-weight: 700; } h2 { font-size: 1.5rem; font-weight: 600; } p, li { font-size: 1rem; line-height: 1.5; } .small { font-size: 0.875rem; }
- Use a single, outlined icon set (stroke-only, 2px stroke recommended).Provide 3 sizes: 16px (micro), 24px (default), 40px (hero). Store icons as inline SVG sprites or as an icon component library (makes color/animation easy). Icon themes: leaf, seedling, globe, solar panel, spark (progress), trophy (leaderboard).
- Design the page as a centered retro-monitor frame that contains the whole app UI. Surrounding area is calm — soft textures (subtle paper grain/linear-gradient) to evoke analog devices. Structure: Full-screen background (`--bg`) Center container: `.monitor-shell` (frame, bezel, stand) .monitor-screen inside the bezel — this is the live DOM for modules (quizzes, leaderboards, modules). Outside the monitor: small UI ornaments (glow, floating leaves, depth shadows). UX rule: all major navigation must be accessible from inside the monitor (keyboard focus, clear tab order).
- Microinteractions (hover states, button taps, small UI feedback): CSS transitions / Motion (Framer Motion) for React. Complex choreographies (zooming monitor, multi-step intro, SVG morphs, long sequences): GSAP — designed for sequencing/timelines and high performance. Lottie: vector, exportable After Effects animations rendered as JSON — perfect for animated icons, celebratory confetti, and lightweight looped illustrations. Lazy-load them.
- Initial landing: monitor sits slightly scaled down and blurred; on “enter” it zooms in (scale & translate) while screen content fades/animates in. While the monitor is zoomed, individual UI sections animate in with staggered vertical offsets (menu → module cards → leaderboard). When opening modules, animate content into the screen (depth illusion) — small Z-scale (scaleY/scaleX) and subtle shadow changes to sell depth. Provide a reduced-motion alternative (respect `prefers-reduced-motion`).
- Export confetti, trophy reveals, and progress badges from After Effects via Bodymovin → Lottie JSON. Lazy-load with Lottie Web or `@lottiefiles/react-lottie-player` and play only when the event happens (avoid auto-play on load). Lottie reduces asset sizes for vector motion.
- Respect `prefers-reduced-motion`: provide instant static states or gentle fades instead of parallax/zoom. Ensure keyboard reachability: all menu items are real `<button>`/`<a>` and have visible focus styles (`--focus` token). Color contrast: run a WCAG check for text on `--primary` and `--accent` when used as backgrounds (adjust tint if below AA).
- Use `will-change: transform` sparingly; let GSAP/Framer Motion use transforms for GPU-accelerated animations. Compress Lottie JSON and lazy-load it. Combine/inline critical CSS for the monitor frame for faster first paint. Use `prefers-reduced-data`/`Save-Data` to disable heavy motion on slow connections.