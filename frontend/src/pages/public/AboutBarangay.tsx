import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  MapPin, Phone, Mail, Users, Heart, Baby, PartyPopper, 
  ArrowRight, Sparkles, Calendar, Award, Building
} from 'lucide-react';

export default function AboutBarangay() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/theycare.png" alt="TheyCare" className="h-10 w-10" />
            <div className="flex flex-col">
              <span className="font-bold text-xl leading-none text-primary">
                TheyCare
              </span>
              <span className="text-xs text-muted-foreground leading-none">Portal Binitayan</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="/#features" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Features
            </a>
            <a href="/#services" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Services
            </a>
            <a href="/announcements" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Announcements
            </a>
            <a href="/about" className="text-sm font-medium text-primary">
              About
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => navigate('/login')} className="hidden sm:inline-flex">
              Login
            </Button>
            <Button onClick={() => navigate('/register')} className="gap-2">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center max-w-4xl mx-auto">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
                <Building className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                About Barangay Binitayan
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl">
                Learn about our community, services, and commitment to serving the residents of Daraga, Albay
              </p>
            </div>
          </div>
        </section>

        {/* Barangay Information */}
        <section className="w-full py-12 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Location & Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Address</h4>
                    <p className="text-muted-foreground">
                      Barangay Binitayan<br />
                      Daraga, Albay, Philippines
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Contact Information</h4>
                    <div className="space-y-2 text-muted-foreground">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        +63 XXX XXX XXXX
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        contact@barangaybinitayan.gov.ph
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Office Hours</h4>
                    <p className="text-muted-foreground">
                      Monday - Friday: 8:00 AM - 5:00 PM<br />
                      Saturday: 8:00 AM - 12:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Barangay Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Population</h4>
                    <p className="text-muted-foreground">
                      Approximately 2,500 residents across 500+ households
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Land Area</h4>
                    <p className="text-muted-foreground">
                      15.2 square kilometers
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Established</h4>
                    <p className="text-muted-foreground">
                      1952 - Over 70 years of community service
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Classification</h4>
                    <p className="text-muted-foreground">
                      Rural Barangay - Agricultural and Residential
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Services Overview */}
        <section className="w-full py-12 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Services</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Comprehensive services designed to support the health, education, and well-being of our community
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Heart className="h-6 w-6 mr-2 text-red-500" />
                    Health Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Maternal and child health programs</li>
                    <li>• Immunization and vaccination</li>
                    <li>• Health monitoring and records</li>
                    <li>• Emergency medical assistance</li>
                    <li>• Health education and awareness</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Baby className="h-6 w-6 mr-2 text-yellow-500" />
                    Daycare Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Early childhood education</li>
                    <li>• Nutritional feeding programs</li>
                    <li>• Child development monitoring</li>
                    <li>• Learning materials and activities</li>
                    <li>• Parent education and support</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <PartyPopper className="h-6 w-6 mr-2 text-purple-500" />
                    Youth Programs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Sangguniang Kabataan activities</li>
                    <li>• Sports and recreation programs</li>
                    <li>• Skills development workshops</li>
                    <li>• Community service projects</li>
                    <li>• Leadership training programs</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="w-full py-12 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Our Mission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    To provide efficient, transparent, and responsive governance that promotes the welfare, 
                    safety, and development of all residents of Barangay Binitayan through innovative 
                    programs and services that address community needs and foster sustainable growth.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Our Vision
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    A progressive, peaceful, and prosperous barangay where every resident enjoys quality 
                    health services, educational opportunities, and active participation in community 
                    development, creating a model community for sustainable living.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="w-full py-16 bg-primary">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center text-primary-foreground">
              <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
              <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                Experience the convenience of digital barangay services. Register today to access 
                health services, daycare programs, and community events.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => navigate('/register')}
                  className="gap-2"
                >
                  Register Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/contact')}
                  className="gap-2 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  Contact Us
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto py-12 md:py-16 px-4 md:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">TheyCare Portal</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Digital barangay services for Binitayan, Daraga, Albay
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/announcements" className="hover:text-primary transition-colors">Announcements</a></li>
                <li><a href="/events/public" className="hover:text-primary transition-colors">Events</a></li>
                <li><a href="/contact" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="/about" className="hover:text-primary transition-colors">About</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Health Services</li>
                <li>Daycare Programs</li>
                <li>Youth Activities</li>
                <li>Community Events</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Barangay Binitayan</li>
                <li>Daraga, Albay</li>
                <li>+63 XXX XXX XXXX</li>
                <li>contact@barangaybinitayan.gov.ph</li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 TheyCare Portal - Barangay Binitayan. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}