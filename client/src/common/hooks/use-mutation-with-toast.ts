import { useMutation, type MutationFunctionContext, type UseMutationOptions } from '@tanstack/react-query';
import { useToast } from '@/common/hooks/use-toast';
import type { ApiErrorResponse } from '@/common/types/api';
import { isApiErrorResponse } from '@/common/types/api';

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
    onSuccess: (
      data: TData,
      variables: TVariables,
      onMutateResult: TContext | undefined,
      context: MutationFunctionContext
    ) => {
      // Call the provided onSuccess callback if it exists
      mutationOptions.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (
      error: TError,
      variables: TVariables,
      onMutateResult: TContext | undefined,
      context: MutationFunctionContext
    ) => {
      // ✅ FIX: Properly type error handling
      // Extract error message from various possible structures
      const errorObj = error as Error & { data?: unknown; response?: { data?: unknown }; message?: string };
      const errorData = errorObj?.data || errorObj?.response?.data;
      const errorMsg = errorObj?.message;
      
      // Check if errorData is an ApiErrorResponse
      let errorDetail: ApiErrorResponse['detail'] | undefined;
      if (isApiErrorResponse(errorData)) {
        errorDetail = errorData.detail;
      } else if (errorData && typeof errorData === 'object' && 'detail' in errorData) {
        errorDetail = (errorData as { detail: unknown }).detail as ApiErrorResponse['detail'];
      }
      let errorMessage: string;
      
      // ✅ FIX: Check for nested error.message structure (backend format: { error: { message: "..." } })
      const errorDataObj = errorData && typeof errorData === 'object' ? errorData as Record<string, unknown> : null;
      const nestedError = errorDataObj?.error && typeof errorDataObj.error === 'object' 
        ? errorDataObj.error as Record<string, unknown> 
        : null;
      
      // Priority order for error message extraction:
      // 1. errorData.error.message (nested error object)
      if (nestedError && typeof nestedError.message === 'string') {
        errorMessage = nestedError.message;
      }
      // 2. Handle case where detail is an object with a message property
      else if (errorDetail && typeof errorDetail === 'object') {
        const detailObj = errorDetail as unknown as Record<string, unknown>;
        if (typeof detailObj.message === 'string') {
          errorMessage = detailObj.message;
          // Add additional context if available for "No records created" messages
          if (errorMessage.includes('No records created') || errorMessage.includes('already exist')) {
            // Add additional context if available
            const skippedCount = Array.isArray((detailObj as any).skipped_enrollment_ids)
              ? (detailObj as any).skipped_enrollment_ids.length
              : 0;
            const totalRequested = typeof (detailObj as any).total_requested === "number"
              ? (detailObj as any).total_requested
              : 0;
            if (skippedCount > 0 && totalRequested > 0) {
              errorMessage = `${errorMessage} (${skippedCount} out of ${totalRequested} enrollment${totalRequested !== 1 ? 's' : ''} already have attendance records for this month.)`;
            }
          }
        } else {
          // If detail is an object but no message, try to stringify it safely
          errorMessage = JSON.stringify(errorDetail);
        }
      }
      // 3. errorData.detail (string)
      else if (typeof errorDetail === 'string') {
        errorMessage = errorDetail;
      }
      // 4. errorData.message (direct property)
      else if (
        errorData &&
        typeof errorData === "object" &&
        "message" in errorData &&
        typeof (errorData as any).message === "string"
      ) {
        errorMessage = (errorData as any).message;
      }
      // 5. error.message (Error object message)
      else if (errorMsg && typeof errorMsg === 'string' && errorMsg !== '[object Object]') {
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
    onSuccess: (
      data: TData,
      variables: TVariables,
      onMutateResult: TContext | undefined,
      context: MutationFunctionContext
    ) => {
      // Show success toast immediately
      toast({
        title: 'Success',
        description: successMessage,
        variant: 'success',
      });

      // Call the provided onSuccess callback if it exists (do this first)
      mutationOptions.onSuccess?.(data, variables, onMutateResult, context);

      // ✅ FIX: Removed CacheUtils.clearAll() - React Query handles caching properly
      // Individual mutations should use invalidateAndRefetch() or batchInvalidateAndRefetch()
      // for specific query keys instead of clearing all cache
    },
    onError: (
      error: TError,
      variables: TVariables,
      onMutateResult: TContext | undefined,
      context: MutationFunctionContext
    ) => {
      // ✅ FIX: Properly type error handling
      // Extract error message from various possible structures
      const errorObj = error as Error & { data?: unknown; response?: { data?: unknown }; message?: string };
      const errorData = errorObj?.data || errorObj?.response?.data;
      const errorMsg = errorObj?.message;
      
      // Check if errorData is an ApiErrorResponse
      let errorDetail: ApiErrorResponse['detail'] | undefined;
      if (isApiErrorResponse(errorData)) {
        errorDetail = errorData.detail;
      } else if (errorData && typeof errorData === 'object' && 'detail' in errorData) {
        errorDetail = (errorData as { detail: unknown }).detail as ApiErrorResponse['detail'];
      }
      let errorMessage: string;
      
      // ✅ FIX: Check for nested error.message structure (backend format: { error: { message: "..." } })
      const errorDataObj = errorData && typeof errorData === 'object' ? errorData as Record<string, unknown> : null;
      const nestedError = errorDataObj?.error && typeof errorDataObj.error === 'object' 
        ? errorDataObj.error as Record<string, unknown> 
        : null;
      
      // Priority order for error message extraction:
      // 1. errorData.error.message (nested error object)
      if (nestedError && typeof nestedError.message === 'string') {
        errorMessage = nestedError.message;
      }
      // 2. Handle case where detail is an object with a message property
      else if (errorDetail && typeof errorDetail === 'object') {
        const detailObj = errorDetail as unknown as Record<string, unknown>;
        if (typeof detailObj.message === 'string') {
          errorMessage = detailObj.message;
          // Add additional context if available for "No records created" messages
          if (errorMessage.includes('No records created') || errorMessage.includes('already exist')) {
            // Add additional context if available
            const skippedCount = Array.isArray((detailObj as any).skipped_enrollment_ids)
              ? (detailObj as any).skipped_enrollment_ids.length
              : 0;
            const totalRequested = typeof (detailObj as any).total_requested === "number"
              ? (detailObj as any).total_requested
              : 0;
            if (skippedCount > 0 && totalRequested > 0) {
              errorMessage = `${errorMessage} (${skippedCount} out of ${totalRequested} enrollment${totalRequested !== 1 ? 's' : ''} already have attendance records for this month.)`;
            }
          }
        } else {
          // If detail is an object but no message, try to stringify it safely
          errorMessage = JSON.stringify(errorDetail);
        }
      }
      // 3. errorData.detail (string)
      else if (typeof errorDetail === 'string') {
        errorMessage = errorDetail;
      }
      // 4. errorData.message (direct property)
      else if (
        errorData &&
        typeof errorData === "object" &&
        "message" in errorData &&
        typeof (errorData as any).message === "string"
      ) {
        errorMessage = (errorData as any).message;
      }
      // 5. error.message (Error object message)
      else if (errorMsg && typeof errorMsg === 'string' && errorMsg !== '[object Object]') {
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
