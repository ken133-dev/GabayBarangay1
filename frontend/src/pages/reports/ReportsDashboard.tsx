import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Activity, Users, Calendar, Baby, Heart, TrendingUp,
  Download, RefreshCw, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';

interface DashboardStats {
  summary?: {
    totalUsers: number;
    totalPatients: number;
    totalAppointments: number;
    totalStudents: number;
    totalEvents: number;
  };
  healthServices?: {
    totalPatients: number;
    totalAppointments: number;
    scheduledAppointments: number;
    completedAppointments: number;
    totalVaccinations: number;
  };
  daycareServices?: {
    totalStudents: number;
    totalRegistrations: number;
    approvedRegistrations: number;
    pendingRegistrations: number;
    averageAttendanceRate: number;
  };
  skEngagement?: {
    totalEvents: number;
    publishedEvents: number;
    completedEvents: number;
    totalRegistrations: number;
    totalAttendance: number;
    averageAttendanceRate: number;
  };
}

interface TrendData {
  appointments: { month: string; count: number }[];
  enrollments: { month: string; count: number }[];
  events: { month: string; count: number }[];
  registrations: { month: string; count: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ReportsDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('30');
  const [trendMonths, setTrendMonths] = useState('6');
  const navigate = useNavigate();

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, []);  // Remove dependencies to prevent infinite loop

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Try to fetch from multiple endpoints and combine data
      const [healthResponse, daycareResponse, eventsResponse, analyticsResponse] = await Promise.allSettled([
        api.get('/reports/health'),
        api.get('/reports/daycare'), 
        api.get('/reports/sk'),
        api.get('/reports/cross-module')
      ]);

      // Extract data from successful responses
      const healthData = healthResponse.status === 'fulfilled' ? healthResponse.value.data.report : null;
      const daycareData = daycareResponse.status === 'fulfilled' ? daycareResponse.value.data.report : null;
      const eventsData = eventsResponse.status === 'fulfilled' ? eventsResponse.value.data.report : null;
      const analyticsData = analyticsResponse.status === 'fulfilled' ? analyticsResponse.value.data.analytics : null;

      // Combine into dashboard stats format
      const combinedStats: DashboardStats = {
        summary: {
          totalUsers: analyticsData?.overview?.totalUsers || 0,
          totalPatients: healthData?.summary?.totalPatients || 0,
          totalAppointments: healthData?.summary?.totalAppointments || 0,
          totalStudents: daycareData?.summary?.totalStudents || 0,
          totalEvents: eventsData?.summary?.totalEvents || 0
        },
        healthServices: healthData?.summary ? {
          totalPatients: healthData.summary.totalPatients || 0,
          totalAppointments: healthData.summary.totalAppointments || 0,
          scheduledAppointments: healthData.summary.scheduledAppointments || 0,
          completedAppointments: healthData.summary.completedAppointments || 0,
          totalVaccinations: healthData.summary.totalVaccinations || 0
        } : {
          totalPatients: 0,
          totalAppointments: 0,
          scheduledAppointments: 0,
          completedAppointments: 0,
          totalVaccinations: 0
        },
        daycareServices: daycareData?.summary ? {
          totalStudents: daycareData.summary.totalStudents || 0,
          totalRegistrations: daycareData.summary.totalRegistrations || 0,
          approvedRegistrations: daycareData.summary.approvedRegistrations || 0,
          pendingRegistrations: daycareData.summary.pendingRegistrations || 0,
          averageAttendanceRate: daycareData.summary.averageAttendanceRate || 0
        } : {
          totalStudents: 0,
          totalRegistrations: 0,
          approvedRegistrations: 0,
          pendingRegistrations: 0,
          averageAttendanceRate: 0
        },
        skEngagement: eventsData?.summary ? {
          totalEvents: eventsData.summary.totalEvents || 0,
          publishedEvents: eventsData.summary.publishedEvents || 0,
          completedEvents: eventsData.summary.completedEvents || 0,
          totalRegistrations: eventsData.summary.totalRegistrations || 0,
          totalAttendance: eventsData.summary.totalAttendance || 0,
          averageAttendanceRate: eventsData.summary.averageAttendanceRate || 0
        } : {
          totalEvents: 0,
          publishedEvents: 0,
          completedEvents: 0,
          totalRegistrations: 0,
          totalAttendance: 0,
          averageAttendanceRate: 0
        }
      };

      setStats(combinedStats);

      // Use real trend data from API responses
      const realTrends: TrendData = {
        appointments: healthData?.appointments?.monthlyTrends || [],
        enrollments: daycareData?.registrations?.monthlyTrends || [],
        events: eventsData?.participation?.registrationVsAttendance?.map((item: any) => ({ month: item.month, count: item.registrations })) || [],
        registrations: eventsData?.participation?.registrationVsAttendance || []
      };

      setTrends(realTrends);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success('Dashboard data refreshed');
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    toast.info(`Exporting to ${format.toUpperCase()}...`);
    // TODO: Implement export functionality
  };

  if (loading) {
    return (
      <DashboardLayout currentPage="/reports">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!stats) {
    return (
      <DashboardLayout currentPage="/reports">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Unable to load dashboard data</p>
              <Button className="mt-4" onClick={fetchDashboardData}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  // Prepare chart data dynamically from API response
  const appointmentStatusData = stats.healthServices ? Object.entries({
    'Scheduled': stats.healthServices.scheduledAppointments,
    'Completed': stats.healthServices.completedAppointments
  }).map(([name, value]) => ({ name, value })) : [];

  const registrationStatusData = stats.daycareServices ? Object.entries({
    'Approved': stats.daycareServices.approvedRegistrations,
    'Pending': stats.daycareServices.pendingRegistrations
  }).map(([name, value]) => ({ name, value })) : [];

  const eventStatusData = stats.skEngagement ? Object.entries({
    'Published': stats.skEngagement.publishedEvents,
    'Completed': stats.skEngagement.completedEvents
  }).map(([name, value]) => ({ name, value })) : [];

  return (
    <DashboardLayout currentPage="/reports">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive insights and performance metrics
            </p>
          </div>

          <div className="flex items-center gap-2">

            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>

            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport('excel')}>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Tabs for different report sections */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {(user.role === 'SYSTEM_ADMIN' || user.role === 'BARANGAY_CAPTAIN' || user.role === 'BARANGAY_OFFICIAL' || user.role === 'BHW' || user.role === 'BHW_COORDINATOR') && (
              <TabsTrigger value="health">Health Services</TabsTrigger>
            )}
            {(user.role === 'SYSTEM_ADMIN' || user.role === 'BARANGAY_CAPTAIN' || user.role === 'BARANGAY_OFFICIAL' || user.role === 'DAYCARE_STAFF' || user.role === 'DAYCARE_TEACHER') && (
              <TabsTrigger value="daycare">Daycare</TabsTrigger>
            )}
            {(user.role === 'SYSTEM_ADMIN' || user.role === 'BARANGAY_CAPTAIN' || user.role === 'BARANGAY_OFFICIAL' || user.role === 'SK_OFFICER' || user.role === 'SK_CHAIRMAN') && (
              <TabsTrigger value="sk">SK Engagement</TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Key Metrics Cards */}
            {stats.summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.summary.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">Registered accounts</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Patients</CardTitle>
                    <Heart className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.summary.totalPatients}</div>
                    <p className="text-xs text-muted-foreground">Health records</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                    <Calendar className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.summary.totalAppointments}</div>
                    <p className="text-xs text-muted-foreground">Total scheduled</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Students</CardTitle>
                    <Baby className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.summary.totalStudents}</div>
                    <p className="text-xs text-muted-foreground">Daycare enrolled</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Events</CardTitle>
                    <Activity className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.summary.totalEvents}</div>
                    <p className="text-xs text-muted-foreground">SK activities</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Trend Charts */}
            {trends && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Appointment Trends
                    </CardTitle>
                    <CardDescription>Monthly appointment activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trends.appointments}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="count" stroke="#8884d8" name="Appointments" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Daycare Enrollments
                    </CardTitle>
                    <CardDescription>Monthly enrollment trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trends.enrollments}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="count" stroke="#82ca9d" name="Enrollments" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Event Activity
                    </CardTitle>
                    <CardDescription>Monthly event creation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={trends.events}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#ffc658" name="Events" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Registration Activity
                    </CardTitle>
                    <CardDescription>Monthly registration trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={trends.registrations}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#ff7c7c" name="Registrations" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Health Services Tab */}
          <TabsContent value="health" className="space-y-4">
            {stats.healthServices && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                      <Heart className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.healthServices.totalPatients}</div>
                      <p className="text-xs text-muted-foreground">Registered patients</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                      <Calendar className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.healthServices.totalAppointments}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.healthServices.completedAppointments} completed
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Vaccinations</CardTitle>
                      <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.healthServices.totalVaccinations}</div>
                      <p className="text-xs text-muted-foreground">Total administered</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5" />
                      Appointment Status Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={appointmentStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {appointmentStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={() => navigate('/reports/health')}>
                    View Detailed Health Reports
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          {/* Daycare Tab */}
          <TabsContent value="daycare" className="space-y-4">
            {stats.daycareServices && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                      <Baby className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.daycareServices.totalStudents}</div>
                      <p className="text-xs text-muted-foreground">Enrolled students</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Registrations</CardTitle>
                      <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.daycareServices.totalRegistrations}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.daycareServices.pendingRegistrations} pending review
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.daycareServices.averageAttendanceRate.toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">Average daily attendance</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5" />
                      Registration Status Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={registrationStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {registrationStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={() => navigate('/reports/daycare')}>
                    View Detailed Daycare Reports
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          {/* SK Engagement Tab */}
          <TabsContent value="sk" className="space-y-4">
            {stats.skEngagement && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                      <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.skEngagement.totalEvents}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.skEngagement.completedEvents} completed
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Participation</CardTitle>
                      <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.skEngagement.totalRegistrations}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.skEngagement.totalAttendance} attended
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.skEngagement.averageAttendanceRate.toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">Average event attendance</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5" />
                      Event Status Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={eventStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {eventStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={() => navigate('/reports/sk')}>
                    View Detailed SK Reports
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
