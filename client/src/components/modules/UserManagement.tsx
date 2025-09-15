import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit, Trash2, Eye, MoreHorizontal, Shield, ShieldCheck, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedDataTable } from '@/components/EnhancedDataTable';

// Mock user data - TODO: remove mock functionality
const mockUsers = [
  {
    user_id: '1',
    full_name: 'Sarah Johnson',
    email: 'sarah@nexzen.edu',
    mobile_no: '+1234567890',
    role: 'institute_admin',
    is_active: true,
    created_at: '2024-01-15',
    branch_access: ['Nexzen School', 'Velocity College']
  },
  {
    user_id: '2', 
    full_name: 'Michael Chen',
    email: 'michael@nexzen.edu',
    mobile_no: '+1234567891',
    role: 'academic',
    is_active: true,
    created_at: '2024-02-01',
    branch_access: ['Nexzen School']
  },
  {
    user_id: '3',
    full_name: 'Emily Rodriguez', 
    email: 'emily@nexzen.edu',
    mobile_no: '+1234567892',
    role: 'accountant',
    is_active: true,
    created_at: '2024-02-15',
    branch_access: ['Nexzen School', 'Velocity College']
  },
  {
    user_id: '4',
    full_name: 'David Thompson',
    email: 'david@nexzen.edu', 
    mobile_no: '+1234567893',
    role: 'academic',
    is_active: false,
    created_at: '2024-01-30',
    branch_access: ['Velocity College']
  }
];

const UserManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'institute_admin': return <ShieldCheck className="h-4 w-4 text-red-600" />;
      case 'academic': return <Shield className="h-4 w-4 text-green-600" />;
      case 'accountant': return <ShieldX className="h-4 w-4 text-blue-600" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'institute_admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'academic': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'accountant': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const truncateText = (text: string, maxLength: number = 20) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditingUser(true);
    console.log('Editing user:', user.full_name);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.user_id !== userId));
    console.log('User deleted:', userId);
  };

  const handleAddUser = () => {
    setIsAddingUser(true);
    console.log('Adding new user');
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'full_name',
      header: 'Full Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {row.original.full_name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="font-medium" title={row.original.full_name}>
              {truncateText(row.original.full_name)}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span title={row.original.email}>
          {truncateText(row.original.email, 25)}
        </span>
      ),
    },
    {
      accessorKey: 'mobile_no',
      header: 'Mobile',
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <Badge className={getRoleColor(row.original.role)}>
          <div className="flex items-center gap-1">
            {getRoleIcon(row.original.role)}
            {row.original.role.replace('institute_', '').replace('_', ' ')}
          </div>
        </Badge>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
          <div className={`w-2 h-2 rounded-full mr-2 ${row.original.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
          {row.original.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover-elevate">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => console.log('View user:', row.original.user_id)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditUser(row.original)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDeleteUser(row.original.user_id)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

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
        <Button onClick={handleAddUser} className="hover-elevate" data-testid="button-add-user">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Users Table */}
      <EnhancedDataTable
        data={users}
        columns={columns}
        title="Users"
        searchKey="full_name"
        exportable={true}
        selectable={true}
      />

      {/* Add User Dialog */}
      <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account for your institute
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" placeholder="Enter full name" data-testid="input-full-name" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter email" data-testid="input-email" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input id="mobile" placeholder="Enter mobile number" data-testid="input-mobile" />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select>
                  <SelectTrigger data-testid="select-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="institute_admin">Institute Admin</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="accountant">Accountant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingUser(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setIsAddingUser(false);
                console.log('User added successfully');
              }}>
                Add User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default UserManagement;