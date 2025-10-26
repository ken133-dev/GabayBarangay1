import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  category?: string;
  maxParticipants?: number;
}

interface Registration {
  id: string;
  eventId: string;
  event?: Event;
  userId: string;
  status: string;
  registrationDate: string;
  notes?: string;
}

export default function MyEventRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchMyRegistrations();
  }, []);

  const fetchMyRegistrations = async () => {
    try {
      const response = await api.get('/events/registrations/my');
      setRegistrations(response.data.registrations || []);
    } catch {
      toast.error('Failed to fetch event registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (registrationId: string, eventTitle: string) => {
    if (!confirm(`Are you sure you want to cancel your registration for "${eventTitle}"?`)) {
      return;
    }

    try {
      await api.delete(`/events/${registrationId}/registrations/cancel`);
      toast.success('Registration cancelled successfully');
      fetchMyRegistrations(); // Refresh the list
    } catch {
      toast.error('Failed to cancel registration');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      PENDING: { variant: 'outline', label: 'Pending Approval' },
      APPROVED: { variant: 'default', label: 'Approved' },
      REJECTED: { variant: 'destructive', label: 'Rejected' },
      CANCELLED: { variant: 'secondary', label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const isEventPast = (eventDate: string) => {
    return new Date(eventDate) < new Date();
  };

  const filteredRegistrations = filterStatus === 'all'
    ? registrations
    : registrations.filter(reg => reg.status === filterStatus);

  const stats = {
    total: registrations.length,
    approved: registrations.filter(r => r.status === 'APPROVED').length,
    pending: registrations.filter(r => r.status === 'PENDING').length,
    upcoming: registrations.filter(r => r.event && !isEventPast(r.event.eventDate) && r.status === 'APPROVED').length
  };

  return (
    <DashboardLayout currentPage="/sk/event-registration">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Event Registrations</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your community event registrations
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Registrations</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Event Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading registrations...</p>
            ) : filteredRegistrations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {registrations.length === 0 ? 'No event registrations yet.' : 'No registrations match the selected filter.'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {registrations.length === 0 ? 'Browse available events and register for community activities.' : 'Try selecting a different status filter.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRegistrations.map((registration) => (
                  <Card key={registration.id} className="border">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {registration.event?.title || 'Event Title Not Available'}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(registration.status)}
                            {registration.event?.category && (
                              <Badge variant="secondary">{registration.event.category}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            Registered on: {new Date(registration.registrationDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          {registration.event && (
                            <div className="text-sm text-gray-600">
                              <p>{new Date(registration.event.eventDate).toLocaleDateString()}</p>
                              {registration.event.startTime && (
                                <p>{new Date(registration.event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {registration.event && (
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Date:</span> {new Date(registration.event.eventDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            {registration.event.startTime && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Time:</span> {new Date(registration.event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {registration.event.endTime && ` - ${new Date(registration.event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                              </p>
                            )}
                          </div>
                          <div>
                            {registration.event.location && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Location:</span> {registration.event.location}
                              </p>
                            )}
                            {registration.event.maxParticipants && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Capacity:</span> {registration.event.maxParticipants} participants
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {registration.event?.description && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Description:</span> {registration.event.description}
                          </p>
                        </div>
                      )}

                      {registration.notes && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Your Notes:</span> {registration.notes}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-4 pt-4 border-t">
                        <div className="text-xs text-gray-500">
                          Registration ID: {registration.id}
                        </div>
                        <div className="flex gap-2">
                          {registration.status === 'APPROVED' && registration.event && !isEventPast(registration.event.eventDate) && (
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          )}
                          {registration.status === 'PENDING' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelRegistration(registration.id, registration.event?.title || 'this event')}
                            >
                              Cancel Registration
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Registration Status Information */}
        <Card>
          <CardHeader>
            <CardTitle>Registration Status Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Pending Approval</Badge>
                <span>Your registration is being reviewed by event organizers</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default">Approved</Badge>
                <span>Your registration has been approved - you're all set to attend!</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Rejected</Badge>
                <span>Your registration was not approved. Contact the organizer for details.</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Cancelled</Badge>
                <span>You cancelled this registration or it was cancelled by the organizer</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> You can cancel pending registrations at any time. Approved registrations for past events cannot be cancelled.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}