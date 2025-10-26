import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, MapPin, Users, Eye, Trash2, Play, X } from 'lucide-react';
import type { Event } from '@/types/index';

export default function EventManagement() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    location: '',
    category: '',
    maxParticipants: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data.events || []);
    } catch {
      console.error('Failed to fetch events');
    }
  };

  const handleSubmit = async (e: React.FormEvent, status: 'DRAFT' | 'PUBLISHED') => {
    e.preventDefault();
    try {
      await api.post('/events', {
        ...formData,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        status
      });
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        eventDate: '',
        startTime: '',
        endTime: '',
        location: '',
        category: '',
        maxParticipants: ''
      });
      fetchEvents();
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
        ? String((error.response.data as { error: string }).error)
        : 'Failed to create event';
      alert(message);
    }
  };

  const handlePublishEvent = async (eventId: string) => {
    try {
      await api.patch(`/events/${eventId}/status`, { status: 'PUBLISHED' });
      fetchEvents();
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
        ? String((error.response.data as { error: string }).error)
        : 'Failed to publish event';
      alert(message);
    }
  };

  const handleCancelEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to cancel this event?')) {
      try {
        await api.patch(`/events/${eventId}/status`, { status: 'CANCELLED' });
        fetchEvents();
      } catch (error: unknown) {
        const message = error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
          ? String((error.response.data as { error: string }).error)
          : 'Failed to cancel event';
        alert(message);
      }
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await api.delete(`/events/${eventId}`);
        fetchEvents();
      } catch (error: unknown) {
        const message = error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
          ? String((error.response.data as { error: string }).error)
          : 'Failed to delete event';
        alert(message);
      }
    }
  };

  return (
    <DashboardLayout currentPage="/sk/events">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Event Management</h1>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : 'Create New Event'}
          </Button>
        </div>

        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Event</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Event Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description *</label>
                  <Textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Event Date *</label>
                    <Input
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Start Time *</label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Time</label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Location *</label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      placeholder="Sports, Cultural, Educational, etc."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Participants</label>
                    <Input
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                      placeholder="Leave blank for unlimited"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={(e) => handleSubmit(e, 'DRAFT')}>
                    Save as Draft
                  </Button>
                  <Button type="button" className="flex-1" onClick={(e) => handleSubmit(e, 'PUBLISHED')}>
                    Publish Event
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          {events.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">No events created yet.</p>
                <p className="text-sm text-muted-foreground text-center mt-1">Create your first event to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                      <Badge variant={event.status === 'PUBLISHED' ? 'default' : event.status === 'DRAFT' ? 'secondary' : event.status === 'COMPLETED' ? 'outline' : 'destructive'}>
                        {event.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          {event.endTime && ` - ${new Date(event.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                      {event.maxParticipants && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>Max: {event.maxParticipants}</span>
                        </div>
                      )}
                      {event.category && (
                        <Badge variant="outline" className="w-fit">{event.category}</Badge>
                      )}
                    </div>

                    <Separator />

                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/sk/events/${event.id}`)}>
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      {event.status === 'DRAFT' && (
                        <Button size="sm" onClick={() => handlePublishEvent(event.id)}>
                          <Play className="h-3 w-3 mr-1" />
                          Publish
                        </Button>
                      )}
                      {(event.status === 'DRAFT' || event.status === 'PUBLISHED') && (
                        <Button size="sm" variant="destructive" onClick={() => handleCancelEvent(event.id)}>
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      )}
                      {event.status === 'DRAFT' && (
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteEvent(event.id)}>
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
