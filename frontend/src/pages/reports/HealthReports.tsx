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
  Heart, Calendar, Activity, Users, TrendingUp, Download, ArrowLeft
} from 'lucide-react';
import { exportHealthReportToPDF, exportHealthReportToExcel } from '@/lib/exportUtils';

interface HealthReport {
  summary: {
    totalPatients: number;
    totalAppointments: number;
    completedAppointments: number;
    totalVaccinations: number;
    completionRate: number;
  };
  appointments: {
    byType: { type: string; count: number }[];
    byStatus: { status: string; count: number }[];
    monthlyTrends: { month: string; count: number }[];
  };
  vaccinations: {
    byType: { vaccine: string; count: number }[];
  };
  demographics: {
    byGender: { gender: string; count: number }[];
    byBloodType: { bloodType: string; count: number }[];
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B9D'];

export default function HealthReports() {
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchHealthReport();
  }, []);

  const fetchHealthReport = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/health');
      setReport(response.data.report || response.data);
    } catch (error) {
      console.error('Failed to fetch health report:', error);
      toast.error('Failed to load health report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    if (!report) {
      toast.error('No data available to export');
      return;
    }

    try {
      console.log('Exporting health report:', report); // Debug log
      if (format === 'pdf') {
        exportHealthReportToPDF(report);
        toast.success('Health report exported to PDF successfully!');
      } else {
        exportHealthReportToExcel(report);
        toast.success('Health report exported to Excel successfully!');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export to ${format.toUpperCase()}. Check console for details.`);
    }
  };

  if (loading) {
    return (
      <DashboardLayout currentPage="/reports/health">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!report) {
    return (
      <DashboardLayout currentPage="/reports/health">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Unable to load health report</p>
              <Button className="mt-4" onClick={fetchHealthReport}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="/reports/health">
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
            <h1 className="text-2xl md:text-3xl font-bold">Health Services Report</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive health statistics and analytics
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
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.summary.totalPatients}</div>
              <p className="text-xs text-muted-foreground">Registered patients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.summary.totalAppointments}</div>
              <p className="text-xs text-muted-foreground">
                {report.summary.completedAppointments} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vaccinations</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.summary.totalVaccinations}</div>
              <p className="text-xs text-muted-foreground">Total administered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.summary.completionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Appointments completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Appointment Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Appointments by Type</CardTitle>
              <CardDescription>Distribution of appointment categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={report.appointments.byType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {report.appointments.byType.map((entry, index) => (
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
              <CardTitle>Appointments by Status</CardTitle>
              <CardDescription>Current status distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={report.appointments.byStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Appointment Trends</CardTitle>
            <CardDescription>Service utilization over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={report.appointments.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8884d8"
                  name="Appointments"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vaccination Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Vaccination Distribution</CardTitle>
            <CardDescription>Vaccines administered by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={report.vaccinations.byType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="vaccine" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Demographics by Gender</CardTitle>
              <CardDescription>Gender distribution of patients</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={report.demographics.byGender}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ gender, percent }) => `${gender}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {report.demographics.byGender.map((entry, index) => (
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
              <CardTitle>Patient Demographics by Blood Type</CardTitle>
              <CardDescription>Blood type distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={report.demographics.byBloodType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bloodType" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#ffc658" name="Patients" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Key Insights Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>
                • Total of {report.summary.totalPatients} patients registered in the health system
              </li>
              <li>
                • {report.summary.completionRate.toFixed(1)}% appointment completion rate indicates{' '}
                {report.summary.completionRate >= 80 ? 'excellent' : report.summary.completionRate >= 60 ? 'good' : 'needs improvement'}{' '}
                patient engagement
              </li>
              <li>
                • {report.summary.totalVaccinations} vaccinations administered, contributing to community health
              </li>
              <li>
                • Most common appointment type:{' '}
                {report.appointments.byType.length > 0
                  ? report.appointments.byType.sort((a, b) => b.count - a.count)[0].type
                  : 'N/A'}
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
