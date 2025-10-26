import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import type { User } from '@/types/index';
import { UserRole } from '@/types/index';
import {
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  Heart,
  Baby,
  Sparkles,
  FileText,
  Activity,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';

// Mock chart data
const areaChartData = [
  { month: 'Jan', value: 30 },
  { month: 'Feb', value: 45 },
  { month: 'Mar', value: 60 },
  { month: 'Apr', value: 50 },
  { month: 'May', value: 70 },
  { month: 'Jun', value: 85 },
];

const pieChartData = [
  { name: 'Completed', value: 65, color: 'hsl(var(--chart-1))' },
  { name: 'Pending', value: 25, color: 'hsl(var(--chart-2))' },
  { name: 'Cancelled', value: 10, color: 'hsl(var(--chart-3))' },
];


export default function Dashboard() {
  const { user } = useAuth();

  const getRoleStats = (user: User) => {
    switch (user.role) {
      case UserRole.BHW:
      case UserRole.BHW_COORDINATOR:
        return [
          { title: 'Total Patients', value: '1,234', change: '+12%', trend: 'up', icon: Users },
          { title: 'Appointments Today', value: '24', change: '+8%', trend: 'up', icon: Calendar },
          { title: 'Pending Records', value: '12', change: '-15%', trend: 'down', icon: FileText },
          { title: 'Vaccinations', value: '89', change: '+24%', trend: 'up', icon: Heart },
        ];
      case UserRole.DAYCARE_STAFF:
      case UserRole.DAYCARE_TEACHER:
        return [
          { title: 'Enrolled Students', value: '156', change: '+5%', trend: 'up', icon: Baby },
          { title: 'Attendance Rate', value: '94%', change: '+2%', trend: 'up', icon: CheckCircle2 },
          { title: 'Pending Reports', value: '8', change: '-20%', trend: 'down', icon: FileText },
          { title: 'Active Classes', value: '6', change: '0%', trend: 'neutral', icon: Users },
        ];
      case UserRole.SK_OFFICER:
      case UserRole.SK_CHAIRMAN:
        return [
          { title: 'Active Events', value: '12', change: '+18%', trend: 'up', icon: Sparkles },
          { title: 'Total Participants', value: '456', change: '+32%', trend: 'up', icon: Users },
          { title: 'This Month', value: '3', change: '0%', trend: 'neutral', icon: Calendar },
          { title: 'Avg Attendance', value: '85%', change: '+5%', trend: 'up', icon: TrendingUp },
        ];
      default:
        return [
          { title: 'My Appointments', value: '3', change: '', trend: 'neutral', icon: Calendar },
          { title: 'Upcoming Events', value: '5', change: '', trend: 'neutral', icon: Sparkles },
          { title: 'Notifications', value: '12', change: '', trend: 'neutral', icon: Activity },
          { title: 'Services Used', value: '8', change: '', trend: 'neutral', icon: Heart },
        ];
    }
  };

  if (!user) {
    return null;
  }

  const stats = getRoleStats(user);

  return (
    <DashboardLayout currentPage="/dashboard">
      {/* Example dashboard content using stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change && (
                <div className={`flex items-center text-xs mt-1 ${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {stat.trend === 'up' && <ArrowUpRight className="h-3 w-3 mr-1" />}
                  {stat.trend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                  {stat.change}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {/* You can add more dashboard widgets/charts here as needed */}
    </DashboardLayout>
  );
}
