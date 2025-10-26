import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Bell, Mail, MessageSquare, Calendar, Baby, Heart, Megaphone } from 'lucide-react';

interface NotificationSettings {
  id: string;
  userId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  appointmentReminders: boolean;
  eventNotifications: boolean;
  daycareUpdates: boolean;
  systemAnnouncements: boolean;
}

export default function NotificationPreferences() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    fetchPreferences();
  }, [navigate]);

  const fetchPreferences = async () => {
    try {
      const response = await api.get('/notifications/preferences');
      setSettings(response.data.settings);
    } catch (error) {
      toast.error('Failed to load notification preferences');
      console.error('Failed to fetch preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [key]: !settings[key]
    });
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      await api.put('/notifications/preferences', {
        emailEnabled: settings.emailEnabled,
        smsEnabled: settings.smsEnabled,
        appointmentReminders: settings.appointmentReminders,
        eventNotifications: settings.eventNotifications,
        daycareUpdates: settings.daycareUpdates,
        systemAnnouncements: settings.systemAnnouncements
      });
      toast.success('Notification preferences saved successfully');
    } catch (error) {
      toast.error('Failed to save preferences');
      console.error('Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout currentPage="/notifications/preferences">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!settings) {
    return (
      <DashboardLayout currentPage="/notifications/preferences">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Unable to load notification preferences</p>
              <Button className="mt-4" onClick={fetchPreferences}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="/notifications/preferences">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Notification Preferences</h1>
          <p className="text-muted-foreground mt-1">
            Manage how you receive notifications and alerts
          </p>
        </div>

        {/* Notification Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Channels
            </CardTitle>
            <CardDescription>
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <Label htmlFor="email-enabled" className="text-base font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
              </div>
              <Switch
                id="email-enabled"
                checked={settings.emailEnabled}
                onCheckedChange={() => handleToggle('emailEnabled')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-primary" />
                <div>
                  <Label htmlFor="sms-enabled" className="text-base font-medium">
                    SMS Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via SMS (carrier charges may apply)
                  </p>
                </div>
              </div>
              <Switch
                id="sms-enabled"
                checked={settings.smsEnabled}
                onCheckedChange={() => handleToggle('smsEnabled')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Types */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
            <CardDescription>
              Select which types of notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-red-500" />
                <div>
                  <Label htmlFor="appointment-reminders" className="text-base font-medium">
                    Appointment Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminders for upcoming health appointments
                  </p>
                </div>
              </div>
              <Switch
                id="appointment-reminders"
                checked={settings.appointmentReminders}
                onCheckedChange={() => handleToggle('appointmentReminders')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <Label htmlFor="event-notifications" className="text-base font-medium">
                    Event Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Stay updated on SK events and community activities
                  </p>
                </div>
              </div>
              <Switch
                id="event-notifications"
                checked={settings.eventNotifications}
                onCheckedChange={() => handleToggle('eventNotifications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Baby className="h-5 w-5 text-purple-500" />
                <div>
                  <Label htmlFor="daycare-updates" className="text-base font-medium">
                    Daycare Updates
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about daycare activities and progress reports
                  </p>
                </div>
              </div>
              <Switch
                id="daycare-updates"
                checked={settings.daycareUpdates}
                onCheckedChange={() => handleToggle('daycareUpdates')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Megaphone className="h-5 w-5 text-orange-500" />
                <div>
                  <Label htmlFor="system-announcements" className="text-base font-medium">
                    System Announcements
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Important barangay announcements and updates
                  </p>
                </div>
              </div>
              <Switch
                id="system-announcements"
                checked={settings.systemAnnouncements}
                onCheckedChange={() => handleToggle('systemAnnouncements')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Bell className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-2">About Notifications</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• In-app notifications are always enabled</li>
                  <li>• Email and SMS notifications can be toggled on/off</li>
                  <li>• You can customize which types of notifications you receive</li>
                  <li>• Critical system alerts cannot be disabled</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/notifications')}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
