# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TheyCare Portal** is a full-stack Barangay Management System built with React + TypeScript frontend and Node.js + Express + Prisma backend. The system manages health services, daycare operations, and SK (Sangguniang Kabataan) youth engagement programs for Philippine local government units.

## Common Commands

### Development Setup (First Time)

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

**Windows Users:** When using `cp` commands on Windows with Git Bash, ensure you're in the correct directory. Alternatively, use PowerShell:
```powershell
# Backend
cd backend
npm install
Copy-Item .env.example .env
# Edit .env, then continue with npm commands

# Frontend
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

### Daily Development

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

### Database Operations

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

### Testing API Endpoints

The backend has a health check endpoint:
```bash
curl http://localhost:5000/health
```

Main API routes:
- `/api/auth/*` - Authentication (login, register)
- `/api/users/*` - User management
- `/api/health/*` - Health services module
- `/api/daycare/*` - Daycare module
- `/api/events/*` - SK events module

## Architecture

### Backend Structure

```
backend/
├── src/
│   ├── index.ts              # Express app entry point
│   ├── controllers/          # Request handlers (business logic)
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── health.controller.ts
│   │   ├── daycare.controller.ts
│   │   └── event.controller.ts
│   ├── routes/               # Route definitions (thin, delegate to controllers)
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── health.routes.ts
│   │   ├── daycare.routes.ts
│   │   └── event.routes.ts
│   ├── middleware/           # Auth & authorization
│   │   └── auth.middleware.ts  # JWT verify, role-based access
│   └── utils/                # Helper functions
│       ├── jwt.ts            # Token generation/verification
│       ├── password.ts       # Bcrypt hashing
│       └── prisma.ts         # Prisma client singleton
├── prisma/
│   ├── schema.prisma         # Database schema (single source of truth)
│   ├── seed.ts               # Basic seeder
│   ├── seed-sample-data.ts   # Full sample data
│   └── migrations/           # Migration history
└── .env                      # Environment variables
```

**Key Architecture Patterns:**
- **Controller Pattern**: Business logic in controllers, routes are thin and delegate to controllers
- **Singleton Prisma Client**: Always import from `utils/prisma.ts` to avoid connection leaks
- **JWT Authentication**: Token stored client-side, verified via `authenticate` middleware
- **Role-Based Authorization**: Use `authorize(...roles)` middleware after `authenticate`
- **Error Handling**: Global error middleware in `src/index.ts` catches all errors and formats responses

### Frontend Structure

```
frontend/
├── src/
│   ├── App.tsx               # React Router setup (all routes defined here)
│   ├── main.tsx              # React app entry point
│   ├── pages/                # Page components organized by module
│   │   ├── Login.tsx, Register.tsx, Dashboard.tsx
│   │   ├── health/           # Health Services pages
│   │   ├── daycare/          # Daycare pages
│   │   ├── sk/               # SK Engagement pages
│   │   ├── admin/            # Admin pages
│   │   └── public/           # Public portal (unauthenticated)
│   ├── components/
│   │   ├── ui/               # shadcn/ui components (reusable)
│   │   └── theme-provider.tsx  # Dark/light mode theme provider
│   ├── lib/
│   │   ├── api.ts            # Axios instance with JWT interceptors
│   │   └── utils.ts          # Utility functions (cn helper for Tailwind)
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript interfaces/enums
│   │   └── index.ts          # Shared types (User, Patient, Event, etc.)
│   └── assets/               # Images, static files
├── vite.config.ts            # Vite + PWA configuration
└── components.json           # shadcn/ui configuration
```

**Key Architecture Patterns:**
- **Component Library**: Uses shadcn/ui (Radix UI primitives + Tailwind CSS)
- **API Client**: Centralized Axios instance (`lib/api.ts`) with auto JWT injection
- **Route Guards**: Client-side auth checks (token presence, role checks in components)
- **Type Safety**: TypeScript enums mirror Prisma schema enums exactly
- **PWA Support**: Configured with service worker for offline capability and app installation
- **Path Aliases**: `@/*` resolves to `src/*` (configured in vite.config + tsconfig)
- **Theme System**: Uses `next-themes` for dark/light mode support

### Database Schema Organization

The Prisma schema (`prisma/schema.prisma`) is organized into logical sections:

1. **Enums** (top): UserRole, AccountStatus, AppointmentStatus, etc.
2. **User Management**: User model with multi-role support
3. **Health Services Module**: Patient, Appointment, HealthRecord, Vaccination
4. **Daycare Module**: DaycareStudent, DaycareRegistration, AttendanceRecord, ProgressReport, LearningMaterial
5. **SK Engagement Module**: Event, EventRegistration, EventAttendance
6. **Certificate Generation**: Polymorphic Certificate model (can relate to Patient/Student/Event)
7. **Notification System**: Notification, NotificationSettings, BroadcastMessage
8. **Public Portal**: Announcement
9. **System Administration**: AuditLog, SystemBackup

**Important Schema Patterns:**
- **Polymorphic Relations**: Certificate model can link to patientId OR studentId OR eventId (nullable foreign keys)
- **Registration Workflows**: DaycareRegistration (pending) → approved → creates DaycareStudent
- **User Relations**: User model connects to Patient, DaycareRegistration, EventRegistration through foreign keys
- **Status Enums**: Most entities use status enums instead of soft deletes for state management

## Authentication Flow

1. **User Registration**: POST `/api/auth/register` → Creates User with status=PENDING
2. **Account Approval**: Admin must approve via User Management (status → ACTIVE)
3. **Login**: POST `/api/auth/login` → Returns JWT + user object
4. **Token Storage**: Frontend stores JWT in localStorage
5. **Authenticated Requests**: Axios interceptor adds `Authorization: Bearer <token>` header
6. **Token Verification**: Backend `authenticate` middleware verifies JWT, attaches `req.user`
7. **Role Authorization**: Backend `authorize(...roles)` middleware checks `req.user.role`

**Security Notes:**
- Passwords hashed with bcrypt (10 rounds)
- JWT secret must be changed in production (`.env` file)
- JWT expires in 7 days by default (configurable in JWT_EXPIRES_IN)
- CORS restricted to FRONTEND_URL
- Helmet.js for security headers (prevents XSS, clickjacking, etc.)

## Role-Based Access Control (RBAC)

### User Roles (from Prisma schema)
- **SYSTEM_ADMIN**: Full system access
- **BARANGAY_CAPTAIN, BARANGAY_OFFICIAL**: Administrative oversight
- **BHW, BHW_COORDINATOR**: Health services management
- **DAYCARE_STAFF, DAYCARE_TEACHER**: Daycare operations
- **SK_CHAIRMAN, SK_OFFICER**: SK event management
- **PARENT_RESIDENT**: Parent portal access (daycare registration)
- **PATIENT**: Health records access
- **VISITOR**: Public portal only (unauthenticated)

### Implementing Role Guards

**Backend (src/routes/*.routes.ts):**
```typescript
import { authenticate, authorize } from '../middleware/auth.middleware';

// Single role
router.get('/patients', authenticate, authorize('BHW', 'BHW_COORDINATOR'), controller);

// Multiple roles
router.post('/events', authenticate, authorize('SK_CHAIRMAN', 'SK_OFFICER'), controller);
```

**Frontend (in components/pages):**
- Check `user.role` from auth context or localStorage
- Conditionally render navigation/pages based on role
- Role enum available in `types/index.ts`

## Module-Specific Guidance

### Health Services Module
- **Patient Management**: Patients can be linked to User (userId) or standalone (guest patients)
- **Appointments**: Must reference healthWorkerId (User with BHW/BHW_COORDINATOR roles)
- **Vaccination Tracking**: nextDueDate triggers notification reminders
- **Certificates**: Use Certificate model with patientId relation for health certificates

### Daycare Module
- **Registration Flow**: DaycareRegistration (pending) → approved by staff → creates DaycareStudent
- **Attendance**: AttendanceRecord tracks daily presence with timeIn/timeOut
- **Learning Materials**: File uploads need fileUrl (implement file storage separately - not yet implemented)
- **Progress Reports**: Generated by Daycare Staff/Teacher for each reporting period

### SK Engagement Module
- **Event Lifecycle**: DRAFT → PUBLISHED → ONGOING → COMPLETED/CANCELLED
- **Registration**: EventRegistration tracks who signed up (approval optional depending on event)
- **Attendance**: EventAttendance separate from registration (QR code scan, manual check-in)
- **Public Events**: Events with status=PUBLISHED visible on public calendar

## Common Development Patterns

### Adding a New Feature

1. **Update Prisma Schema** (if database changes needed):
   ```bash
   # Edit prisma/schema.prisma
   npm run prisma:generate
   npm run prisma:migrate
   ```

2. **Create Backend Route**:
   - Add controller in `src/controllers/` with business logic
   - Add route in `src/routes/` that delegates to controller
   - Register route in `src/index.ts` (app.use)
   - Add authentication/authorization middleware to route

3. **Create Frontend Page**:
   - Add page component in `src/pages/[module]/`
   - Add route in `App.tsx` (Routes component)
   - Create API call functions using `api` from `lib/api.ts`
   - Add TypeScript types in `types/index.ts` if needed

4. **Add UI Components** (if needed):
   ```bash
   cd frontend
   npx shadcn@latest add [component-name]
   # Example: npx shadcn@latest add table
   # Example: npx shadcn@latest add dialog
   ```

### Working with shadcn/ui

The project uses shadcn/ui components. To add new components:

```bash
cd frontend
npx shadcn@latest add button    # Adds button component
npx shadcn@latest add dialog    # Adds dialog component
npx shadcn@latest add table     # Adds table component
npx shadcn@latest add calendar  # Adds calendar component
```

Components are installed in `src/components/ui/` and can be customized directly. They are fully owned by your project.

### API Call Pattern

```typescript
// In a React component
import { api } from '@/lib/api';
import { Patient } from '@/types';

const fetchPatients = async () => {
  try {
    const response = await api.get<Patient[]>('/health/patients');
    setPatients(response.data);
  } catch (error) {
    console.error('Error fetching patients:', error);
    // Error handling: 401 automatically redirects to login
  }
};
```

The `api` instance automatically:
- Adds JWT token to requests from localStorage
- Redirects to login on 401 errors
- Sets Content-Type headers
- Uses base URL from VITE_API_URL

### Database Query Pattern

```typescript
// In a controller (src/controllers/*.controller.ts)
import prisma from '../utils/prisma';

// Get all with relations
const patients = await prisma.patient.findMany({
  include: {
    user: true,
    appointments: true,
  },
});

// Create with relations
const appointment = await prisma.appointment.create({
  data: {
    patientId: req.body.patientId,
    healthWorkerId: req.user!.id,
    appointmentDate: new Date(req.body.date),
    appointmentType: req.body.type,
    status: 'SCHEDULED',
  },
  include: {
    patient: true,
    healthWorker: true,
  },
});

// Update with validation
const updatedPatient = await prisma.patient.update({
  where: { id: patientId },
  data: {
    firstName: req.body.firstName,
    // ... other fields
  },
});
```

**Always use the Prisma client from `utils/prisma.ts` to avoid connection pool exhaustion.**

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/theycare_db?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

**Important:** Change JWT_SECRET before deploying to production. Use a long random string.

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## PWA Configuration

The frontend is configured as a Progressive Web App with the following features:

- **Service Worker**: Auto-registers for offline support (vite-plugin-pwa)
- **Manifest**: Configured in `vite.config.ts` with app name, icons, theme color
- **Icons**: Located in `public/` directory (icon-192x192.svg, icon-512x512.svg, theycare.png)
- **Caching Strategy**:
  - **Network-first** for API calls (5-minute cache fallback)
  - **Cache-first** for assets and Google Fonts
- **Installation**: Users can install the app from browser (Chrome, Edge, Firefox)
- **Offline Access**: Previously visited pages remain accessible offline

**Testing PWA:**
```bash
cd frontend
npm run build    # Production build required for PWA features
npm run preview  # Test the PWA at http://localhost:4173
```

See `DEMO_GUIDE.md` for detailed PWA demonstration instructions.

## TypeScript Configuration

- **Backend**: CommonJS (`"type": "commonjs"` in package.json)
- **Frontend**: ES Modules (default Vite configuration)
- **Path Aliases**: `@/*` maps to `src/*` in frontend (vite.config.ts + tsconfig.json)
- **Strict Mode**: Enabled in both projects for type safety

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running (verify with `psql` or pgAdmin)
- Verify DATABASE_URL in `.env` is correct
- Run `npm run prisma:generate` to regenerate Prisma Client
- Check port 5000 is not in use (`netstat -ano | findstr :5000` on Windows)
- Check for syntax errors in `.env` file (no spaces around `=`)

### Frontend API calls fail
- Verify backend is running on port 5000
- Check VITE_API_URL in frontend `.env` matches backend URL
- Inspect browser console for CORS errors
- Verify JWT token exists in localStorage (Application tab in DevTools)
- Check Network tab for actual API response errors

### Database migration errors
- Ensure PostgreSQL user has CREATE/ALTER permissions
- Check database name matches DATABASE_URL
- Try `npx prisma migrate reset` to start fresh (destroys all data!)
- Check for open connections to database (close pgAdmin, Prisma Studio)

### TypeScript errors after schema changes
- Run `npm run prisma:generate` to update Prisma Client types
- Restart TypeScript server in VS Code (Cmd/Ctrl + Shift + P → "Restart TS Server")
- Check frontend `types/index.ts` enums match backend Prisma schema enums exactly

### PWA not installing
- Ensure you're using HTTPS or localhost
- Build the production version (`npm run build` then `npm run preview`)
- Check browser console for service worker errors
- Clear browser cache and hard reload (Ctrl+Shift+R)

## Prisma Studio

Prisma Studio provides a visual database browser:

```bash
cd backend
npm run prisma:studio
```

Opens at `http://localhost:5555` - useful for:
- Viewing/editing data directly in a GUI
- Understanding table relationships visually
- Debugging data issues quickly
- Seeding test data manually
- Verifying migrations applied correctly

## Demo and Presentation

See `DEMO_GUIDE.md` for comprehensive instructions on:
- Demonstrating the system to stakeholders
- Showcasing PWA installation and offline functionality
- Following a logical narrative through the modules
- Preparing for technical Q&A

## File Upload Implementation (Future)

The system references file uploads in several places but file storage is not yet implemented:

- **Learning Materials** (Daycare): fileUrl field in LearningMaterial model
- **Health Records**: Potential for attaching medical documents
- **Certificates**: PDF generation and storage

**Recommended approach:**
- Use multer for file upload handling in Express
- Store files in cloud storage (AWS S3, Google Cloud Storage) or local filesystem
- Save file URLs in database
- Implement file size limits and type validation
- Add file deletion when records are removed
