import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { CacheUtils } from '@/lib/api';

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
      // Extract error message from various possible structures
      // Check both error.data (from our API layer) and error.response.data (from axios/fetch wrappers)
      const errorData = (error as any)?.data || (error as any)?.response?.data;
      const errorDetail = errorData?.detail;
      const errorMsg = (error as any)?.message;
      let errorMessage: string;
      
      // Handle case where detail is an object with a message property
      if (errorDetail && typeof errorDetail === 'object') {
        if ('message' in errorDetail && typeof errorDetail.message === 'string') {
          errorMessage = errorDetail.message;
          // Add additional context if available for "No records created" messages
          if (errorMessage.includes('No records created') || errorMessage.includes('already exist')) {
            // Add additional context if available
            const skippedCount = errorDetail.skipped_enrollment_ids?.length || 0;
            const totalRequested = errorDetail.total_requested || 0;
            if (skippedCount > 0 && totalRequested > 0) {
              errorMessage = `${errorMessage} (${skippedCount} out of ${totalRequested} enrollment${totalRequested !== 1 ? 's' : ''} already have attendance records for this month.)`;
            }
          }
        } else {
          // If detail is an object but no message, try to stringify it safely
          errorMessage = JSON.stringify(errorDetail);
        }
      } else if (typeof errorDetail === 'string') {
        errorMessage = errorDetail;
      } else if (errorData?.message && typeof errorData.message === 'string') {
        errorMessage = errorData.message;
      } else if (errorMsg && typeof errorMsg === 'string' && errorMsg !== '[object Object]') {
        // Use error.message only if it's a valid string and not the object string representation
        errorMessage = errorMsg;
      } else {
        errorMessage = 'An error occurred';
      }
      
      toast({
        title: errorMessage.includes('No records created') ? 'No Records Created' : 'Error',
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
      // CRITICAL: Clear ALL API cache on any mutation success
      // This ensures fresh data is fetched when queries are refetched
      // The API layer cache was preventing UI updates after mutations
      try {
        CacheUtils.clearAll();
      } catch (error) {
        console.warn('Failed to clear API cache on mutation success:', error);
      }

      // Show success toast
      toast({
        title: 'Success',
        description: successMessage,
        variant: 'success',
      });

      // Call the provided onSuccess callback if it exists
      mutationOptions.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error: TError, variables: TVariables, onMutateResult: TContext | undefined, context: any) => {
      // Extract error message from various possible structures
      // Check both error.data (from our API layer) and error.response.data (from axios/fetch wrappers)
      const errorData = (error as any)?.data || (error as any)?.response?.data;
      const errorDetail = errorData?.detail;
      const errorMsg = (error as any)?.message;
      let errorMessage: string;
      
      // Handle case where detail is an object with a message property
      if (errorDetail && typeof errorDetail === 'object') {
        if ('message' in errorDetail && typeof errorDetail.message === 'string') {
          errorMessage = errorDetail.message;
          // Add additional context if available for "No records created" messages
          if (errorMessage.includes('No records created') || errorMessage.includes('already exist')) {
            // Add additional context if available
            const skippedCount = errorDetail.skipped_enrollment_ids?.length || 0;
            const totalRequested = errorDetail.total_requested || 0;
            if (skippedCount > 0 && totalRequested > 0) {
              errorMessage = `${errorMessage} (${skippedCount} out of ${totalRequested} enrollment${totalRequested !== 1 ? 's' : ''} already have attendance records for this month.)`;
            }
          }
        } else {
          // If detail is an object but no message, try to stringify it safely
          errorMessage = JSON.stringify(errorDetail);
        }
      } else if (typeof errorDetail === 'string') {
        errorMessage = errorDetail;
      } else if (errorData?.message && typeof errorData.message === 'string') {
        errorMessage = errorData.message;
      } else if (errorMsg && typeof errorMsg === 'string' && errorMsg !== '[object Object]') {
        // Use error.message only if it's a valid string and not the object string representation
        errorMessage = errorMsg;
      } else {
        errorMessage = 'An error occurred';
      }
      
      toast({
        title: errorMessage.includes('No records created') ? 'No Records Created' : 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      // Call the provided onError callback if it exists
      mutationOptions.onError?.(error, variables, onMutateResult, context);
    },
  });
}
