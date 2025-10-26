import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { toast } from 'sonner';
import { Trophy, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Logo } from '@/components/Logo';
import type { Event } from '@/types/index';

export default function PublicEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublicEvents();
  }, []);

  const fetchPublicEvents = async () => {
    setLoading(true);
    try {
      // Mock events fetch
      const mockEvents: Event[] = [
        { id: '1', title: 'Barangay Fiesta', description: 'Join us for a day of fun and festivities! Experience traditional games, local food, and cultural performances.', category: 'Community', eventDate: new Date().toISOString().split('T')[0], startTime: '10:00', endTime: '18:00', location: 'Barangay Hall', maxParticipants: 100, status: 'ACTIVE' },
        { id: '2', title: 'Youth Basketball League', description: 'Show off your skills on the court. Open to all youth ages 15-21. Prizes for winning teams!', category: 'Sports', eventDate: new Date().toISOString().split('T')[0], startTime: '14:00', endTime: '17:00', location: 'Basketball Court', maxParticipants: 50, status: 'ACTIVE' },
        { id: '3', title: 'Free Medical Mission', description: 'Free check-ups and consultations with licensed medical professionals. Bring your health records.', category: 'Health', eventDate: new Date().toISOString().split('T')[0], startTime: '08:00', endTime: '16:00', location: 'Health Center', maxParticipants: 200, status: 'ACTIVE' },
      ];
      setEvents(mockEvents);
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="cursor-pointer" onClick={() => navigate('/')}>
            <Logo size="sm" showText />
          </div>
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
            <Button onClick={() => navigate('/register')}>Register</Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center max-w-3xl mx-auto">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
                <Calendar className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Community Events
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl">
                Join us in our upcoming events and be a part of our growing community
              </p>
            </div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="w-full py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No upcoming events</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                {events.map(event => (
                  <Card key={event.id} className="hover:shadow-xl transition-all duration-300 hover:border-primary/50 flex flex-col">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant="secondary">{event.category}</Badge>
                      </div>
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 flex-1 flex flex-col">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{new Date(event.eventDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>{new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4 text-primary" />
                          <span>{event.maxParticipants} available slots</span>
                        </div>
                      </div>
                      <Button className="w-full" onClick={() => navigate('/login')}>
                        Register for Event
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto py-8 px-4 md:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; 2025 TheyCare Portal. All rights reserved.
            </p>
            <nav className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
