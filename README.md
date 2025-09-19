# EcoQuest: The Gamified Sustainability Learning Platform

Welcome to EcoQuest, an interactive web application designed to make learning about environmental sustainability engaging, fun, and effective. Framed within a unique, retro-themed "Eco-OS," this platform combines gamified learning modules, quizzes, and AI-powered tools to create a rich educational experience for both students and teachers.

## User Roles & Features

EcoQuest is designed for different user types, each with a tailored experience.

### Student Experience
Students are the primary learners, engaging with a gamified interface to explore environmental topics.
- **Interactive Learning Games**: Five distinct, narrative-driven games designed to teach core environmental concepts in a hands-on manner.
- **Gamified Progress & Motivation**: Students earn Eco Points, maintain daily streaks, and unlock badges for their achievements, all tracked in their personal dashboard.
- **Leaderboards**: A global leaderboard fosters friendly competition and highlights top performers.
- **AI-Powered Suggestions**: A "For You" section on the dashboard provides personalized learning activity suggestions based on the student's interests, powered by Google's Gemini model through Genkit.

### Teacher Dashboard
Teachers are equipped with powerful tools to monitor educational content and student progress. The teacher interface is a clean, professional dashboard completely separate from the student's gamified desktop.
- **Performance Analytics**: A dashboard provides teachers with insights into student activity, quiz scores, and module completion rates, allowing them to track class progress.
- **Content Management**: Teachers can oversee the learning modules and quizzes available to their students.

### Admin Panel (Future)
An administrative role will be available for platform management, user administration, and overseeing the entire educational ecosystem.

## Core Features Breakdown

### 1. Interactive Learning Games
Five distinct, narrative-driven games designed to teach core environmental concepts:
- **Forest Guardian**: Learn about biodiversity and deforestation by restoring a virtual forest.
- **Ocean Explorer**: Dive into a coral reef to clean up pollution and learn about marine ecosystems.
- **Eco City Builder**: Design a sustainable city, balancing growth with green infrastructure.
- **Recycle Rally**: A fast-paced game to master the art of waste sorting and recycling.
- **Carbon Quest**: Take on the role of a policymaker to tackle climate change and manage carbon emissions.

Each game features a unique animated home screen, a rules/briefing page, and gameplay that integrates educational content seamlessly.

### 2. Gamified Progress & Motivation
- **Progress Tracking**: Users earn Eco Points, maintain daily streaks, and unlock badges for their achievements.
- **Leaderboards**: A global leaderboard fosters friendly competition and highlights top performers.

### 3. Retro "Edu-OS" Interface
- **Themed Desktop**: The entire student-facing app is wrapped in a customizable retro operating system interface, complete with CRT-style window animations, pixel art icons, and video backgrounds.
- **Customizable Themes**: Users can switch between multiple "OS" themes, such as 'The TVA Archives', 'The Vault-Ed Program', and 'The Lumon Method', each with a unique color scheme and font.
- **Window Manager**: "Apps" open in draggable, resizable, and maximizable windows, simulating a real desktop environment.
- **User Authentication**: Secure login and signup powered by Firebase lets users save their progress and access their unique profile. It supports distinct roles for students and teachers.

### Mock AI Features
- **Simulated Personalized Suggestions**: The dashboard displays curated learning activity suggestions from a predefined list.
- **Dynamic Content**: Widgets like the "Eco Fact" widget display rotating environmental facts and tips from a static content pool.

## Technology Stack

EcoQuest is built on a modern, robust, and scalable tech stack.

- **Framework**: **Next.js** (with App Router) for a high-performance, server-rendered React application.
- **Language**: **TypeScript** for type safety and improved developer experience.
- **Mock AI**: Simulated AI features using predefined content and suggestions for demonstration purposes.
- **UI Components**: **ShadCN UI** provides a set of beautifully designed, accessible, and composable components.
- **Styling**: **Tailwind CSS** is used for all styling, with a theming system that allows for easy customization of the retro OS look and feel.
- **Data Storage**: Static JSON files for game data and browser local storage for user progress.
- **Animations**: **CSS Animations** and keyframes are used to create the fluid CRT-style window open/close effects.

## How to Run the Project

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Environment Setup**:
    No additional environment variables are required for the basic functionality. The project uses mock data and simulated features for demonstration purposes.

3.  **Run the Development Server**:
    To run the application locally, start the Next.js development server:
    ```bash
    npm run dev
    ```
    The web application will be available at `http://localhost:9002`.
        
You are now all set up and running locally!
