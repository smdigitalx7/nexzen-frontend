import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EmployeesService } from "@/features/general/services/employees.service";
import type {
  EmployeeRead,
  EmployeeCreate,
  EmployeeUpdate,
  EmployeeWithBranches,
  TeacherByBranch,
  EmployeeDashboardStats,
  RecentEmployee,
  EmployeeMinimal,
  EmployeePaginatedResponse
} from "@/features/general/types/employees";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";
import { useGlobalRefetch } from "@/common/hooks/useGlobalRefetch";

// Query keys
export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>, page?: number, pageSize?: number) =>
    [...employeeKeys.lists(), { filters, page, pageSize }] as const,
  details: () => [...employeeKeys.all, "detail"] as const,
  detail: (id: number) => [...employeeKeys.details(), id] as const,
  dashboard: () => [...employeeKeys.all, "dashboard"] as const,
  recent: (limit?: number) =>
    [...employeeKeys.all, "recent", { limit }] as const,
  withBranches: () => [...employeeKeys.all, "with-branches"] as const,
  byBranch: (page?: number, pageSize?: number, search?: string) =>
    [...employeeKeys.all, "by-branch", { page, pageSize, search }] as const,
  teachersByBranch: () => [...employeeKeys.all, "teachers-by-branch"] as const,
  minimal: () => [...employeeKeys.all, "minimal"] as const,
  drivers: () => [...employeeKeys.all, "drivers"] as const,
};

// Hooks for fetching data
export const useEmployeesByInstitute = (page: number = 1, pageSize: number = 25, search?: string) => {
  return useQuery({
    queryKey: employeeKeys.list({}, page, pageSize),
    queryFn: () => EmployeesService.listByInstitute({ page, page_size: pageSize, search: search || undefined }),
  });
};

export const useEmployeesByBranch = (
  enabled: boolean = true,
  page: number = 1,
  pageSize: number = 25,
  search?: string
) => {
  return useQuery({
    queryKey: employeeKeys.byBranch(page, pageSize, search),
    queryFn: () =>
      EmployeesService.listByBranch({
        page,
        page_size: pageSize,
        search: search || undefined,
      }),
    enabled, // Allow conditional query execution to prevent unnecessary fetches
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEmployeesWithBranches = () => {
  return useQuery({
    queryKey: employeeKeys.withBranches(),
    queryFn: () => EmployeesService.listWithBranches(),
  });
};

export const useTeachersByBranch = (enabled: boolean = true) => {
  return useQuery({
    queryKey: employeeKeys.teachersByBranch(),
    queryFn: () => EmployeesService.getTeachersByBranch(),
    enabled, // ✅ OPTIMIZATION: Allow conditional query execution to prevent unnecessary fetches
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    select: (data: any) => Array.isArray(data) ? data : data.data || [],
  });
};

/**
 * Hook to get minimal employee list (only employee_id and employee_name)
 * Use this for dropdowns and lightweight employee selection
 * Only returns active employees, filtered by institute
 */
export const useEmployeesMinimal = (enabled: boolean = true) => {
  return useQuery({
    queryKey: employeeKeys.minimal(),
    queryFn: () => EmployeesService.listMinimal(),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - dropdowns don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useEmployee = (id: number) => {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => EmployeesService.getById(id),
    enabled: !!id,
  });
};

export const useEmployeeDashboard = (enabled: boolean = true) => {
  return useQuery({
    queryKey: employeeKeys.dashboard(),
    queryFn: () => EmployeesService.getDashboard(),
    enabled, // ✅ FIX: Only fetch when enabled (tab is active)
  });
};

export const useRecentEmployees = (limit: number = 5) => {
  return useQuery({
    queryKey: employeeKeys.recent(limit),
    queryFn: () => EmployeesService.getRecent(limit),
  });
};

export const useDrivers = (enabled: boolean = true) => {
  return useQuery({
    queryKey: employeeKeys.drivers(),
    queryFn: () => EmployeesService.listDrivers(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

// Mutation hooks
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutationWithSuccessToast(
    {
      mutationFn: (data: EmployeeCreate) => EmployeesService.create(data),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: employeeKeys.all });
        await queryClient.refetchQueries({ queryKey: employeeKeys.all, type: "active" });
      },
    },
    "Employee created successfully"
  );
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutationWithSuccessToast(
    {
      mutationFn: ({ id, payload }: { id: number; payload: EmployeeUpdate }) =>
        EmployeesService.update(id, payload),
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries({ queryKey: employeeKeys.all });
        if (variables?.id) {
          await queryClient.invalidateQueries({ queryKey: employeeKeys.detail(variables.id) });
        }
        await queryClient.refetchQueries({ queryKey: employeeKeys.all, type: "active" });
      },
    },
    "Employee updated successfully"
  );
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutationWithSuccessToast(
    {
      mutationFn: (id: number) => EmployeesService.remove(id),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: employeeKeys.all });
        await queryClient.refetchQueries({ queryKey: employeeKeys.all, type: "active" });
      },
    },
    "Employee deleted successfully"
  );
};

export const useUpdateEmployeeStatus = () => {
  const queryClient = useQueryClient();

  return useMutationWithSuccessToast(
    {
      mutationFn: ({ id, status }: { id: number; status: string }) =>
        EmployeesService.updateStatus(id, status),
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries({ queryKey: employeeKeys.all });
        if (variables?.id) {
          await queryClient.invalidateQueries({ queryKey: employeeKeys.detail(variables.id) });
        }
        await queryClient.refetchQueries({ queryKey: employeeKeys.all, type: "active" });
      },
    },
    "Employee status updated successfully"
  );
};
