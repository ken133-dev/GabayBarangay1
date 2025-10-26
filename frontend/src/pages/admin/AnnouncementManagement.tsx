import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Megaphone, Plus, Edit, Trash2, Eye } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdBy: string;
  createdAt: string;
  publishedAt?: string;
}

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'MEDIUM',
    status: 'DRAFT'
  });
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRoles = user.roles || [user.role || 'VISITOR'];
  const isAdmin = userRoles.some((role: string) => ['SYSTEM_ADMIN', 'BARANGAY_CAPTAIN'].includes(role));

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchAnnouncements();
  }, [isAdmin, navigate]);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/admin/announcements');
      setAnnouncements(response.data.announcements || []);
    } catch (error) {
      toast.error('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/announcements/${editingId}`, formData);
        toast.success('Announcement updated successfully');
      } else {
        await api.post('/admin/announcements', formData);
        toast.success('Announcement created successfully');
      }
      setShowDialog(false);
      setEditingId(null);
      setFormData({ title: '', content: '', priority: 'MEDIUM', status: 'DRAFT' });
      fetchAnnouncements();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save announcement');
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      status: announcement.status
    });
    setEditingId(announcement.id);
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await api.delete(`/admin/announcements/${id}`);
      toast.success('Announcement deleted successfully');
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to delete announcement');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await api.patch(`/admin/announcements/${id}/publish`);
      toast.success('Announcement published successfully');
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to publish announcement');
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      LOW: 'outline',
      MEDIUM: 'secondary',
      HIGH: 'default',
      URGENT: 'destructive'
    } as const;
    return <Badge variant={variants[priority as keyof typeof variants]}>{priority}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      DRAFT: 'outline',
      PUBLISHED: 'default',
      ARCHIVED: 'secondary'
    } as const;
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  return (
    <DashboardLayout currentPage="/admin/announcements">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Announcement Management</h1>
            <p className="text-muted-foreground">Create and manage barangay announcements</p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Announcement
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{announcements.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {announcements.filter(a => a.status === 'PUBLISHED').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Drafts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-600">
                {announcements.filter(a => a.status === 'DRAFT').length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading announcements...</p>
            ) : announcements.length === 0 ? (
              <div className="text-center py-12">
                <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No announcements yet</p>
                <Button className="mt-4" onClick={() => setShowDialog(true)}>
                  Create First Announcement
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="border p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold">{announcement.title}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{announcement.content}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {getPriorityBadge(announcement.priority)}
                        {getStatusBadge(announcement.status)}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-xs text-gray-500">
                        Created: {new Date(announcement.createdAt).toLocaleDateString()}
                        {announcement.publishedAt && (
                          <span className="ml-2">
                            Published: {new Date(announcement.publishedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(announcement)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {announcement.status === 'DRAFT' && (
                          <Button size="sm" onClick={() => handlePublish(announcement.id)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Publish
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(announcement.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit' : 'Create'} Announcement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Announcement title"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Content *</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Announcement content"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingId ? 'Update' : 'Create'} Announcement</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}