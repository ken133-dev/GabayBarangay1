import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Baby, Users } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import { api } from '@/lib/api';

export default function Services() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get('/public/features');
        setServices(response.data.features || []);
      } catch (error) {
        console.error('Failed to fetch services:', error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <PublicLayout>

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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No services available at the moment.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                {services.map((service, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-lg transition-shadow duration-300"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-md flex-shrink-0">
                          {service.iconType === 'heart' ? <Heart className="h-6 w-6 text-primary-foreground" /> :
                           service.iconType === 'baby' ? <Baby className="h-6 w-6 text-primary-foreground" /> :
                           service.iconType === 'users' ? <Users className="h-6 w-6 text-primary-foreground" /> :
                           <Heart className="h-6 w-6 text-primary-foreground" />}
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
            )}
          </div>
        </section>
      </main>

    </PublicLayout>
  );
}