import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  location?: string;
  capacity?: number;
}

interface AttendanceRecord {
  id: string;
  eventId: string;
  event?: Event;
  userId: string;
  userName: string;
  email: string;
  checkInTime: string;
  checkOutTime?: string;
  attendanceStatus: string;
  notes?: string;
}

interface EventStats {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  totalRegistrations: number;
  totalAttendees: number;
  present: number;
  absent: number;
  late: number;
  attendanceRate: number;
}

export default function AttendanceAnalytics() {
  const [events, setEvents] = useState<Event[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [eventStats, setEventStats] = useState<EventStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [showMarkDialog, setShowMarkDialog] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [markFormData, setMarkFormData] = useState({
    userId: '',
    status: 'PRESENT',
    notes: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isStaff = ['SK_OFFICER', 'SK_CHAIRMAN', 'SYSTEM_ADMIN'].includes(user.role);

  useEffect(() => {
    fetchEvents();
    fetchEventStats();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchAttendance(selectedEvent);
      fetchEventRegistrations(selectedEvent);
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data.events || []);
      if (response.data.events?.length > 0) {
        setSelectedEvent(response.data.events[0].id);
      }
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async (eventId: string) => {
    try {
      const response = await api.get(`/events/${eventId}/attendance`);
      setAttendanceRecords(response.data.attendance || []);
    } catch (error) {
      toast.error('Failed to fetch attendance');
    }
  };

  const fetchEventRegistrations = async (eventId: string) => {
    try {
      const response = await api.get(`/events/${eventId}/registrations`);
      const approvedUsers = response.data.registrations?.filter(
        (r: any) => r.status === 'APPROVED'
      ) || [];
      setRegisteredUsers(approvedUsers);
    } catch (error) {
      toast.error('Failed to fetch registrations');
    }
  };

  const fetchEventStats = async () => {
    try {
      const eventsRes = await api.get('/events');
      const events = eventsRes.data.events || [];

      const statsPromises = events.map(async (event: Event) => {
        try {
          const [regRes, attRes] = await Promise.all([
            api.get(`/events/${event.id}/registrations`),
            api.get(`/events/${event.id}/attendance`)
          ]);

          const registrations = regRes.data.registrations || [];
          const attendance = attRes.data.attendance || [];

          const totalRegistrations = registrations.filter(
            (r: any) => r.status === 'APPROVED'
          ).length;
          const present = attendance.filter((a: AttendanceRecord) => a.attendanceStatus === 'PRESENT').length;
          const absent = attendance.filter((a: AttendanceRecord) => a.attendanceStatus === 'ABSENT').length;
          const late = attendance.filter((a: AttendanceRecord) => a.attendanceStatus === 'LATE').length;

          return {
            eventId: event.id,
            eventTitle: event.title,
            eventDate: event.eventDate,
            totalRegistrations,
            totalAttendees: attendance.length,
            present,
            absent,
            late,
            attendanceRate: totalRegistrations > 0 ? (present / totalRegistrations) * 100 : 0
          };
        } catch {
          return null;
        }
      });

      const stats = (await Promise.all(statsPromises)).filter(Boolean) as EventStats[];
      setEventStats(stats);
    } catch (error) {
      toast.error('Failed to fetch event statistics');
    }
  };

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!markFormData.userId) {
      toast.error('Please select a user');
      return;
    }

    try {
      await api.post('/events/attendance', {
        eventId: selectedEvent,
        userId: markFormData.userId,
        attendanceStatus: markFormData.status,
        checkInTime: new Date().toISOString(),
        notes: markFormData.notes
      });

      toast.success('Attendance marked successfully!');
      setShowMarkDialog(false);
      setMarkFormData({
        userId: '',
        status: 'PRESENT',
        notes: ''
      });
      fetchAttendance(selectedEvent);
      fetchEventStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to mark attendance');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      PRESENT: { variant: 'default', label: 'Present' },
      ABSENT: { variant: 'destructive', label: 'Absent' },
      LATE: { variant: 'outline', label: 'Late' }
    };

    const config = statusConfig[status] || statusConfig.PRESENT;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getAttendanceRateBadge = (rate: number) => {
    if (rate >= 80) return <Badge variant="default">{rate.toFixed(1)}%</Badge>;
    if (rate >= 60) return <Badge variant="secondary">{rate.toFixed(1)}%</Badge>;
    if (rate >= 40) return <Badge variant="outline">{rate.toFixed(1)}%</Badge>;
    return <Badge variant="destructive">{rate.toFixed(1)}%</Badge>;
  };

  const overallStats = {
    totalEvents: eventStats.length,
    totalAttendees: eventStats.reduce((sum, e) => sum + e.totalAttendees, 0),
    avgAttendanceRate: eventStats.length > 0
      ? eventStats.reduce((sum, e) => sum + e.attendanceRate, 0) / eventStats.length
      : 0,
    upcomingEvents: events.filter(e => new Date(e.eventDate) > new Date()).length
  };

  const selectedEventData = events.find(e => e.id === selectedEvent);
  const selectedEventStats = eventStats.find(s => s.eventId === selectedEvent);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Attendance Analytics</h1>
            <p className="text-gray-600 mt-1">Track and analyze event participation</p>
          </div>
          {isStaff && (
            <Button onClick={() => setShowMarkDialog(true)}>
              Mark Attendance
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{overallStats.totalEvents}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Attendees</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{overallStats.totalAttendees}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Avg. Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{overallStats.avgAttendanceRate.toFixed(1)}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">{overallStats.upcomingEvents}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Event Statistics Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {eventStats.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No event statistics available.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead>Present</TableHead>
                      <TableHead>Absent</TableHead>
                      <TableHead>Late</TableHead>
                      <TableHead>Attendance Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventStats.map((stat) => (
                      <TableRow key={stat.eventId}>
                        <TableCell className="font-medium">{stat.eventTitle}</TableCell>
                        <TableCell>
                          {new Date(stat.eventDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{stat.totalRegistrations}</TableCell>
                        <TableCell className="text-green-600 font-medium">{stat.present}</TableCell>
                        <TableCell className="text-red-600 font-medium">{stat.absent}</TableCell>
                        <TableCell className="text-orange-600 font-medium">{stat.late}</TableCell>
                        <TableCell>
                          {getAttendanceRateBadge(stat.attendanceRate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Attendance Details</CardTitle>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-600">Select Event:</span>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Select event..." />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {selectedEventData && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold">{selectedEventData.title}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(selectedEventData.eventDate).toLocaleString()}
                </p>
                {selectedEventStats && (
                  <div className="grid grid-cols-4 gap-4 mt-2">
                    <div>
                      <p className="text-xs text-gray-600">Registered</p>
                      <p className="text-lg font-bold">{selectedEventStats.totalRegistrations}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Present</p>
                      <p className="text-lg font-bold text-green-600">{selectedEventStats.present}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Absent</p>
                      <p className="text-lg font-bold text-red-600">{selectedEventStats.absent}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Attendance Rate</p>
                      <p className="text-lg font-bold">{selectedEventStats.attendanceRate.toFixed(1)}%</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {loading ? (
              <p>Loading attendance...</p>
            ) : attendanceRecords.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No attendance records for this event.</p>
                {isStaff && (
                  <p className="text-sm text-gray-500 mt-2">Click "Mark Attendance" to start tracking.</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participant</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Check-in Time</TableHead>
                      <TableHead>Check-out Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.userName}</TableCell>
                        <TableCell>{record.email}</TableCell>
                        <TableCell>
                          {new Date(record.checkInTime).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>
                          {record.checkOutTime
                            ? new Date(record.checkOutTime).toLocaleTimeString()
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(record.attendanceStatus)}
                        </TableCell>
                        <TableCell>{record.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showMarkDialog} onOpenChange={setShowMarkDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Mark Attendance</DialogTitle>
            </DialogHeader>
            {selectedEventData && (
              <div className="mb-4">
                <h3 className="font-semibold">{selectedEventData.title}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(selectedEventData.eventDate).toLocaleString()}
                </p>
              </div>
            )}
            <form onSubmit={handleMarkAttendance} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Participant *</label>
                <Select
                  value={markFormData.userId}
                  onValueChange={(value) => setMarkFormData({...markFormData, userId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a registered participant..." />
                  </SelectTrigger>
                  <SelectContent>
                    {registeredUsers.map((user) => (
                      <SelectItem key={user.userId} value={user.userId}>
                        {user.userName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Attendance Status *</label>
                <Select
                  value={markFormData.status}
                  onValueChange={(value) => setMarkFormData({...markFormData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRESENT">Present</SelectItem>
                    <SelectItem value="ABSENT">Absent</SelectItem>
                    <SelectItem value="LATE">Late</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={markFormData.notes}
                  onChange={(e) => setMarkFormData({...markFormData, notes: e.target.value})}
                  placeholder="Any additional notes"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setShowMarkDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Mark Attendance</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
