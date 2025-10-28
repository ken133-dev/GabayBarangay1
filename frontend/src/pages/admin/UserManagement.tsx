import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Users,
  Search,
  MoreVertical,
  UserCheck,
  Ban,
  Mail,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Shield,
  Phone,
  MapPin,
  Calendar,
  UserPlus,
} from 'lucide-react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  contactNumber?: string;
  address?: string;
  role?: string;
  roles?: string[];
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'INACTIVE';
  otpEnabled?: boolean;
  createdAt: string;
  updatedAt?: string;
}

const ROLE_HIERARCHY = {
  'Administrative': {
    roles: ['SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL'],
    variant: 'default' as const,
    icon: Shield
  },
  'Health Services': {
    roles: ['BHW_COORDINATOR', 'BHW'],
    variant: 'secondary' as const,
    icon: Users
  },
  'Daycare Services': {
    roles: ['DAYCARE_TEACHER', 'DAYCARE_STAFF'],
    variant: 'outline' as const,
    icon: Users
  },
  'Youth Services': {
    roles: ['SK_CHAIRMAN', 'SK_OFFICER'],
    variant: 'secondary' as const,
    icon: Users
  },
  'Community': {
    roles: ['PARENT_RESIDENT', 'VISITOR'],
    variant: 'outline' as const,
    icon: Users
  }
};

const USER_ROLES = Object.values(ROLE_HIERARCHY).flatMap(group => group.roles);

const USER_STATUSES = ['ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE'];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    address: '',
    roles: [] as string[],
    otpEnabled: false
  });
  const [addFormData, setAddFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    address: '',
    roles: [] as string[],
    otpEnabled: false
  });
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

    fetchUsers();
  }, [isAdmin, navigate]);

  useEffect(() => {
    const filterUsers = () => {
      let filtered = users;

      // Search filter
      if (searchTerm) {
        filtered = filtered.filter(
          (u) =>
            u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Role filter
      if (roleFilter !== 'all') {
        filtered = filtered.filter((u) => {
          const userRoles = u.roles || [u.role];
          return userRoles.includes(roleFilter);
        });
      }

      // Status filter
      if (statusFilter !== 'all') {
        filtered = filtered.filter((u) => u.status === statusFilter);
      }

      setFilteredUsers(filtered);
    };

    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data.users || []);
      setFilteredUsers(response.data.users || []);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: 'ACTIVE' });
      setUsers(users.map(u => u.id === userId ? { ...u, status: 'ACTIVE' as const } : u));
      toast.success('User approved successfully');
    } catch {
      toast.error('Failed to approve user');
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: 'SUSPENDED' });
      setUsers(users.map(u => u.id === userId ? { ...u, status: 'SUSPENDED' as const } : u));
      toast.success('User suspended successfully');
    } catch {
      toast.error('Failed to suspend user');
    }
  };

  const handleUnsuspendUser = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: 'ACTIVE' });
      setUsers(users.map(u => u.id === userId ? { ...u, status: 'ACTIVE' as const } : u));
      toast.success('User unsuspended successfully');
    } catch {
      toast.error('Failed to unsuspend user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const handleViewDetails = async (user: User) => {
    try {
      const response = await api.get(`/admin/users/${user.id}`);
      setSelectedUser(response.data.user);
      setShowViewDialog(true);
    } catch {
      toast.error('Failed to load user details');
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      contactNumber: user.contactNumber || '',
      address: user.address || '',
      roles: user.roles || [user.role || ''],
      otpEnabled: user.otpEnabled || false
    });
    setShowEditDialog(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      // Update user roles if changed
      if (JSON.stringify(editFormData.roles) !== JSON.stringify(selectedUser.roles || [selectedUser.role])) {
        await api.put(`/admin/users/${selectedUser.id}/roles`, { roles: editFormData.roles });
      }

      // Update other user details
      const userUpdateData = {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        email: editFormData.email,
        contactNumber: editFormData.contactNumber,
        address: editFormData.address,
        otpEnabled: editFormData.otpEnabled
      };

      await api.put(`/admin/users/${selectedUser.id}`, userUpdateData);

      // Refetch the updated user data to ensure local state matches database
      const response = await api.get(`/admin/users/${selectedUser.id}`);
      const updatedUser = response.data.user;

      setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
      setShowEditDialog(false);
      toast.success('User updated successfully');
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleRoleToggle = (role: string) => {
    setEditFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleAddRoleToggle = (role: string) => {
    setAddFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleAddUser = async () => {
    try {
      const userData = {
        firstName: addFormData.firstName,
        lastName: addFormData.lastName,
        email: addFormData.email,
        contactNumber: addFormData.contactNumber,
        address: addFormData.address,
        roles: addFormData.roles,
        otpEnabled: addFormData.otpEnabled
      };

      const response = await api.post('/admin/users', userData);
      setUsers([...users, response.data.user]);
      setShowAddDialog(false);
      setAddFormData({
        firstName: '',
        lastName: '',
        email: '',
        contactNumber: '',
        address: '',
        roles: [],
        otpEnabled: false
      });
      toast.success('User created successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create user');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800 border-green-200',
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      SUSPENDED: 'bg-red-100 text-red-800 border-red-200',
      INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <Badge variant="outline" className={styles[status as keyof typeof styles]}>
        {status}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    if (!role) return <Badge variant="outline">Unknown</Badge>;
    
    const roleColors: Record<string, string> = {
      SYSTEM_ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
      BARANGAY_CAPTAIN: 'bg-blue-100 text-blue-800 border-blue-200',
      BHW: 'bg-pink-100 text-pink-800 border-pink-200',
      DAYCARE_STAFF: 'bg-orange-100 text-orange-800 border-orange-200',
      SK_OFFICER: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      PARENT_RESIDENT: 'bg-green-100 text-green-800 border-green-200',
      PATIENT: 'bg-teal-100 text-teal-800 border-teal-200'
    };

    return (
      <Badge variant="outline" className={roleColors[role] || 'bg-gray-100 text-gray-800'}>
        {role.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const exportUsers = () => {
    const csv = [
      ['Name', 'Email', 'Role', 'Status', 'Contact', 'Created'],
      ...filteredUsers.map(u => [
        `${u.firstName} ${u.lastName}`,
        u.email,
        u.roles ? u.roles.join('; ') : u.role || 'Unknown',
        u.status,
        u.contactNumber || '',
        formatDate(u.createdAt)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Users exported successfully');
  };

  return (
    <DashboardLayout currentPage="User Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">
              Manage user accounts, roles, and permissions
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
            <Button variant="outline" onClick={() => fetchUsers()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportUsers}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => navigate('/admin/users/pending')}>
              <UserCheck className="h-4 w-4 mr-2" />
              Pending Approvals
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold">{users.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Registered accounts
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <p className="text-3xl font-bold text-green-600">
                    {users.filter(u => u.status === 'ACTIVE').length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {users.length > 0 ? Math.round((users.filter(u => u.status === 'ACTIVE').length / users.length) * 100) : 0}% of total
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {users.filter(u => u.status === 'PENDING').length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Awaiting verification
                  </p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Suspended</p>
                  <p className="text-3xl font-bold text-red-600">
                    {users.filter(u => u.status === 'SUSPENDED').length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Access restricted
                  </p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Ban className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {Object.entries(ROLE_HIERARCHY).map(([category, { roles, icon: IconComponent }]) => (
                    <div key={category}>
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <IconComponent className="h-3 w-3" />
                        {category}
                      </div>
                      {roles.map(role => (
                        <SelectItem key={role} value={role} className="pl-6">
                          {role.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {USER_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <CardDescription>
              {filteredUsers.length !== users.length && `Showing ${filteredUsers.length} of ${users.length} users`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.roles ? (
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role, idx) => (
                              <span key={idx}>{getRoleBadge(role)}</span>
                            ))}
                          </div>
                        ) : (
                          getRoleBadge(user.role || 'Unknown')
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.contactNumber || 'N/A'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status === 'PENDING' && (
                              <DropdownMenuItem onClick={() => handleApproveUser(user.id)}>
                                <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                                Approve
                              </DropdownMenuItem>
                            )}
                            {user.status === 'ACTIVE' && (
                              <DropdownMenuItem onClick={() => handleSuspendUser(user.id)}>
                                <Ban className="h-4 w-4 mr-2 text-yellow-600" />
                                Suspend
                              </DropdownMenuItem>
                            )}
                            {user.status === 'SUSPENDED' && (
                              <DropdownMenuItem onClick={() => handleUnsuspendUser(user.id)}>
                                <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                                Unsuspend
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* View User Details Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                User Details
              </DialogTitle>
              <DialogDescription>
                Complete information about the selected user
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Full Name</Label>
                    <p className="text-sm">{selectedUser.firstName} {selectedUser.lastName}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm">{selectedUser.email}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Contact Number</Label>
                    <p className="text-sm flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {selectedUser.contactNumber || 'Not provided'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedUser.status)}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Roles */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Roles</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.roles ? (
                      selectedUser.roles.map((role, idx) => (
                        <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {role.replace(/_/g, ' ')}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {selectedUser.role || 'Unknown'}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Address */}
                {selectedUser.address && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Address</Label>
                      <p className="text-sm flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {selectedUser.address}
                      </p>
                    </div>
                  </>
                )}

                {/* Account Information */}
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Account Created</Label>
                    <p className="text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                    <div className="flex items-center gap-2">
                      {selectedUser.otpEnabled ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Enabled
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Disabled
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Edit User
              </DialogTitle>
              <DialogDescription>
                Update user information and permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 overflow-y-auto flex-1 pr-2">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    value={editFormData.contactNumber}
                    onChange={(e) => setEditFormData({...editFormData, contactNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                />
              </div>

              <Separator />

              {/* Roles */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Roles</Label>
                <div className="space-y-3">
                  {Object.entries(ROLE_HIERARCHY).map(([category, { roles, variant, icon: IconComponent }]) => (
                    <Card key={category} className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                        <Badge variant={variant} className="text-xs">
                          {category}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {roles.map(role => (
                          <div 
                            key={role} 
                            className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
                              editFormData.roles.includes(role) 
                                ? 'bg-primary/10 border border-primary/20' 
                                : 'hover:bg-muted/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              id={role}
                              checked={editFormData.roles.includes(role)}
                              onChange={() => handleRoleToggle(role)}
                              className="rounded border-input"
                            />
                            <Label 
                              htmlFor={role} 
                              className={`text-sm cursor-pointer ${
                                editFormData.roles.includes(role) ? 'font-medium text-primary' : ''
                              }`}
                            >
                              {role.replace(/_/g, ' ')}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Two-Factor Authentication */}
              {/* <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable SMS-based two-factor authentication for this user
                  </p>
                </div>
                <Switch
                  checked={editFormData.otpEnabled}
                  onCheckedChange={(checked) => setEditFormData({...editFormData, otpEnabled: checked})}
                />
              </div> */}

            </div>
            <div className="flex justify-end gap-3 flex-shrink-0 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser}>
                Update User
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add User Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Add New User
              </DialogTitle>
              <DialogDescription>
                Create a new user account with specified roles and permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 overflow-y-auto flex-1 pr-2">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addFirstName">First Name *</Label>
                  <Input
                    id="addFirstName"
                    value={addFormData.firstName}
                    onChange={(e) => setAddFormData({...addFormData, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addLastName">Last Name *</Label>
                  <Input
                    id="addLastName"
                    value={addFormData.lastName}
                    onChange={(e) => setAddFormData({...addFormData, lastName: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addEmail">Email *</Label>
                  <Input
                    id="addEmail"
                    type="email"
                    value={addFormData.email}
                    onChange={(e) => setAddFormData({...addFormData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addContactNumber">Contact Number</Label>
                  <Input
                    id="addContactNumber"
                    value={addFormData.contactNumber}
                    onChange={(e) => setAddFormData({...addFormData, contactNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="addAddress">Address</Label>
                <Input
                  id="addAddress"
                  value={addFormData.address}
                  onChange={(e) => setAddFormData({...addFormData, address: e.target.value})}
                />
              </div>

              <Separator />

              {/* Roles */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Roles *</Label>
                <div className="space-y-3">
                  {Object.entries(ROLE_HIERARCHY).map(([category, { roles, variant, icon: IconComponent }]) => (
                    <Card key={category} className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                        <Badge variant={variant} className="text-xs">
                          {category}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {roles.map(role => (
                          <div 
                            key={role} 
                            className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
                              addFormData.roles.includes(role) 
                                ? 'bg-primary/10 border border-primary/20' 
                                : 'hover:bg-muted/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              id={`add-${role}`}
                              checked={addFormData.roles.includes(role)}
                              onChange={() => handleAddRoleToggle(role)}
                              className="rounded border-input"
                            />
                            <Label 
                              htmlFor={`add-${role}`} 
                              className={`text-sm cursor-pointer ${
                                addFormData.roles.includes(role) ? 'font-medium text-primary' : ''
                              }`}
                            >
                              {role.replace(/_/g, ' ')}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable SMS-based two-factor authentication for this user
                  </p>
                </div>
                <Switch
                  checked={addFormData.otpEnabled}
                  onCheckedChange={(checked) => setAddFormData({...addFormData, otpEnabled: checked})}
                />
              </div>

            </div>
            <div className="flex justify-end gap-3 flex-shrink-0 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddUser}
                disabled={!addFormData.firstName || !addFormData.lastName || !addFormData.email || addFormData.roles.length === 0}
              >
                Create User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
