import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ColumnDef } from '@tanstack/react-table';
import { Trash2, Shield, ShieldX, Eye, Edit, Copy, RefreshCw, EyeOff, User, Mail, Phone, Building, Key, CheckCircle2, Power } from 'lucide-react';
import { cn } from '@/common/utils';
import { Badge } from '@/common/components/ui/badge';
import { Avatar, AvatarFallback } from '@/common/components/ui/avatar';
import { Button } from '@/common/components/ui/button';
import { FormDialog, ConfirmDialog, FormSheet } from '@/common/components/shared';
import { FilterState } from '@/common/components/shared/DataTable/types';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/common/components/ui/select';
import { Checkbox } from '@/common/components/ui/checkbox';
import { Switch } from '@/common/components/ui/switch';
import { CircleOff } from 'lucide-react';
import { Card, CardContent } from '@/common/components/ui/card';
import { DataTable } from '@/common/components/shared/DataTable';
import { useToast } from '@/common/hooks/use-toast';
import {
  createAvatarColumn,
  createTextColumn,
  createBadgeColumn,
  createDateColumn
} from "@/common/utils/factory/columnFactories";
import { useUsersWithRolesAndBranches, useCreateUser, useUpdateUser, useDeleteUser, useUserDashboard, useRevokeUserAccess, useCreateUserAccess, useUser, useUpdateUserStatus } from '@/features/general/hooks/useUsers';
import { useRoles } from '@/features/general/hooks/useRoles';
import { useBranches } from '@/features/general/hooks/useBranches';
import { UserWithRolesAndBranches, UserCreate, UserUpdate, BranchRoleAssignment, UserWithAccesses } from '@/features/general/types/users';
import { BranchRead } from '@/features/general/types/branches';
import { UserStatsCards } from './UserStatsCards';

const UserManagement = () => {
  // Component state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | null>(null);

  // API hooks - Now using clean architecture directly
  const { data: paginatedUsers, isLoading, error } = useUsersWithRolesAndBranches({
    page,
    page_size: pageSize,
    is_active: isActiveFilter
  });

  const users = useMemo(() => paginatedUsers?.data || [], [paginatedUsers]);
  const totalCount = paginatedUsers?.total_count || 0;

  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: branches = [], isLoading: branchesLoading } = useBranches();
  const { data: dashboardStats, isLoading: dashboardLoading } = useUserDashboard();
  const branchesArray = branches;
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const updateUserStatusMutation = useUpdateUserStatus();
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Generate a password based on name and mobile number
  const generatePassword = () => {
    if (!formData.full_name) {
      toast({
        title: "Name Required",
        description: "Please enter a full name first to generate a password.",
        variant: "destructive",
      });
      return;
    }

    const namePart = formData.full_name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
    const phonePart = formData.mobile_no ? formData.mobile_no.slice(-4) : Math.floor(1000 + Math.random() * 9000).toString();
    const specialChars = "!@#$";
    const randomChar = specialChars[Math.floor(Math.random() * specialChars.length)];
    
    // Capitalize first letter of namePart for better complexity
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const generated = `${formattedName}${randomChar}${phonePart}`;
    
    handleFormChange('password', generated);
    handleFormChange('confirm_password', generated);
    
    toast({
      title: "Password Generated",
      description: "A password has been generated based on the user's details.",
      variant: "success",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Password copied to clipboard.",
      variant: "success",
    });
  };


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
            variant: "success",
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
          variant: "success",
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
            variant: "success",
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
            variant: "success",
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
            variant: "success",
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


  const handleToggleStatus = (user: UserWithRolesAndBranches, is_active: boolean) => {
    updateUserStatusMutation.mutate({ 
      id: user.user_id, 
      is_active
    }, {
      onSuccess: () => {
        toast({
          title: "Status Updated",
          description: `${user.full_name} is now ${is_active ? 'active' : 'inactive'}.`,
          variant: "success",
        });
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.error?.message || error?.message || 'An error occurred while updating status.';
        toast({
          title: "Update Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    });
  };

  const columns: ColumnDef<UserWithRolesAndBranches>[] = useMemo(() => ([
    createAvatarColumn<UserWithRolesAndBranches>('full_name', 'email', { header: 'Full Name' }),
    createTextColumn<UserWithRolesAndBranches>('email', { header: 'Email' }),
    createTextColumn<UserWithRolesAndBranches>('mobile_no', { header: 'Mobile', fallback: 'N/A' }),
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge 
          variant={row.original.is_active ? "success" : "secondary"} 
          className={cn(
            "text-[10px] font-bold min-w-[70px] justify-center py-1 rounded-full border-none shadow-none",
            row.original.is_active 
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" 
              : "bg-slate-100 text-slate-600 hover:bg-slate-100"
          )}
        >
          {row.original.is_active ? "ACTIVE" : "INACTIVE"}
        </Badge>
      )
    },
    createDateColumn<UserWithRolesAndBranches>('created_at', { header: 'Created' })
  ]), [handleToggleStatus]);

  // ✅ MIGRATED: Use DataTable V2 actions format
  const actions = useMemo(() => [
    { 
      id: 'view', 
      label: 'View', 
      icon: Eye, 
      onClick: (row: UserWithRolesAndBranches) => { setSelectedUser(row); setShowDetail(true); }
    },
    { 
      id: 'edit', 
      label: 'Edit', 
      icon: Edit, 
      onClick: (row: UserWithRolesAndBranches) => handleEditUser(row)
    },
    { 
      id: 'status', 
      label: (row: UserWithRolesAndBranches) => row.is_active ? 'Deactivate' : 'Activate', 
      icon: Power, 
      className: (row: UserWithRolesAndBranches) => row.is_active ? 'text-red-500 hover:text-red-600' : 'text-emerald-500 hover:text-emerald-600',
      onClick: (row: UserWithRolesAndBranches) => handleToggleStatus(row, !row.is_active)
    },
    { 
      id: 'access', 
      label: 'Access', 
      icon: Shield, 
      variant: 'outline' as const,
      onClick: (row: UserWithRolesAndBranches) => handleAddAccess(row)
    },
    { 
      id: 'delete', 
      label: 'Delete', 
      icon: Trash2, 
      variant: 'destructive' as const,
      onClick: (row: UserWithRolesAndBranches) => handleDeleteUser(row)
    }
  ], [handleEditUser, handleDeleteUser]);

  // Use dashboard stats if available, otherwise fallback to calculated stats
  const displayStats = useMemo(() => dashboardStats || {
    total_users: users.length,
    active_users: users.filter(u => u.is_active).length,
    inactive_users: users.filter(u => !u.is_active).length,
    institute_admins: users.filter(u => u.is_institute_admin).length,
    regular_users: users.filter(u => !u.is_institute_admin).length,
    users_created_this_month: 0,
    users_created_this_year: 0,
  }, [dashboardStats, users]);

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
        <DataTable
          data={users}
          columns={columns}
          title="Users"
          loading={isLoading}
          pagination="server"
          totalCount={totalCount}
          currentPage={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          searchKey="full_name"
          searchPlaceholder="Search users by name..."
          actions={actions}
          onAdd={handleAddUser}
          addButtonText="Add User"
          export={{ enabled: true, filename: 'users' }}
          filters={[
            {
              key: 'is_active',
              label: 'Status',
              type: 'select',
              options: [
                { label: 'All', value: 'null' },
                { label: 'Active', value: 'true' },
                { label: 'Inactive', value: 'false' },
              ],
            },
          ]}
          onFilterChange={(filters: FilterState) => {
            const status = filters.is_active;
            if (status === 'true') setIsActiveFilter(true);
            else if (status === 'false') setIsActiveFilter(false);
            else setIsActiveFilter(null);
            setPage(1); // Reset to first page on filter change
          }}
        />
      )}

      {/* Add/Edit User Form Sheet */}
      <FormSheet
        open={showUserForm}
        onOpenChange={setShowUserForm}
        title={isEditing ? "Edit User" : "Add New User"}
        description={isEditing ? "Update user information" : "Create a new user account for your institute"}
        size="large"
        isLoading={createUserMutation.isPending || updateUserMutation.isPending}
        onSave={handleSave}
        saveText={isEditing ? "Update User" : "Add User"}
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
        <form id="user-form" onSubmit={handleFormSubmit} className="space-y-6">
            {/* Section 1: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
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
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    placeholder="example@mail.com"
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="mobile_no">Mobile Number</Label>
                  <Input
                    id="mobile_no"
                    value={formData.mobile_no || ""}
                    onChange={(e) => handleFormChange('mobile_no', e.target.value)}
                    placeholder="10-digit mobile number"
                    data-testid="input-mobile"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Exclude country code (e.g., 9876543210).
                  </p>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleFormChange('is_active', checked as boolean)}
                  />
                  <Label htmlFor="is_active" className="text-sm font-medium">Active Account</Label>
                </div>
              </div>
            </div>
            
            {/* Section 2: Roles & Permissions */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Roles & Permissions</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="role">Primary Role *</Label>
                  <Select 
                    value={selectedRole ? selectedRole.toString() : ""} 
                    onValueChange={(value) => setSelectedRole(value ? parseInt(value) : null)}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {rolesLoading ? (
                        <SelectItem value="loading" disabled>Loading roles...</SelectItem>
                      ) : (
                        roles
                          .filter(role => role.role_name !== 'INSTITUTE_ADMIN')
                          .map((role) => (
                            <SelectItem key={role.role_id} value={role.role_id.toString()}>
                              {role.role_name}
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="branch">Base Branch *</Label>
                  <Select 
                    value={selectedBranch ? selectedBranch.toString() : ""} 
                    onValueChange={(value) => setSelectedBranch(value ? parseInt(value) : null)}
                  >
                    <SelectTrigger id="branch">
                      <SelectValue placeholder="Select a branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branchesLoading ? (
                        <SelectItem value="loading" disabled>Loading branches...</SelectItem>
                      ) : (
                        branchesArray.map((branch: BranchRead) => (
                          <SelectItem key={branch.branch_id} value={branch.branch_id.toString()}>
                            {branch.branch_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="user_access_notes">Internal Notes (Optional)</Label>
                <Input
                  id="user_access_notes"
                  value={accessNotes}
                  onChange={(e) => setAccessNotes(e.target.value)}
                  placeholder="Additional context about this user assignment"
                  data-testid="input-access-notes"
                />
              </div>
            </div>
            
            {/* Section 3: Security */}
            {!isEditing && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-sm font-semibold text-gray-900">Security Credentials</h3>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={generatePassword}
                    className="h-auto p-0 text-blue-600 hover:text-blue-700 font-bold text-xs border-transparent shadow-none hover:bg-transparent"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Generate Password
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 relative">
                    <Label htmlFor="password">Login Password *</Label>
                    <div className="relative group">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleFormChange('password', e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={8}
                        className="pr-20"
                        data-testid="input-password"
                      />
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:bg-transparent"
                          onClick={() => copyToClipboard(formData.password)}
                          disabled={!formData.password}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirm_password">Confirm Password *</Label>
                    <div className="relative">
                      <Input
                        id="confirm_password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirm_password}
                        onChange={(e) => handleFormChange('confirm_password', e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={8}
                        className={`w-full pr-10 ${
                          passwordsMatch === false ? 'border-red-500' : 
                          passwordsMatch === true ? 'border-green-500' : ''
                        }`}
                        data-testid="input-confirm-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordsMatch === false && (
                      <p className="text-[10px] text-red-600 font-medium mt-1">Passwords do not match</p>
                    )}
                  </div>
                </div>
              </div>
            )}
        </form>

      </FormSheet>

      {/* User Detail Sheet */}
      <FormSheet
        open={showDetail}
        onOpenChange={setShowDetail}
        title="User Profile"
        description="Detailed account information and branch accesses"
        size="large"
        showFooter={false}
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-neutral-50 p-4 rounded-xl border border-neutral-100">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 ring-4 ring-white shadow-sm">
                  <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                    {selectedUser.full_name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-neutral-900">{selectedUser.full_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    {selectedUser.email}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-3 bg-white p-2 rounded-lg border shadow-sm">
                  <span className="text-xs font-semibold text-neutral-500">Status</span>
                  <Switch 
                    checked={selectedUser.is_active}
                    onCheckedChange={(checked) => handleToggleStatus(selectedUser, checked)}
                    disabled={updateUserMutation.isPending}
                  />
                </div>
                <Badge variant={selectedUser.is_active ? "success" : "secondary" as any} className="text-[10px] font-bold">
                  {selectedUser.is_active ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 p-1">
              <div className="space-y-1.5 p-3 rounded-lg border bg-white/50">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <Label className="font-medium text-xs">Mobile Number</Label>
                </div>
                <p className="font-semibold text-sm pl-6">{selectedUser.mobile_no || 'N/A'}</p>
              </div>
              <div className="space-y-1.5 p-3 rounded-lg border bg-white/50">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <Label className="font-medium text-xs">Created On</Label>
                </div>
                <p className="font-semibold text-sm pl-6">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            
            {detailedUser && ('accesses' in detailedUser && detailedUser.accesses && detailedUser.accesses.length > 0) && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Branch Accesses</h4>
                  <Badge variant="outline" className="bg-neutral-50">{detailedUser.accesses.length} Units</Badge>
                </div>
                <div className="grid gap-3">
                  {detailedUser.accesses.map((access, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-100 shadow-sm hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center">
                          <Building className="h-5 w-5 text-neutral-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-neutral-900">{access.branch_name}</p>
                          <p className="text-xs font-semibold text-primary uppercase mt-0.5">{access.role_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {access.is_default && (
                          <Badge className="text-[9px] bg-neutral-900 hover:bg-neutral-800 text-white font-bold border-none">
                            PRIMARY
                          </Badge>
                        )}
                        <Badge variant={access.is_active ? "success" : "outline"} className="text-[9px] font-bold">
                          {access.is_active ? 'ACTIVE' : 'LOCKED'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isEditing && (
              <div className="pt-4 mt-auto">
                <Button 
                  variant="outline" 
                  className="w-full justify-center gap-2 font-bold"
                  onClick={() => {
                    setShowDetail(false);
                    handleEditUser(selectedUser);
                  }}
                >
                  <Edit className="h-4 w-4" />
                  Modify User Credentials
                </Button>
              </div>
            )}
          </div>
        )}
      </FormSheet>

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


      {/* Branch Access Management Sheet */}
      <FormSheet
        open={showAccessDialog}
        onOpenChange={setShowAccessDialog}
        title="Branch Access Management"
        description={`Configure permissions for ${selectedUser?.full_name}`}
        size="large"
        isLoading={createAccessMutation.isPending}
        onSave={() => {
          const form = document.getElementById('access-form') as HTMLFormElement;
          if (form) {
            form.requestSubmit();
          }
        }}
        saveText={createAccessMutation.isPending ? "Assigning..." : "Assign Access"}
        cancelText="Close"
      >
        {formError && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md mb-4 border border-red-100">
            {formError}
          </div>
        )}
        
        {/* Existing Access Permissions */}
        {detailedUser && ('accesses' in detailedUser && detailedUser.accesses && detailedUser.accesses.length > 0) && (
          <div className="mb-6 space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Current Portfolios</Label>
            <div className="space-y-1">
              {detailedUser.accesses.map((access, index) => (
                <div key={access.access_id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{access.role_name}</span>
                      {access.is_default && (
                        <Badge className="text-[9px] h-3.5 bg-neutral-600">PRIMARY</Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{access.branch_name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeAccessFromDialog(
                      access.access_id, 
                      detailedUser.user_id, 
                      access.role_name, 
                      access.branch_name
                    )}
                    className="text-red-500 hover:text-red-700 hover:bg-transparent h-8 p-0"
                    disabled={revokeAccessMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <form id="access-form" onSubmit={handleAccessFormSubmit} className="space-y-4 pt-4 border-t">
          <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Assign New Authority</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="access-branch">Target Branch *</Label>
              <Select 
                value={accessFormData.branch_id > 0 ? accessFormData.branch_id.toString() : ""} 
                onValueChange={(value) => setAccessFormData(prev => ({ ...prev, branch_id: value ? parseInt(value) : 0 }))}
              >
                <SelectTrigger id="access-branch">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branchesLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    branchesArray.map((branch: BranchRead) => (
                      <SelectItem key={branch.branch_id} value={branch.branch_id.toString()}>
                        {branch.branch_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="access-role">Authority Role *</Label>
              <Select 
                value={accessFormData.role_id > 0 ? accessFormData.role_id.toString() : ""} 
                onValueChange={(value) => setAccessFormData(prev => ({ ...prev, role_id: value ? parseInt(value) : 0 }))}
              >
                <SelectTrigger id="access-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {rolesLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    roles
                      .filter(role => role.role_name !== 'INSTITUTE_ADMIN')
                      .map((role) => (
                        <SelectItem key={role.role_id} value={role.role_id.toString()}>
                          {role.role_name}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="access-notes">Assignment Notes</Label>
            <Input
              id="access-notes"
              value={accessFormData.access_notes}
              onChange={(e) => setAccessFormData(prev => ({ ...prev, access_notes: e.target.value }))}
              placeholder="Justification or context"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="access-is-default"
                checked={accessFormData.is_default}
                onCheckedChange={(checked) => setAccessFormData(prev => ({ ...prev, is_default: checked as boolean }))}
              />
              <Label htmlFor="access-is-default" className="text-xs">Set as Primary Access</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="access-is-active"
                checked={accessFormData.is_active}
                onCheckedChange={(checked) => setAccessFormData(prev => ({ ...prev, is_active: checked as boolean }))}
              />
              <Label htmlFor="access-is-active" className="text-xs">Instant Activation</Label>
            </div>
          </div>
        </form>
      </FormSheet>

      {/* Revoke Access from Access Dialog Confirmation */}
      <FormDialog
        open={showAccessRevokeDialog}
        onOpenChange={setShowAccessRevokeDialog}
        title="Revoke Access"
        description={`Are you sure you want to revoke ${accessToRevokeFromDialog?.roleName} access at ${accessToRevokeFromDialog?.branchName}?`}
        size="SMALL"
        overlayClassName="bg-black/60 backdrop-blur-[6px]"
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

