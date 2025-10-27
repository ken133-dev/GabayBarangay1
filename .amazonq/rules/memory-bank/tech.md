# TheyCarE Portal - Technology Stack

## Programming Languages
- **TypeScript**: Primary language for both frontend and backend
- **JavaScript**: Configuration files and build scripts
- **SQL**: Database queries and migrations via Prisma

## Backend Technology Stack

### Core Framework
- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **TypeScript**: Type-safe JavaScript development

### Database & ORM
- **Prisma**: Type-safe database toolkit and ORM
- **PostgreSQL/MySQL/SQLite**: Supported database engines
- **Prisma Migrate**: Database schema management
- **Prisma Studio**: Database GUI

### Authentication & Security
- **JWT (jsonwebtoken)**: Token-based authentication
- **bcryptjs**: Password hashing
- **Helmet**: Security headers middleware
- **CORS**: Cross-origin resource sharing

### External Services
- **Twilio**: SMS/OTP services for verification
- **Morgan**: HTTP request logging

### Development Tools
- **nodemon**: Development server with hot reload
- **ts-node**: TypeScript execution for Node.js
- **dotenv**: Environment variable management

## Frontend Technology Stack

### Core Framework
- **React 19**: UI library with latest features
- **Vite**: Build tool and development server
- **TypeScript**: Type-safe development

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Component library built on Radix UI
- **Radix UI**: Headless UI primitives
- **Lucide React**: Icon library
- **next-themes**: Theme management

### State Management & Forms
- **React Context**: Global state management
- **React Hook Form**: Form handling and validation
- **Zod**: Schema validation
- **@hookform/resolvers**: Form validation integration

### Data Visualization & Tables
- **Recharts**: Chart and graph library
- **@tanstack/react-table**: Table management
- **date-fns**: Date manipulation utilities

### Routing & Navigation
- **React Router DOM**: Client-side routing
- **React Day Picker**: Date picker component

### HTTP & API
- **Axios**: HTTP client for API requests

### PWA & Performance
- **vite-plugin-pwa**: Progressive Web App features
- **Sonner**: Toast notifications

## Development Commands

### Backend Commands
```bash
npm run dev              # Start development server with nodemon
npm run build            # Compile TypeScript to JavaScript
npm start                # Run production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio GUI
npm run prisma:seed      # Seed database with initial data
```

### Frontend Commands
```bash
npm run dev      # Start Vite development server
npm run build    # Build for production (TypeScript + Vite)
npm run lint     # Run ESLint code analysis
npm run preview  # Preview production build locally
```

## Build System & Configuration

### Backend Configuration
- **tsconfig.json**: TypeScript compiler options
- **nodemon.json**: Development server configuration
- **prisma.config.ts**: Prisma configuration
- **.env**: Environment variables (database, JWT secrets, Twilio)

### Frontend Configuration
- **vite.config.ts**: Vite build and development configuration
- **tailwind.config.js**: Tailwind CSS customization
- **components.json**: shadcn/ui component configuration
- **eslint.config.js**: Code linting rules
- **tsconfig.json**: TypeScript configuration for React

## Environment Requirements
- **Node.js**: Version 18+ recommended
- **npm**: Package manager
- **Database**: PostgreSQL, MySQL, or SQLite
- **Twilio Account**: For SMS/OTP functionality (optional)

## Development Workflow
1. **Backend**: `npm run dev` starts nodemon with TypeScript compilation
2. **Frontend**: `npm run dev` starts Vite dev server with HMR
3. **Database**: Prisma handles migrations and type generation
4. **Linting**: ESLint enforces code quality standards
5. **Building**: TypeScript compilation + Vite bundling for production