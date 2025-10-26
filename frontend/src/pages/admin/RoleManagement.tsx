import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Users, Shield, Edit, Search } from 'lucide-react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  createdAt: string;
}

const USER_ROLES = [
  { value: 'SYSTEM_ADMIN', label: 'System Admin', color: 'bg-red-100 text-red-800' },
  { value: 'BARANGAY_CAPTAIN', label: 'Barangay Captain', color: 'bg-purple-100 text-purple-800' },
  { value: 'BARANGAY_OFFICIAL', label: 'Barangay Official', color: 'bg-blue-100 text-blue-800' },
  { value: 'BHW', label: 'Barangay Health Worker', color: 'bg-green-100 text-green-800' },
  { value: 'BHW_COORDINATOR', label: 'BHW Coordinator', color: 'bg-green-100 text-green-800' },
  { value: 'DAYCARE_STAFF', label: 'Daycare Staff', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'DAYCARE_TEACHER', label: 'Daycare Teacher', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'SK_OFFICER', label: 'SK Officer', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'SK_CHAIRMAN', label: 'SK Chairman', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'PARENT_RESIDENT', label: 'Parent/Resident', color: 'bg-gray-100 text-gray-800' },
  { value: 'PATIENT', label: 'Patient', color: 'bg-gray-100 text-gray-800' },
  { value: 'VISITOR', label: 'Visitor', color: 'bg-gray-100 text-gray-800' }
];

export default function RoleManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    try {
      await api.put(`/admin/users/${selectedUser.id}/role`, { role: newRole });
      toast.success('User role updated successfully');
      setIsDialogOpen(false);
      setSelectedUser(null);
      setNewRole('');
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const openRoleDialog = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsDialogOpen(true);
  };

  const getRoleInfo = (role: string) => {
    return USER_ROLES.find(r => r.value === role) || USER_ROLES[USER_ROLES.length - 1];
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const roleStats = USER_ROLES.map(role => ({
    ...role,
    count: users.filter(user => user.role === role.value).length
  }));

  return (
    <DashboardLayout currentPage="/admin/users/roles">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Role Management</h1>
            <p className="text-muted-foreground">Manage user roles and permissions</p>
          </div>
        </div>

        {/* Role Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {roleStats.map((role) => (
            <Card key={role.value}>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{role.count}</div>
                  <div className="text-xs text-muted-foreground">{role.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              {USER_ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Users ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No users found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map((user) => {
                    const roleInfo = getRoleInfo(user.role);
                    return (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          <div className="flex items-center mt-2 space-x-2">
                            <Badge className={roleInfo.color}>{roleInfo.label}</Badge>
                            <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
                              {user.status}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRoleDialog(user)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Change Role
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Role Change Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change User Role</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div>
                  <p className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Select New Role</label>
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleRoleChange}>
                    Update Role
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}