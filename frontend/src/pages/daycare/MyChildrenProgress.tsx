import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface ProgressReport {
  id: string;
  studentId: string;
  reportingPeriod: string;
  academicPerformance?: number;
  socialBehavior?: number;
  physicalDevelopment?: number;
  emotionalDevelopment?: number;
  recommendations?: string;
  generatedAt: string;
  generatedBy: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  progressReports: ProgressReport[];
}

export default function MyChildrenProgress() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string>('all');

  useEffect(() => {
    fetchProgressReports();
  }, []);

  const fetchProgressReports = async () => {
    try {
      const response = await api.get('/daycare/progress-reports/my');
      setStudents(response.data.students || []);
    } catch {
      toast.error('Failed to fetch progress reports');
    } finally {
      setLoading(false);
    }
  };

  const getSkillBadge = (score?: number) => {
    if (!score) return <Badge variant="outline">Not Rated</Badge>;

    if (score >= 4) return <Badge variant="default">Excellent</Badge>;
    if (score >= 3) return <Badge variant="secondary">Good</Badge>;
    if (score >= 2) return <Badge variant="outline">Developing</Badge>;
    return <Badge variant="destructive">Needs Support</Badge>;
  };

  const calculateAverageScore = (report: ProgressReport) => {
    const scores = Object.values({
      academic: report.academicPerformance,
      social: report.socialBehavior,
      physical: report.physicalDevelopment,
      emotional: report.emotionalDevelopment
    }).filter(s => s !== null && s !== undefined) as number[];

    if (scores.length === 0) return null;
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  };

  const filteredStudents = selectedStudent === 'all'
    ? students
    : students.filter(student => student.id === selectedStudent);

  const allReports = filteredStudents.flatMap(student =>
    student.progressReports.map(report => ({
      ...report,
      studentName: `${student.firstName} ${student.lastName}`,
      studentId: student.id
    }))
  ).sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());

  return (
    <DashboardLayout currentPage="/daycare/progress-reports">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Children's Progress</h1>
            <p className="text-muted-foreground mt-1">
              View progress reports and development updates for your registered children
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Children Enrolled</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{students.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {students.reduce((total, student) => total + student.progressReports.length, 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Latest Report</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {allReports.length > 0
                  ? new Date(allReports[0].generatedAt).toLocaleDateString()
                  : 'No reports'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Student Filter */}
        {students.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Filter by Child</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select a child" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Children</SelectItem>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Progress Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading progress reports...</p>
            ) : allReports.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No progress reports available yet.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Progress reports will appear here once your children are enrolled and reports are generated by daycare staff.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {allReports.map((report) => (
                  <Card key={report.id} className="border">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{report.studentName}</h3>
                          <p className="text-sm text-gray-600">
                            Period: {report.reportingPeriod} | Generated: {new Date(report.generatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Average Score</p>
                          <p className="text-2xl font-bold">
                            {calculateAverageScore(report) || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Academic</p>
                          {getSkillBadge(report.academicPerformance)}
                          <p className="text-sm font-medium mt-1">{report.academicPerformance || '-'}/5</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Social Behavior</p>
                          {getSkillBadge(report.socialBehavior)}
                          <p className="text-sm font-medium mt-1">{report.socialBehavior || '-'}/5</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Physical Dev.</p>
                          {getSkillBadge(report.physicalDevelopment)}
                          <p className="text-sm font-medium mt-1">{report.physicalDevelopment || '-'}/5</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Emotional Dev.</p>
                          {getSkillBadge(report.emotionalDevelopment)}
                          <p className="text-sm font-medium mt-1">{report.emotionalDevelopment || '-'}/5</p>
                        </div>
                      </div>

                      {report.recommendations && (
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">Recommendations:</p>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                            {report.recommendations}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-4 pt-4 border-t">
                        <p className="text-xs text-gray-500">
                          Report generated by daycare staff
                        </p>
                        <Button variant="outline" size="sm">
                          Download PDF
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Educational Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Understanding Progress Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                <strong>Scoring Scale:</strong> 1-5 (1 = Needs Support, 2 = Developing, 3 = Good, 4 = Excellent, 5 = Outstanding)
              </div>
              <div>
                <strong>Academic Performance:</strong> Learning progress in educational activities
              </div>
              <div>
                <strong>Social Behavior:</strong> Interaction with peers and following classroom rules
              </div>
              <div>
                <strong>Physical Development:</strong> Motor skills and physical coordination
              </div>
              <div>
                <strong>Emotional Development:</strong> Emotional regulation and self-expression
              </div>
              <div className="pt-2">
                <strong>Note:</strong> If you have concerns about your child's progress, please contact the daycare coordinator directly.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}