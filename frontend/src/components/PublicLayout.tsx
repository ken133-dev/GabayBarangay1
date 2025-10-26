import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { 
  User, Bell, LayoutDashboard, LogOut, ChevronDown,
  Home, Calendar, Megaphone, Phone, Info
} from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/theme-toggle';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  roles: string[];
}

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getUserName = () => {
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`.trim() || user.email;
  };

  const getUserInitials = () => {
    if (!user) return '';
    const name = getUserName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/theycare.png" alt="Gabay Barangay" className="h-10 w-10" />
              <div>
                <h1 className="text-xl font-bold">Gabay Barangay</h1>
                <p className="text-sm text-muted-foreground">Barangay Services</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button variant="ghost" onClick={() => navigate('/events/public')}>
                <Calendar className="h-4 w-4 mr-2" />
                Events
              </Button>
              <Button variant="ghost" onClick={() => navigate('/announcements')}>
                <Megaphone className="h-4 w-4 mr-2" />
                Announcements
              </Button>
              <Button variant="ghost" onClick={() => navigate('/about')}>
                <Info className="h-4 w-4 mr-2" />
                About
              </Button>
              <Button variant="ghost" onClick={() => navigate('/contact')}>
                <Phone className="h-4 w-4 mr-2" />
                Contact
              </Button>
            </nav>

            {/* User Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={getUserName()} />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block">{getUserName()}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="p-0 font-normal">
                      <div className="flex items-center gap-2 px-1 py-1.5">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={getUserName()} />
                          <AvatarFallback>{getUserInitials()}</AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">{getUserName()}</span>
                          <span className="truncate text-xs">{user.email}</span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/profile')}>
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/notifications')}>
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => navigate('/login')}>
                    Login
                  </Button>
                  <Button onClick={() => navigate('/register')}>
                    Register
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <div className="bg-background border-t mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/theycare.png" alt="Gabay Barangay" className="h-8 w-8" />
                <span className="font-bold">Gabay Barangay</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Serving the community with digital innovation and accessible barangay services.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Services</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/services" className="hover:text-foreground">Health Services</a></li>
                <li><a href="/services" className="hover:text-foreground">Daycare Services</a></li>
                <li><a href="/services" className="hover:text-foreground">SK Programs</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Community</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/events/public" className="hover:text-foreground">Events</a></li>
                <li><a href="/announcements" className="hover:text-foreground">Announcements</a></li>
                <li><a href="/about" className="hover:text-foreground">About Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/contact" className="hover:text-foreground">Contact Us</a></li>
                <li><a href="/about" className="hover:text-foreground">Help Center</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Gabay Barangay. All rights reserved.</p>
            <p className="mt-1">Serving the community with digital innovation</p>
          </div>
        </div>
      </div>
    </div>
  );
}