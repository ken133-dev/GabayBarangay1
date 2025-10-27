import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/sonner';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    barangayName: '',
    address: '',
    phone: '',
    email: '',
    hours: ''
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await api.get('/public/contact');
        setContactInfo(response.data.contactInfo);
      } catch (error) {
        console.error('Failed to fetch contact info:', error);
        // Fallback to default values
        setContactInfo({
          barangayName: 'Barangay Binitayan',
          address: 'Daraga, Albay, Philippines',
          phone: '+63 XXX XXX XXXX',
          email: 'contact@barangaybinitayan.gov.ph',
          hours: 'Mon - Fri: 8am - 5pm, Sat: 8am - 12pm'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Simulate form submission (replace with actual endpoint when available)
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({ title: "Success", description: "Your message has been sent!" });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <Toaster />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center max-w-3xl mx-auto">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
                <Mail className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Contact {contactInfo.barangayName || 'Us'}
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl">
                We're here to help. Reach out to us with any questions or concerns.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="w-full py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 max-w-6xl mx-auto">
              {/* Contact Form */}
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle>Send a Message</CardTitle>
                  <CardDescription>Our team will get back to you as soon as possible.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={e => setFormData({...formData, subject: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={e => setFormData({...formData, message: e.target.value})}
                        required
                        rows={5}
                      />
                    </div>
                    <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                      {submitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-6">
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shrink-0">
                        <MapPin className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Address</h3>
                        <p className="text-sm text-muted-foreground">{contactInfo.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shrink-0">
                        <Phone className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Phone</h3>
                        <p className="text-sm text-muted-foreground">{contactInfo.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shrink-0">
                        <Mail className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Email</h3>
                        <p className="text-sm text-muted-foreground">{contactInfo.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shrink-0">
                        <Clock className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Office Hours</h3>
                        <p className="text-sm text-muted-foreground">{contactInfo.hours}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle>Find Us</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video rounded-md bg-muted/30 flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">[Map Placeholder]</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

    </PublicLayout>
  );
}