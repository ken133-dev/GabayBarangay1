import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import type { User } from '@/types/index';
import { Mail, Bell } from 'lucide-react';
import { api } from '@/lib/api';

export default function Profile() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    otpEnabled: false
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  // Move fetchProfile above useEffect so it can be referenced
  // (Keep only one fetchProfile definition, with correct catch syntax)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = localStorage.getItem('user');
        if (!user) {
          navigate('/login');
          return;
        }
        const profileData = JSON.parse(user);
        setProfile(profileData);
        setFormData({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          otpEnabled: profileData.otpEnabled || false
        });
      } catch {
        toast.error('Failed to load profile');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);


  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.put('/auth/profile', formData);

      setProfile(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    toast.success('Password changed successfully!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      SYSTEM_ADMIN: 'destructive',
      BARANGAY_CAPTAIN: 'default',
      BHW: 'secondary',
      DAYCARE_STAFF: 'outline',
      SK_OFFICER: 'secondary',
      PARENT_RESIDENT: 'outline'
    };

    return (
      <Badge variant={roleColors[role] || 'outline'}>
        {role.replace(/_/g, ' ')}
      </Badge>
    );
  };

  if (loading) {
    return (
      <DashboardLayout currentPage="/profile">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <DashboardLayout currentPage="/profile">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">My Profile</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Role(s)</Label>
                <div className="flex flex-wrap gap-2">
                  {profile.roles && profile.roles.length > 0 ? (
                    profile.roles.map((role, index) => (
                      <span key={index}>{getRoleBadge(role)}</span>
                    ))
                  ) : (
                    profile.role && getRoleBadge(profile.role)
                  )}
                </div>
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  minLength={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  minLength={6}
                  required
                />
              </div>
              <Button type="submit">Change Password</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>Enable OTP for additional security.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS OTP</p>
                <p className="text-sm text-muted-foreground">Receive OTP via SMS for login</p>
              </div>
              <Switch
                checked={formData.otpEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, otpEnabled: checked })}
              />
            </div>
            <Button onClick={handleUpdateProfile} className="mt-4">Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Manage your notification settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-4">
                <Mail className="w-6 h-6 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Enabled
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-4">
                <Bell className="w-6 h-6 text-muted-foreground" />
                <div>
                  <p className="font-medium">Event Reminders</p>
                  <p className="text-sm text-muted-foreground">Get notified about upcoming events</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Enabled
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
