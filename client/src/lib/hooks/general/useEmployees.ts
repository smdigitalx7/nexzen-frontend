import { useQuery, useMutation } from "@tanstack/react-query";
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
  const { invalidateEntity } = useGlobalRefetch();

  return useMutationWithSuccessToast(
    {
      mutationFn: (data: EmployeeCreate) => EmployeesService.create(data),
      onSuccess: () => {
        invalidateEntity("employees");
      },
    },
    "Employee created successfully"
  );
};

export const useUpdateEmployee = () => {
  const { invalidateEntity } = useGlobalRefetch();

  return useMutationWithSuccessToast(
    {
      mutationFn: ({ id, payload }: { id: number; payload: EmployeeUpdate }) =>
        EmployeesService.update(id, payload),
      onSuccess: () => {
        invalidateEntity("employees");
      },
    },
    "Employee updated successfully"
  );
};

export const useDeleteEmployee = () => {
  const { invalidateEntity } = useGlobalRefetch();

  return useMutationWithSuccessToast(
    {
      mutationFn: (id: number) => EmployeesService.remove(id),
      onSuccess: () => {
        invalidateEntity("employees");
      },
    },
    "Employee deleted successfully"
  );
};

export const useUpdateEmployeeStatus = () => {
  const { invalidateEntity } = useGlobalRefetch();

  return useMutationWithSuccessToast(
    {
      mutationFn: ({ id, status }: { id: number; status: string }) =>
        EmployeesService.updateStatus(id, status),
      onSuccess: () => {
        invalidateEntity("employees");
      },
    },
    "Employee status updated successfully"
  );
};
