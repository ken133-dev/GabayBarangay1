import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Activity, UserPlus, Loader2, Users, BarChart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function HealthDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Get user roles (support both single role and multi-role)
    const userRoles = user.roles || (user.role ? [user.role] : []);
    
    // Allow admin users to access health dashboard
    if (!userRoles.some(role => ['BHW', 'BHW_COORDINATOR', 'SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL'].includes(role))) {
      navigate('/dashboard');
      return;
    }
    fetchHealthStats();
  }, [user, navigate]);

  const fetchHealthStats = async () => {
    try {
      const response = await api.get('/reports/health');
      const report = response.data.report;
      setStats({
        todayAppointments: report?.summary?.totalAppointments || 0,
        totalPatients: report?.summary?.totalPatients || 0,
        pendingFollowups: report?.summary?.pendingAppointments || 0
      });
      
      // Convert monthly trend to chart data
      const monthlyTrend = report?.appointments?.monthlyTrends || [];
      const chartData = monthlyTrend.map((item: any) => ({
        name: item.month,
        appointments: item.count,
        patients: report?.summary?.totalPatients || 0
      }));
      setChartData(chartData);
    } catch (error) {
      console.error('Failed to fetch health stats:', error);
      setStats({
        todayAppointments: 0,
        totalPatients: 0,
        pendingFollowups: 0
      });
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout currentPage="/health">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Health Services Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome, {user.firstName}! Manage patient care and health services.
            </p>
          </div>
          <Button onClick={() => navigate('/health/patients')}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Patient
          </Button>
        </div>
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-3 flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/health/appointments')}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                  <div className="p-2 rounded-lg bg-blue-50">
                    <Activity className="w-4 h-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.todayAppointments || 0}</div>
                  <p className="text-xs text-muted-foreground">Scheduled for today</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/health/patients')}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                  <div className="p-2 rounded-lg bg-green-50">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalPatients || 0}</div>
                  <p className="text-xs text-muted-foreground">Registered patients</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/health/records')}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending Follow-ups</CardTitle>
                  <div className="p-2 rounded-lg bg-red-50">
                    <Heart className="w-4 h-4 text-red-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.pendingFollowups || 0}</div>
                  <p className="text-xs text-muted-foreground">Needs attention</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
        {/* Charts and Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Patient Visits Overview</CardTitle>
              <CardDescription>Monthly patient visits and appointments.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {loading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="patients" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="appointments" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No chart data available
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common health service tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate('/health/patients')}
              >
                <Users className="mr-2 h-4 w-4" />
                Patient Management
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate('/health/appointments')}
              >
                <Activity className="mr-2 h-4 w-4" />
                Schedule Appointment
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate('/health/vaccinations')}
              >
                <Heart className="mr-2 h-4 w-4" />
                Vaccination Records
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate('/health/records')}
              >
                <BarChart className="mr-2 h-4 w-4" />
                Health Records
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}