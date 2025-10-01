import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Edit, Trash2, Search, Filter, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EnhancedDataTable } from '@/components/shared';
import { useToast } from '@/hooks/use-toast';
import { useAcademicYears, useCreateAcademicYear, useUpdateAcademicYear, useDeleteAcademicYear } from '@/lib/hooks/useAcademicYear';

// UI row shape for the table
type UIAcademicYearRow = {
  academic_year_id: number;
  year_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  created_by: number | null;
  updated_by: number | null;
};

const academicYearFormSchema = z.object({
  year_name: z.string().min(1, "Year name is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  is_active: z.boolean().optional(),
});

const AcademicYearManagement = () => {
  const { data: academicYears = [], isLoading: academicYearsLoading, error } = useAcademicYears();
  
  
  const createAcademicYearMutation = useCreateAcademicYear();
  const updateAcademicYearMutation = useUpdateAcademicYear();
  const deleteAcademicYearMutation = useDeleteAcademicYear();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAcademicYear, setEditingAcademicYear] = useState<any>(null);
  const [deletingAcademicYear, setDeletingAcademicYear] = useState<UIAcademicYearRow | null>(null);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(academicYearFormSchema),
    defaultValues: {
      year_name: '',
      start_date: '',
      end_date: '',
      is_active: false,
    },
  });

  // Filtered data based on search and filters
  const filteredData = useMemo(() => {
    return academicYears.filter((academicYear: UIAcademicYearRow) => {
      const matchesSearch = 
        academicYear.year_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || 
        (selectedStatus === 'active' && academicYear.is_active) ||
        (selectedStatus === 'inactive' && !academicYear.is_active);
      
      return matchesSearch && matchesStatus;
    });
  }, [academicYears, searchQuery, selectedStatus]);

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500' : 'bg-gray-500';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive';
  };

  const columns = [
    {
      accessorKey: 'year_name',
      header: 'Academic Year',
      cell: ({ row }: { row: { original: UIAcademicYearRow } }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-600" />
          <span className="font-medium">{row.original.year_name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'start_date',
      header: 'Start Date',
      cell: ({ row }: { row: { original: UIAcademicYearRow } }) => {
        const date = new Date(row.original.start_date);
        return (
          <span className="text-slate-600">
            {isNaN(date.getTime()) ? row.original.start_date : date.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      accessorKey: 'end_date',
      header: 'End Date',
      cell: ({ row }: { row: { original: UIAcademicYearRow } }) => {
        const date = new Date(row.original.end_date);
        return (
          <span className="text-slate-600">
            {isNaN(date.getTime()) ? row.original.end_date : date.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }: { row: { original: UIAcademicYearRow } }) => (
        <Badge 
          variant={row.original.is_active ? "default" : "secondary"}
          className={`${getStatusColor(row.original.is_active)} text-white`}
        >
          {getStatusText(row.original.is_active)}
        </Badge>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }: { row: { original: UIAcademicYearRow } }) => {
        const date = new Date(row.original.created_at);
        return (
          <span className="text-slate-500 text-sm">
            {isNaN(date.getTime()) ? row.original.created_at : date.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: { original: UIAcademicYearRow } }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row.original)}
            className="hover-elevate"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.original)}
            className="hover-elevate text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingAcademicYear(null);
    form.reset({
      year_name: '',
      start_date: '',
      end_date: '',
      is_active: false,
    });
    setShowAddDialog(true);
  };

  const handleEdit = (academicYear: UIAcademicYearRow) => {
    setEditingAcademicYear(academicYear);
    form.reset({
      year_name: academicYear.year_name,
      start_date: academicYear.start_date,
      end_date: academicYear.end_date,
      is_active: academicYear.is_active,
    });
    setShowAddDialog(true);
  };

  const handleDelete = (academicYear: UIAcademicYearRow) => {
    setDeletingAcademicYear(academicYear);
  };

  const confirmDelete = async () => {
    if (!deletingAcademicYear) return;
    
    try {
      await deleteAcademicYearMutation.mutateAsync(deletingAcademicYear.academic_year_id);
      setDeletingAcademicYear(null);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const onSubmit = async (values: any) => {
    try {
      if (editingAcademicYear) {
        await updateAcademicYearMutation.mutateAsync({
          id: editingAcademicYear.academic_year_id,
          data: values,
        });
      } else {
        await createAcademicYearMutation.mutateAsync(values);
      }
      setShowAddDialog(false);
      form.reset();
    } catch (error) {
      // Error handling is done in the mutation
    }
  };



  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Academic Years Management</h1>
              <p className="text-slate-600 mt-1">Manage academic years, terms, and academic calendar</p>
            </div>
            <div className="flex gap-3">
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button onClick={handleAdd} className="hover-elevate">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Academic Year
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingAcademicYear ? 'Edit Academic Year' : 'Add New Academic Year'}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="year_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Academic Year Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 2024-25" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="is_active"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Active Year</FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Mark this as the current active academic year
                              </div>
                            </div>
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowAddDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                          {form.formState.isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search academic years..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Data Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {academicYearsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-slate-600">Loading academic years...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="text-red-600 mb-2">❌ Error loading academic years</div>
                  <p className="text-sm text-slate-600">Check console for details</p>
                  <pre className="text-xs text-slate-500 mt-2 max-w-md overflow-auto">{JSON.stringify(error, null, 2)}</pre>
                </div>
              </div>
            ) : academicYears.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="text-slate-500 mb-2">📅 No academic years found</div>
                  <p className="text-sm text-slate-600">Create your first academic year to get started</p>
                </div>
              </div>
            ) : (
              <EnhancedDataTable
                data={filteredData}
                columns={columns as any}
                exportable={true}
                title="Academic Years"
              />
            )}
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingAcademicYear} onOpenChange={() => setDeletingAcademicYear(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Delete Academic Year
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingAcademicYear?.year_name}</strong>? 
              This action cannot be undone and may affect related data such as:
              <ul className="mt-2 ml-4 list-disc text-sm">
                <li>Student enrollments for this academic year</li>
                <li>Class assignments and schedules</li>
                <li>Exam and test records</li>
                <li>Fee structures and payments</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingAcademicYear(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteAcademicYearMutation.isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteAcademicYearMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Academic Year
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AcademicYearManagement;
