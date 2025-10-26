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
  Baby, Users, TrendingUp, CheckCircle, Clock, Download, ArrowLeft
} from 'lucide-react';

interface DaycareReport {
  summary: {
    totalStudents: number;
    totalRegistrations: number;
    approvedRegistrations: number;
    pendingRegistrations: number;
    averageAttendanceRate: number;
  };
  registrations: {
    byStatus: { status: string; count: number }[];
    monthlyTrends: { month: string; count: number }[];
  };
  attendance: {
    averageRate: number;
    totalRecords: number;
    presentCount: number;
    absentCount: number;
  };
  demographics: {
    byAgeGroup: { ageGroup: string; count: number }[];
    byGender: { gender: string; count: number }[];
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B9D'];

export default function DaycareReports() {
  const [report, setReport] = useState<DaycareReport | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDaycareReport();
  }, [navigate, user]);

  const fetchDaycareReport = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/daycare');
      setReport(response.data);
    } catch (error) {
      console.error('Failed to fetch daycare report:', error);
      toast.error('Failed to load daycare report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    toast.info(`Exporting daycare report to ${format.toUpperCase()}...`);
    // TODO: Implement export functionality
  };

  if (loading) {
    return (
      <DashboardLayout currentPage="/reports/daycare">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!report) {
    return (
      <DashboardLayout currentPage="/reports/daycare">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Unable to load daycare report</p>
              <Button className="mt-4" onClick={fetchDaycareReport}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="/reports/daycare">
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
            <h1 className="text-2xl md:text-3xl font-bold">Daycare Services Report</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive daycare statistics and analytics
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
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Baby className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.summary.totalStudents}</div>
              <p className="text-xs text-muted-foreground">Currently enrolled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registrations</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.summary.totalRegistrations}</div>
              <p className="text-xs text-muted-foreground">
                {report.summary.approvedRegistrations} approved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.summary.pendingRegistrations}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {report.summary.averageAttendanceRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Average daily rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Registration Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Registration Status Distribution</CardTitle>
              <CardDescription>Current registration breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={report.registrations.byStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {report.registrations.byStatus.map((entry, index) => (
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
              <CardTitle>Attendance Overview</CardTitle>
              <CardDescription>Daily attendance breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Present', value: report.attendance.presentCount },
                      { name: 'Absent', value: report.attendance.absentCount }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#00C49F" />
                    <Cell fill="#FF8042" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Total Records: {report.attendance.totalRecords}
                </p>
                <p className="text-sm font-medium mt-1">
                  Average Rate: {report.attendance.averageRate.toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Registration Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Registration Trends</CardTitle>
            <CardDescription>Enrollment activity over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={report.registrations.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#82ca9d"
                  name="Registrations"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Age Group Distribution</CardTitle>
              <CardDescription>Students by age range</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={report.demographics.byAgeGroup}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageGroup" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gender Distribution</CardTitle>
              <CardDescription>Students by gender</CardDescription>
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
        </div>

        {/* Key Insights Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>
                • Total of {report.summary.totalStudents} students currently enrolled in the daycare program
              </li>
              <li>
                • {report.summary.averageAttendanceRate.toFixed(1)}% average attendance rate indicates{' '}
                {report.summary.averageAttendanceRate >= 90
                  ? 'excellent'
                  : report.summary.averageAttendanceRate >= 75
                  ? 'good'
                  : 'needs improvement'}{' '}
                student engagement
              </li>
              <li>
                • {report.summary.pendingRegistrations} registration
                {report.summary.pendingRegistrations !== 1 ? 's' : ''} currently pending review
              </li>
              <li>
                • {report.summary.approvedRegistrations} out of {report.summary.totalRegistrations}{' '}
                registrations approved (
                {report.summary.totalRegistrations > 0
                  ? ((report.summary.approvedRegistrations / report.summary.totalRegistrations) * 100).toFixed(
                      1
                    )
                  : 0}
                % approval rate)
              </li>
              <li>
                • Parent engagement metrics show active participation in daycare activities
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
