import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner';
import { Heart, Baby, Trophy, Eye, EyeOff, ArrowLeft, MessageSquare } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const navigate = useNavigate();
  const { login, sendOTP: sendLoginOTP, verifyOTP: verifyLoginOTP } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (step === 'credentials') {
        // First step: validate credentials
        const { requiresOTP } = await login(email, password);

        if (requiresOTP) {
          // Send OTP if required
          await sendLoginOTP(email);
          toast.success('OTP sent!', {
            description: 'Please check your phone for the verification code.'
          });
          setStep('otp');
        } else {
          // Direct login without OTP
          toast.success('Login successful!', {
            description: 'Welcome back!'
          });
          navigate('/dashboard');
        }
      } else {
        // Second step: verify OTP
        await verifyLoginOTP(email, otp);

        toast.success('Login successful!', {
          description: 'Welcome back!'
        });

        // Redirect to dashboard
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);

      // Handle specific error messages
      if (err.response?.status === 403) {
        toast.error('Account not active', {
          description: err.response.data.error || 'Your account is pending approval or has been suspended.'
        });
      } else if (err.response?.status === 401) {
        toast.error('Login failed', {
          description: 'Invalid email or password. Please try again.'
        });
      } else if (err.response?.status === 404) {
        toast.error('User not found', {
          description: 'No account found with this email address.'
        });
      } else if (err.response?.status === 400) {
        toast.error('OTP verification failed', {
          description: err.response.data.error || 'Invalid or expired OTP code.'
        });
      } else {
        toast.error('Login failed', {
          description: 'An error occurred. Please try again later.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCredentials = () => {
    setStep('credentials');
    setOtp('');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <Link to="/" className="flex justify-center mb-6">
          <Logo size="sm" showText />
        </Link>
        <Card className="overflow-hidden">
          <CardContent className="grid p-0 md:grid-cols-2">
            <form className="p-6 md:p-8" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">
                    {step === 'credentials' ? 'Welcome back' : 'Verify your identity'}
                  </h1>
                  <p className="text-balance text-muted-foreground">
                    {step === 'credentials'
                      ? 'Login to your Gabay Barangay account'
                      : 'Enter the 6-digit code sent to your phone'
                    }
                  </p>
                </div>

                {step === 'credentials' ? (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        <Link
                          to="/forgot-password"
                          className="ml-auto text-sm underline-offset-2 hover:underline"
                        >
                          Forgot your password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
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
                  </>
                ) : (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="otp">Verification Code</Label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="otp"
                          type="text"
                          placeholder="000000"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="pl-10 text-center text-lg tracking-widest"
                          maxLength={6}
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Enter the 6-digit code sent to your registered phone number
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleBackToCredentials}
                      className="w-full gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to login
                    </Button>
                  </>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading
                    ? (step === 'credentials' ? 'Logging in...' : 'Verifying...')
                    : (step === 'credentials' ? 'Login' : 'Verify & Login')
                  }
                </Button>

                {step === 'credentials' && (
                  <div className="text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link to="/register" className="underline underline-offset-4">
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </form>
            <div className="relative hidden bg-muted md:block">
              <div className="absolute inset-0 flex flex-col justify-center p-8 text-white bg-gradient-to-br from-primary via-primary/90 to-primary/80">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      Your Community,<br/>Digitally Connected
                    </h2>
                    <p className="text-sm text-primary-foreground/80">
                      Access health services, daycare management, and youth programs all in one place.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3 rounded-lg bg-primary-foreground/10 p-3 backdrop-blur">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/10">
                        <Heart className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-sm font-semibold">Health Services</div>
                        <div className="text-xs text-primary-foreground/70">
                          Patient records & appointments
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg bg-primary-foreground/10 p-3 backdrop-blur">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/10">
                        <Baby className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-sm font-semibold">Daycare Management</div>
                        <div className="text-xs text-primary-foreground/70">
                          Student tracking & reports
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg bg-primary-foreground/10 p-3 backdrop-blur">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/10">
                        <Trophy className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-sm font-semibold">SK Programs</div>
                        <div className="text-xs text-primary-foreground/70">
                          Youth events & engagement
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary  mt-4">
          By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
          and <a href="#">Privacy Policy</a>.
        </div>
      </div>
    </div>
  )
}
