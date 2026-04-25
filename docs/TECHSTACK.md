# EcoQuest Technology Stack

This document provides a comprehensive overview of the technologies and libraries used to build the EcoQuest application.

## Core Framework & Language

- **Framework**: [Next.js](https://nextjs.org/) (v15.3)
  - We use the App Router for server-rendered components, improved performance, and modern routing capabilities.
- **Language**: [TypeScript](https://www.typescriptlang.org/) (v5)
  - TypeScript provides static typing, enhancing code quality, maintainability, and developer experience.
- **UI Library**: [React](https://react.dev/) (v18.3)
  - The application is built with functional components, hooks, and modern React patterns.

## Mock AI Features

- **Simulated AI**: Mock implementations for demonstration purposes
  - Weather widget uses predefined environmental facts for different themes
  - Learning suggestions are generated from a curated list of activities
  - Dynamic content widgets display rotating environmental tips

## Styling & UI Components

- **CSS Framework**: [Tailwind CSS](https://tailwindcss.com/) (v3.4)
  - A utility-first CSS framework used for all styling. The application features a theming system built with CSS variables to allow for customizable retro "OS" skins.
- **Component Library**: [ShadCN UI](https://ui.shadcn.com/)
  - A collection of beautifully designed, accessible, and composable React components that are used as the foundation for the UI. It is built on top of Radix UI primitives.
- **Icons**: [Lucide React](https://lucide.dev/)
  - Provides a comprehensive set of clean and consistent icons used throughout the application.
- **Animations**: [CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/animation)
  - Used for creating fluid UI animations, including the CRT-style window effects and other interactive elements.

## Backend & Services

- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
  - Secure authentication with credentials and session management.
  - Role-based access control (RBAC) for student and teacher differentiation.
- **Database**: [MongoDB](https://www.mongodb.com/)
  - Persistent storage for user profiles, game progress, badges, and quiz results.
  - Uses [Mongoose](https://mongoosejs.com/) for elegant object modeling and schema validation.
- **Server Environment**: Node.js with Next.js Server Actions and API Routes.

## Other Key Libraries

- **State Management**: React Context & Hooks
  - Used for managing global state such as authentication and theme settings.
- **Data Validation**: [Zod](https://zod.dev/)
  - Used for schema validation in both client-side forms and server-side Genkit flows.
- **Charting**: [Recharts](https://recharts.org/)
  - Used in the teacher dashboard to display performance analytics and student progress visually.
- **Forms**: [React Hook Form](https://react-hook-form.com/)
  - Provides a performant and flexible way to manage forms, used for login and signup.
- **Draggable UI**: [React Draggable](https://github.com/react-grid-layout/react-draggable)
  - Enables the draggable window functionality for the "Edu-OS" desktop interface.
