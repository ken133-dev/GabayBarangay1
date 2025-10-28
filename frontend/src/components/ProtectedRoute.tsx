import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // Changed from UserRole[] to string[]
  requireActive?: boolean;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  requireActive = true
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if account is active (if required)
  if (requireActive && user.status !== 'ACTIVE') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">Account Pending Approval</h1>
          <p className="text-muted-foreground">
            Your account is currently {user.status.toLowerCase()}. Please wait for an administrator
            to activate your account.
          </p>
          <p className="text-sm text-muted-foreground">
            You will receive a notification once your account is approved.
          </p>
        </div>
      </div>
    );
  }

  // Role-based access control removed - all authenticated users can access any route

  return <>{children}</>;
}
