import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Users, Calendar, TrendingUp, Award, Download, ArrowLeft, PartyPopper
} from 'lucide-react';

interface SKAnalytics {
  summary: {
    totalEvents: number;
    totalParticipants: number;
    averageAttendance: number;
    completedEvents: number;
  };
  participation: {
    byAgeGroup: { ageGroup: string; count: number }[];
    byGender: { gender: string; count: number }[];
    monthlyTrends: { month: string; participants: number; events: number }[];
  };
  events: {
    byCategory: { category: string; count: number }[];
    topEvents: { title: string; participants: number; attendanceRate: string }[];
  };
  engagement: {
    repeatParticipants: number;
    newParticipants: number;
    engagementScore: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B9D'];

export default function SKAnalytics() {
  const [analytics, setAnalytics] = useState<SKAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('6months');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/sk/analytics?range=${dateRange}`);
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Failed to fetch SK analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    toast.info(`Exporting SK analytics to ${format.toUpperCase()}...`);
    // TODO: Implement export functionality
  };

  if (loading) {
    return (
      <DashboardLayout currentPage="/sk/analytics">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout currentPage="/sk/analytics">
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
    <DashboardLayout currentPage="/sk/analytics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/sk')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to SK Dashboard
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">SK Engagement Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Youth participation and engagement insights
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.summary.completedEvents} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.totalParticipants}</div>
              <p className="text-xs text-muted-foreground">Unique participants</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.averageAttendance.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Per event</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
              <Award className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.engagement.engagementScore}/100</div>
              <p className="text-xs text-muted-foreground">Overall engagement</p>
            </CardContent>
          </Card>
        </div>

        {/* Participation Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Participation by Age Group</CardTitle>
              <CardDescription>Youth engagement across different age ranges</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.participation.byAgeGroup}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ ageGroup, percent }) => `${ageGroup}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.participation.byAgeGroup.map((entry, index) => (
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
              <CardDescription>Distribution of event types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.events.byCategory}>
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

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Participation Trends</CardTitle>
            <CardDescription>Event participation over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.participation.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="participants" stroke="#8884d8" name="Participants" />
                <Line type="monotone" dataKey="events" stroke="#82ca9d" name="Events" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Events and Engagement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Events</CardTitle>
              <CardDescription>Events with highest participation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.events.topEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.participants} participants
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">{event.attendanceRate}</div>
                      <div className="text-xs text-muted-foreground">attendance</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Insights</CardTitle>
              <CardDescription>Participant behavior analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Repeat Participants</div>
                    <div className="text-sm text-muted-foreground">
                      Attended multiple events
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics.engagement.repeatParticipants}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">New Participants</div>
                    <div className="text-sm text-muted-foreground">
                      First-time attendees
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {analytics.engagement.newParticipants}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-center">
                    <PartyPopper className="h-8 w-8 text-purple-500 mr-2" />
                    <div className="text-center">
                      <div className="text-lg font-bold">Youth Engagement</div>
                      <div className="text-sm text-muted-foreground">
                        {analytics.engagement.engagementScore >= 80 ? 'Excellent' :
                         analytics.engagement.engagementScore >= 60 ? 'Good' :
                         analytics.engagement.engagementScore >= 40 ? 'Fair' : 'Needs Improvement'}
                      </div>
                    </div>
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