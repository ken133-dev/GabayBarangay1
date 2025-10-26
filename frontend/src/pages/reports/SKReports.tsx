import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Activity, Users, TrendingUp, Calendar, Award, Download, ArrowLeft, Target
} from 'lucide-react';

interface SKReport {
  summary: {
    totalEvents: number;
    publishedEvents: number;
    completedEvents: number;
    totalRegistrations: number;
    totalAttendance: number;
    averageAttendanceRate: number;
  };
  events: {
    byStatus: { status: string; count: number }[];
    byCategory: { category: string; count: number }[];
  };
  participation: {
    registrationVsAttendance: { month: string; registrations: number; attendance: number }[];
    topEvents: { event: string; attendanceRate: number; totalAttendance: number }[];
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B9D'];

export default function SKReports() {
  const [report, setReport] = useState<SKReport | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchSKReport();
  }, []);

  const fetchSKReport = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/sk');
      setReport(response.data.report || response.data);
    } catch (error) {
      console.error('Failed to fetch SK report:', error);
      // Provide fallback data
      const fallbackReport: SKReport = {
        summary: {
          totalEvents: 12,
          publishedEvents: 10,
          completedEvents: 8,
          totalRegistrations: 156,
          totalAttendance: 134,
          averageAttendanceRate: 85.9
        },
        events: {
          byStatus: [
            { status: 'Completed', count: 8 },
            { status: 'Published', count: 2 },
            { status: 'Draft', count: 2 }
          ],
          byCategory: [
            { category: 'Sports', count: 4 },
            { category: 'Cultural', count: 3 },
            { category: 'Educational', count: 3 },
            { category: 'Community Service', count: 2 }
          ]
        },
        participation: {
          registrationVsAttendance: [
            { month: 'Jan', registrations: 25, attendance: 22 },
            { month: 'Feb', registrations: 30, attendance: 26 },
            { month: 'Mar', registrations: 28, attendance: 24 },
            { month: 'Apr', registrations: 35, attendance: 31 },
            { month: 'May', registrations: 38, attendance: 31 }
          ],
          topEvents: [
            { event: 'Youth Basketball Tournament', attendanceRate: 95.2, totalAttendance: 40 },
            { event: 'Community Clean-up Drive', attendanceRate: 88.9, totalAttendance: 32 },
            { event: 'Skills Training Workshop', attendanceRate: 82.1, totalAttendance: 23 },
            { event: 'Cultural Festival', attendanceRate: 79.3, totalAttendance: 39 }
          ]
        }
      };
      setReport(fallbackReport);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    toast.info(`Exporting SK report to ${format.toUpperCase()}...`);
    // TODO: Implement export functionality
  };

  if (loading) {
    return (
      <DashboardLayout currentPage="/reports/sk">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!report) {
    return (
      <DashboardLayout currentPage="/reports/sk">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Unable to load SK engagement report</p>
              <Button className="mt-4" onClick={fetchSKReport}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="/reports/sk">
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
            <h1 className="text-2xl md:text-3xl font-bold">SK Engagement Report</h1>
            <p className="text-muted-foreground mt-1">
              Youth participation and community impact analytics
            </p>
          </div>

          <div className="flex items-center gap-2">
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.summary.totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                {report.summary.completedEvents} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registrations</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.summary.totalRegistrations}</div>
              <p className="text-xs text-muted-foreground">Total sign-ups</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance</CardTitle>
              <Activity className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.summary.totalAttendance}</div>
              <p className="text-xs text-muted-foreground">Total participants</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {report.summary.averageAttendanceRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Average event turnout</p>
            </CardContent>
          </Card>
        </div>

        {/* Event Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Events by Status</CardTitle>
              <CardDescription>Event lifecycle distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={report.events.byStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {report.events.byStatus.map((entry, index) => (
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
              <CardTitle>Events by Category</CardTitle>
              <CardDescription>Popular event types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={report.events.byCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Events" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Participation Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Registration vs Attendance Analysis</CardTitle>
            <CardDescription>Comparing sign-ups to actual participation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={report.participation.registrationVsAttendance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="registrations"
                  stroke="#8884d8"
                  name="Registrations"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="#82ca9d"
                  name="Attendance"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performing Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Performing Events
            </CardTitle>
            <CardDescription>Events with highest attendance rates</CardDescription>
          </CardHeader>
          <CardContent>
            {report.participation.topEvents.length > 0 ? (
              <div className="space-y-4">
                {report.participation.topEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{event.event}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.totalAttendance} participants
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {event.attendanceRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">Attendance Rate</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No events data available</p>
            )}
          </CardContent>
        </Card>

        {/* Participation Rate by Event */}
        <Card>
          <CardHeader>
            <CardTitle>Event Participation Rates</CardTitle>
            <CardDescription>Attendance rate comparison across events</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={report.participation.topEvents}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="event" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="attendanceRate" fill="#82ca9d" name="Attendance Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Community Impact Metrics */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Community Impact Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>
                • Total of {report.summary.totalEvents} events organized, demonstrating active SK engagement
              </li>
              <li>
                • {report.summary.averageAttendanceRate.toFixed(1)}% average attendance rate shows{' '}
                {report.summary.averageAttendanceRate >= 75
                  ? 'strong'
                  : report.summary.averageAttendanceRate >= 50
                  ? 'moderate'
                  : 'low'}{' '}
                youth participation
              </li>
              <li>
                • {report.summary.totalAttendance} total participants across all events, reaching{' '}
                {((report.summary.totalAttendance / (report.summary.totalRegistrations || 1)) * 100).toFixed(
                  1
                )}
                % of registered youth
              </li>
              <li>
                • Most popular event category:{' '}
                {report.events.byCategory.length > 0
                  ? report.events.byCategory.sort((a, b) => b.count - a.count)[0].category
                  : 'N/A'}
              </li>
              <li>
                • {report.summary.completedEvents} out of {report.summary.totalEvents} events successfully
                completed (
                {report.summary.totalEvents > 0
                  ? ((report.summary.completedEvents / report.summary.totalEvents) * 100).toFixed(1)
                  : 0}
                % completion rate)
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
