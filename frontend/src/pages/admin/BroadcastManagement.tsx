import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Send, MessageSquare, Users, Calendar } from 'lucide-react';

interface BroadcastMessage {
  id: string;
  title: string;
  message: string;
  targetRoles: string[];
  sentAt: string;
  sender: {
    firstName: string;
    lastName: string;
  };
}

const USER_ROLES = [
  { value: 'BHW', label: 'Barangay Health Workers' },
  { value: 'BHW_COORDINATOR', label: 'BHW Coordinators' },
  { value: 'DAYCARE_STAFF', label: 'Daycare Staff' },
  { value: 'DAYCARE_TEACHER', label: 'Daycare Teachers' },
  { value: 'SK_OFFICER', label: 'SK Officers' },
  { value: 'SK_CHAIRMAN', label: 'SK Chairman' },
  { value: 'PARENT_RESIDENT', label: 'Parents/Residents' },
  { value: 'PATIENT', label: 'Patients' }
];

export default function BroadcastManagement() {
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetRoles: [] as string[]
  });

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/broadcasts');
      setBroadcasts(response.data.broadcasts || []);
    } catch (error) {
      console.error('Failed to fetch broadcasts:', error);
      toast.error('Failed to load broadcast history');
    } finally {
      setLoading(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.targetRoles.length === 0) {
      toast.error('Please select at least one target role');
      return;
    }

    try {
      setSending(true);
      await api.post('/admin/broadcasts', formData);
      toast.success('Broadcast message sent successfully');
      setIsDialogOpen(false);
      setFormData({ title: '', message: '', targetRoles: [] });
      fetchBroadcasts();
    } catch (error) {
      console.error('Failed to send broadcast:', error);
      toast.error('Failed to send broadcast message');
    } finally {
      setSending(false);
    }
  };

  const handleRoleToggle = (roleValue: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        targetRoles: [...prev.targetRoles, roleValue]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        targetRoles: prev.targetRoles.filter(role => role !== roleValue)
      }));
    }
  };

  const selectAllRoles = () => {
    setFormData(prev => ({
      ...prev,
      targetRoles: USER_ROLES.map(role => role.value)
    }));
  };

  const clearAllRoles = () => {
    setFormData(prev => ({
      ...prev,
      targetRoles: []
    }));
  };

  return (
    <DashboardLayout currentPage="/admin/settings/notifications">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Broadcast Management</h1>
            <p className="text-muted-foreground">Send notifications to multiple user groups</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Send Broadcast
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Send Broadcast Message</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <Input
                  placeholder="Message Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="Message Content"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  required
                />
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium">Target Roles</label>
                    <div className="space-x-2">
                      <Button type="button" variant="outline" size="sm" onClick={selectAllRoles}>
                        Select All
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={clearAllRoles}>
                        Clear All
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded-lg p-3">
                    {USER_ROLES.map((role) => (
                      <div key={role.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={role.value}
                          checked={formData.targetRoles.includes(role.value)}
                          onCheckedChange={(checked) => handleRoleToggle(role.value, checked as boolean)}
                        />
                        <label htmlFor={role.value} className="text-sm">
                          {role.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Selected: {formData.targetRoles.length} role(s)
                  </p>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={sending}>
                    {sending ? 'Sending...' : 'Send Broadcast'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Broadcast History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Broadcast History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : broadcasts.length === 0 ? (
              <div className="text-center py-8">
                <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No broadcast messages sent yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {broadcasts.map((broadcast) => (
                  <div key={broadcast.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{broadcast.title}</h3>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(broadcast.sentAt).toLocaleString()}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{broadcast.message}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {broadcast.targetRoles.map((role) => {
                          const roleInfo = USER_ROLES.find(r => r.value === role);
                          return (
                            <Badge key={role} variant="secondary" className="text-xs">
                              {roleInfo?.label || role}
                            </Badge>
                          );
                        })}
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Sent by: {broadcast.sender.firstName} {broadcast.sender.lastName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Broadcast Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Keep messages clear and concise</li>
                <li>• Use appropriate titles that describe the content</li>
                <li>• Target specific roles relevant to the message</li>
                <li>• Avoid sending too many broadcasts to prevent notification fatigue</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Message Types</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Announcements:</strong> General barangay updates</li>
                <li>• <strong>Reminders:</strong> Important deadlines or events</li>
                <li>• <strong>Alerts:</strong> Urgent information requiring immediate attention</li>
                <li>• <strong>Updates:</strong> System or service changes</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}