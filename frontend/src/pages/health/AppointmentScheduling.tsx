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
import { Search, CalendarPlus, Calendar, Clock, Users, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Appointment, Patient } from '@/types/index';

export default function AppointmentScheduling() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    patientId: '',
    appointmentDate: '',
    appointmentType: 'GENERAL_CHECKUP',
    notes: ''
  });

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/health/appointments');
      setAppointments(response.data.appointments || []);
    } catch (error) {
      toast.error('Failed to fetch appointments');
      console.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/health/patients');
      setPatients(response.data.patients || []);
    } catch (error) {
      toast.error('Failed to fetch patients');
      console.error('Failed to fetch patients');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/health/appointments', formData);
      setShowAddDialog(false);
      setFormData({
        patientId: '',
        appointmentDate: '',
        appointmentType: 'GENERAL_CHECKUP',
        notes: ''
      });
      fetchAppointments();
      toast.success('Appointment scheduled successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to schedule appointment');
    }
  };

  const filteredAppointments = appointments.filter(appointment =>
    `${appointment.patient?.firstName} ${appointment.patient?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingCount = appointments.filter(a =>
    new Date(a.appointmentDate) > new Date() && a.status === 'SCHEDULED'
  ).length;

  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      SCHEDULED: { variant: 'default', label: 'Scheduled' },
      COMPLETED: { variant: 'secondary', label: 'Completed' },
      CANCELLED: { variant: 'destructive', label: 'Cancelled' },
      RESCHEDULED: { variant: 'outline', label: 'Rescheduled' }
    };

    const config = statusConfig[status] || statusConfig.SCHEDULED;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeColors: Record<string, 'default' | 'secondary' | 'outline'> = {
      'PRENATAL': 'default',
      'POSTNATAL': 'secondary',
      'IMMUNIZATION': 'outline',
      'GENERAL_CHECKUP': 'default',
      'FOLLOW_UP': 'secondary'
    };

    return <Badge variant={typeColors[type] || 'outline'}>{type.replace('_', ' ')}</Badge>;
  };

  return (
    <DashboardLayout currentPage="/health/appointments">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Appointment Scheduling
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage patient appointments and schedules
            </p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <CalendarPlus className="h-5 w-5" />
                Schedule Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
                <DialogDescription>
                  Book a health appointment for a patient
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient">Patient *</Label>
                    <Select value={formData.patientId} onValueChange={(value) => setFormData({...formData, patientId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient..." />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.firstName} {patient.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="appointmentDate">Appointment Date & Time *</Label>
                      <Input
                        id="appointmentDate"
                        type="datetime-local"
                        value={formData.appointmentDate}
                        onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="appointmentType">Appointment Type *</Label>
                      <Select value={formData.appointmentType} onValueChange={(value) => setFormData({...formData, appointmentType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PRENATAL">Prenatal Check-up</SelectItem>
                          <SelectItem value="POSTNATAL">Postnatal Check-up</SelectItem>
                          <SelectItem value="IMMUNIZATION">Immunization</SelectItem>
                          <SelectItem value="GENERAL_CHECKUP">General Check-up</SelectItem>
                          <SelectItem value="FOLLOW_UP">Follow-up</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <textarea
                      id="notes"
                      className="w-full p-2 border rounded-md"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Any special instructions or notes..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Schedule Appointment</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Appointments
              </CardTitle>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{appointments.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All scheduled appointments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming
              </CardTitle>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{upcomingCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Scheduled for future
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
              <CheckCircle className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Finished appointments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search appointments by patient name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment Schedule</CardTitle>
            <CardDescription>
              View and manage all patient appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No appointments found matching your search' : 'No appointments scheduled yet'}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">
                          {appointment.patient?.firstName} {appointment.patient?.lastName}
                        </TableCell>
                        <TableCell>
                          {getTypeBadge(appointment.appointmentType)}
                        </TableCell>
                        <TableCell>
                          {new Date(appointment.appointmentDate).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(appointment.status)}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {appointment.notes || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View Details
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
