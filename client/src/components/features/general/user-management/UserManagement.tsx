import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ColumnDef } from '@tanstack/react-table';
import { Trash2, Shield, ShieldX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FormDialog, ConfirmDialog } from '@/components/shared';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { EnhancedDataTable } from '@/components/shared/EnhancedDataTable';
import { useToast } from '@/hooks/use-toast';
import {
  createAvatarColumn,
  createTextColumn,
  createBadgeColumn,
  createDateColumn
} from "@/lib/utils/columnFactories.tsx";
import { useUsersWithRolesAndBranches, useCreateUser, useUpdateUser, useDeleteUser, useUserDashboard, useRevokeUserAccess, useCreateUserAccess, useUser } from '@/lib/hooks/general/useUsers';
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
  const createAccessMutation = useCreateUserAccess();
  const { toast } = useToast();

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
  const [showAccessDialog, setShowAccessDialog] = useState(false);
  const [accessFormData, setAccessFormData] = useState({
    branch_id: 0,
    role_id: 0,
    is_default: false,
    access_notes: '',
    is_active: true
  });
  const [showAccessRevokeDialog, setShowAccessRevokeDialog] = useState(false);
  const [accessToRevokeFromDialog, setAccessToRevokeFromDialog] = useState<{ accessId: number; userId: number; roleName: string; branchName: string } | null>(null);
  const [accessRevokeNotes, setAccessRevokeNotes] = useState<string>('');
  
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
      deleteUserMutation.mutate(userToDelete.user_id, {
        onSuccess: () => {
          toast({
            title: "User Deleted Successfully",
            description: `${userToDelete.full_name} has been deleted successfully.`,
          });
          setShowDeleteDialog(false);
          setUserToDelete(null);
        },
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.error?.message || error?.message || 'An error occurred while deleting the user.';
          toast({
            title: "Deletion Failed",
            description: errorMessage,
            variant: "destructive",
          });
        }
      });
    }
  };


  const handleAddAccess = (user: UserWithRolesAndBranches) => {
    setSelectedUser(user);
    setAccessFormData({
      branch_id: 0,
      role_id: 0,
      is_default: false,
      access_notes: '',
      is_active: true
    });
    setShowAccessDialog(true);
  };

  const handleAccessFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !accessFormData.branch_id || !accessFormData.role_id) {
      setFormError('Please select both branch and role for the access.');
      return;
    }

    createAccessMutation.mutate({
      user_id: selectedUser.user_id,
      branch_id: accessFormData.branch_id,
      role_id: accessFormData.role_id,
      is_default: accessFormData.is_default,
      access_notes: accessFormData.access_notes || undefined,
      is_active: accessFormData.is_active
    }, {
      onSuccess: () => {
        toast({
          title: "Access Granted Successfully",
          description: `Access has been granted to ${selectedUser.full_name} successfully.`,
        });
        setShowAccessDialog(false);
        setFormError(null);
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.error?.message || error?.message || 'An error occurred while creating the access.';
        toast({
          title: "Access Creation Failed",
          description: errorMessage,
          variant: "destructive",
        });
        setFormError(errorMessage);
      }
    });
  };

  const handleRevokeAccessFromDialog = (accessId: number, userId: number, roleName: string, branchName: string) => {
    setAccessToRevokeFromDialog({ accessId, userId, roleName, branchName });
    setAccessRevokeNotes('');
    setShowAccessRevokeDialog(true);
  };

  const confirmRevokeAccessFromDialog = () => {
    if (accessToRevokeFromDialog) {
      revokeAccessMutation.mutate({
        accessId: accessToRevokeFromDialog.accessId,
        payload: {
          user_id: accessToRevokeFromDialog.userId,
          access_notes: accessRevokeNotes || undefined,
        }
      }, {
        onSuccess: () => {
          toast({
            title: "Access Revoked Successfully",
            description: `Access has been revoked from ${accessToRevokeFromDialog.roleName} at ${accessToRevokeFromDialog.branchName} successfully.`,
          });
          setShowAccessRevokeDialog(false);
          setAccessToRevokeFromDialog(null);
          setAccessRevokeNotes('');
        },
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.error?.message || error?.message || 'An error occurred while revoking the access.';
          toast({
            title: "Access Revocation Failed",
            description: errorMessage,
            variant: "destructive",
          });
        }
      });
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
          toast({
            title: "User Updated Successfully",
            description: `${formData.full_name} has been updated successfully.`,
          });
          setShowUserForm(false);
          setFormError(null);
        },
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.error?.message || error?.message || 'An error occurred while updating the user.';
          toast({
            title: "Update Failed",
            description: errorMessage,
            variant: "destructive",
          });
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
          toast({
            title: "User Created Successfully",
            description: `${formData.full_name} has been created successfully.`,
          });
          setShowUserForm(false);
          setFormError(null);
        },
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.error?.message || error?.message || 'An error occurred while creating the user.';
          toast({
            title: "Creation Failed",
            description: errorMessage,
            variant: "destructive",
          });
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
    createDateColumn<UserWithRolesAndBranches>('created_at', { header: 'Created' })
  ]), []);

  // Action button groups for the EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'view' as const,
      onClick: (row: UserWithRolesAndBranches) => { setSelectedUser(row); setShowDetail(true); }
    },
    {
      type: 'edit' as const,
      onClick: (row: UserWithRolesAndBranches) => handleEditUser(row)
    },
    {
      type: 'custom' as const,
      label: 'Access',
      icon: Shield,
      onClick: (row: UserWithRolesAndBranches) => handleAddAccess(row),
      variant: 'outline' as const,
      className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
    },
    {
      type: 'delete' as const,
      onClick: (row: UserWithRolesAndBranches) => handleDeleteUser(row)
    }
  ], [handleEditUser, handleDeleteUser]);

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
          searchKey="full_name"
          searchPlaceholder="Search users..."
          exportable={true}
          onAdd={handleAddUser}
          addButtonText="Add User"
          showActions={true}
          actionButtonGroups={actionButtonGroups}
          actionColumnHeader="Actions"
          showActionLabels={false}
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
                  placeholder="Enter mobile number (e.g., 9876543210)"
                  data-testid="input-mobile"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Exclude country code (e.g., 9876543210 for India).
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


      {/* Add Access Dialog */}
      <FormDialog
        open={showAccessDialog}
        onOpenChange={setShowAccessDialog}
        title="Manage Branch Access"
        description={`Manage branch access for ${selectedUser?.full_name}`}
        size="LARGE"
        isLoading={createAccessMutation.isPending}
        onSave={() => {
          const form = document.getElementById('access-form') as HTMLFormElement;
          if (form) {
            form.requestSubmit();
          }
        }}
        saveText={createAccessMutation.isPending ? "Adding..." : "Add Access"}
        cancelText="Cancel"
      >
        {formError && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md mb-4">
            <strong>Error:</strong> {formError}
          </div>
        )}
        
        {/* Existing Access Permissions */}
        {detailedUser && ('accesses' in detailedUser && detailedUser.accesses && detailedUser.accesses.length > 0) && (
          <div className="mb-6">
            <Label className="text-muted-foreground text-sm font-medium">Current Access Permissions</Label>
            <div className="mt-2 space-y-2">
              {detailedUser.accesses.map((access, index) => (
                <div key={access.access_id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <div>
                      <span className="font-medium text-sm">{access.role_name}</span>
                      <span className="text-muted-foreground text-sm ml-2">at {access.branch_name}</span>
                      {access.is_default && (
                        <Badge variant="outline" className="ml-2 text-xs">Default</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevokeAccessFromDialog(access.access_id, detailedUser.user_id, access.role_name, access.branch_name)}
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

        {/* Add New Access Form */}
        <div className="border-t pt-4">
          <Label className="text-muted-foreground text-sm font-medium mb-4 block">Add New Access</Label>
          <form id="access-form" onSubmit={handleAccessFormSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="access-branch">Branch *</Label>
                <Select 
                  value={accessFormData.branch_id.toString()} 
                  onValueChange={(value) => setAccessFormData(prev => ({ ...prev, branch_id: parseInt(value) }))}
                >
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
              <div>
                <Label htmlFor="access-role">Role *</Label>
                <Select 
                  value={accessFormData.role_id.toString()} 
                  onValueChange={(value) => setAccessFormData(prev => ({ ...prev, role_id: parseInt(value) }))}
                >
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
            </div>
            
            <div>
              <Label htmlFor="access-notes">Access Notes</Label>
              <Input
                id="access-notes"
                value={accessFormData.access_notes}
                onChange={(e) => setAccessFormData(prev => ({ ...prev, access_notes: e.target.value }))}
                placeholder="Optional notes about this access"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="access-is-default"
                  checked={accessFormData.is_default}
                  onCheckedChange={(checked) => setAccessFormData(prev => ({ ...prev, is_default: checked as boolean }))}
                />
                <Label htmlFor="access-is-default">Set as Default Access</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="access-is-active"
                  checked={accessFormData.is_active}
                  onCheckedChange={(checked) => setAccessFormData(prev => ({ ...prev, is_active: checked as boolean }))}
                />
                <Label htmlFor="access-is-active">Active</Label>
              </div>
            </div>
          </form>
        </div>
      </FormDialog>

      {/* Revoke Access from Access Dialog Confirmation */}
      <FormDialog
        open={showAccessRevokeDialog}
        onOpenChange={setShowAccessRevokeDialog}
        title="Revoke Access"
        description={`Are you sure you want to revoke ${accessToRevokeFromDialog?.roleName} access at ${accessToRevokeFromDialog?.branchName}? This action cannot be undone.`}
        size="MEDIUM"
        isLoading={revokeAccessMutation.isPending}
        onSave={confirmRevokeAccessFromDialog}
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
                  This will remove the user's {accessToRevokeFromDialog?.roleName} role at {accessToRevokeFromDialog?.branchName}.
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="access-revoke-notes">Reason for Revocation (Optional)</Label>
            <Input
              id="access-revoke-notes"
              value={accessRevokeNotes}
              onChange={(e) => setAccessRevokeNotes(e.target.value)}
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

