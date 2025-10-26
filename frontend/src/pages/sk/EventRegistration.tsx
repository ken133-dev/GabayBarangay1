import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  registeredCount?: number;
  status?: string;
}

interface Registration {
  id: string;
  eventId: string;
  event?: Event;
  userId: string;
  userName: string;
  email: string;
  contactNumber?: string;
  status: string;
  registrationDate: string;
  notes?: string;
}

export default function EventRegistration() {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filterEvent, setFilterEvent] = useState('');
  const [formData, setFormData] = useState({
    contactNumber: '',
    notes: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRoles = user.roles || [user.role]; // Support both single role and multi-role
  const isStaff = userRoles.some((role: string) => ['SK_OFFICER', 'SK_CHAIRMAN', 'SYSTEM_ADMIN'].includes(role));

  useEffect(() => {
    fetchEvents();
    fetchRegistrations();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      const eventsData = response.data.events || [];

      // Fetch registration counts for each event
      const eventsWithCounts = await Promise.all(
        eventsData.map(async (event: Event) => {
          try {
            const regResponse = await api.get(`/events/${event.id}/registrations`);
            return {
              ...event,
              registeredCount: regResponse.data.registrations?.length || 0
            };
          } catch {
            return { ...event, registeredCount: 0 };
          }
        })
      );

      setEvents(eventsWithCounts);
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const response = await api.get('/events/registrations/my');
      setRegistrations(response.data.registrations || []);
    } catch (error) {
      toast.error('Failed to fetch registrations');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEvent) return;

    // Check if already registered
    const existingReg = registrations.find(
      r => r.eventId === selectedEvent.id && r.userId === user.userId
    );

    if (existingReg) {
      toast.error('You are already registered for this event');
      return;
    }

    // Check capacity
    if (selectedEvent.capacity && selectedEvent.registeredCount! >= selectedEvent.capacity) {
      toast.error('Event is at full capacity');
      return;
    }

    try {
      await api.post('/events/register', {
        eventId: selectedEvent.id,
        contactNumber: formData.contactNumber,
        notes: formData.notes
      });

      toast.success('Registration successful!');
      setShowRegisterDialog(false);
      setSelectedEvent(null);
      setFormData({
        contactNumber: '',
        notes: ''
      });
      // Refresh both events and registrations to update UI
      await Promise.all([fetchEvents(), fetchRegistrations()]);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
    }
  };

  const handleApprove = async (registrationId: string) => {
    try {
      await api.patch(`/events/registrations/${registrationId}`, {
        status: 'APPROVED'
      });
      toast.success('Registration approved');
      fetchRegistrations();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to approve registration');
    }
  };

  const handleReject = async (registrationId: string) => {
    try {
      await api.patch(`/events/registrations/${registrationId}`, {
        status: 'REJECTED'
      });
      toast.success('Registration rejected');
      fetchRegistrations();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reject registration');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      PENDING: { variant: 'outline', label: 'Pending' },
      APPROVED: { variant: 'default', label: 'Approved' },
      REJECTED: { variant: 'destructive', label: 'Rejected' },
      CANCELLED: { variant: 'secondary', label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const isEventFull = (event: Event) => {
    return event.capacity && event.registeredCount! >= event.capacity;
  };

  const isEventPast = (eventDate: string) => {
    return new Date(eventDate) < new Date();
  };

  const myRegistrations = registrations.filter(r => r.userId === user.id || r.userId === user.userId);
  const filteredRegistrations = filterEvent
    ? registrations.filter(r => r.eventId === filterEvent)
    : registrations;

  const stats = {
    totalEvents: events.length,
    upcomingEvents: events.filter(e => !isEventPast(e.eventDate)).length,
    myRegistrations: myRegistrations.length,
    pendingApprovals: registrations.filter(r => r.status === 'PENDING').length
  };

  return (
    <DashboardLayout currentPage="/sk/event-registration">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Event Registration</h1>
          <p className="text-muted-foreground">Register for community events and manage registrations</p>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalEvents}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{stats.upcomingEvents}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">My Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.myRegistrations}</p>
            </CardContent>
          </Card>
          {isStaff && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Available Events</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading events...</p>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No events available.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => {
                  const isRegistered = myRegistrations.some(r => r.eventId === event.id);
                  const isFull = isEventFull(event);
                  const isPast = isEventPast(event.eventDate);
                  const isCancelled = event.status === 'CANCELLED';

                  return (
                    <Card key={event.id} className="border">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{event.title}</h3>
                          {isCancelled && <Badge variant="destructive">Cancelled</Badge>}
                          {isPast && !isCancelled && <Badge variant="secondary">Past</Badge>}
                          {isFull && !isPast && !isCancelled && <Badge variant="destructive">Full</Badge>}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {new Date(event.eventDate).toLocaleString()}
                        </p>
                        {event.location && (
                          <p className="text-sm text-gray-600 mb-2">
                            📍 {event.location}
                          </p>
                        )}
                        {event.capacity && (
                          <p className="text-sm text-gray-600 mb-3">
                            Capacity: {event.registeredCount}/{event.capacity}
                          </p>
                        )}
                        {event.description && (
                          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                        {isRegistered ? (
                          <Badge variant="default" className="w-full justify-center">
                            Already Registered
                          </Badge>
                        ) : (
                          <Button
                            className="w-full"
                            disabled={isFull || isPast || isCancelled}
                            onClick={() => {
                              setSelectedEvent(event);
                              setShowRegisterDialog(true);
                            }}
                          >
                            {isCancelled ? 'Event Cancelled' : isPast ? 'Event Ended' : isFull ? 'Event Full' : 'Register Now'}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {isStaff && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Manage Registrations</CardTitle>
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-gray-600">Filter by event:</span>
                  <select
                    className="border rounded-md px-3 py-1"
                    value={filterEvent}
                    onChange={(e) => setFilterEvent(e.target.value)}
                  >
                    <option value="">All events</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredRegistrations.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No registrations yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Participant</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Registered Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRegistrations.map((registration) => (
                        <TableRow key={registration.id}>
                          <TableCell className="font-medium">
                            {registration.event?.title}
                          </TableCell>
                          <TableCell>{registration.userName}</TableCell>
                          <TableCell>{registration.email}</TableCell>
                          <TableCell>{registration.contactNumber || '-'}</TableCell>
                          <TableCell>
                            {new Date(registration.registrationDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(registration.status)}
                          </TableCell>
                          <TableCell>
                            {registration.status === 'PENDING' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(registration.id)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(registration.id)}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
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

        <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Register for Event</DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="mb-4">
                <h3 className="font-semibold text-lg">{selectedEvent.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(selectedEvent.eventDate).toLocaleString()}
                </p>
                {selectedEvent.location && (
                  <p className="text-sm text-gray-600">📍 {selectedEvent.location}</p>
                )}
              </div>
            )}
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Contact Number</label>
                <Input
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  placeholder="Enter your contact number"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Additional Notes</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any special requirements or questions"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your registration will be pending approval by the event organizer.
                  You will receive a notification once your registration is approved.
                </p>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowRegisterDialog(false);
                    setSelectedEvent(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Confirm Registration</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
