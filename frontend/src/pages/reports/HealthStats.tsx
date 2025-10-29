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
  Heart, Users, Activity, TrendingUp, Calendar, ArrowLeft, Download
} from 'lucide-react';
import { exportToPDF, exportToExcel } from '@/lib/exportUtils';

interface HealthStats {
  overview: {
    totalPatients: number;
    totalAppointments: number;
    completedAppointments: number;
    totalVaccinations: number;
    completionRate: number;
    avgWaitTime: number;
    patientSatisfaction: number;
    noShowRate: number;
    efficiencyScore: number;
  };
  demographics: {
    ageGroups: { group: string; count: number }[];
    genderDistribution: { gender: string; count: number }[];
    bloodTypes: { type: string; count: number }[];
  };
  performance: {
    appointmentTypes: { type: string; count: number; avgDuration: number }[];
    bhwPerformance: { name: string; appointments: number; completionRate: number }[];
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B9D'];

export default function HealthStats() {
  const [stats, setStats] = useState<HealthStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('6months');
  const navigate = useNavigate();

  useEffect(() => {
    fetchHealthStats();
  }, [dateRange]);

  const fetchHealthStats = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reports/health/stats?range=${dateRange}`);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch health stats:', error);
      toast.error('Failed to load health statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    if (!stats) {
      toast.error('No data available to export');
      return;
    }

    try {
      console.log('Exporting health stats:', stats);
      const exportData = [
        { metric: 'Total Patients', value: stats.overview.totalPatients, category: 'Overview' },
        { metric: 'Total Appointments', value: stats.overview.totalAppointments, category: 'Overview' },
        { metric: 'Completed Appointments', value: stats.overview.completedAppointments, category: 'Overview' },
        { metric: 'Total Vaccinations', value: stats.overview.totalVaccinations, category: 'Overview' },
        { metric: 'Completion Rate (%)', value: stats.overview.completionRate.toFixed(1), category: 'Performance' },
        { metric: 'Avg Wait Time (min)', value: stats.overview.avgWaitTime, category: 'Performance' },
        { metric: 'Patient Satisfaction', value: stats.overview.patientSatisfaction, category: 'Performance' },
        { metric: 'No-Show Rate (%)', value: stats.overview.noShowRate, category: 'Performance' },
        { metric: 'Efficiency Score (%)', value: stats.overview.efficiencyScore, category: 'Performance' }
      ];

      const columns = ['Metric', 'Value', 'Category'];

      if (format === 'pdf') {
        exportToPDF(exportData, 'Health Statistics - Gabay Barangay', columns);
        toast.success('Health statistics exported to PDF successfully!');
      } else {
        exportToExcel(exportData, 'Health Statistics');
        toast.success('Health statistics exported to Excel successfully!');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export to ${format.toUpperCase()}. Check console for details.`);
    }
  };

  if (loading) {
    return (
      <DashboardLayout currentPage="/reports/health/stats">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!stats) {
    return (
      <DashboardLayout currentPage="/reports/health/stats">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Unable to load health statistics</p>
              <Button className="mt-4" onClick={fetchHealthStats}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="/reports/health/stats">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/reports/health')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Health Reports
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">Advanced Health Analytics</h1>
            <p className="text-muted-foreground mt-1">
              AI-powered insights, predictive analytics, and performance optimization
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

        {/* Advanced Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
              <Calendar className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.avgWaitTime}</div>
              <p className="text-xs text-muted-foreground">minutes average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patient Satisfaction</CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.patientSatisfaction}/5</div>
              <p className="text-xs text-muted-foreground">average rating</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">No-Show Rate</CardTitle>
              <Users className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.noShowRate}%</div>
              <p className="text-xs text-muted-foreground">missed appointments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.efficiencyScore}%</div>
              <p className="text-xs text-muted-foreground">operational efficiency</p>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Duration Analysis</CardTitle>
              <CardDescription>Average time spent per appointment type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.performance.appointmentTypes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Appointments" />
                  <Bar dataKey="avgDuration" fill="#82ca9d" name="Avg Duration (min)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resource Utilization</CardTitle>
              <CardDescription>BHW workload and capacity analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.performance.bhwPerformance.map((bhw, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{bhw.name}</div>
                      <div className="text-sm text-muted-foreground">{bhw.appointments} appointments</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">{bhw.completionRate.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">completion rate</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Blood Type Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Blood Type Distribution Analysis</CardTitle>
            <CardDescription>Critical for emergency preparedness and blood bank planning</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.demographics.bloodTypes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#ff7300" name="Patients" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quality Metrics & Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Quality Improvement Insights</CardTitle>
            <CardDescription>AI-powered recommendations for health service optimization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-green-600">✅ Performance Highlights</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Completion Rate: {stats.overview.completionRate.toFixed(1)}%</li>
                  <li>• Patient Satisfaction: {stats.overview.patientSatisfaction}/5</li>
                  <li>• Efficiency Score: {stats.overview.efficiencyScore}%</li>
                  <li>• Total Vaccinations: {stats.overview.totalVaccinations}</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-orange-600">⚠️ Areas for Improvement</h4>
                <ul className="space-y-2 text-sm">
                  <li>• No-Show Rate: {stats.overview.noShowRate}%</li>
                  <li>• Average Wait Time: {stats.overview.avgWaitTime} minutes</li>
                  <li>• Pending Appointments: {stats.overview.totalAppointments - stats.overview.completedAppointments}</li>
                  <li>• Active BHWs: {stats.performance.bhwPerformance.length}</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">📊 Data Summary</h4>
              <p className="text-sm text-blue-700">
                Currently serving {stats.overview.totalPatients} patients with {stats.overview.totalAppointments} total appointments. 
                {stats.performance.bhwPerformance.length > 0 ? `Top performing BHW: ${stats.performance.bhwPerformance[0]?.name} with ${stats.performance.bhwPerformance[0]?.completionRate.toFixed(1)}% completion rate.` : 'No BHW performance data available.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}