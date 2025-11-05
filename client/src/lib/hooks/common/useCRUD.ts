import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { useGlobalRefetch, type EntityType, ENTITY_QUERY_MAP } from "./useGlobalRefetch";
import { useMutationWithSuccessToast } from "./use-mutation-with-toast";

interface UseCRUDOptions<TData, TVariables> {
  entity: string;
  createFn: (data: TVariables) => Promise<TData>;
  updateFn: (id: number, data: Partial<TVariables>) => Promise<TData>;
  deleteFn: (id: number) => Promise<void>;
  messages?: {
    create?: string;
    update?: string;
    delete?: string;
  };
}

interface UseCRUDReturn<TData, TVariables> {
  create: UseMutationResult<TData, unknown, TVariables, unknown>;
  update: UseMutationResult<
    TData,
    unknown,
    { id: number; data: Partial<TVariables> },
    unknown
  >;
  remove: UseMutationResult<void, unknown, number, unknown>;
}

/**
 * Generic CRUD Hook
 * Provides reusable create, update, and delete mutations with automatic query invalidation
 */
export function useCRUD<TData, TVariables>({
  entity,
  createFn,
  updateFn,
  deleteFn,
  messages = {},
}: UseCRUDOptions<TData, TVariables>): UseCRUDReturn<TData, TVariables> {
  const { invalidateEntity } = useGlobalRefetch();

  // Type guard to ensure entity is a valid EntityType
  const isValidEntity = (e: string): e is EntityType => {
    return e in ENTITY_QUERY_MAP;
  };

  const create = useMutationWithSuccessToast(
    {
      mutationFn: createFn,
      onSuccess: () => {
        // Auto-invalidate entity queries
        if (isValidEntity(entity)) {
          invalidateEntity(entity);
        }
      },
    },
    messages.create ||
      `${
        entity.slice(0, 1).toUpperCase() + entity.slice(1)
      } created successfully`
  );

  const update = useMutationWithSuccessToast(
    {
      mutationFn: ({ id, data }: { id: number; data: Partial<TVariables> }) =>
        updateFn(id, data),
      onSuccess: () => {
        // Auto-invalidate entity queries
        if (isValidEntity(entity)) {
          invalidateEntity(entity);
        }
      },
    },
    messages.update ||
      `${
        entity.slice(0, 1).toUpperCase() + entity.slice(1)
      } updated successfully`
  );

  const remove = useMutationWithSuccessToast(
    {
      mutationFn: deleteFn,
      onSuccess: () => {
        // Auto-invalidate entity queries
        if (isValidEntity(entity)) {
          invalidateEntity(entity);
        }
      },
    },
    messages.delete ||
      `${
        entity.slice(0, 1).toUpperCase() + entity.slice(1)
      } deleted successfully`
  );

  return {
    create,
    update,
    remove,
  };
}
