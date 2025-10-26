import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, ArrowLeft } from 'lucide-react';
import type { Event } from '@/types/index';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data.event);
    } catch (error) {
      console.error('Failed to fetch event');
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
      </div>
    </DashboardLayout>
  );
}