import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Database, Download, RefreshCw, Calendar, HardDrive, Clock } from 'lucide-react';

interface Backup {
  id: string;
  backupType: string;
  filePath: string;
  fileSize: number;
  status: string;
  initiatedBy: string;
  startedAt: string;
  completedAt?: string;
  notes?: string;
}

export default function BackupManagement() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/backups');
      setBackups(response.data.backups || []);
    } catch (error) {
      console.error('Failed to fetch backups:', error);
      toast.error('Failed to load backups');
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async (backupType: string) => {
    try {
      setIsCreatingBackup(true);
      setBackupProgress(0);
      
      // Simulate backup progress
      const progressInterval = setInterval(() => {
        setBackupProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await api.post('/admin/backups', { backupType });
      
      clearInterval(progressInterval);
      setBackupProgress(100);
      
      setTimeout(() => {
        setIsCreatingBackup(false);
        setBackupProgress(0);
        toast.success('Backup created successfully');
        fetchBackups();
      }, 1000);
    } catch (error) {
      console.error('Failed to create backup:', error);
      toast.error('Failed to create backup');
      setIsCreatingBackup(false);
      setBackupProgress(0);
    }
  };

  const downloadBackup = async (backup: Backup) => {
    try {
      const response = await api.get(`/admin/backups/${backup.id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup-${backup.id}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Backup download started');
    } catch (error) {
      console.error('Failed to download backup:', error);
      toast.error('Failed to download backup');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout currentPage="/admin/settings/backup">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Backup Management</h1>
            <p className="text-muted-foreground">Create and manage system backups</p>
          </div>
          <Button onClick={fetchBackups} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Backup Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Database className="h-5 w-5 mr-2" />
                Full System Backup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Complete backup of all system data including users, health records, daycare data, and events.
              </p>
              <Button 
                onClick={() => createBackup('FULL_SYSTEM')}
                disabled={isCreatingBackup}
                className="w-full"
              >
                Create Full Backup
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <HardDrive className="h-5 w-5 mr-2" />
                Database Only
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Backup only the database without uploaded files and media.
              </p>
              <Button 
                onClick={() => createBackup('DATABASE_ONLY')}
                disabled={isCreatingBackup}
                variant="outline"
                className="w-full"
              >
                Create DB Backup
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Clock className="h-5 w-5 mr-2" />
                Quick Backup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Fast backup of essential data for quick recovery.
              </p>
              <Button 
                onClick={() => createBackup('QUICK')}
                disabled={isCreatingBackup}
                variant="outline"
                className="w-full"
              >
                Quick Backup
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Backup Progress */}
        {isCreatingBackup && (
          <Card>
            <CardContent className="py-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Creating backup...</span>
                  <span>{backupProgress}%</span>
                </div>
                <Progress value={backupProgress} className="w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Backup History */}
        <Card>
          <CardHeader>
            <CardTitle>Backup History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : backups.length === 0 ? (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No backups found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {backups.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium">{backup.backupType.replace('_', ' ')}</span>
                        <Badge className={getStatusColor(backup.status)}>
                          {backup.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Started: {new Date(backup.startedAt).toLocaleString()}
                        </div>
                        {backup.completedAt && (
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Completed: {new Date(backup.completedAt).toLocaleString()}
                          </div>
                        )}
                        <div>Size: {formatFileSize(backup.fileSize)}</div>
                        {backup.notes && <div>Notes: {backup.notes}</div>}
                      </div>
                    </div>
                    {backup.status === 'COMPLETED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadBackup(backup)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Backup Information */}
        <Card>
          <CardHeader>
            <CardTitle>Backup Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Backup Types</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li><strong>Full System:</strong> Complete backup including all data and files</li>
                <li><strong>Database Only:</strong> Database backup without media files</li>
                <li><strong>Quick:</strong> Essential data backup for fast recovery</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Recommendations</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Create full system backups weekly</li>
                <li>• Perform database backups daily</li>
                <li>• Store backups in multiple locations</li>
                <li>• Test backup restoration regularly</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}