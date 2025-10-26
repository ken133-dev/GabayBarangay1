import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Baby, Users, FileText, Shield, Handshake } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Services() {
  const navigate = useNavigate();

  const services = [
    { title: 'Health Services', description: 'Medical consultations, vaccinations, and health records.', icon: <Heart className="h-6 w-6 text-primary-foreground" /> },
    { title: 'Daycare Services', description: 'Early childhood care and development programs.', icon: <Baby className="h-6 w-6 text-primary-foreground" /> },
    { title: 'SK Youth Programs', description: 'Youth development and community engagement.', icon: <Users className="h-6 w-6 text-primary-foreground" /> },
    { title: 'Document Services', description: 'Request for barangay certificates and clearances.', icon: <FileText className="h-6 w-6 text-primary-foreground" /> },
    { title: 'Dispute Resolution', description: 'Community mediation and settlement services.', icon: <Shield className="h-6 w-6 text-primary-foreground" /> },
    { title: 'Social Welfare', description: 'Assistance programs for residents in need.', icon: <Handshake className="h-6 w-6 text-primary-foreground" /> },
  ];

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
                <Heart className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Our Services
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl">
                We provide a wide range of services to cater to the needs of our community.
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="w-full py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {services.map((service, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow duration-300"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-md flex-shrink-0">
                        {service.icon}
                      </div>
                    </div>
                    <CardTitle className="mt-4">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-sm">
                      {service.description}
                    </CardDescription>
                    <Button variant="outline" className="w-full">Learn More</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto py-8 px-4 md:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">&copy; 2025 TheyCare Portal. All rights reserved.</p>
            <nav className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}