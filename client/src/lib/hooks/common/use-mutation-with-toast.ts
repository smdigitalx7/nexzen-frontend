import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

/**
 * Centralized mutation hook with automatic toast notifications
 * This replaces repetitive toast + error handling patterns across components
 */
export function useMutationWithToast<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  mutationOptions: UseMutationOptions<TData, TError, TVariables, TContext>
) {
  const { toast } = useToast();

  return useMutation<TData, TError, TVariables, TContext>({
    ...mutationOptions,
    onSuccess: (data: TData, variables: TVariables, onMutateResult: TContext | undefined, context: any) => {
      // Call the provided onSuccess callback if it exists
      mutationOptions.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error: TError, variables: TVariables, onMutateResult: TContext | undefined, context: any) => {
      // Show error toast
      const errorMessage = 
        (error as any)?.response?.data?.detail || 
        (error as any)?.message || 
        'An error occurred';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      // Call the provided onError callback if it exists
      mutationOptions.onError?.(error, variables, onMutateResult, context);
    },
  });
}

/**
 * Create mutation hook with automatic success toast
 */
export function useMutationWithSuccessToast<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  mutationOptions: UseMutationOptions<TData, TError, TVariables, TContext>,
  successMessage: string
) {
  const { toast } = useToast();

  return useMutation<TData, TError, TVariables, TContext>({
    ...mutationOptions,
    onSuccess: (data: TData, variables: TVariables, onMutateResult: TContext | undefined, context: any) => {
      // Show success toast
      toast({
        title: 'Success',
        description: successMessage,
      });

      // Call the provided onSuccess callback if it exists
      mutationOptions.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error: TError, variables: TVariables, onMutateResult: TContext | undefined, context: any) => {
      // Show error toast
      const errorMessage = 
        (error as any)?.response?.data?.detail || 
        (error as any)?.message || 
        'An error occurred';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      // Call the provided onError callback if it exists
      mutationOptions.onError?.(error, variables, onMutateResult, context);
    },
  });
}
