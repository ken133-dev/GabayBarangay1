import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '@/components/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import { api } from '@/lib/api';
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
  const [stats, setStats] = useState({
    communityMembers: 0,
    healthRecords: 0,
    daycareChildren: 0,
    skEvents: 0
  });
  const [features, setFeatures] = useState<any[]>([]);
  const [benefits, setBenefits] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [serviceFeatures, setServiceFeatures] = useState<any[]>([]);
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        setLoading(true);
        console.log('Fetching public data...');
        
        // Fetch public data (no auth required)
        const [statsRes, featuresRes, benefitsRes, testimonialsRes, serviceFeaturesRes] = await Promise.all([
          api.get('/public/stats').catch(err => {
            console.error('Stats fetch error:', err);
            return { data: { stats: { communityMembers: 0, healthRecords: 0, daycareChildren: 0, skEvents: 0 } } };
          }),
          api.get('/public/features').catch(err => {
            console.error('Features fetch error:', err);
            return { data: { features: [] } };
          }),
          api.get('/public/benefits').catch(err => {
            console.error('Benefits fetch error:', err);
            return { data: { benefits: [] } };
          }),
          api.get('/public/testimonials').catch(err => {
            console.error('Testimonials fetch error:', err);
            return { data: { testimonials: [] } };
          }),
          api.get('/public/service-features').catch(err => {
            console.error('Service features fetch error:', err);
            return { data: { features: [] } };
          })
        ]);

        console.log('Public data fetched:', { statsRes, featuresRes, benefitsRes, testimonialsRes, serviceFeaturesRes });

        setStats(statsRes.data.stats || {
          communityMembers: 0,
          healthRecords: 0,
          daycareChildren: 0,
          skEvents: 0
        });

        setFeatures(featuresRes.data.features || []);
        setBenefits(benefitsRes.data.benefits || []);
        setTestimonials(testimonialsRes.data.testimonials || []);
        setServiceFeatures(serviceFeaturesRes.data.features || []);

        // Set default contact info (no need to fetch from admin settings)
        setContactInfo({
          email: 'contact@barangaybinitayan.gov.ph',
          phone: '+63 XXX XXX XXXX',
          address: 'Barangay Binitayan, Daraga, Albay, Philippines'
        });
      } catch (error) {
        console.error('Failed to fetch public data:', error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchPublicData();
  }, []);

  const statsDisplay = [
    { value: `${stats.communityMembers}+`, label: "Community Members", icon: Users },
    { value: `${stats.healthRecords}+`, label: "Health Records Managed", icon: Heart },
    { value: `${stats.daycareChildren}+`, label: "Daycare Children", icon: Baby },
    { value: `${stats.skEvents}+`, label: "SK Events Organized", icon: Calendar }
  ];

  return (
    <PublicLayout>
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
                    Gabay Barangay:
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
                        {benefit.iconType === 'shield' ? <Shield className="h-5 w-5 text-primary" /> :
                         benefit.iconType === 'fileText' ? <FileText className="h-5 w-5 text-primary" /> :
                         benefit.iconType === 'calendar' ? <CalendarDays className="h-5 w-5 text-primary" /> :
                         benefit.iconType === 'barChart' ? <BarChart3 className="h-5 w-5 text-primary" /> :
                         <Shield className="h-5 w-5 text-primary" />}
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
                          {feature.iconType === 'users' || feature.title?.includes('SK') ? (
                            <img src="/sklogo.png" alt="SK Logo" className="h-8 w-8 object-contain" />
                          ) : feature.iconType === 'heart' || feature.title?.includes('Health') ? (
                            <Heart className="h-6 w-6 text-primary-foreground" />
                          ) : feature.iconType === 'baby' || feature.title?.includes('Daycare') ? (
                            <Baby className="h-6 w-6 text-primary-foreground" />
                          ) : (
                            <Heart className="h-6 w-6 text-primary-foreground" />
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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-foreground"></div>
              </div>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
                {statsDisplay.map((stat, idx) => (
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
            )}
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
                  Gabay Barangay complements the DILG's Barangay Information Management System (BIMS) 
                  by focusing on specialized operational needs of maternal health, daycare education, and youth engagement.
                </p>

                <div className="space-y-3">
                  {serviceFeatures.map((item, idx) => (
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
                        <a href={`mailto:${contactInfo.email}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          {contactInfo.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">Contact Number</div>
                        <a href={`tel:${contactInfo.phone.replace(/\s/g, '')}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          {contactInfo.phone}
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
                          {contactInfo.address}
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
    </PublicLayout>
  );
}