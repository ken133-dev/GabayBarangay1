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
import { Search, CalendarPlus, Calendar, Clock, CheckCircle, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import type { Appointment, Patient } from '@/types/index';

export default function AppointmentScheduling() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
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
    } catch {
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
    } catch {
      toast.error('Failed to fetch patients');
      console.error('Failed to fetch patients');
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      appointmentDate: '',
      appointmentType: 'GENERAL_CHECKUP',
      notes: ''
    });
    setIsEditing(false);
    setSelectedAppointment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing) {
      await handleUpdateAppointment(e);
      return;
    }
    
    try {
      await api.post('/health/appointments', formData);
      setShowAddDialog(false);
      resetForm();
      fetchAppointments();
      toast.success('Appointment scheduled successfully');
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
        ? String((error.response.data as { error: string }).error)
        : 'Failed to schedule appointment';
      toast.error(message);
    }
  };

  const handleUpdateStatus = async (appointmentId: string, status: string) => {
    try {
      await api.patch(`/health/appointments/${appointmentId}/status`, { status });
      fetchAppointments();
      toast.success(`Appointment ${status.toLowerCase()} successfully`);
      setShowDetailsDialog(false);
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
        ? String((error.response.data as { error: string }).error)
        : 'Failed to update appointment';
      toast.error(message);
    }
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsDialog(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsEditing(true);
    setFormData({
      patientId: appointment.patientId || '',
      appointmentDate: new Date(appointment.appointmentDate).toISOString().slice(0, 16),
      appointmentType: appointment.appointmentType,
      notes: appointment.notes || ''
    });
    setShowAddDialog(true);
  };

  const handleDeleteAppointment = async (appointment: Appointment) => {
    try {
      await api.delete(`/health/appointments/${appointment.id}`);
      setAppointments(appointments.filter(a => a.id !== appointment.id));
      toast.success('Appointment deleted successfully');
      setShowDeleteDialog(false);
      setAppointmentToDelete(null);
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
        ? String((error.response.data as { error: string }).error)
        : 'Failed to delete appointment';
      toast.error(message);
    }
  };

  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      await api.put(`/health/appointments/${selectedAppointment.id}`, formData);
      fetchAppointments();
      toast.success('Appointment updated successfully');
      setShowAddDialog(false);
      resetForm();
      setIsEditing(false);
      setSelectedAppointment(null);
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
        ? String((error.response.data as { error: string }).error)
        : 'Failed to update appointment';
      toast.error(message);
    }
  };

  const filteredAppointments = appointments.filter(appointment =>
    `${appointment.patient?.firstName} ${appointment.patient?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingCount = appointments.filter((a: Appointment) =>
    new Date(a.appointmentDate) > new Date() && a.status === 'SCHEDULED'
  ).length;

  const completedCount = appointments.filter((a: Appointment) => a.status === 'COMPLETED').length;

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
                <DialogTitle>{isEditing ? 'Edit Appointment' : 'Schedule New Appointment'}</DialogTitle>
                <DialogDescription>
                  {isEditing ? 'Update appointment details' : 'Book a health appointment for a patient'}
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
                  <Button type="submit">{isEditing ? 'Update Appointment' : 'Schedule Appointment'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Appointment Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
              <DialogDescription>
                Complete appointment information and management
              </DialogDescription>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Patient Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Patient Name</Label>
                        <p className="text-sm">{selectedAppointment.patient?.firstName} {selectedAppointment.patient?.lastName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Contact</Label>
                        <p className="text-sm">{selectedAppointment.patient?.contactNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                        <p className="text-sm">{selectedAppointment.patient?.address || 'N/A'}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Appointment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                        <div className="mt-1">{getTypeBadge(selectedAppointment.appointmentType)}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Date & Time</Label>
                        <p className="text-sm">{new Date(selectedAppointment.appointmentDate).toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                        <div className="mt-1">{getStatusBadge(selectedAppointment.status)}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Health Worker</Label>
                        <p className="text-sm">{selectedAppointment.healthWorker?.firstName} {selectedAppointment.healthWorker?.lastName}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Notes */}
                {selectedAppointment.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedAppointment.notes}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                    Close
                  </Button>
                  <div className="flex gap-2">
                    {selectedAppointment.status === 'SCHEDULED' && (
                      <>
                        <Button 
                          variant="outline"
                          onClick={() => handleUpdateStatus(selectedAppointment.id, 'CANCELLED')}
                        >
                          Cancel Appointment
                        </Button>
                        <Button 
                          onClick={() => handleUpdateStatus(selectedAppointment.id, 'COMPLETED')}
                        >
                          Mark as Completed
                        </Button>
                      </>
                    )}
                    {selectedAppointment.status === 'CANCELLED' && (
                      <Button 
                        onClick={() => handleUpdateStatus(selectedAppointment.id, 'SCHEDULED')}
                      >
                        Reschedule
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Appointment</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this appointment? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {appointmentToDelete && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Patient: {appointmentToDelete.patient?.firstName} {appointmentToDelete.patient?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Date: {new Date(appointmentToDelete.appointmentDate).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Type: {appointmentToDelete.appointmentType.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDeleteAppointment(appointmentToDelete)}
                  >
                    Delete Appointment
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Total Appointments
              </CardTitle>
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{appointments.length}</div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                All scheduled appointments
              </p>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Upcoming
              </CardTitle>
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">{upcomingCount}</div>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Scheduled for future
              </p>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                Completed
              </CardTitle>
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 dark:text-green-100">{completedCount}</div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
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
        <Card className="bg-linear-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 border-slate-200 dark:border-slate-800">
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
                      <TableRow key={appointment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
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
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewDetails(appointment)}
                              className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="View appointment details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditAppointment(appointment)}
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                              title="Edit appointment details"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setAppointmentToDelete(appointment);
                                setShowDeleteDialog(true);
                              }}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                              title="Delete appointment"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
