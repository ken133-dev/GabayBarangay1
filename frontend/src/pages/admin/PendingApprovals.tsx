import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  UserCheck,
  UserX,
  Eye,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  RefreshCw
} from 'lucide-react';
import { api } from '@/lib/api';

interface PendingUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  contactNumber?: string;
  address?: string;
  createdAt: string;
  status: string;
}

export default function PendingApprovals() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRoles = user.roles || [user.role || 'VISITOR'];
  const isAdmin = userRoles.some((role: string) => ['SYSTEM_ADMIN', 'BARANGAY_CAPTAIN'].includes(role));

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied: Admin privileges required');
      navigate('/dashboard');
      return;
    }

    fetchPendingUsers();
  }, [isAdmin, navigate]);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users?status=PENDING');
      const allUsers = response.data.users || [];
      // Filter to only show PENDING status users
      const pendingUsers = allUsers.filter((user: PendingUser) => user.status === 'PENDING');
      setUsers(pendingUsers);
      setFilteredUsers(pendingUsers);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      toast.error('Failed to load pending users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter((u) =>
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.role || 'VISITOR').toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredUsers(filtered);
  };

  const handleViewUser = (user: PendingUser) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const handleApproveClick = (user: PendingUser) => {
    setSelectedUser(user);
    setActionType('approve');
    setRejectionReason('');
    setActionDialogOpen(true);
  };

  const handleRejectClick = (user: PendingUser) => {
    setSelectedUser(user);
    setActionType('reject');
    setRejectionReason('');
    setActionDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;

    if (actionType === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoading(true);

      if (actionType === 'approve') {
        await api.patch(`/admin/users/${selectedUser.id}/status`, { status: 'ACTIVE' });
        setUsers(users.filter(u => u.id !== selectedUser.id));
        toast.success('User approved successfully', {
          description: `${selectedUser.firstName} ${selectedUser.lastName} has been activated.`
        });
      } else {
        await api.patch(`/admin/users/${selectedUser.id}/status`, { status: 'REJECTED', reason: rejectionReason });
        setUsers(users.filter(u => u.id !== selectedUser.id));
        toast.success('User rejected', {
          description: 'The user has been notified of the rejection.'
        });
      }

      setActionDialogOpen(false);
      setSelectedUser(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error processing user action:', error);
      toast.error(`Failed to ${actionType} user`);
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'BARANGAY_CAPTAIN':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'BHW':
      case 'BHW_COORDINATOR':
        return 'bg-pink-100 text-pink-800 border-pink-300';
      case 'DAYCARE_STAFF':
      case 'DAYCARE_TEACHER':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'SK_OFFICER':
      case 'SK_CHAIRMAN':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'PARENT_RESIDENT':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'PATIENT':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysWaiting = (dateString: string) => {
    const created = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <DashboardLayout currentPage="Pending Approvals">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading pending approvals...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="Pending Approvals">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Approvals</h1>
          <p className="text-muted-foreground">
            Review and approve user registrations
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredUsers.length}</div>
              <p className="text-xs text-muted-foreground">
                {filteredUsers.length === 1 ? 'user awaiting' : 'users awaiting'} approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Oldest Request</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredUsers.length > 0
                  ? `${Math.max(...filteredUsers.map(u => getDaysWaiting(u.createdAt)))} days`
                  : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Time waiting for approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Action Needed</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredUsers.filter(u => getDaysWaiting(u.createdAt) > 2).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Waiting more than 2 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User Registrations</CardTitle>
                <CardDescription>
                  Review user information and approve or reject registrations
                </CardDescription>
              </div>
              <Button variant="outline" onClick={fetchPendingUsers}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
                <p className="text-muted-foreground">
                  There are no pending user approvals at this time.
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead>Waiting</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getRoleBadgeColor(user.role || 'VISITOR')}>
                            {(user.role || 'VISITOR').replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {user.contactNumber || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(user.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              getDaysWaiting(user.createdAt) > 2
                                ? 'bg-yellow-50 text-yellow-800 border-yellow-300'
                                : 'bg-blue-50 text-blue-800 border-blue-300'
                            }
                          >
                            {getDaysWaiting(user.createdAt)} {getDaysWaiting(user.createdAt) === 1 ? 'day' : 'days'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewUser(user)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApproveClick(user)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <UserCheck className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRejectClick(user)}
                            >
                              <UserX className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
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

      {/* View User Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Review the user's registration information
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-lg">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </div>
                  <Badge variant="outline" className={getRoleBadgeColor(selectedUser.role || 'VISITOR')}>
                    {(selectedUser.role || 'VISITOR').replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Email</div>
                    <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                  </div>
                </div>

                {selectedUser.contactNumber && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Contact Number</div>
                      <div className="text-sm text-muted-foreground">{selectedUser.contactNumber}</div>
                    </div>
                  </div>
                )}

                {selectedUser.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Address</div>
                      <div className="text-sm text-muted-foreground">{selectedUser.address}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Registration Date</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(selectedUser.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Waiting Time</div>
                    <div className="text-sm text-muted-foreground">
                      {getDaysWaiting(selectedUser.createdAt)} {getDaysWaiting(selectedUser.createdAt) === 1 ? 'day' : 'days'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            {selectedUser && (
              <>
                <Button
                  variant="default"
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleApproveClick(selectedUser);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleRejectClick(selectedUser);
                  }}
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve User' : 'Reject User'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? 'This user will be activated and able to access the system.'
                : 'This user will be notified of the rejection and will not have access to the system.'}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="font-medium">
                  {selectedUser.firstName} {selectedUser.lastName}
                </div>
                <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
              </div>

              {actionType === 'reject' && (
                <div className="space-y-2">
                  <Label htmlFor="reason">Rejection Reason *</Label>
                  <Textarea
                    id="reason"
                    placeholder="Please provide a reason for rejecting this user..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    This reason will be sent to the user via email.
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              onClick={handleConfirmAction}
              disabled={actionLoading}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {actionLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {actionType === 'approve' ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirm Approval
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Confirm Rejection
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
