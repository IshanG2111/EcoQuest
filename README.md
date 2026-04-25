# 🌿 EcoQuest: The Immersive Sustainability Edu-OS

[![EcoQuest Preview](https://lh3.googleusercontent.com/d/1OiK1YyheQw5NHd1ZOy66rhT6SLbvd30F)](https://drive.google.com/file/d/1OiK1YyheQw5NHd1ZOy66rhT6SLbvd30F/view?usp=sharing)

> **"Saving the planet, one pixel at a time."**

**EcoQuest** is a next-generation gamified learning platform designed as a retro-inspired "Edu-OS." It transforms complex environmental sustainability concepts into engaging, interactive experiences for students while providing powerful analytics for educators.

---

## 🚀 Key Features

### 🖥️ Immersive "Edu-OS" Desktop
Step into a fully functional, draggable, and resizable window-based operating system.
*   **Themed Experiences:** Switch between three distinct aesthetics:
    *   **The TVA Archives:** A nostalgic parchment-and-amber temporal aesthetic.
    *   **The Vault-Ed Program:** A high-contrast green phosphor terminal experience.
    *   **The Lumon Method:** A clean, corporate minimalist blue-and-white design.
*   **Interactive Widgets:** Real-time environmental facts, daily briefings, and weather-aware sustainability tips.
*   **Draggable Windows:** Manage your learning space just like a classic desktop.

### 🎮 The Game Suite (Learning through Play)
Five data-driven games with randomized scenarios and progressive difficulty:
1.  **Forest Guardian:** Restore a degraded virtual forest and manage ecosystem health.
2.  **Ocean Explorer:** Clean up coral reefs using specialized marine tools in a race against time.
3.  **Eco City Builder:** A policy-driven simulation where you balance population, happiness, and green energy.
4.  **Recycle Rally:** A high-speed waste-sorting challenge to build real-world recycling habits.
5.  **Carbon Quest:** Step into the shoes of a global policymaker to avert climate crisis through strategic decisions.

### 🧠 Advanced Learning System
*   **Terminal Auth:** A unified, terminal-style chat interface for seamless login and signup.
*   **Knowledge Library:** Interactive quizzes with dynamic question pools and instant visual feedback.
*   **Leaderboards:** Compete globally and climb the ranks of "Eco-Champions."
*   **Personalized Progress:** Earn points, maintain daily streaks, and unlock unique achievement badges.

### 👩‍🏫 Educator Suite
*   **Teacher Dashboard:** Comprehensive analytics to monitor student performance, engagement levels, and quiz results.
*   **Content Management:** Tools to manage quizzes and track classroom progress at scale.

---

## 🛠️ Technical Excellence

Built with a cutting-edge modern stack designed for performance and scalability:

*   **Frontend:** [Next.js 15](https://nextjs.org/) (App Router) + [TypeScript](https://www.typescriptlang.org/)
*   **Backend:** [MongoDB](https://www.mongodb.com/) (Database) + [NextAuth.js](https://next-auth.js.org/) (Authentication)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [ShadCN UI](https://ui.shadcn.com/)
*   **Animations:** [CSS Keyframes](https://developer.mozilla.org/en-US/docs/Web/CSS/animation) + [React Draggable](https://github.com/react-grid-layout/react-draggable)
*   **Charts:** [Recharts](https://recharts.org/) for performance analytics.

---

## 📂 Project Structure & Documentation

Detailed documentation is available in the [`/docs`](./docs) directory:

- [**OVERVIEW.md**](./docs/OVERVIEW.md): Comprehensive software demonstration script and architecture breakdown.
- [**TECHSTACK.md**](./docs/TECHSTACK.md): Detailed look at our technology choices and libraries.
- [**GAMERULES.md**](./docs/GAMERULES.md): In-depth breakdown of the logic and mechanics behind every game.
- [**ARCHITECT.md**](./docs/ARCHITECT.md): The original design vision and UI/UX blueprint.

---

## ⚡ Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### Setup
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/IshanG2111/EcoQuest.git
    cd EcoQuest
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure environment variables:**
    Create a `.env.local` file based on `.env.local.example` and add your MongoDB URI and NextAuth secrets.
4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Access the app at [http://localhost:3000](http://localhost:3000).

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Developed with ❤️ for a Greener Future.
