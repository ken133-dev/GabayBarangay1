import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Heart,
  Baby,
  Users,
  ArrowRight,
  Shield,
  Calendar,
  Sparkles,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Zap,
  Clock,
  Star,
  BarChart3,
  FileText,
  CalendarDays
} from 'lucide-react';

export default function Homepage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Heart,
      title: "Maternal Health Services",
      description: "Digital tracking of prenatal check-ups, immunization schedules, and health records for mothers and newborns in Barangay Binitayan.",
      stats: "Streamlined Health Monitoring"
    },
    {
      icon: Baby,
      title: "Daycare Education Management",
      description: "Online registration, attendance tracking, progress reporting, and learning material distribution for daycare programs.",
      stats: "Enhanced Child Development"
    },
    {
      icon: Users,
      title: "SK Youth Engagement",
      description: "Event planning, attendance tracking, and community participation analytics for Sangguniang Kabataan programs.",
      stats: "Active Youth Participation"
    }
  ];

  const benefits = [
    { icon: Shield, text: "Secure & Role-Based Access" },
    { icon: FileText, text: "Digital Documentation" },
    { icon: CalendarDays, text: "Automated Scheduling" },
    { icon: BarChart3, text: "Real-time Analytics" }
  ];

  const testimonials = [
    {
      name: "Hon. Michael L. Rodridueza",
      role: "Barangay Captain, Binitayan",
      content: "TheyCare Portal has transformed our community services. We can now efficiently manage health, daycare, and youth programs in one platform.",
      rating: 5
    },
    {
      name: "Gianfranco A. Tirador",
      role: "SK Chairman, Binitayan",
      content: "Event management and youth engagement have never been more organized. The portal helps us reach more community members effectively.",
      rating: 5
    },
    {
      name: "Barangay Health Worker",
      role: "BHW Team, Binitayan",
      content: "Digital health records and automated appointment scheduling have significantly improved our maternal care services.",
      rating: 5
    }
  ];

  const stats = [
    { value: "8,044+", label: "Community Members", icon: Users },
    { value: "500+", label: "Health Records Managed", icon: Heart },
    { value: "150+", label: "Daycare Children", icon: Baby },
    { value: "50+", label: "SK Events Organized", icon: Calendar }
  ];

  return (
    <div className="min-h-screen">
      {/* Modern Sticky Header with Glass Effect */}
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
            <a href="#features" className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group">
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#services" className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group">
              Services
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="/announcements" className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group">
              Announcements
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="/contact" className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group">
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
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
        <section className="relative w-full py-16 md:py-24 lg:py-32 overflow-hidden bg-muted/30">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>

          <div className="container mx-auto relative px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-6">
                <Badge className="w-fit" variant="secondary">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Official Portal of Barangay Binitayan
                </Badge>

                <div className="space-y-4">
                  <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                    TheyCare Portal:
                    <span className="block text-primary">
                      For Health, Nurture & Active Youth
                    </span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground text-lg md:text-xl">
                    A Progressive Web-Based Management System connecting maternal health services, 
                    daycare education, and Sangguniang Kabataan engagement in Barangay Binitayan, Daraga, Albay.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    size="lg"
                    onClick={() => navigate('/register')}
                    className="gap-2"
                  >
                    Join Our Community
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/services')}
                  >
                    Explore Services
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                  {benefits.map((benefit, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-card border hover:shadow-md transition-shadow duration-300">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <benefit.icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-center">{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero Visual */}
              <div className="relative">
                <Card className="shadow-2xl overflow-hidden">
                  <CardContent className="p-0">
                    <img 
                      src="/binitayan.jpg" 
                      alt="Barangay Binitayan" 
                      className="w-full h-64 md:h-80 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-lg"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="text-sm font-medium">
                        Welcome to Barangay Binitayan
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Floating Stats Cards */}
                <Card className="absolute -top-4 -left-4 shadow-xl animate-float hidden lg:block">
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                      <Zap className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="text-xl font-bold">PWA</div>
                      <div className="text-xs text-muted-foreground">Technology</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="absolute -bottom-4 -right-4 shadow-xl animate-float animation-delay-2000 hidden lg:block">
                  <CardContent className="p-3 flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="text-xl font-bold">24/7</div>
                      <div className="text-xs text-muted-foreground">Access</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
              <Badge variant="outline">Core Modules</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Comprehensive Community
                <span className="block text-primary">Services Management</span>
              </h2>
              <p className="max-w-[800px] text-muted-foreground text-lg">
                Designed specifically for Barangay Binitayan to streamline operations across health, education, and youth development programs.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {features.map((feature, idx) => (
                  <Card
                    key={idx}
                    className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-primary/50"
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-md">
                          {feature.icon === Users ? (
                            <img src="/sklogo.png" alt="SK Logo" className="h-8 w-8 object-contain" />
                          ) : (
                            <feature.icon className="h-6 w-6 text-primary-foreground" />
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {feature.stats}
                        </Badge>
                      </div>                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>

                    <Button variant="ghost" size="sm" className="gap-2 p-0 h-auto hover:text-primary">
                      Learn more
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="h-14 w-14 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
                      <stat.icon className="h-7 w-7" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold">{stat.value}</div>
                  <div className="text-sm opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
              <Badge variant="outline">Community Feedback</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Trusted by Barangay
                <span className="block text-primary">Binitayan Leaders</span>
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {testimonials.map((testimonial, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground italic">
                      "{testimonial.content}"
                    </p>
                    <Separator />
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="w-full py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div className="space-y-6">
                <Badge variant="outline">Digital Transformation</Badge>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Aligned with National
                  <span className="block text-primary">Digital Governance</span>
                </h2>
                <p className="text-muted-foreground text-lg">
                  TheyCare Portal complements the DILG's Barangay Information Management System (BIMS) 
                  by focusing on specialized operational needs of maternal health, daycare education, and youth engagement.
                </p>

                <div className="space-y-3">
                  {[
                    "Secure role-based access for BHWs, daycare staff, and SK officials",
                    "Real-time notifications and announcements",
                    "Digital certificates and printable documents",
                    "Comprehensive reporting and analytics",
                    "Mobile-responsive Progressive Web App",
                    "Backup and recovery features for data safety"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                <Button size="lg" onClick={() => navigate('/services')} className="gap-2 mt-4">
                  View All Services
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>

              <Card className="shadow-xl">
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Barangay Contact</h3>
                    <p className="text-muted-foreground">
                      Reach out to Barangay Binitayan for assistance and support.
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">Email</div>
                        <a href="mailto:barangay.binitayan@daraga.gov.ph" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          barangay.binitayan@daraga.gov.ph
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">Contact Number</div>
                        <a href="tel:+639123456789" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          +63 912 345 6789
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">Barangay Hall</div>
                        <p className="text-sm text-muted-foreground">
                          Barangay Binitayan<br />
                          Daraga, Albay, Philippines
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <Card className="shadow-xl max-w-5xl mx-auto">
              <CardContent className="p-8 md:p-12">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                      Ready to Enhance
                      <span className="block text-primary">Community Services?</span>
                    </h2>
                    <p className="text-muted-foreground text-lg">
                      Join Barangay Binitayan in embracing digital transformation for better health, 
                      education, and youth development services.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
                    <Button
                      size="lg"
                      onClick={() => navigate('/register')}
                      className="gap-2"
                    >
                      Register Now
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                      Sign In
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Modern Footer */}
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
                A Progressive Web-Based Management System for Barangay Binitayan, 
                enhancing maternal health, daycare education, and youth engagement.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Core Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Maternal Health Tracking</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Daycare Management</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">SK Youth Programs</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Digital Certificates</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/announcements" className="hover:text-primary transition-colors">Announcements</a></li>
                <li><a href="/events/public" className="hover:text-primary transition-colors">Community Events</a></li>
                <li><a href="/contact" className="hover:text-primary transition-colors">Contact Support</a></li>
                <li><a href="/about" className="hover:text-primary transition-colors">About Project</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Data Protection</a></li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 TheyCare Portal - Barangay Binitayan, Daraga, Albay. Capstone Project for BS Information Technology.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -20px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(20px, 20px) scale(1.05);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}