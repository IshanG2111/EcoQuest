# EcoQuest: The Gamified Sustainability Learning Platform

Welcome to EcoQuest — an interactive web application that makes learning about environmental sustainability engaging, fun, and effective. Framed within a retro-themed "Eco-OS", EcoQuest combines gamified learning modules, quizzes, and mock AI-powered tools to deliver a rich educational experience for students and teachers.

Live demo (deployed to Vercel): https://ecoquest-woad.vercel.app

Quick links
- Production (Vercel): https://ecoquest-woad.vercel.app

What EcoQuest offers
- Interactive learning games: Forest Guardian, Ocean Explorer, Eco City Builder, Recycle Rally, Carbon Quest.
- Gamified progress: Eco Points, streaks, badges, and leaderboards.
- Student-facing retro "Edu-OS" desktop with draggable/resizable windows and CRT-style animations.
- Teacher dashboard with performance analytics and content management.
- Mock AI features and dynamic content for demo purposes (simulated suggestions and rotating Eco Facts).
- Built with Next.js (App Router) + TypeScript, Tailwind CSS, and ShadCN UI.

Tech stack
- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- UI: shadcn/ui components
- Data & persistence: Static JSON + browser localStorage (mocked/demo)
- Animations: CSS keyframes & transitions
- Authentication (demo): Firebase (mocked behavior in demo; no required env by default)

Getting started (local development)
1. Install dependencies:
   npm install

2. Run the development server:
   npm run dev
   By default the app is configured to run on http://localhost:9002 in development.

3. Build for production locally:
   npm run build
   npm run start
   (These run the Next.js production build and server.)

Environment
- Basic demo functionality requires no environment variables — the project uses mock data and simulated features.
- If you integrate real services (Firebase auth, GenKit / Gemini, or analytics), add the required environment variables in a .env.local file (see Vercel or Firebase docs for the required keys).

Vercel deployment
- This project is deployed to Vercel at: https://ecoquest-woad.vercel.app
- To deploy or update the site on Vercel:
  1. Push your changes to the Git branch connected to the Vercel project (typically `main`).
  2. Vercel will automatically build and deploy the latest commit.
  3. Build command: npm run build (Vercel auto-detects Next.js projects)
  4. Output: Vercel handles Next.js routing automatically.
- Adding a custom domain:
  - Go to your Vercel dashboard → Project → Domains → Add domain.
  - Follow DNS setup instructions provided by Vercel.

Recommended next steps (optional)
- Add a Vercel status badge to the README to show the latest deployment status.
- If you plan to use Firebase or GenKit in production, add a short section documenting required environment variables and secrets.
- Add automated tests and a CI check to run on PRs before merging.

Contributing
- Contributions and bug reports are welcome. Please open issues and PRs in the repo and follow the existing code style (TypeScript + Tailwind).
- If you maintain a contributor guide or code of conduct, link to it here.

License
- Add your project's license information here (e.g., MIT, Apache-2.0).

Acknowledgments
- Built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.
- Concept inspired by gamified learning platforms and eco-education best practices.

---

Deployed site: https://ecoquest-woad.vercel.app
