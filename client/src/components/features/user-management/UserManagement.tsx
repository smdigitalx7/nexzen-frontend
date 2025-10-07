import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit, Trash2, Eye, MoreHorizontal, Shield, ShieldCheck, ShieldX, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedDataTable } from '@/components/shared/EnhancedDataTable';
import {
  createAvatarColumn,
  createTextColumn,
  createBadgeColumn,
  createDateColumn,
  createActionColumn,
  createViewAction,
  createEditAction,
  createDeleteAction
} from "@/lib/utils/columnFactories.tsx";
import { useUsersWithRoles, useCreateUser, useUpdateUser, useDeleteUser, useUpdateUserStatus } from '@/lib/hooks/useUsers';
import { useRoles } from '@/lib/hooks/useRoles';
import { useBranches } from '@/lib/hooks/useBranches';
import { useCreateUserBranchAccess } from '@/lib/hooks/useUserBranchAccess';
import { UserWithRolesAndBranches, UserCreate, UserUpdate } from '@/lib/types/users';
import { RoleRead } from '@/lib/types/roles';
import { BranchRead } from '@/lib/types/branches';

const UserManagement = () => {
  // API hooks - Now using clean architecture directly
  const { data: users = [], isLoading, error } = useUsersWithRoles();
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: branches = [], isLoading: branchesLoading } = useBranches();
  const branchesArray = branches as BranchRead[];
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const updateStatusMutation = useUpdateUserStatus();
  const createUserBranchAccessMutation = useCreateUserBranchAccess();

  // Component state
  const [selectedUser, setSelectedUser] = useState<UserWithRolesAndBranches | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithRolesAndBranches | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Form data
  const [formData, setFormData] = useState<UserCreate>({
    full_name: '',
    email: '',
    mobile_no: '',
    password: '',
    confirm_password: '',
    is_institute_admin: false,
    is_active: true,
  });

  // Role and branch selections
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [selectedDefaultBranch, setSelectedDefaultBranch] = useState<number | null>(null);


  const handleAddUser = () => {
    setIsEditing(false);
    setFormData({
      full_name: '',
      email: '',
      mobile_no: '',
      password: '',
      confirm_password: '',
      is_institute_admin: false,
      is_active: true,
    });
    setSelectedRole(null);
    setSelectedBranch(null);
    setSelectedDefaultBranch(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user: UserWithRolesAndBranches) => {
    setIsEditing(true);
    setSelectedUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      mobile_no: user.mobile_no || '',
      password: '',
      confirm_password: '',
      is_institute_admin: user.is_institute_admin,
      is_active: user.is_active,
    });
    // Set role and branch selections for editing
    setSelectedRole(user.roles && user.roles.length > 0 ? user.roles[0].role_id : null);
    setSelectedBranch(user.branches && user.branches.length > 0 ? user.branches[0].branch_id : null);
    setSelectedDefaultBranch(user.branches && user.branches.length > 0 ? user.branches[0].branch_id : null);
    setShowUserForm(true);
  };

  const handleDeleteUser = (user: UserWithRolesAndBranches) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.user_id);
      setShowDeleteDialog(false);
      setUserToDelete(null);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate role and branch selection for new users
    if (!isEditing) {
      if (!selectedRole) {
        alert('Please select a role for the user.');
        return;
      }
      if (!selectedBranch) {
        alert('Please select a branch for the user.');
        return;
      }
    }
    
    if (isEditing && selectedUser) {
      const updateData: UserUpdate = {
        full_name: formData.full_name,
        email: formData.email,
        mobile_no: formData.mobile_no || null,
        is_institute_admin: formData.is_institute_admin,
        is_active: formData.is_active,
      };
      updateUserMutation.mutate({ id: selectedUser.user_id, payload: updateData });
    } else {
      // Create user first, then create user branch access
      createUserMutation.mutate(formData, {
        onSuccess: (createdUser) => {
          // After user is created successfully, create the user branch access
          if (selectedRole && selectedBranch) {
            createUserBranchAccessMutation.mutate({
              user_id: createdUser.user_id,
              branch_id: selectedBranch,
              role_id: selectedRole,
              is_default: selectedDefaultBranch === selectedBranch,
              is_active: true,
            });
          }
        },
      });
    }
    setShowUserForm(false);
  };

  const handleFormChange = (field: keyof UserCreate, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStatusToggle = (user: UserWithRolesAndBranches) => {
    updateStatusMutation.mutate({
      id: user.user_id,
      is_active: !user.is_active,
    });
  };

  const columns: ColumnDef<UserWithRolesAndBranches>[] = useMemo(() => ([
    createAvatarColumn<UserWithRolesAndBranches>('full_name', 'email', { header: 'Full Name' }),
    createTextColumn<UserWithRolesAndBranches>('email', { header: 'Email' }),
    createTextColumn<UserWithRolesAndBranches>('mobile_no', { header: 'Mobile', fallback: 'N/A' }),
    createBadgeColumn<UserWithRolesAndBranches>('is_active', { header: 'Status', variant: 'outline' }),
    createDateColumn<UserWithRolesAndBranches>('created_at', { header: 'Created' }),
    createActionColumn<UserWithRolesAndBranches>([
      createViewAction((row) => { setSelectedUser(row); setShowDetail(true); }),
      createEditAction((row) => handleEditUser(row)),
      createDeleteAction((row) => handleDeleteUser(row))
    ])
  ]), [handleEditUser, handleDeleteUser]);

  // Stats cards
  const statsCards = useMemo(() => [
    {
      title: 'Total Users',
      value: users.length,
      icon: <Shield className="h-4 w-4" />,
      description: 'All users in institute',
    },
    {
      title: 'Active Users',
      value: users.filter(u => u.is_active).length,
      icon: <UserCheck className="h-4 w-4" />,
      description: 'Currently active',
    },
    {
      title: 'Institute Admins',
      value: users.filter(u => u.is_institute_admin).length,
      icon: <ShieldCheck className="h-4 w-4" />,
      description: 'Admin privileges',
    },
    {
      title: 'Inactive Users',
      value: users.filter(u => !u.is_active).length,
      icon: <UserX className="h-4 w-4" />,
      description: 'Deactivated accounts',
    },
  ], [users]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts and permissions across your institute
          </p>
          <div className="text-sm text-muted-foreground mt-1">
            Showing {users.length} users
          </div>
        </div>
        <Button onClick={handleAddUser} className="hover-elevate" data-testid="button-add-user">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users Table */}
      {error ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Failed to load users: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EnhancedDataTable
          data={users}
          columns={columns}
          title={isLoading ? "Users (Loading...)" : "Users"}
          searchKey="full_name"
          exportable={true}
        />
      )}

      {/* Add/Edit User Form Dialog */}
      <Dialog open={showUserForm} onOpenChange={setShowUserForm}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update user information" : "Create a new user account for your institute"}
            </DialogDescription>
            {!isEditing && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                <strong>Complete Setup:</strong> The user will be created with the selected role and branch assignment. 
                The default branch will be set if specified.
              </div>
            )}
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleFormChange('full_name', e.target.value)}
                  placeholder="Enter full name"
                  required
                  data-testid="input-full-name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  placeholder="Enter email"
                  required
                  data-testid="input-email"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mobile_no">Mobile Number</Label>
                <Input
                  id="mobile_no"
                  value={formData.mobile_no || ""}
                  onChange={(e) => handleFormChange('mobile_no', e.target.value)}
                  placeholder="Enter mobile number"
                  data-testid="input-mobile"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_institute_admin"
                  checked={formData.is_institute_admin}
                  onCheckedChange={(checked) => handleFormChange('is_institute_admin', checked as boolean)}
                />
                <Label htmlFor="is_institute_admin">Institute Admin</Label>
              </div>
            </div>
            
            {/* Role and Branch Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Role *</Label>
                <Select value={selectedRole?.toString() || ""} onValueChange={(value) => setSelectedRole(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {rolesLoading ? (
                      <SelectItem value="" disabled>Loading roles...</SelectItem>
                    ) : (
                      roles.map((role) => (
                        <SelectItem key={role.role_id} value={role.role_id.toString()}>
                          {role.role_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="branch">Branch *</Label>
                <Select value={selectedBranch?.toString() || ""} onValueChange={(value) => setSelectedBranch(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branchesLoading ? (
                      <SelectItem value="" disabled>Loading branches...</SelectItem>
                    ) : (
                      branchesArray.map((branch: BranchRead) => (
                        <SelectItem key={branch.branch_id} value={branch.branch_id.toString()}>
                          {branch.branch_name} ({branch.branch_type})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="default_branch">Default Branch</Label>
                <Select value={selectedDefaultBranch?.toString() || ""} onValueChange={(value) => setSelectedDefaultBranch(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select default branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branchesLoading ? (
                      <SelectItem value="" disabled>Loading branches...</SelectItem>
                    ) : (
                      branchesArray.map((branch: BranchRead) => (
                        <SelectItem key={branch.branch_id} value={branch.branch_id.toString()}>
                          {branch.branch_name} ({branch.branch_type})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleFormChange('is_active', checked as boolean)}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
            {!isEditing && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleFormChange('password', e.target.value)}
                    placeholder="Enter password"
                    required
                    minLength={8}
                    data-testid="input-password"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm_password">Confirm Password *</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={formData.confirm_password}
                    onChange={(e) => handleFormChange('confirm_password', e.target.value)}
                    placeholder="Confirm password"
                    required
                    minLength={8}
                    data-testid="input-confirm-password"
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowUserForm(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createUserMutation.isPending || updateUserMutation.isPending || createUserBranchAccessMutation.isPending}
                data-testid="button-submit-user"
              >
                {createUserMutation.isPending || updateUserMutation.isPending || createUserBranchAccessMutation.isPending ? "Saving..." : isEditing ? "Update User" : "Add User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* User Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-lg">
                    {selectedUser.full_name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedUser.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Mobile</Label>
                  <p>{selectedUser.mobile_no || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Role</Label>
                  <p>{selectedUser.is_institute_admin ? 'Institute Admin' : 'User'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={selectedUser.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}>
                    {selectedUser.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <p>{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{userToDelete?.full_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default UserManagement;