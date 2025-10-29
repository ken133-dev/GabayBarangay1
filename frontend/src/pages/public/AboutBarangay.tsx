import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import PublicLayout from '@/components/PublicLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, Phone, Mail, Clock, Users, Heart, Baby, 
  Calendar, Award, Building, Shield, Landmark 
} from 'lucide-react';

interface BarangayInfo {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  officeHours: string;
  population: number;
  area: string;
  established: string;
}

interface Official {
  id: string;
  name: string;
  position: string;
  photo?: string;
  term: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  department: string;
}

export default function AboutBarangay() {
  const [barangayInfo, setBarangayInfo] = useState<BarangayInfo | null>(null);
  const [officials, setOfficials] = useState<Official[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBarangayInfo();
  }, []);

  const fetchBarangayInfo = async () => {
    // Static data for Barangay Binitayan, Daraga, Albay
    const staticBarangayInfo: BarangayInfo = {
      name: 'Barangay Binitayan',
      description: 'A vibrant rural barangay located in the municipality of Daraga, Province of Albay, Bicol Region. Known for its scenic views of Mayon Volcano and strong community spirit.',
      address: 'Binitayan, Daraga, Albay 4501, Philippines',
      phone: '(052) 123-4567',
      email: 'barangay.binitayan@daraga.gov.ph',
      officeHours: 'Monday - Friday: 8:00 AM - 5:00 PM',
      population: 3842, // Based on 2020 Census
      area: '2.85 km²',
      established: '1957'
    };

    const staticOfficials: Official[] = [
      {
        id: '1',
        name: 'Hon. Maria Santos',
        position: 'Barangay Captain',
        term: '2023-2026'
      },
      {
        id: '2', 
        name: 'Hon. Juan Dela Cruz',
        position: 'Barangay Kagawad',
        term: '2023-2026'
      },
      {
        id: '3',
        name: 'Hon. Ana Rodriguez',
        position: 'SK Chairman',
        term: '2023-2026'
      }
    ];

    // Simulate loading delay
    setTimeout(() => {
      setBarangayInfo(staticBarangayInfo);
      setOfficials(staticOfficials);
      setServices([]); // Keep services empty to show default services
      setLoading(false);
    }, 1000);
  };

  const getServiceIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      heart: Heart,
      baby: Baby,
      calendar: Calendar,
      users: Users,
      shield: Shield,
      building: Building
    };
    const IconComponent = icons[iconName] || Building;
    return <IconComponent className="h-8 w-8" />;
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Barangay Overview */}
        {barangayInfo && (
          <Card>
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <Landmark className="h-16 w-16 text-primary" />
                </div>
                <h1 className="text-4xl font-bold mb-4">{barangayInfo.name}</h1>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  {barangayInfo.description}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                <div className="text-center">
                  <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{barangayInfo.population.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Population</div>
                </div>
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{barangayInfo.area}</div>
                  <div className="text-sm text-muted-foreground">Area</div>
                </div>
                <div className="text-center">
                  <Calendar className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{barangayInfo.established}</div>
                  <div className="text-sm text-muted-foreground">Established</div>
                </div>
                <div className="text-center">
                  <Award className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">A+</div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        {/* {barangayInfo && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <div className="font-medium">Address</div>
                      <div className="text-muted-foreground">{barangayInfo.address}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <div className="font-medium">Phone</div>
                      <div className="text-muted-foreground">{barangayInfo.phone}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-muted-foreground">{barangayInfo.email}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <div className="font-medium">Office Hours</div>
                      <div className="text-muted-foreground">{barangayInfo.officeHours}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )} */}

        {/* Barangay Officials */}
        {/* {officials.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Barangay Officials</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {officials.map((official) => (
                  <div key={official.id} className="text-center p-6 border rounded-lg">
                    <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-1">{official.name}</h3>
                    <p className="text-sm text-primary font-medium mb-1">{official.position}</p>
                    <p className="text-xs text-muted-foreground">Term: {official.term}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )} */}

        {/* Location & Geography */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6">Location & Geography</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Administrative Division</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Municipality: Daraga</div>
                    <div>Province: Albay</div>
                    <div>Region: Bicol Region (Region V)</div>
                    <div>Island Group: Luzon</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Classification</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Type: Rural Barangay</div>
                    <div>Income Class: 4th Class</div>
                    <div>Urbanization: Rural</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Geographic Features</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Elevation: 150-300 meters above sea level</div>
                    <div>Climate: Tropical, Type II (No dry season)</div>
                    <div>Notable Feature: View of Mayon Volcano</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Demographics (2020 Census)</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Population: 3,842 residents</div>
                    <div>Households: ~960 families</div>
                    <div>Density: 1,348 people/km²</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
 

        {/* Services */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6">Our Services</h2>
            {services.length === 0 ? (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 border rounded-lg">
                  <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Health Services</h3>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive healthcare including prenatal care, immunizations, and health monitoring
                  </p>
                </div>
                <div className="text-center p-6 border rounded-lg">
                  <Baby className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Daycare Services</h3>
                  <p className="text-sm text-muted-foreground">
                    Early childhood education and care for children aged 3-5 years
                  </p>
                </div>
                <div className="text-center p-6 border rounded-lg">
                  <Calendar className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">SK Programs</h3>
                  <p className="text-sm text-muted-foreground">
                    Youth development programs and community engagement activities
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <div key={service.id} className="text-center p-6 border rounded-lg">
                    <div className="text-primary mx-auto mb-4">
                      {getServiceIcon(service.icon)}
                    </div>
                    <h3 className="font-semibold mb-2">{service.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                    <Badge variant="outline">{service.department}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Get Started with Gabay Barangay</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join our digital community and access all barangay services online. 
              Register today to schedule appointments, enroll in daycare, and stay updated with community events.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => window.location.href = '/register'}>
                Register Now
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.href = '/login'}>
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}