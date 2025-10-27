# TheyCarE Portal - Project Structure

## Architecture Overview
Full-stack web application with separate backend API and frontend client, following modern web development patterns with TypeScript throughout.

## Directory Structure

### Root Level
```
theycare-portal/
├── backend/           # Node.js/Express API server
├── frontend/          # React/Vite client application
├── .amazonq/          # AI assistant configuration
├── .claude/           # Claude AI settings
├── README.md          # Project documentation
├── DEMO_GUIDE.md      # Demo instructions
├── USER_FLOWS.md      # User journey documentation
└── USER_STORIES.md    # Feature requirements
```

### Backend Structure (`/backend`)
```
backend/
├── src/
│   ├── controllers/   # Request handlers and business logic
│   ├── middleware/    # Authentication, validation, error handling
│   ├── routes/        # API endpoint definitions
│   ├── services/      # Business logic and external integrations
│   ├── utils/         # Helper functions and utilities
│   └── index.ts       # Application entry point
├── prisma/
│   ├── migrations/    # Database schema changes
│   ├── schema.prisma  # Database schema definition
│   ├── seed*.ts       # Database seeding scripts
│   └── seed.ts        # Main seed file
├── .env               # Environment variables
├── package.json       # Dependencies and scripts
└── tsconfig.json      # TypeScript configuration
```

### Frontend Structure (`/frontend`)
```
frontend/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Route-specific page components
│   ├── contexts/      # React context providers
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility libraries and configurations
│   ├── types/         # TypeScript type definitions
│   ├── assets/        # Static assets
│   ├── App.tsx        # Main application component
│   └── main.tsx       # Application entry point
├── public/            # Static public assets
├── package.json       # Dependencies and scripts
├── vite.config.ts     # Vite build configuration
└── tailwind.config.js # Tailwind CSS configuration
```

## Core Components & Relationships

### Backend Architecture
- **Controllers**: Handle HTTP requests, validate input, coordinate with services
- **Services**: Contain business logic, database operations, external API calls
- **Middleware**: Authentication (JWT), role-based access control, request validation
- **Routes**: RESTful API endpoints organized by feature modules
- **Prisma ORM**: Database abstraction layer with type-safe queries

### Frontend Architecture
- **Component-Based**: Modular UI components using React and shadcn/ui
- **State Management**: React Context for global state, local state for components
- **Routing**: React Router for client-side navigation
- **Styling**: Tailwind CSS with custom component library
- **Forms**: React Hook Form with Zod validation

### Key Architectural Patterns

#### Multi-Role Navigation System
- Dynamic sidebar generation based on user roles
- Role-based route protection and feature access
- Centralized permission management

#### Module-Based Organization
- Health Services Module
- Daycare Management Module  
- SK Youth Engagement Module
- Administrative Module
- User Management Module

#### Data Flow
1. Frontend makes authenticated API requests
2. Backend middleware validates JWT tokens and permissions
3. Controllers process requests and delegate to services
4. Services interact with database via Prisma ORM
5. Responses flow back through the same chain

#### Security Architecture
- JWT-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- CORS protection
- Helmet security headers