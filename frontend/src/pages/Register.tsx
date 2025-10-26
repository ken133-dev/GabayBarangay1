import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Users,
  Calendar,
  Shield,
  CheckCircle2,
  Mail,
  Lock,
  User,
  ArrowLeft,
  Clock
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: 'PARENT_RESIDENT' // Default role for self-registration
      });

      toast.success('Registration successful!', {
        description: 'Your account is pending approval. You will be notified once activated.'
      });

      navigate('/login');
    } catch (err: any) {
      console.error('Registration error:', err);

      if (err.response?.status === 400 && err.response?.data?.error?.includes('already exists')) {
        toast.error('Registration failed', {
          description: 'An account with this email already exists.'
        });
      } else {
        toast.error('Registration failed', {
          description: err.response?.data?.error || 'Please try again later.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  }

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />

        <div className="relative flex flex-col justify-center p-8 xl:p-12 text-primary-foreground max-w-lg mx-auto">
          <div className="space-y-6">
            {/* Main Message */}
            <div className="space-y-3">
              <div className="inline-block rounded-lg bg-primary-foreground/10 px-3 py-1 text-sm backdrop-blur">
                Join Your Community
              </div>
              <h2 className="text-3xl xl:text-4xl font-bold leading-tight">
                Become Part of
                <br />
                TheyCare Family
              </h2>
              <p className="text-base xl:text-lg text-primary-foreground/90">
                Get instant access to health services, daycare programs, and youth activities
                in your barangay.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              {[
                {
                  icon: Users,
                  title: "Community Access",
                  description: "Connect with 1,000+ registered members"
                },
                {
                  icon: Calendar,
                  title: "24/7 Availability",
                  description: "Access services anytime, anywhere"
                },
                {
                  icon: Shield,
                  title: "Secure Platform",
                  description: "Your data is protected and encrypted"
                }
              ].map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-lg bg-primary-foreground/10 p-3 backdrop-blur"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10 flex-shrink-0">
                    <benefit.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-sm">{benefit.title}</div>
                    <div className="text-xs text-primary-foreground/80">
                      {benefit.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Badge */}
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">Quick Approval</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">2-Min Setup</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-4 sm:p-6 md:p-8 bg-background">
        <div className="w-full max-w-md space-y-6">
          {/* Back to Home and Theme Toggle */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <ThemeToggle />
          </div>

          {/* Logo & Title */}
          <div className="space-y-3">
            <Logo size="md" showText />
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create your account</h1>
              <p className="text-sm text-muted-foreground">
                Join your barangay community today
              </p>
            </div>
          </div>

          {/* Registration Form */}
          <Card className="border-2">
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      placeholder="Juan"
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      placeholder="Dela Cruz"
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <p>
                    By creating an account, you agree to our Terms of Service and Privacy Policy.
                    Your account will be reviewed by an administrator before activation.
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </Card>

          {/* Sign In Link */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
