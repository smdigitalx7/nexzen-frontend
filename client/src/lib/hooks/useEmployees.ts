import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ServiceLocator } from "@/core";
import { QUERY_STALE_TIME } from "@/lib/constants/query";
import type { EmployeeRead, EmployeeCreate, EmployeeUpdate } from "@/lib/types/employees";
import { useToast } from "@/hooks/use-toast";
import { CreateEmployeeRequest, UpdateEmployeeRequest } from "@/core/application/dto/EmployeeDto";
import { EmployeeStatus } from "@/core/domain/entities/Employee";
import { useAuthStore } from "@/store/authStore";

const keys = {
  institute: ["employees", "institute"] as const,
  branch: ["employees", "branch"] as const,
  detail: (id: number) => ["employees", id] as const,
};

export function useEmployeesByInstitute() {
  return useQuery<EmployeeRead[]>({ 
    queryKey: keys.institute, 
    queryFn: async () => {
      console.log('🔍 useEmployeesByInstitute: Starting to fetch employees...');
      
      // Check authentication state
      const authState = useAuthStore.getState();
      console.log('🔍 useEmployeesByInstitute: Auth state:', {
        isAuthenticated: authState.isAuthenticated,
        hasToken: !!authState.token,
        userRole: authState.user?.role,
        userId: authState.user?.user_id
      });
      
      try {
        console.log('🔍 useEmployeesByInstitute: Getting ServiceLocator...');
        const employeeUseCases = ServiceLocator.getEmployeeUseCases();
        console.log('🔍 useEmployeesByInstitute: Got employee use cases:', !!employeeUseCases);
        
        const employees = await employeeUseCases.getAllEmployees();
        console.log('🔍 useEmployeesByInstitute: Got employees:', employees.length, 'employees');
        
        // Convert clean architecture entities to backend format
        const mappedEmployees = employees.map(employee => ({
          employee_id: employee.id,
          institute_id: 1, // Default value
          employee_name: employee.fullName,
          employee_type: 'FULL_TIME', // Default value
          employee_code: employee.employeeId,
          aadhar_no: null, // Not available in Employee entity
          mobile_no: employee.phoneNumber || null,
          email: employee.email,
          address: null, // Not available in Employee entity
          date_of_joining: employee.hireDate, // Already in correct format
          designation: employee.position,
          qualification: null, // Not available in Employee entity
          experience_years: null, // Not available in Employee entity
          status: employee.status,
          salary: employee.salary,
          created_at: employee.createdAt,
          updated_at: employee.updatedAt,
          created_by: null, // Not available in Employee entity
          updated_by: null, // Not available in Employee entity
        }));
        
        console.log('🔍 useEmployeesByInstitute: Mapped employees:', mappedEmployees.length, 'employees');
        return mappedEmployees;
        
      } catch (error) {
        console.error('❌ useEmployeesByInstitute: Error fetching employees:', error);
        throw error;
      }
    },
    staleTime: QUERY_STALE_TIME, // 5 minutes
  });
}

export function useEmployeesByBranch() {
  const { currentBranch } = useAuthStore();
  return useQuery<EmployeeRead[]>({ 
    queryKey: [...keys.branch, currentBranch?.branch_id ?? 'unknown'], 
    queryFn: async () => {
      console.log('🔍 useEmployeesByBranch: Starting to fetch employees for branch:', currentBranch?.branch_id);
      const employeeUseCases = ServiceLocator.getEmployeeUseCases();
      const employees = await employeeUseCases.getAllEmployees();
      console.log('🔍 useEmployeesByBranch: Got employees:', employees.length, 'employees');
      
      // Convert EmployeeResponse to EmployeeRead format
      console.log('🔍 useEmployeesByBranch: Converting EmployeeResponse to EmployeeRead format');
      return employees.map(employee => ({
        employee_id: employee.id,
        institute_id: 1, // Default value
        employee_name: employee.fullName,
        employee_type: 'FULL_TIME', // Default value
        employee_code: employee.employeeId,
        aadhar_no: null, // Not available in EmployeeResponse
        mobile_no: employee.phoneNumber || null,
        email: employee.email,
        address: null, // Not available in EmployeeResponse
        date_of_joining: employee.hireDate, // Already in correct format
        designation: employee.position,
        qualification: null, // Not available in EmployeeResponse
        experience_years: null, // Not available in EmployeeResponse
        status: employee.status,
        salary: employee.salary,
        created_at: employee.createdAt,
        updated_at: employee.updatedAt,
        created_by: null, // Not available in EmployeeResponse
        updated_by: null, // Not available in EmployeeResponse
      }));
    },
    enabled: !!currentBranch?.branch_id,
    staleTime: 1000 * 60 * 1,
  });
}

export function useEmployee(id: number) {
  return useQuery<EmployeeRead>({ 
    queryKey: keys.detail(id), 
    queryFn: async () => {
      const employeeUseCases = ServiceLocator.getEmployeeUseCases();
      const employee = await employeeUseCases.getEmployeeById(id);
      
      // Convert clean architecture entity to backend format
      return {
        employee_id: employee.id,
        institute_id: 1, // Default value
        employee_name: employee.fullName,
        employee_type: 'FULL_TIME', // Default value
        employee_code: employee.employeeId,
        aadhar_no: null, // Not available in Employee entity
        mobile_no: employee.phoneNumber || null,
        email: employee.email,
        address: null, // Not available in Employee entity
        date_of_joining: employee.hireDate, // Already in correct format
        designation: employee.position,
        qualification: null, // Not available in Employee entity
        experience_years: null, // Not available in Employee entity
        status: employee.status,
        salary: employee.salary,
        created_at: employee.createdAt,
        updated_at: employee.updatedAt,
        created_by: null, // Not available in Employee entity
        updated_by: null, // Not available in Employee entity
      };
    },
    enabled: Number.isFinite(id) && id > 0,
    staleTime: QUERY_STALE_TIME, // 5 minutes
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (payload: EmployeeCreate) => {
      const employeeUseCases = ServiceLocator.getEmployeeUseCases();
      const employee = await employeeUseCases.createEmployee({
        employeeId: payload.employee_code,
        fullName: payload.employee_name,
        department: 'General', // Default value
        position: payload.designation || 'Employee',
        email: payload.email || '',
        phoneNumber: payload.mobile_no || '',
        salary: payload.salary || 0,
      });
      return employee;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.institute });
      qc.invalidateQueries({ queryKey: keys.branch });
      toast({
        title: "Success",
        description: "Employee created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create employee.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: EmployeeUpdate }) => {
      const employeeUseCases = ServiceLocator.getEmployeeUseCases();
      const employee = await employeeUseCases.updateEmployee(id, {
        fullName: payload.employee_name,
        department: 'General', // Default value
        position: payload.designation || 'Employee',
        email: payload.email || '',
        phoneNumber: payload.mobile_no || '',
        salary: payload.salary || 0,
        status: payload.status as any,
      });
      return employee;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: keys.institute });
      qc.invalidateQueries({ queryKey: keys.branch });
      qc.invalidateQueries({ queryKey: keys.detail(id) });
      toast({
        title: "Success",
        description: "Employee updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update employee.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const employeeUseCases = ServiceLocator.getEmployeeUseCases();
      await employeeUseCases.deleteEmployee(id);
      
      // Return mock response for compatibility
      return {
        employee_id: id,
        institute_id: 1,
        employee_name: 'Deleted Employee',
        employee_type: 'DELETED',
        employee_code: 'DELETED',
        aadhar_no: null,
        mobile_no: null,
        email: null,
        address: null,
        joining_date: new Date().toISOString(),
        status: 'DELETED',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: null,
        updated_by: null,
      };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.institute });
      qc.invalidateQueries({ queryKey: keys.branch });
      toast({
        title: "Success",
        description: "Employee deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete employee.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateEmployeeStatus() {
  const qc = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const employeeUseCases = ServiceLocator.getEmployeeUseCases();
      const employee = await employeeUseCases.updateEmployeeStatus(id, status as any);
      return employee;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: keys.institute });
      qc.invalidateQueries({ queryKey: keys.branch });
      qc.invalidateQueries({ queryKey: keys.detail(id) });
      toast({
        title: "Success",
        description: "Employee status updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update employee status.",
        variant: "destructive",
      });
    },
  });
}


