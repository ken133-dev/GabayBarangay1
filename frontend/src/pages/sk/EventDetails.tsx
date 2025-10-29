import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, ArrowLeft, UserCheck } from 'lucide-react';
import type { Event } from '@/types/index';

interface EventRegistration {
  id: string;
  status: string;
  registeredAt: string;
  confirmedAt?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const [eventResponse, registrationsResponse] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/events/${id}/registrations?status=APPROVED`)
      ]);
      setEvent(eventResponse.data.event);
      setRegistrations(registrationsResponse.data.registrations || []);
    } catch (error) {
      console.error('Failed to fetch event data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout currentPage="/sk/events">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout currentPage="/sk/events">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Event not found</p>
          <Button onClick={() => navigate('/sk/events')} className="mt-4">
            Back to Events
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="/sk/events">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/sk/events')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
          <Badge variant={event.status === 'PUBLISHED' ? 'default' : event.status === 'DRAFT' ? 'secondary' : 'destructive'}>
            {event.status}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{event.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">{event.description}</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.eventDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      {event.endTime && ` - ${new Date(event.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </div>
                </div>
                
                {event.maxParticipants && (
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Capacity</p>
                      <p className="text-sm text-muted-foreground">{event.maxParticipants} participants</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {event.category && (
              <div>
                <p className="font-medium mb-2">Category</p>
                <Badge variant="outline">{event.category}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approved Participants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Approved Participants ({registrations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {registrations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No approved participants yet.
              </p>
            ) : (
              <div className="space-y-3">
                {registrations.map((registration) => (
                  <div key={registration.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {registration.user.firstName.charAt(0)}{registration.user.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {registration.user.firstName} {registration.user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {registration.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="default">Approved</Badge>
                      {registration.confirmedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Confirmed {new Date(registration.confirmedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}