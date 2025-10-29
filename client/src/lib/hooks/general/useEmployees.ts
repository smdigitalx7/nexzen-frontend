import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EmployeesService } from "@/lib/services/general/employees.service";
import type {
  EmployeeRead,
  EmployeeCreate,
  EmployeeUpdate,
  EmployeeWithBranches,
  TeacherByBranch,
  EmployeeDashboardStats,
  RecentEmployee,
} from "@/lib/types/general/employees";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";
import { useGlobalRefetch } from "../common/useGlobalRefetch";

// Query keys
export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...employeeKeys.lists(), { filters }] as const,
  details: () => [...employeeKeys.all, "detail"] as const,
  detail: (id: number) => [...employeeKeys.details(), id] as const,
  dashboard: () => [...employeeKeys.all, "dashboard"] as const,
  recent: (limit?: number) =>
    [...employeeKeys.all, "recent", { limit }] as const,
  withBranches: () => [...employeeKeys.all, "with-branches"] as const,
  byBranch: () => [...employeeKeys.all, "by-branch"] as const,
  teachersByBranch: () => [...employeeKeys.all, "teachers-by-branch"] as const,
};

// Hooks for fetching data
export const useEmployeesByInstitute = () => {
  return useQuery({
    queryKey: employeeKeys.lists(),
    queryFn: () => EmployeesService.listByInstitute(),
  });
};

export const useEmployeesByBranch = () => {
  return useQuery({
    queryKey: employeeKeys.byBranch(),
    queryFn: () => EmployeesService.listByBranch(),
  });
};

export const useEmployeesWithBranches = () => {
  return useQuery({
    queryKey: employeeKeys.withBranches(),
    queryFn: () => EmployeesService.listWithBranches(),
  });
};

export const useTeachersByBranch = () => {
  return useQuery({
    queryKey: employeeKeys.teachersByBranch(),
    queryFn: () => EmployeesService.getTeachersByBranch(),
  });
};

export const useEmployee = (id: number) => {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => EmployeesService.getById(id),
    enabled: !!id,
  });
};

export const useEmployeeDashboard = () => {
  return useQuery({
    queryKey: employeeKeys.dashboard(),
    queryFn: () => EmployeesService.getDashboard(),
  });
};

export const useRecentEmployees = (limit: number = 5) => {
  return useQuery({
    queryKey: employeeKeys.recent(limit),
    queryFn: () => EmployeesService.getRecent(limit),
  });
};

// Mutation hooks
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  const { invalidateEntity } = useGlobalRefetch();

  return useMutationWithSuccessToast(
    {
      mutationFn: (data: EmployeeCreate) => EmployeesService.create(data),
      onSuccess: () => {
        // Specific invalidations for precise cache updates
        queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
        queryClient.invalidateQueries({ queryKey: employeeKeys.byBranch() });
        queryClient.invalidateQueries({ queryKey: employeeKeys.dashboard() });
        queryClient.invalidateQueries({ queryKey: employeeKeys.recent() });
        // Global entity invalidation for cross-module refetch
        invalidateEntity("employees");
      },
    },
    "Employee created successfully"
  );
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  const { invalidateEntity } = useGlobalRefetch();

  return useMutationWithSuccessToast(
    {
      mutationFn: ({ id, payload }: { id: number; payload: EmployeeUpdate }) =>
        EmployeesService.update(id, payload),
      onSuccess: (_, { id }) => {
        // Specific invalidations for precise cache updates
        queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
        queryClient.invalidateQueries({ queryKey: employeeKeys.byBranch() });
        queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
        queryClient.invalidateQueries({ queryKey: employeeKeys.dashboard() });
        // Global entity invalidation for cross-module refetch
        invalidateEntity("employees");
      },
    },
    "Employee updated successfully"
  );
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  const { invalidateEntity } = useGlobalRefetch();

  return useMutationWithSuccessToast(
    {
      mutationFn: (id: number) => EmployeesService.remove(id),
      onSuccess: () => {
        // Specific invalidations for precise cache updates
        queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
        queryClient.invalidateQueries({ queryKey: employeeKeys.byBranch() });
        queryClient.invalidateQueries({ queryKey: employeeKeys.dashboard() });
        // Global entity invalidation for cross-module refetch
        invalidateEntity("employees");
      },
    },
    "Employee deleted successfully"
  );
};

export const useUpdateEmployeeStatus = () => {
  const queryClient = useQueryClient();
  const { invalidateEntity } = useGlobalRefetch();

  return useMutationWithSuccessToast(
    {
      mutationFn: ({ id, status }: { id: number; status: string }) =>
        EmployeesService.updateStatus(id, status),
      onSuccess: (_, { id }) => {
        // Specific invalidations for precise cache updates
        queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
        queryClient.invalidateQueries({ queryKey: employeeKeys.byBranch() });
        queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
        queryClient.invalidateQueries({ queryKey: employeeKeys.dashboard() });
        // Global entity invalidation for cross-module refetch
        invalidateEntity("employees");
      },
    },
    "Employee status updated successfully"
  );
};
