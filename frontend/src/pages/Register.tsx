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
  Clock,
  Eye,
  EyeOff,
  Phone
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate Philippine phone number format
    if (!formData.contactNumber.match(/^09[0-9]{9}$/)) {
      toast.error('Invalid phone number format', {
        description: 'Please enter a valid Philippine mobile number starting with 09 (11 digits total)'
      });
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        contactNumber: formData.contactNumber,
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
                Gabay Barangay Community
              </h2>
              <p className="text-base xl:text-lg text-primary-foreground/90">
                Get instant access to health services, daycare programs, and youth activities
                in your barangay.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg bg-primary-foreground/10 p-3 backdrop-blur">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10 flex-shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="font-semibold text-sm">Community Access</div>
                  <div className="text-xs text-primary-foreground/80">
                    Connect with your barangay community
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-primary-foreground/10 p-3 backdrop-blur">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10 flex-shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="font-semibold text-sm">24/7 Availability</div>
                  <div className="text-xs text-primary-foreground/80">
                    Access services anytime, anywhere
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-primary-foreground/10 p-3 backdrop-blur">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10 flex-shrink-0">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="font-semibold text-sm">Secure Platform</div>
                  <div className="text-xs text-primary-foreground/80">
                    Your data is protected and encrypted
                  </div>
                </div>
              </div>
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
                <Label htmlFor="contactNumber" className="text-sm font-medium">
                  Contact Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="contactNumber"
                    type="tel"
                    placeholder="09XX XXX XXXX"
                    value={formData.contactNumber}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                      
                      // Ensure it starts with 09
                      if (value.length > 0 && !value.startsWith('09')) {
                        if (value.startsWith('9')) {
                          value = '0' + value;
                        } else if (value.startsWith('63')) {
                          value = '0' + value.substring(2);
                        } else {
                          value = '09' + value;
                        }
                      }
                      
                      // Limit to 11 digits (09XXXXXXXXX)
                      if (value.length > 11) {
                        value = value.substring(0, 11);
                      }
                      
                      setFormData({ ...formData, contactNumber: value });
                    }}
                    className="pl-10"
                    pattern="09[0-9]{9}"
                    maxLength={11}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter Philippine mobile number starting with 09 (e.g., 09123456789)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    onChange={handleChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
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
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    onChange={handleChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
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
