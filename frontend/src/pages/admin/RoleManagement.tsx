import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Users, Shield, Edit, Search } from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  status: string;
  createdAt: string;
}

const AVAILABLE_ROLES = [
  'SYSTEM_ADMIN',
  'BARANGAY_CAPTAIN', 
  'BARANGAY_OFFICIAL',
  'BHW',
  'BHW_COORDINATOR',
  'DAYCARE_STAFF',
  'DAYCARE_TEACHER',
  'SK_OFFICER',
  'SK_CHAIRMAN',
  'PARENT_RESIDENT',
  'VISITOR'
];

export default function RoleManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRoles = user.roles || [user.role || 'VISITOR'];
  const isAdmin = userRoles.some((role: string) => ['SYSTEM_ADMIN', 'BARANGAY_CAPTAIN'].includes(role));

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, [isAdmin, navigate]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users || []);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRoles = (user: User) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles || []);
    setShowDialog(true);
  };

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;
    
    try {
      await api.put(`/admin/users/${selectedUser.id}/roles`, {
        roles: selectedRoles
      });
      toast.success('User roles updated successfully');
      setShowDialog(false);
      setSelectedUser(null);
      setSelectedRoles([]);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update user roles');
    }
  };

  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.roles.some(role => role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRoleStats = () => {
    const roleCount: Record<string, number> = {};
    users.forEach(user => {
      user.roles.forEach(role => {
        roleCount[role] = (roleCount[role] || 0) + 1;
      });
    });
    return roleCount;
  };

  const roleStats = getRoleStats();

  return (
    <DashboardLayout currentPage="/admin/users/roles">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Role Management</h1>
            <p className="text-muted-foreground">Manage user roles and permissions</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{users.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Admin Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">
                {(roleStats['SYSTEM_ADMIN'] || 0) + (roleStats['BARANGAY_CAPTAIN'] || 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Staff Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">
                {(roleStats['BHW'] || 0) + (roleStats['DAYCARE_STAFF'] || 0) + (roleStats['SK_OFFICER'] || 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Residents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {roleStats['PARENT_RESIDENT'] || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>User Roles</CardTitle>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading users...</p>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="border p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {user.roles.map((role) => (
                            <Badge key={role} variant="outline">
                              {role.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => handleEditRoles(user)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit Roles
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Edit Roles - {selectedUser?.firstName} {selectedUser?.lastName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Select the roles for this user:
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {AVAILABLE_ROLES.map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={role}
                      checked={selectedRoles.includes(role)}
                      onCheckedChange={() => handleRoleToggle(role)}
                    />
                    <label htmlFor={role} className="text-sm font-medium cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        {role.replace('_', ' ')}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveRoles}>
                  Save Roles
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}