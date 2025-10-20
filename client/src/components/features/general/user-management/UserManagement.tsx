import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit, Trash2, Eye, MoreHorizontal, Shield, ShieldCheck, ShieldX, UserCheck, UserX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FormDialog, ConfirmDialog } from '@/components/shared';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
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
import { useUsersWithRolesAndBranches, useCreateUser, useUpdateUser, useDeleteUser, useUserDashboard, useRevokeUserAccess, useUser } from '@/lib/hooks/general/useUsers';
import { useRoles } from '@/lib/hooks/general/useRoles';
import { useBranches } from '@/lib/hooks/general/useBranches';
import { UserWithRolesAndBranches, UserCreate, UserUpdate, BranchRoleAssignment, UserWithAccesses } from '@/lib/types/general/users';
import { BranchRead } from '@/lib/types/general/branches';
import { UserStatsCards } from './UserStatsCards';

const UserManagement = () => {
  // API hooks - Now using clean architecture directly
  const { data: users = [], isLoading, error } = useUsersWithRolesAndBranches();
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: branches = [], isLoading: branchesLoading } = useBranches();
  const { data: dashboardStats, isLoading: dashboardLoading } = useUserDashboard();
  const branchesArray = branches as BranchRead[];
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const revokeAccessMutation = useRevokeUserAccess();

  // Helper function to extract role and branch info from accesses
  const getRoleAndBranchFromAccesses = (user: UserWithRolesAndBranches | UserWithAccesses) => {
    if ('accesses' in user && user.accesses && user.accesses.length > 0) {
      const firstAccess = user.accesses[0];
      return {
        roleId: roles.find(r => r.role_name === firstAccess.role_name)?.role_id || null,
        branchId: branchesArray.find(b => b.branch_name === firstAccess.branch_name)?.branch_id || null,
        roleName: firstAccess.role_name,
        branchName: firstAccess.branch_name
      };
    } else if ('roles' in user && user.roles && user.roles.length > 0) {
      return {
        roleId: user.roles[0].role_id,
        branchId: user.branches && user.branches.length > 0 ? user.branches[0].branch_id : null,
        roleName: user.roles[0].role_name,
        branchName: user.branches && user.branches.length > 0 ? user.branches[0].branch_name : ''
      };
    }
    return { roleId: null, branchId: null, roleName: '', branchName: '' };
  };

  // Component state
  const [selectedUser, setSelectedUser] = useState<UserWithRolesAndBranches | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithRolesAndBranches | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [accessToRevoke, setAccessToRevoke] = useState<{ accessId: number; userId: number; roleName: string; branchName: string } | null>(null);
  const [revokeNotes, setRevokeNotes] = useState<string>('');
  
  // Fetch detailed user data when viewing user details (includes accesses array)
  const { data: detailedUser, isLoading: detailedUserLoading } = useUser(selectedUser?.user_id || 0);

  // Form data
  const [formData, setFormData] = useState<UserCreate>({
    full_name: '',
    email: '',
    mobile_no: '',
    password: '',
    confirm_password: '',
    is_institute_admin: false,
    is_active: true,
    branch_role_assignments: [],
  });

  // Role and branch selections for the assignment
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [accessNotes, setAccessNotes] = useState<string>('');
  
  // Password validation state
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);


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
      branch_role_assignments: [],
    });
    setSelectedRole(null);
    setSelectedBranch(null);
    setAccessNotes('');
    setFormError(null);
    setPasswordsMatch(null);
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
      branch_role_assignments: [],
    });
    // Set role and branch selections for editing using helper function
    const { roleId, branchId } = getRoleAndBranchFromAccesses(user);
    setSelectedRole(roleId);
    setSelectedBranch(branchId);
    setAccessNotes('');
    setFormError(null);
    setPasswordsMatch(null);
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

  const handleRevokeAccess = (accessId: number, userId: number, roleName: string, branchName: string) => {
    setAccessToRevoke({ accessId, userId, roleName, branchName });
    setRevokeNotes('');
    setShowRevokeDialog(true);
  };

  const confirmRevokeAccess = () => {
    if (accessToRevoke) {
      revokeAccessMutation.mutate({
        accessId: accessToRevoke.accessId,
        payload: {
          user_id: accessToRevoke.userId,
          access_notes: revokeNotes || undefined,
        }
      });
      setShowRevokeDialog(false);
      setAccessToRevoke(null);
      setRevokeNotes('');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null); // Clear any previous errors
    
    // Validate role and branch selection for new users
    if (!isEditing) {
      if (!selectedRole) {
        setFormError('Please select a role for the user.');
        return;
      }
      if (!selectedBranch) {
        setFormError('Please select a branch for the user.');
        return;
      }
    }
    
    // Check for duplicate mobile number (only for new users)
    if (!isEditing && formData.mobile_no) {
      const existingUser = users.find(user => 
        user.mobile_no === formData.mobile_no && user.user_id !== selectedUser?.user_id
      );
      if (existingUser) {
        setFormError(`A user with mobile number ${formData.mobile_no} already exists. Please use a different mobile number.`);
        return;
      }
    }
    
    // Validate password confirmation (only for new users)
    if (!isEditing) {
      if (formData.password !== formData.confirm_password) {
        setFormError('Passwords do not match. Please ensure both password fields contain the same value.');
        return;
      }
      if (formData.password.length < 8) {
        setFormError('Password must be at least 8 characters long.');
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
      updateUserMutation.mutate({ id: selectedUser.user_id, payload: updateData }, {
        onSuccess: () => {
          setShowUserForm(false);
        },
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.error?.message || error?.message || 'An error occurred while updating the user.';
          setFormError(errorMessage);
        }
      });
    } else {
      // Create user with branch_role_assignments
      const userData: UserCreate = {
        ...formData,
        branch_role_assignments: [
          {
            branch_id: selectedBranch!,
            role_id: selectedRole!,
            is_default: true,
            access_notes: accessNotes || undefined,
          }
        ]
      };
      createUserMutation.mutate(userData, {
        onSuccess: () => {
          setShowUserForm(false);
        },
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.error?.message || error?.message || 'An error occurred while creating the user.';
          setFormError(errorMessage);
        }
      });
    }
  };

  const handleSave = () => {
    const form = document.getElementById('user-form') as HTMLFormElement;
    if (form) {
      form.requestSubmit();
    }
  };

  const handleFormChange = (field: keyof UserCreate, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Check password matching in real-time
      if (field === 'password' || field === 'confirm_password') {
        if (newData.password && newData.confirm_password) {
          const match = newData.password === newData.confirm_password;
          setPasswordsMatch(match);
          // Clear form error if passwords now match
          if (match && formError?.includes('Passwords do not match')) {
            setFormError(null);
          }
        } else {
          setPasswordsMatch(null);
        }
      }
      
      return newData;
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

  // Use dashboard stats if available, otherwise fallback to calculated stats
  const displayStats = dashboardStats || {
    total_users: users.length,
    active_users: users.filter(u => u.is_active).length,
    inactive_users: users.filter(u => !u.is_active).length,
    institute_admins: users.filter(u => u.is_institute_admin).length,
    regular_users: users.filter(u => !u.is_institute_admin).length,
    users_created_this_month: 0,
    users_created_this_year: 0,
  };

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
        </div>
      </div>

      {/* Stats Cards */}
      <UserStatsCards 
        stats={displayStats} 
        loading={dashboardLoading}
      />

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
          description="Manage user accounts and permissions"
          searchKey="full_name"
          searchPlaceholder="Search users..."
          exportable={true}
          onAdd={handleAddUser}
          addButtonText="Add User"
        />
      )}

      {/* Add/Edit User Form Dialog */}
      <FormDialog
        open={showUserForm}
        onOpenChange={setShowUserForm}
        title={isEditing ? "Edit User" : "Add New User"}
        description={isEditing ? "Update user information" : "Create a new user account for your institute"}
        size="LARGE"
        isLoading={createUserMutation.isPending || updateUserMutation.isPending}
        onSave={handleSave}
        saveText={isEditing ? "Update" : "Add"}
        cancelText="Cancel"
      >
        {formError && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md mb-4">
            <strong>Error:</strong> {formError}
          </div>
        )}
        {!isEditing && !formError && (
          <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md mb-4">
            <strong>Complete Setup:</strong> The user will be created with the selected role and branch assignment. You can add optional access notes to provide additional context about the user's permissions.
          </div>
        )}
        <form id="user-form" onSubmit={handleFormSubmit} className="space-y-4">
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
                  placeholder="Enter mobile number (e.g., +919876543210)"
                  data-testid="input-mobile"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Include country code (e.g., +91 for India). Each mobile number must be unique within your institute.
                </p>
              </div>
              <div></div>
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
            
            {/* Access Notes */}
            <div>
              <Label htmlFor="access_notes">Access Notes</Label>
              <Input
                id="access_notes"
                value={accessNotes}
                onChange={(e) => setAccessNotes(e.target.value)}
                placeholder="Optional notes about user access"
                data-testid="input-access-notes"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleFormChange('is_active', checked as boolean)}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div></div>
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
                    placeholder="Enter password (min 8 characters)"
                    required
                    minLength={8}
                    data-testid="input-password"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Password must be at least 8 characters long
                  </p>
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
                    className={passwordsMatch === false ? 'border-red-500' : passwordsMatch === true ? 'border-green-500' : ''}
                  />
                  {passwordsMatch === false && (
                    <p className="text-xs text-red-600 mt-1">
                      Passwords do not match
                    </p>
                  )}
                  {passwordsMatch === true && (
                    <p className="text-xs text-green-600 mt-1">
                      Passwords match ✓
                    </p>
                  )}
                </div>
              </div>
            )}
        </form>
      </FormDialog>

      {/* User Detail Dialog */}
      <FormDialog
        open={showDetail}
        onOpenChange={setShowDetail}
        title="User Details"
        description="View user information and account details"
        size="MEDIUM"
        showFooter={false}
      >
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
            
            {/* Access Information */}
            {detailedUser && ('accesses' in detailedUser && detailedUser.accesses && detailedUser.accesses.length > 0) && (
              <div className="mt-4">
                <Label className="text-muted-foreground">Access Permissions</Label>
                <div className="mt-2 space-y-2">
                  {detailedUser.accesses.map((access, index) => (
                    <div key={access.access_id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <div>
                        <span className="font-medium">{access.role_name}</span>
                        <span className="text-muted-foreground ml-2">at {access.branch_name}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeAccess(access.access_id, detailedUser.user_id, access.role_name, access.branch_name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={revokeAccessMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {revokeAccessMutation.isPending ? "Revoking..." : "Revoke"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Legacy roles and branches display for backward compatibility */}
            {('roles' in selectedUser && selectedUser.roles && selectedUser.roles.length > 0) && (
              <div className="mt-4">
                <Label className="text-muted-foreground">Roles & Branches</Label>
                <div className="mt-2 space-y-2">
                  {selectedUser.roles.map((role, index) => (
                    <div key={role.role_id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <div>
                        <span className="font-medium">{role.role_name}</span>
                        {selectedUser.branches && selectedUser.branches[index] && (
                          <span className="text-muted-foreground ml-2">at {selectedUser.branches[index].branch_name}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete User"
        description={`Are you sure you want to delete "${userToDelete?.full_name}"? This action cannot be undone.`}
        confirmText={deleteUserMutation.isPending ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
        disabled={deleteUserMutation.isPending}
      />

      {/* Revoke Access Confirmation Dialog */}
      <FormDialog
        open={showRevokeDialog}
        onOpenChange={setShowRevokeDialog}
        title="Revoke Access"
        description={`Are you sure you want to revoke ${accessToRevoke?.roleName} access at ${accessToRevoke?.branchName}? This action cannot be undone.`}
        size="MEDIUM"
        isLoading={revokeAccessMutation.isPending}
        onSave={confirmRevokeAccess}
        saveText={revokeAccessMutation.isPending ? "Revoking..." : "Revoke Access"}
        cancelText="Cancel"
        saveVariant="destructive"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <ShieldX className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-red-800">Revoke Access Permission</p>
                <p className="text-sm text-red-700">
                  This will remove the user's {accessToRevoke?.roleName} role at {accessToRevoke?.branchName}.
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="revoke-notes">Reason for Revocation (Optional)</Label>
            <Input
              id="revoke-notes"
              value={revokeNotes}
              onChange={(e) => setRevokeNotes(e.target.value)}
              placeholder="Enter reason for revoking access..."
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              This information will be recorded for audit purposes.
            </p>
          </div>
        </div>
      </FormDialog>
    </motion.div>
  );
};

export default UserManagement;

