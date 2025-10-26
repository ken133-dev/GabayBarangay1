import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Database, Download, Upload, Trash2, RefreshCw, HardDrive, Calendar, Clock } from 'lucide-react';

interface Backup {
  id: string;
  filename: string;
  size: number;
  type: 'MANUAL' | 'SCHEDULED' | 'AUTO';
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
  createdAt: string;
  createdBy?: string;
}

export default function BackupManagement() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRoles = user.roles || [user.role || 'VISITOR'];
  const isAdmin = userRoles.some((role: string) => ['SYSTEM_ADMIN', 'BARANGAY_CAPTAIN'].includes(role));

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchBackups();
  }, [isAdmin, navigate]);

  const fetchBackups = async () => {
    try {
      const response = await api.get('/admin/backups');
      setBackups(response.data.backups || []);
    } catch (error) {
      toast.error('Failed to fetch backups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      await api.post('/admin/backups/create');
      toast.success('Backup creation started');
      fetchBackups();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create backup');
    } finally {
      setCreating(false);
    }
  };

  const handleDownloadBackup = async (backup: Backup) => {
    try {
      const response = await api.get(`/admin/backups/${backup.id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', backup.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Backup download started');
    } catch (error) {
      toast.error('Failed to download backup');
    }
  };

  const handleDeleteBackup = async (id: string) => {
    if (!confirm('Are you sure you want to delete this backup?')) return;
    try {
      await api.delete(`/admin/backups/${id}`);
      toast.success('Backup deleted successfully');
      fetchBackups();
    } catch (error) {
      toast.error('Failed to delete backup');
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return;
    try {
      await api.post(`/admin/backups/${selectedBackup.id}/restore`);
      toast.success('Backup restoration started');
      setShowRestoreDialog(false);
      setSelectedBackup(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to restore backup');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      COMPLETED: 'default',
      IN_PROGRESS: 'secondary',
      FAILED: 'destructive'
    } as const;
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      MANUAL: 'outline',
      SCHEDULED: 'secondary',
      AUTO: 'default'
    } as const;
    return <Badge variant={variants[type as keyof typeof variants]}>{type}</Badge>;
  };

  return (
    <DashboardLayout currentPage="/admin/settings/backup">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Backup Management</h1>
            <p className="text-muted-foreground">Manage system backups and data recovery</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchBackups} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleCreateBackup} disabled={creating}>
              <Database className="h-4 w-4 mr-2" />
              {creating ? 'Creating...' : 'Create Backup'}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Backups</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{backups.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {backups.filter(b => b.status === 'COMPLETED').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Size</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatFileSize(backups.reduce((sum, b) => sum + b.size, 0))}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Last Backup</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-bold">
                {backups.length > 0 
                  ? new Date(Math.max(...backups.map(b => new Date(b.createdAt).getTime()))).toLocaleDateString()
                  : 'Never'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Backup History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin" />
              </div>
            ) : backups.length === 0 ? (
              <div className="text-center py-12">
                <HardDrive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No backups found</p>
                <Button className="mt-4" onClick={handleCreateBackup}>
                  Create First Backup
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {backups.map((backup) => (
                  <div key={backup.id} className="border p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{backup.filename}</h3>
                          {getStatusBadge(backup.status)}
                          {getTypeBadge(backup.type)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <HardDrive className="h-4 w-4" />
                            {formatFileSize(backup.size)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(backup.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(backup.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                        {backup.createdBy && (
                          <p className="text-xs text-gray-500 mt-1">
                            Created by: {backup.createdBy}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        {backup.status === 'COMPLETED' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleDownloadBackup(backup)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => {
                                setSelectedBackup(backup);
                                setShowRestoreDialog(true);
                              }}
                            >
                              <Upload className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteBackup(backup.id)}>
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

        <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Restore Backup</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> Restoring a backup will replace all current data with the backup data. 
                  This action cannot be undone.
                </p>
              </div>
              {selectedBackup && (
                <div className="space-y-2">
                  <p><strong>Backup:</strong> {selectedBackup.filename}</p>
                  <p><strong>Size:</strong> {formatFileSize(selectedBackup.size)}</p>
                  <p><strong>Created:</strong> {new Date(selectedBackup.createdAt).toLocaleString()}</p>
                </div>
              )}
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleRestoreBackup}>
                  Restore Backup
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}