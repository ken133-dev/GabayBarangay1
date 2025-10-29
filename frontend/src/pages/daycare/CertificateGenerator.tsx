import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { FileText, Download, Award, TrendingUp, Calendar } from 'lucide-react';

interface DaycareStudent {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
}

interface Certificate {
  id: string;
  certificateType: string;
  issuedDate: string;
  certificateNumber: string;
  studentId?: string;
  student?: DaycareStudent;
  program?: string;
  achievements?: string;
  issuedBy: string;
}

export default function DaycareCertificateGenerator() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [students, setStudents] = useState<DaycareStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [formData, setFormData] = useState({
    certificateType: '',
    program: '',
    achievements: '',
    completionDate: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchStudents();
    fetchCertificates();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/daycare/students');
      setStudents(response.data.students || []);
    } catch (error) {
      toast.error('Failed to fetch students');
    }
  };

  const fetchCertificates = async () => {
    try {
      const response = await api.get('/daycare/certificates');
      setCertificates(response.data.certificates || []);
    } catch (error) {
      toast.error('Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  const generateCertificateNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `DAYCARE-${year}${month}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }

    if (!formData.certificateType) {
      toast.error('Please select certificate type');
      return;
    }

    try {
      const certificateNumber = generateCertificateNumber();

      await api.post('/daycare/certificates', {
        studentId: selectedStudent,
        certificateType: formData.certificateType,
        certificateNumber,
        program: formData.program,
        achievements: formData.achievements,
        completionDate: formData.completionDate || null,
        issuedBy: `${user.firstName} ${user.lastName}`
      });

      toast.success('Certificate generated successfully!');
      setShowDialog(false);
      setFormData({
        certificateType: '',
        program: '',
        achievements: '',
        completionDate: ''
      });
      setSelectedStudent('');
      fetchCertificates();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate certificate');
    }
  };

  const handleDownload = async (certificateId: string) => {
    try {
      toast.info('Generating PDF...');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/daycare/certificates/${certificateId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to download certificate');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `daycare-certificate-${certificateId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download certificate');
    }
  };

  const getCertificateTypeBadge = (type: string) => {
    const typeColors: Record<string, 'default' | 'secondary' | 'outline'> = {
      'COMPLETION': 'default',
      'ACHIEVEMENT': 'secondary',
      'PARTICIPATION': 'outline',
      'GRADUATION': 'default'
    };

    return <Badge variant={typeColors[type] || 'outline'}>{type.replace(/_/g, ' ')}</Badge>;
  };

  return (
    <DashboardLayout currentPage="/daycare/certificates">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Daycare Certificate Generator
            </h1>
            <p className="text-muted-foreground mt-1">
              Generate certificates for daycare students
            </p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <FileText className="h-5 w-5" />
                Generate Certificate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Generate Daycare Certificate</DialogTitle>
                <DialogDescription>
                  Fill in the student's information to create a new certificate
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student">Select Student *</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a student..." />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certificateType">Certificate Type *</Label>
                  <Select
                    value={formData.certificateType}
                    onValueChange={(value) => setFormData({...formData, certificateType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select certificate type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COMPLETION">Program Completion</SelectItem>
                      <SelectItem value="ACHIEVEMENT">Academic Achievement</SelectItem>
                      <SelectItem value="PARTICIPATION">Program Participation</SelectItem>
                      <SelectItem value="GRADUATION">Daycare Graduation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="program">Program/Course</Label>
                  <Input
                    id="program"
                    value={formData.program}
                    onChange={(e) => setFormData({...formData, program: e.target.value})}
                    placeholder="e.g., Early Childhood Development, Pre-K Program"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="achievements">Achievements/Skills</Label>
                  <textarea
                    id="achievements"
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    value={formData.achievements}
                    onChange={(e) => setFormData({...formData, achievements: e.target.value})}
                    placeholder="Enter student achievements, skills learned, or milestones reached"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="completionDate">Completion Date</Label>
                  <Input
                    id="completionDate"
                    type="date"
                    value={formData.completionDate}
                    onChange={(e) => setFormData({...formData, completionDate: e.target.value})}
                  />
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Certificate will be issued by {user.firstName} {user.lastName}.
                    A unique certificate number will be generated automatically.
                  </p>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Generate Certificate</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Certificates</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{certificates.length}</div>
              <p className="text-xs text-muted-foreground mt-1">All generated certificates</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {certificates.filter(c => {
                  const issued = new Date(c.issuedDate);
                  const now = new Date();
                  return issued.getMonth() === now.getMonth() && issued.getFullYear() === now.getFullYear();
                }).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Issued this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Students</CardTitle>
              <Award className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Enrolled students</p>
            </CardContent>
          </Card>
        </div>

        {/* Certificates Table */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Certificates</CardTitle>
            <CardDescription>View and download all issued daycare certificates</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : certificates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No certificates generated yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Click "Generate Certificate" to create the first certificate.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certificate No.</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Issued Date</TableHead>
                      <TableHead>Issued By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates.map((certificate) => (
                      <TableRow key={certificate.id}>
                        <TableCell className="font-medium">
                          {certificate.certificateNumber}
                        </TableCell>
                        <TableCell>
                          {certificate.student?.firstName} {certificate.student?.lastName}
                        </TableCell>
                        <TableCell>
                          {getCertificateTypeBadge(certificate.certificateType)}
                        </TableCell>
                        <TableCell>{certificate.program || '-'}</TableCell>
                        <TableCell>
                          {new Date(certificate.issuedDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{certificate.issuedBy}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => handleDownload(certificate.id)}
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}