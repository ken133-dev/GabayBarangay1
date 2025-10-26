import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Users,
  UserCheck,
  UserX,
  Heart,
  Baby,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { api } from '@/lib/api';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  suspendedUsers: number;
  totalPatients: number;
  totalStudents: number;
  totalEvents: number;
  recentActivities: Activity[];
}

interface Activity {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  type: 'success' | 'warning' | 'info';
}

interface QuickAction {
  title: string;
  description: string;
  icon: any;
  action: () => void;
  variant: "default" | "outline";
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    suspendedUsers: 0,
    totalPatients: 0,
    totalStudents: 0,
    totalEvents: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = ['SYSTEM_ADMIN', 'BARANGAY_CAPTAIN'].includes(user.role);

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied: Admin privileges required');
      navigate('/dashboard');
      return;
    }

    fetchDashboardStats();
  }, [isAdmin, navigate]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // TODO: Replace with real API call
      // const response = await api.get('/admin/stats');
      // setStats(response.data);

      // Mock data for now
      setStats({
        totalUsers: 127,
        activeUsers: 98,
        pendingUsers: 15,
        suspendedUsers: 14,
        totalPatients: 342,
        totalStudents: 89,
        totalEvents: 23,
        recentActivities: [
          {
            id: '1',
            action: 'New user registration',
            user: 'Juan Dela Cruz',
            timestamp: '5 minutes ago',
            type: 'info'
          },
          {
            id: '2',
            action: 'User account approved',
            user: 'Maria Santos',
            timestamp: '15 minutes ago',
            type: 'success'
          },
          {
            id: '3',
            action: 'Health appointment scheduled',
            user: 'BHW Maria',
            timestamp: '1 hour ago',
            type: 'info'
          },
          {
            id: '4',
            action: 'Daycare registration pending',
            user: 'Parent John',
            timestamp: '2 hours ago',
            type: 'warning'
          },
          {
            id: '5',
            action: 'SK Event published',
            user: 'SK Officer Mark',
            timestamp: '3 hours ago',
            type: 'success'
          }
        ]
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      description: 'All registered users',
      trend: '+12%',
      trendUp: true,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      onClick: () => navigate('/admin/users')
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: UserCheck,
      description: 'Users with active accounts',
      trend: '+8%',
      trendUp: true,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      onClick: () => navigate('/admin/users')
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingUsers,
      icon: Clock,
      description: 'Awaiting approval',
      trend: stats.pendingUsers > 0 ? 'Action needed' : 'All clear',
      trendUp: false,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      onClick: () => navigate('/admin/users/pending')
    },
    {
      title: 'Suspended Users',
      value: stats.suspendedUsers,
      icon: UserX,
      description: 'Suspended accounts',
      trend: '-3%',
      trendUp: true,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      onClick: () => navigate('/admin/users')
    },
    {
      title: 'Health Patients',
      value: stats.totalPatients,
      icon: Heart,
      description: 'Registered patients',
      trend: '+24',
      trendUp: true,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      onClick: () => navigate('/health/patients')
    },
    {
      title: 'Daycare Students',
      value: stats.totalStudents,
      icon: Baby,
      description: 'Enrolled students',
      trend: '+5',
      trendUp: true,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      onClick: () => navigate('/daycare/registrations')
    },
    {
      title: 'SK Events',
      value: stats.totalEvents,
      icon: Calendar,
      description: 'Published events',
      trend: '+2',
      trendUp: true,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      onClick: () => navigate('/sk/events')
    },
    {
      title: 'System Health',
      value: '98%',
      icon: Activity,
      description: 'Overall performance',
      trend: 'Excellent',
      trendUp: true,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      onClick: () => navigate('/admin/settings')
    }
  ];

  const quickActions: QuickAction[] = [
    {
      title: 'Approve Users',
      description: `${stats.pendingUsers} users awaiting approval`,
      icon: UserCheck,
      action: () => navigate('/admin/users/pending'),
      variant: stats.pendingUsers > 0 ? 'default' : 'outline'
    },
    {
      title: 'View Reports',
      description: 'Access system analytics',
      icon: BarChart3,
      action: () => navigate('/reports'),
      variant: 'outline'
    },
    {
      title: 'System Settings',
      description: 'Configure system',
      icon: Activity,
      action: () => navigate('/admin/settings'),
      variant: 'outline'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Activity className="h-5 w-5 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout currentPage="Admin Dashboard">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="Admin Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.firstName}! Here's what's happening in the system.
          </p>
        </div>

        {/* Pending Approvals Alert */}
        {stats.pendingUsers > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900">Action Required</h3>
                  <p className="text-sm text-yellow-800 mt-1">
                    You have {stats.pendingUsers} user registration{stats.pendingUsers !== 1 ? 's' : ''} pending approval.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-yellow-600 text-yellow-900 hover:bg-yellow-100"
                  onClick={() => navigate('/admin/users/pending')}
                >
                  Review Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={stat.onClick}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                  <div className="flex items-center mt-2">
                    {stat.trendUp ? (
                      <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                    )}
                    <span className={`text-xs ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trend}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-base">{action.title}</CardTitle>
                    </div>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button
                      variant={action.variant}
                      className="w-full"
                      onClick={action.action}
                    >
                      {action.title}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system events and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.action}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        by {activity.user}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {activity.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full" onClick={() => navigate('/admin/settings/audit-logs')}>
                View All Activity
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>Key metrics and performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">User Approval Rate</span>
                  <span className="font-medium">
                    {Math.round((stats.activeUsers / stats.totalUsers) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 transition-all"
                    style={{ width: `${(stats.activeUsers / stats.totalUsers) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Active Modules</span>
                  <span className="font-medium">3/3</span>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="flex-1 justify-center">
                    <Heart className="h-3 w-3 mr-1" />
                    Health
                  </Badge>
                  <Badge variant="outline" className="flex-1 justify-center">
                    <Baby className="h-3 w-3 mr-1" />
                    Daycare
                  </Badge>
                  <Badge variant="outline" className="flex-1 justify-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    SK
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/reports')}
                >
                  View Detailed Reports
                  <BarChart3 className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
