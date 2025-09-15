import { EnhancedDataTable } from '../EnhancedDataTable';
import { Badge } from '@/components/ui/badge';

const sampleData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Teacher', status: 'Active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Student', status: 'Inactive' },
];

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email', 
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }: any) => (
      <Badge variant="secondary">{row.original.role}</Badge>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: any) => (
      <Badge variant={row.original.status === 'Active' ? 'default' : 'secondary'}>
        {row.original.status}
      </Badge>
    ),
  },
];

export default function EnhancedDataTableExample() {
  return (
    <EnhancedDataTable
      data={sampleData}
      columns={columns}
      title="Sample Data Table"
      searchKey="name"
      exportable={true}
      selectable={true}
    />
  );
}