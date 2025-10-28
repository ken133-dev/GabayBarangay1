
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Database, Download, RefreshCw, HardDrive, Clock, FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface SystemBackup {
  id: string;
  filePath: string;
  fileSize: number;
  backupType: 'MANUAL' | 'SCHEDULED';
  status: 'COMPLETED' | 'FAILED' | 'IN_PROGRESS';
  startedAt: string;
  completedAt?: string;
  initiatedBy?: string;
}

export default function BackupManagement() {
  const [backups, setBackups] = useState<SystemBackup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [backupFrequency] = useState('daily');
  const navigate = useNavigate();

  const fetchBackups = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/backups');
      setBackups(response.data.backups || []);
    } catch (error) {
      console.error('Error fetching backups:', error);
      toast.error('Failed to fetch backups');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      await api.post('/admin/backup');
      toast.success('Backup creation started');
      await fetchBackups();
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Failed to create backup');
    } finally {
      setCreating(false);
    }
  };

  const handleDownloadBackup = async (backup: SystemBackup) => {
    try {
      const response = await api.get(`/admin/backups/${backup.id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', backup.filePath);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Backup download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download backup');
    }
  };

  const formatFileSize = (bytes: number | undefined | null) => {
    if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) return 'Unknown';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTotalBackupSize = () => {
    const completedBackups = backups.filter(b => b.status === 'COMPLETED' && b.fileSize);
    const totalBytes = completedBackups.reduce((sum, b) => sum + (b.fileSize || 0), 0);
    return totalBytes / (1024 * 1024 * 1024); // GB
  };

  // Defensive: get last backup date
  let lastBackupDate = 'Never';
  if (backups && backups.length > 0) {
    const validDates = backups
      .map(b => new Date(b.completedAt || b.startedAt))
      .filter(d => d instanceof Date && !isNaN(d.getTime()));
    if (validDates.length > 0) {
      const maxDate = new Date(Math.max(...validDates.map(d => d.getTime())));
      lastBackupDate = maxDate.toLocaleString();
    }
  }

  return (
    <DashboardLayout currentPage="Backup Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-3xl font-bold">Backup Management</h1>
            <p className="text-muted-foreground">Manage system backups and data recovery</p>
          </div>
        </div>
        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lastBackupDate}</div>
              <p className="text-xs text-muted-foreground">
                {lastBackupDate !== 'Never' ? 'Backup completed successfully' : 'No backups yet'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{backups.filter(b => b.status === 'COMPLETED').length}</div>
              <p className="text-xs text-muted-foreground">
                {getTotalBackupSize() > 0 ? `${getTotalBackupSize().toFixed(2)} GB total` : 'No completed backups'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Backup Frequency</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{backupFrequency}</div>
              <p className="text-xs text-muted-foreground">
                Automated backup schedule
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Size</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatFileSize(backups.reduce((sum, b) => sum + (b.fileSize || 0), 0))}</div>
              <p className="text-xs text-muted-foreground">
                All backup files combined
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Button onClick={handleCreateBackup} disabled={creating} className="flex-1">
            {creating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Creating Backup...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Create Backup Now
              </>
            )}
          </Button>
          <Button variant="outline" disabled={backups.length === 0} onClick={() => {
            const latestBackup = backups
              .filter(b => b.status === 'COMPLETED')
              .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0];
            if (latestBackup) {
              handleDownloadBackup(latestBackup);
            }
          }}>
            <Download className="mr-2 h-4 w-4" />
            Download Latest
          </Button>
          <Button variant="outline" disabled>
            <Upload className="mr-2 h-4 w-4" />
            Restore Backup
          </Button>
        </div>

        <Separator />

        {/* Backup History */}
        <Card>
          <CardHeader>
            <CardTitle>Backup History</CardTitle>
            <CardDescription>
              Recent database backup records and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin" />
              </div>
            ) : !backups || backups.length === 0 ? (
              <div className="text-center py-12">
                <Database className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">No Backup History</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't created any backups yet. Create your first backup to get started.
                </p>
                <Button onClick={handleCreateBackup} disabled={creating}>
                  {creating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Creating Backup...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Create First Backup
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {backups.map((backup) => {
                  const fileSize = formatFileSize(backup.fileSize);
                  let started = 'Unknown';
                  let completed = 'Unknown';
                  if (backup.startedAt) {
                    const d = new Date(backup.startedAt);
                    if (d instanceof Date && !isNaN(d.getTime())) {
                      started = d.toLocaleString();
                    }
                  }
                  if (backup.completedAt) {
                    const d = new Date(backup.completedAt);
                    if (d instanceof Date && !isNaN(d.getTime())) {
                      completed = d.toLocaleString();
                    }
                  }
                  return (
                    <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0">
                          {backup.status === 'COMPLETED' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : backup.status === 'FAILED' ? (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          ) : (
                            <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {backup.backupType === 'MANUAL' ? 'Manual Backup' : 'Scheduled Backup'}
                            </span>
                            <Badge
                              variant={backup.status === 'COMPLETED' ? 'default' : backup.status === 'FAILED' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {backup.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Started: {started}</p>
                            <p>Completed: {completed}</p>
                            <p className="flex items-center gap-2">
                              <span>
                                Size: {fileSize}
                              </span>
                              {typeof backup.fileSize === 'number' && !isNaN(backup.fileSize) && backup.fileSize > 0 && (
                                <span className="text-xs">
                                  ({backup.fileSize.toLocaleString()} bytes)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {backup.status === 'COMPLETED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadBackup(backup)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}