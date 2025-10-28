import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, Users, Activity, Calendar, Download, ArrowLeft, BarChart3
} from 'lucide-react';
import { exportToPDF, exportToExcel } from '@/lib/exportUtils';

interface CrossModuleAnalytics {
  overview: {
    totalUsers: number;
    activeServices: number;
    totalEngagement: number;
    systemUtilization: number;
  };
  serviceUsage: {
    health: { users: number; activities: number };
    daycare: { users: number; activities: number };
    sk: { users: number; activities: number };
  };
  userEngagement: {
    byRole: { role: string; count: number; engagement: number }[];
    monthlyTrends: { month: string; health: number; daycare: number; sk: number }[];
  };
  crossService: {
    multiServiceUsers: number;
    serviceOverlap: { services: string; users: number }[];
    engagementScore: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B9D'];

export default function CrossModuleAnalytics() {
  const [analytics, setAnalytics] = useState<CrossModuleAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('6months');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reports/cross-module?range=${dateRange}`);
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Failed to fetch cross-module analytics:', error);
      toast.error('Failed to load cross-module analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    if (!analytics) {
      toast.error('No data available to export');
      return;
    }

    try {
      console.log('Exporting analytics:', analytics); // Debug log
      const exportData = [
        {
          metric: 'Total Users',
          value: analytics.overview?.totalUsers || 0,
          category: 'Overview'
        },
        {
          metric: 'Active Services',
          value: analytics.overview?.activeServices || 0,
          category: 'Overview'
        },
        {
          metric: 'Total Engagement',
          value: analytics.overview?.totalEngagement || 0,
          category: 'Overview'
        },
        {
          metric: 'System Utilization (%)',
          value: analytics.overview?.systemUtilization || 0,
          category: 'Overview'
        },
        {
          metric: 'Health Service Users',
          value: analytics.serviceUsage?.health?.users || 0,
          category: 'Service Usage'
        },
        {
          metric: 'Daycare Service Users',
          value: analytics.serviceUsage?.daycare?.users || 0,
          category: 'Service Usage'
        },
        {
          metric: 'SK Service Users',
          value: analytics.serviceUsage?.sk?.users || 0,
          category: 'Service Usage'
        },
        {
          metric: 'Multi-Service Users',
          value: analytics.crossService?.multiServiceUsers || 0,
          category: 'Cross-Service'
        },
        {
          metric: 'Engagement Score',
          value: analytics.crossService?.engagementScore || 0,
          category: 'Cross-Service'
        }
      ];

      const columns = ['Metric', 'Value', 'Category'];

      if (format === 'pdf') {
        exportToPDF(exportData, 'Cross-Module Analytics - Gabay Barangay', columns);
        toast.success('Analytics exported to PDF successfully!');
      } else {
        exportToExcel(exportData, 'Cross-Module Analytics');
        toast.success('Analytics exported to Excel successfully!');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export to ${format.toUpperCase()}. Check console for details.`);
    }
  };

  if (loading) {
    return (
      <DashboardLayout currentPage="/reports/analytics">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout currentPage="/reports/analytics">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Unable to load analytics</p>
              <Button className="mt-4" onClick={fetchAnalytics}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="/reports/analytics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/reports')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reports
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">Cross-Module Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Consolidated insights across all barangay services
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={(value) => {
              setDateRange(value);
              // Don't auto-fetch to prevent loops
            }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
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

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Active system users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Services</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.activeServices}</div>
              <p className="text-xs text-muted-foreground">Services in use</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.totalEngagement}</div>
              <p className="text-xs text-muted-foreground">User interactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Utilization</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.systemUtilization}%</div>
              <p className="text-xs text-muted-foreground">Overall usage</p>
            </CardContent>
          </Card>
        </div>

        {/* Service Usage Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Usage Distribution</CardTitle>
              <CardDescription>User engagement across different services</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Health Services', value: analytics.serviceUsage.health.users },
                      { name: 'Daycare Services', value: analytics.serviceUsage.daycare.users },
                      { name: 'SK Engagement', value: analytics.serviceUsage.sk.users }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[0, 1, 2].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Activity Comparison</CardTitle>
              <CardDescription>Activity levels across services</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { service: 'Health', users: analytics.serviceUsage.health.users, activities: analytics.serviceUsage.health.activities },
                  { service: 'Daycare', users: analytics.serviceUsage.daycare.users, activities: analytics.serviceUsage.daycare.activities },
                  { service: 'SK', users: analytics.serviceUsage.sk.users, activities: analytics.serviceUsage.sk.activities }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="service" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" fill="#8884d8" name="Users" />
                  <Bar dataKey="activities" fill="#82ca9d" name="Activities" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Service Usage Trends</CardTitle>
            <CardDescription>Service utilization over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.userEngagement.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="health" stroke="#8884d8" name="Health Services" />
                <Line type="monotone" dataKey="daycare" stroke="#82ca9d" name="Daycare Services" />
                <Line type="monotone" dataKey="sk" stroke="#ffc658" name="SK Engagement" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cross-Service Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement by Role</CardTitle>
              <CardDescription>Engagement levels across user types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.userEngagement.byRole.map((role, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{role.role.replace('_', ' ')}</div>
                      <div className="text-sm text-muted-foreground">{role.count} users</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-blue-600">{role.engagement}%</div>
                      <div className="text-xs text-muted-foreground">engagement</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cross-Service Insights</CardTitle>
              <CardDescription>Multi-service user analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {analytics.crossService.multiServiceUsers}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Users accessing multiple services
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Service Combinations</h4>
                  {analytics.crossService.serviceOverlap.map((overlap, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{overlap.services}</span>
                      <span className="font-medium">{overlap.users} users</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t text-center">
                  <div className="text-lg font-bold">Overall Engagement Score</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {analytics.crossService.engagementScore}/100
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}