import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
  User,
  Clock,
  Calendar
} from 'lucide-react';
import { api } from '@/lib/api';
import { exportToPDF, exportToExcel } from '@/lib/exportUtils';

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId?: string;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [searchTerm, actionFilter, severityFilter, entityFilter, logs]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/audit-logs');
      const logsData = response.data.logs || [];
      setLogs(logsData);
      setFilteredLogs(logsData);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter((log) =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter((log) => log.action.includes(actionFilter.toUpperCase()));
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter((log) => log.severity === severityFilter);
    }

    if (entityFilter !== 'all') {
      filtered = filtered.filter((log) => log.entityType === entityFilter);
    }

    setFilteredLogs(filtered);
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailsDialogOpen(true);
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    try {
      const exportData = filteredLogs.map(log => ({
        timestamp: formatDateTime(log.timestamp),
        user: log.userName,
        role: log.userRole,
        action: log.action,
        entity: log.entityType,
        severity: log.severity,
        ipaddress: log.ipAddress || 'N/A',
        entityid: log.entityId || 'N/A'
      }));

      const columns = ['Timestamp', 'User', 'Role', 'Action', 'Entity', 'Severity', 'IP Address', 'Entity ID'];

      if (format === 'pdf') {
        exportToPDF(exportData, 'Audit Logs - Gabay Barangay', columns);
        toast.success('Audit logs exported to PDF successfully!');
      } else {
        exportToExcel(exportData, 'Audit Logs');
        toast.success('Audit logs exported to Excel successfully!');
      }
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast.error(`Failed to export audit logs to ${format.toUpperCase()}`);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getActionBadge = (action: string) => {
    if (action.includes('CREATED') || action.includes('APPROVED')) {
      return 'bg-green-100 text-green-800 border-green-300';
    } else if (action.includes('DELETED') || action.includes('SUSPENDED') || action.includes('FAILED')) {
      return 'bg-red-100 text-red-800 border-red-300';
    } else if (action.includes('UPDATED') || action.includes('CHANGED')) {
      return 'bg-orange-100 text-orange-800 border-orange-300';
    }
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <DashboardLayout currentPage="Audit Logs">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading audit logs...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="Audit Logs">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
            <p className="text-muted-foreground">
              System activity and administrative actions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchAuditLogs}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => handleExport('pdf')}>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button onClick={() => handleExport('excel')}>
                <Download className="mr-2 h-4 w-4" />
                Export Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredLogs.length}</div>
              <p className="text-xs text-muted-foreground">
                Showing filtered results
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredLogs.filter(log => log.severity === 'critical').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warnings</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredLogs.filter(log => log.severity === 'warning').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Potential issues
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Activity</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredLogs.filter(log => {
                  const logDate = new Date(log.timestamp).toDateString();
                  const today = new Date().toDateString();
                  return logDate === today;
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Actions logged today
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Logs</CardTitle>
            <CardDescription>
              View and filter system activity and administrative actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="USER">User Actions</SelectItem>
                  <SelectItem value="PATIENT">Patient Actions</SelectItem>
                  <SelectItem value="APPOINTMENT">Appointment Actions</SelectItem>
                  <SelectItem value="EVENT">Event Actions</SelectItem>
                  <SelectItem value="SYSTEM">System Actions</SelectItem>
                </SelectContent>
              </Select>

              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>

              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Entities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Patient">Patient</SelectItem>
                  <SelectItem value="Appointment">Appointment</SelectItem>
                  <SelectItem value="Event">Event</SelectItem>
                  <SelectItem value="System">System</SelectItem>
                  <SelectItem value="Auth">Authentication</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No logs found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead className="text-right">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium text-sm">
                                {formatDateTime(log.timestamp)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatTimeAgo(log.timestamp)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium text-sm">{log.userName}</div>
                              <div className="text-xs text-muted-foreground">
                                {typeof log.userRole === 'string' ? log.userRole.replace('_', ' ') : ''}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getActionBadge(log.action)}>
                            {log.action.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{log.entityType}</span>
                          {log.entityId && (
                            <div className="text-xs text-muted-foreground">
                              ID: {log.entityId.substring(0, 8)}...
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getSeverityBadge(log.severity)}>
                            {getSeverityIcon(log.severity)}
                            <span className="ml-1">{typeof log.severity === 'string' ? log.severity.toUpperCase() : ''}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Detailed information about this system activity
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Timestamp</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDateTime(selectedLog.timestamp)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">User</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedLog.userName} ({typeof selectedLog.userRole === 'string' ? selectedLog.userRole.replace('_', ' ') : ''})
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Action</div>
                  <Badge variant="outline" className={getActionBadge(selectedLog.action)}>
                    {selectedLog.action.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Severity</div>
                  <Badge variant="outline" className={getSeverityBadge(selectedLog.severity)}>
                    {getSeverityIcon(selectedLog.severity)}
                    <span className="ml-1">{typeof selectedLog.severity === 'string' ? selectedLog.severity.toUpperCase() : ''}</span>
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Entity Type</div>
                  <div className="text-sm text-muted-foreground">{selectedLog.entityType}</div>
                </div>

                {selectedLog.entityId && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Entity ID</div>
                    <div className="text-sm text-muted-foreground font-mono">
                      {selectedLog.entityId}
                    </div>
                  </div>
                )}

                {selectedLog.ipAddress && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">IP Address</div>
                    <div className="text-sm text-muted-foreground font-mono">
                      {selectedLog.ipAddress}
                    </div>
                  </div>
                )}

                {selectedLog.userAgent && (
                  <div className="space-y-2 md:col-span-2">
                    <div className="text-sm font-medium">User Agent</div>
                    <div className="text-xs text-muted-foreground break-all">
                      {selectedLog.userAgent}
                    </div>
                  </div>
                )}
              </div>

              {selectedLog.changes && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Changes</div>
                  <div className="bg-muted p-4 rounded-lg max-h-48 overflow-auto">
                    <pre className="text-xs whitespace-pre-wrap break-all">
                      {JSON.stringify(selectedLog.changes, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
