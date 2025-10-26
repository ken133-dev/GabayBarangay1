import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/index';
import {
  Users,
  Calendar,
  Heart,
  Baby,
  Activity,
  Settings,
  FileText,
  ArrowRight,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    
    // Redirect role-specific users to their specialized dashboards
    if ([UserRole.BHW, UserRole.BHW_COORDINATOR].includes(user.role)) {
      navigate('/health');
      return;
    }
    if ([UserRole.DAYCARE_STAFF, UserRole.DAYCARE_TEACHER].includes(user.role)) {
      navigate('/daycare');
      return;
    }
    if ([UserRole.SK_OFFICER, UserRole.SK_CHAIRMAN].includes(user.role)) {
      navigate('/sk');
      return;
    }
    if ([UserRole.SYSTEM_ADMIN, UserRole.BARANGAY_CAPTAIN].includes(user.role)) {
      navigate('/admin');
      return;
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  // For regular users (PARENT_RESIDENT, PATIENT, VISITOR)
  const quickActions = [
    {
      title: 'Health Services',
      description: 'View health records and appointments',
      icon: Heart,
      path: '/health/records',
      available: [UserRole.PATIENT, UserRole.PARENT_RESIDENT].includes(user.role)
    },
    {
      title: 'Daycare Services',
      description: 'Manage daycare registrations',
      icon: Baby,
      path: '/daycare/registrations',
      available: [UserRole.PARENT_RESIDENT].includes(user.role)
    },
    {
      title: 'SK Events',
      description: 'Register for youth events',
      icon: Calendar,
      path: '/sk/event-registration',
      available: true
    },
    {
      title: 'Announcements',
      description: 'View barangay announcements',
      icon: FileText,
      path: '/announcements',
      available: true
    },
    {
      title: 'Profile Settings',
      description: 'Update your profile information',
      icon: Settings,
      path: '/profile',
      available: true
    },
    {
      title: 'Notifications',
      description: 'Manage your notifications',
      icon: Activity,
      path: '/notifications',
      available: true
    }
  ];

  const availableActions = quickActions.filter(action => action.available);

  return (
    <DashboardLayout currentPage="/dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.firstName}!</h1>
          <p className="text-muted-foreground">
            Access your barangay services and stay connected with the community.
          </p>
        </div>

        {/* Role-specific message */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Your Role: {user.role.replace('_', ' ')}</h3>
                <p className="text-sm text-muted-foreground">
                  {user.role === UserRole.PARENT_RESIDENT && 'Access health and daycare services for your family.'}
                  {user.role === UserRole.PATIENT && 'Manage your health records and appointments.'}
                  {user.role === UserRole.VISITOR && 'Explore available barangay services and events.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(action.path)}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-base">{action.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                    <Button variant="outline" className="w-full">
                      Access Service
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Barangay Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <h3 className="font-medium">Health Services</h3>
                <p className="text-sm text-muted-foreground">Medical care and health monitoring</p>
              </div>
              <div className="text-center">
                <Baby className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-medium">Daycare Services</h3>
                <p className="text-sm text-muted-foreground">Early childhood education and care</p>
              </div>
              <div className="text-center">
                <Calendar className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-medium">SK Programs</h3>
                <p className="text-sm text-muted-foreground">Youth development and engagement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
