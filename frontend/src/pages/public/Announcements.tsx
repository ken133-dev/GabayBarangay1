import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import { Megaphone, Search } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  publishedAt: string;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      // Mock announcements fetch
      const mockAnnouncements: Announcement[] = [
        { id: '1', title: 'Community Cleanup Drive', content: 'Join us this Saturday for a community cleanup drive. Together we can make our barangay cleaner and greener.', category: 'EVENTS', publishedAt: new Date().toISOString() },
        { id: '2', title: 'Free Vaccination Camp', content: 'Get your free flu shots this weekend at the barangay health center. Open to all residents.', category: 'HEALTH', publishedAt: new Date().toISOString() },
        { id: '3', title: 'Daycare Enrollment Open', content: 'Enroll your kids in our daycare program for the upcoming year. Limited slots available.', category: 'DAYCARE', publishedAt: new Date().toISOString() },
      ];
      setAnnouncements(mockAnnouncements);
    } catch (error) {
      toast.error('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter(a =>
    (a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.content.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterCategory === 'All' || a.category === filterCategory)
  );

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
                <Megaphone className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Announcements
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl">
                Stay informed with the latest news and updates from your barangay
              </p>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="w-full py-8 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col sm:flex-row justify-center gap-3 max-w-3xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search announcements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="HEALTH">Health</SelectItem>
                  <SelectItem value="DAYCARE">Daycare</SelectItem>
                  <SelectItem value="EVENTS">Events</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Announcements Grid */}
        <section className="w-full py-12 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="text-center py-12">
                <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm || filterCategory !== 'All' ? 'No announcements found matching your criteria' : 'No announcements available'}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                {filteredAnnouncements.map(announcement => (
                  <Card key={announcement.id} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant="secondary">{announcement.category}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(announcement.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <CardTitle className="text-xl">{announcement.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        {announcement.content}
                      </CardDescription>
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
