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
    try {
      const [infoResponse, officialsResponse, servicesResponse] = await Promise.allSettled([
        api.get('/public/barangay-info'),
        api.get('/public/officials'),
        api.get('/public/services')
      ]);

      if (infoResponse.status === 'fulfilled') {
        setBarangayInfo(infoResponse.value.data.info);
      }
      if (officialsResponse.status === 'fulfilled') {
        setOfficials(officialsResponse.value.data.officials || []);
      }
      if (servicesResponse.status === 'fulfilled') {
        setServices(servicesResponse.value.data.services || []);
      }
    } catch (error) {
      console.error('Failed to fetch barangay information:', error);
    } finally {
      setLoading(false);
    }
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
        {barangayInfo && (
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
        )}

        {/* Barangay Officials */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6">Barangay Officials</h2>
            {officials.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Official information will be available soon</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {officials.map((official) => (
                  <div key={official.id} className="text-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      {official.photo ? (
                        <img src={official.photo} alt={official.name} className="w-24 h-24 rounded-full object-cover" />
                      ) : (
                        <Users className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <h3 className="font-semibold">{official.name}</h3>
                    <p className="text-sm text-muted-foreground">{official.position}</p>
                    <Badge variant="outline" className="mt-2">{official.term}</Badge>
                  </div>
                ))}
              </div>
            )}
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