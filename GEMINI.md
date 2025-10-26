# Project Overview

This is a web application called "TheyCare Portal", which appears to be a Barangay Management System. It's built with a modern tech stack, featuring a React frontend and a Node.js backend. The system manages health services, daycare operations, and SK (Sangguniang Kabataan) youth engagement programs for Philippine local government units.

## Frontend

The frontend is a React application built with Vite, TypeScript, and styled with Tailwind CSS and shadcn-ui. It uses React Router for navigation and includes features like user authentication, dashboards, and various management modules. The frontend is also configured as a Progressive Web App (PWA).

**Key Technologies:**

*   **React:** A JavaScript library for building user interfaces.
*   **Vite:** A fast build tool for modern web development.
*   **TypeScript:** A typed superset of JavaScript.
*   **Tailwind CSS:** A utility-first CSS framework.
*   **shadcn-ui:** A collection of reusable UI components.
*   **React Router:** For declarative routing in React applications.
*   **Zod:** For data validation.
*   **Axios:** For making HTTP requests.

## Backend

The backend is a Node.js application built with Express.js and TypeScript. It uses Prisma as an ORM for interacting with a PostgreSQL database. The backend provides a RESTful API for the frontend to consume.

**Key Technologies:**

*   **Node.js:** A JavaScript runtime built on Chrome's V8 JavaScript engine.
*   **Express.js:** A fast, unopinionated, minimalist web framework for Node.js.
*   **TypeScript:** A typed superset of JavaScript.
*   **Prisma:** A next-generation ORM for Node.js and TypeScript.
*   **PostgreSQL:** A powerful, open-source object-relational database system.
*   **JWT:** For implementing JSON Web Tokens for authentication.

# Building and Running

## Development Setup (First Time)

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed          # Basic seed (users + roles)
npm run prisma:seed-sample   # Full sample data
npm run dev                  # Start dev server on :5000
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev                  # Start dev server on :5173
```

## Daily Development

**Backend:**
```bash
npm run dev                  # Development with hot-reload (nodemon)
npm run build                # Compile TypeScript to dist/
npm start                    # Run compiled production build
npm run prisma:studio        # Open Prisma Studio database GUI
```

**Frontend:**
```bash
npm run dev                  # Development server with HMR
npm run build                # Production build (TypeScript check + Vite)
npm run preview              # Preview production build
npm run lint                 # Run ESLint
```

## Database Operations

```bash
# After schema changes in schema.prisma
npm run prisma:generate      # Regenerate Prisma Client
npm run prisma:migrate       # Create and apply migration

# Database management
npm run prisma:studio        # Visual database browser
npm run prisma:seed          # Re-seed database (basic)
npm run prisma:seed-sample   # Re-seed with sample data

# Reset database (careful!)
npx prisma migrate reset     # Drops DB, reruns migrations, reseeds
```

# Architecture

## Backend Structure

```
backend/
├── src/
│   ├── index.ts              # Express app entry point
│   ├── controllers/          # Request handlers
│   ├── routes/               # Route definitions
│   ├── middleware/           # Auth & authorization
│   └── utils/                # Helper functions
├── prisma/
│   ├── schema.prisma         # Database schema (single source of truth)
│   ├── seed.ts               # Basic seeder
│   ├── seed-sample-data.ts   # Full sample data
│   └── migrations/           # Migration history
└── .env                      # Environment variables
```

## Frontend Structure

```
frontend/
├── src/
│   ├── App.tsx               # React Router setup, all routes defined here
│   ├── main.tsx              # React app entry point
│   ├── pages/                # Page components organized by module
│   ├── components/
│   │   └── ui/               # shadcn/ui components (reusable)
│   ├── lib/
│   │   ├── api.ts            # Axios instance with JWT interceptors
│   │   └── utils.ts          # Utility functions (cn helper)
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript interfaces/enums
│   └── assets/               # Images, static files
├── vite.config.ts            # Vite + PWA configuration
└── components.json           # shadcn/ui configuration
```

# Authentication Flow

1. **User Registration**: POST `/api/auth/register` → Creates User with status=PENDING
2. **Account Approval**: Admin must approve via User Management (status → ACTIVE)
3. **Login**: POST `/api/auth/login` → Returns JWT + user object
4. **Token Storage**: Frontend stores JWT in localStorage
5. **Authenticated Requests**: Axios interceptor adds `Authorization: Bearer <token>` header
6. **Token Verification**: Backend `authenticate` middleware verifies JWT, attaches `req.user`
7. **Role Authorization**: Backend `authorize(...roles)` middleware checks `req.user.role`

# Role-Based Access Control (RBAC)

## User Roles (from Prisma schema)
- **SYSTEM_ADMIN**: Full system access
- **BARANGAY_CAPTAIN, BARANGAY_OFFICIAL**: Administrative oversight
- **BHW, BHW_COORDINATOR**: Health services management
- **DAYCARE_STAFF, DAYCARE_TEACHER**: Daycare operations
- **SK_CHAIRMAN, SK_OFFICER**: SK event management
- **PARENT_RESIDENT**: Parent portal access
- **PATIENT**: Health records access
- **VISITOR**: Public portal only (unauthenticated)