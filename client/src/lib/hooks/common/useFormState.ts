import { useState, useCallback } from 'react';

/**
 * Common form state management hook
 * Provides standardized state for form dialogs and form data
 */
export interface FormStateConfig<T> {
  initialData?: Partial<T>;
  resetOnClose?: boolean;
}

export const useFormState = <T extends Record<string, any>>(config: FormStateConfig<T> = {}) => {
  const { initialData = {}, resetOnClose = true } = config;

  // Form state
  const [formData, setFormData] = useState<Partial<T>>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form handlers
  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, [errors]);

  const updateFields = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setIsSubmitting(false);
  }, [initialData]);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field as string]: error }));
  }, []);

  const clearFieldError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field as string];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  // Validation helpers
  const hasErrors = Object.keys(errors).length > 0;
  const hasFieldError = (field: keyof T) => !!errors[field as string];
  const getFieldError = (field: keyof T) => errors[field as string] || '';

  return {
    // Form data
    formData,
    setFormData,
    updateField,
    updateFields,
    resetForm,
    
    // Submission state
    isSubmitting,
    setSubmitting,
    
    // Errors
    errors,
    setErrors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    hasErrors,
    hasFieldError,
    getFieldError,
  };
};
