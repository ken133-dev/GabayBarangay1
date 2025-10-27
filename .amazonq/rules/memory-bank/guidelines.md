# TheyCarE Portal - Development Guidelines

## Code Quality Standards

### TypeScript Usage
- **Strict typing**: All files use TypeScript with strict type checking enabled
- **Interface definitions**: Use interfaces for object shapes and API responses
- **Type imports**: Import types explicitly using `import type` when needed
- **Generic types**: Use generics for reusable components and functions
- **Enum usage**: Use string enums for constants like status values

### Error Handling Patterns
- **Try-catch blocks**: Wrap all async operations in try-catch blocks
- **Consistent error responses**: Return structured error objects with `{ success: boolean; error?: string }`
- **Error logging**: Use `console.error()` for server-side error logging with context
- **User-friendly messages**: Provide clear, actionable error messages to users
- **HTTP status codes**: Use appropriate HTTP status codes (400, 404, 500, etc.)

### Code Formatting & Structure
- **Function organization**: Group related functions with comment separators (e.g., `// ========== ADMIN STATS ==========`)
- **Async/await**: Prefer async/await over Promises for better readability
- **Destructuring**: Use object destructuring for function parameters and API responses
- **Arrow functions**: Use arrow functions for inline callbacks and short functions
- **Consistent naming**: Use camelCase for variables/functions, PascalCase for components/types

## Architectural Patterns

### Backend Controller Pattern
```typescript
export const controllerFunction = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Extract and validate input
    const { param1, param2 } = req.body;
    
    // 2. Validate required fields
    if (!param1 || !param2) {
      return res.status(400).json({ error: 'Required fields missing' });
    }
    
    // 3. Business logic operations
    const result = await prisma.model.operation();
    
    // 4. Audit logging (for admin operations)
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'Description of action',
        entityType: 'ENTITY_TYPE',
        entityId: result.id,
        changes: { param1, param2 }
      }
    });
    
    // 5. Return success response
    res.json({ result, message: 'Operation successful' });
  } catch (error) {
    console.error('Operation error:', error);
    res.status(500).json({ error: 'Operation failed' });
  }
};
```

### Frontend Component Structure
```typescript
"use client"

import * as React from "react"
import { ComponentProps } from "react"
import { LucideIcon } from "lucide-react"

// UI component imports
import { Component } from "@/components/ui/component"

// Type definitions
interface ComponentProps {
  prop1: string;
  prop2?: boolean;
}

export function ComponentName({ prop1, prop2 = false }: ComponentProps) {
  // State management
  const [state, setState] = React.useState();
  
  // Event handlers
  const handleAction = () => {
    // Implementation
  };
  
  // Render
  return (
    <Component>
      {/* JSX content */}
    </Component>
  );
}
```

### Role-Based Access Control Pattern
- **Multi-role support**: Users can have multiple roles stored as arrays
- **Role checking functions**: Use helper functions like `hasRole(role)` for role validation
- **Dynamic navigation**: Generate navigation menus based on user roles
- **Route protection**: Implement role-based route guards with `allowedRoles` arrays
- **Permission granularity**: Check specific permissions within roles for fine-grained access

## Database & API Patterns

### Prisma ORM Usage
- **Type-safe queries**: Leverage Prisma's type generation for compile-time safety
- **Include relationships**: Use `include` to fetch related data in single queries
- **Upsert operations**: Use `upsert` for create-or-update scenarios in seed files
- **Transaction handling**: Use Prisma transactions for multi-table operations
- **Audit logging**: Implement audit trails for all administrative operations

### API Response Patterns
```typescript
// Success responses
res.json({ data, message: 'Success message' });

// Error responses  
res.status(400).json({ error: 'Error message' });

// Paginated responses
res.json({ 
  data, 
  pagination: { page, limit, total, pages } 
});

// List responses with transformations
const transformedData = rawData.map(item => ({
  // Transform properties for frontend consumption
}));
res.json({ items: transformedData });
```

### Rate Limiting & Security
- **Rate limiting**: Implement rate limiting for sensitive operations (OTP, login attempts)
- **Input validation**: Validate all inputs before processing
- **Phone number formatting**: Standardize phone numbers to international format
- **Cleanup routines**: Implement periodic cleanup of temporary data
- **Environment variables**: Use environment variables for sensitive configuration

## UI/UX Patterns

### Component Library Usage
- **shadcn/ui**: Use shadcn/ui components as base building blocks
- **Lucide icons**: Use Lucide React for consistent iconography
- **Tailwind CSS**: Use Tailwind utility classes for styling
- **Responsive design**: Implement mobile-first responsive layouts
- **Theme support**: Support light/dark themes using next-themes

### Navigation Patterns
- **Sidebar navigation**: Use collapsible sidebar with role-based menu items
- **Breadcrumb navigation**: Implement breadcrumbs for deep navigation
- **Quick actions**: Provide quick action buttons for common tasks
- **Active states**: Highlight current page/section in navigation
- **Icon consistency**: Use consistent icons across similar functions

### Form Handling
- **React Hook Form**: Use React Hook Form for form state management
- **Zod validation**: Use Zod schemas for form validation
- **Error display**: Show validation errors inline with form fields
- **Loading states**: Show loading indicators during form submission
- **Success feedback**: Provide clear success messages after form submission

## Development Workflow

### File Organization
- **Feature-based structure**: Organize files by feature/module (health, daycare, sk, admin)
- **Shared components**: Place reusable components in `/components` directory
- **Type definitions**: Centralize type definitions in `/types` directory
- **Utility functions**: Place helper functions in `/utils` or `/lib` directories
- **API routes**: Organize API routes by feature with consistent naming

### Testing & Quality
- **ESLint configuration**: Use ESLint for code quality enforcement
- **TypeScript strict mode**: Enable strict TypeScript checking
- **Environment separation**: Maintain separate configurations for dev/prod
- **Error boundaries**: Implement error boundaries for React components
- **Logging**: Implement comprehensive logging for debugging and monitoring

### Performance Optimization
- **Code splitting**: Use dynamic imports for route-based code splitting
- **Lazy loading**: Implement lazy loading for heavy components
- **Memoization**: Use React.memo and useMemo for expensive computations
- **Bundle optimization**: Optimize bundle size with proper tree shaking
- **Database queries**: Optimize database queries with proper indexing and includes