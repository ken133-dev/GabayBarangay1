import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  student?: Student;
  attendanceDate: string;
  status: string;
  timeIn?: string;
  timeOut?: string;
  notes?: string;
  remarks?: string;
  recordedBy: string;
}

export default function AttendanceTracking() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [quickMarkMode, setQuickMarkMode] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    status: 'PRESENT',
    timeIn: '',
    timeOut: '',
    notes: ''
  });
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchStudents();
    fetchAttendance();
  }, [selectedDate]);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/daycare/students');
      setStudents(response.data.students || []);
    } catch (error) {
      toast.error('Failed to fetch students');
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await api.get(`/daycare/attendance?date=${selectedDate}`);
      setRecords(response.data.attendance || []);
    } catch (error) {
      toast.error('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.studentId && !editingRecord) {
      toast.error('Please select a student');
      return;
    }

    try {
      if (editingRecord) {
        // Update existing record
        await api.patch(`/daycare/attendance/${editingRecord.id}`, {
          status: formData.status,
          timeIn: formData.timeIn || null,
          timeOut: formData.timeOut || null,
          remarks: formData.notes
        });
        toast.success('Attendance updated successfully!');
      } else {
        // Create new record
        await api.post('/daycare/attendance', {
          studentId: formData.studentId,
          attendanceDate: selectedDate,
          status: formData.status,
          timeIn: formData.timeIn || null,
          timeOut: formData.timeOut || null,
          notes: formData.notes
        });
        toast.success('Attendance marked successfully!');
      }

      setShowDialog(false);
      setEditingRecord(null);
      setFormData({
        studentId: '',
        status: 'PRESENT',
        timeIn: '',
        timeOut: '',
        notes: ''
      });
      fetchAttendance();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save attendance');
    }
  };

  const handleQuickMark = async (studentId: string, status: string) => {
    try {
      const currentTime = new Date();
      const timeString = currentTime.toTimeString().slice(0, 5); // HH:MM format
      
      await api.post('/daycare/attendance', {
        studentId,
        attendanceDate: selectedDate,
        status,
        timeIn: status === 'PRESENT' || status === 'LATE' ? timeString : null
      });

      toast.success('Attendance marked!');
      fetchAttendance();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to mark attendance');
    }
  };

  const handleEditRecord = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setFormData({
      studentId: record.studentId,
      status: record.status,
      timeIn: record.timeIn ? new Date(record.timeIn).toTimeString().slice(0, 5) : '',
      timeOut: record.timeOut ? new Date(record.timeOut).toTimeString().slice(0, 5) : '',
      notes: record.remarks || record.notes || ''
    });
    setShowDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      PRESENT: { variant: 'default', label: 'Present' },
      ABSENT: { variant: 'destructive', label: 'Absent' },
      LATE: { variant: 'outline', label: 'Late' },
      EXCUSED: { variant: 'secondary', label: 'Excused' },
      HALFDAY: { variant: 'outline', label: 'Half Day' }
    };

    const config = statusConfig[status] || statusConfig.PRESENT;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const isStudentMarked = (studentId: string) => {
    return records.some(r => r.studentId === studentId && r.attendanceDate === selectedDate);
  };

  const getStudentRecord = (studentId: string) => {
    return records.find(r => r.studentId === studentId && r.attendanceDate === selectedDate);
  };

  const todayStats = {
    total: students.length,
    present: records.filter(r => r.status === 'PRESENT').length,
    absent: records.filter(r => r.status === 'ABSENT').length,
    late: records.filter(r => r.status === 'LATE').length
  };

  return (
    <DashboardLayout currentPage="/daycare/attendance">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Attendance Tracking</h1>
            <p className="text-muted-foreground">Daily attendance management for daycare students</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={quickMarkMode ? 'default' : 'outline'}
              onClick={() => setQuickMarkMode(!quickMarkMode)}
            >
              {quickMarkMode ? 'Exit Quick Mark' : 'Quick Mark Mode'}
            </Button>
            <Button onClick={() => setShowDialog(true)}>
              Mark Attendance
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">Select Date</label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{todayStats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Present</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{todayStats.present}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Absent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{todayStats.absent}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Late</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-600">{todayStats.late}</p>
            </CardContent>
          </Card>
        </div>

        {quickMarkMode ? (
          <Card>
            <CardHeader>
              <CardTitle>Quick Mark - {new Date(selectedDate).toLocaleDateString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {students.map((student) => {
                  const record = getStudentRecord(student.id);
                  return (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear()} years old
                        </p>
                      </div>
                      {record ? (
                        <div className="flex items-center gap-2">
                          {getStatusBadge(record.status)}
                          {record.timeIn && (
                            <span className="text-sm text-gray-600">In: {new Date(record.timeIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditRecord(record)}
                          >
                            Edit
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleQuickMark(student.id, 'PRESENT')}
                          >
                            Present
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuickMark(student.id, 'LATE')}
                          >
                            Late
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleQuickMark(student.id, 'ABSENT')}
                          >
                            Absent
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records - {new Date(selectedDate).toLocaleDateString()}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading attendance...</p>
              ) : records.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No attendance records for this date.</p>
                  <p className="text-sm text-gray-500 mt-2">Click "Mark Attendance" or use "Quick Mark Mode" to start.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Time In</TableHead>
                        <TableHead>Time Out</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Recorded By</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {record.student?.firstName} {record.student?.lastName}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(record.status)}
                          </TableCell>
                          <TableCell>
                            {record.timeIn ? new Date(record.timeIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </TableCell>
                          <TableCell>
                            {record.timeOut ? new Date(record.timeOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </TableCell>
                          <TableCell>{record.remarks || record.notes || '-'}</TableCell>
                          <TableCell>{record.recordedBy}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditRecord(record)}
                            >
                              Edit
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
        )}

        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) {
            setEditingRecord(null);
            setFormData({
              studentId: '',
              status: 'PRESENT',
              timeIn: '',
              timeOut: '',
              notes: ''
            });
          }
        }}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingRecord ? 'Edit Attendance' : 'Mark Attendance'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleMarkAttendance} className="space-y-4">
              {!editingRecord && (
                <div>
                  <label className="text-sm font-medium">Select Student *</label>
                  <Select
                    value={formData.studentId}
                    onValueChange={(value) => setFormData({...formData, studentId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a student..." />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName}
                          {isStudentMarked(student.id) && ' (Already marked)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {editingRecord && (
                <div>
                  <label className="text-sm font-medium">Student</label>
                  <div className="p-2 bg-gray-50 rounded border">
                    {editingRecord.student?.firstName} {editingRecord.student?.lastName}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Attendance Status *</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRESENT">Present</SelectItem>
                    <SelectItem value="ABSENT">Absent</SelectItem>
                    <SelectItem value="LATE">Late</SelectItem>
                    <SelectItem value="EXCUSED">Excused</SelectItem>
                    <SelectItem value="HALFDAY">Half Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Time In</label>
                  <Input
                    type="time"
                    value={formData.timeIn}
                    onChange={(e) => setFormData({...formData, timeIn: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Time Out</label>
                  <Input
                    type="time"
                    value={formData.timeOut}
                    onChange={(e) => setFormData({...formData, timeOut: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any special notes (e.g., reason for absence, early pickup)"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setShowDialog(false);
                  setEditingRecord(null);
                  setFormData({
                    studentId: '',
                    status: 'PRESENT',
                    timeIn: '',
                    timeOut: '',
                    notes: ''
                  });
                }}>
                  Cancel
                </Button>
                <Button type="submit">{editingRecord ? 'Update Attendance' : 'Mark Attendance'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
