# Quick Reference: New Query Invalidation System

## 🎯 How to Use

### 1. Using useGlobalRefetch in Any Hook

```typescript
import { useGlobalRefetch } from "@/lib/hooks/common/useGlobalRefetch";

function useMyCustomHook() {
  const { invalidateEntity, invalidateAll } = useGlobalRefetch();

  const mutation = useMutation({
    mutationFn: myService.create,
    onSuccess: () => {
      // Invalidate all queries for an entity
      invalidateEntity("employees");

      // Or invalidate ALL queries
      // invalidateAll();
    },
  });

  return mutation;
}
```

### 2. Using useCRUD for New Modules

**Create a new hook file:**

```typescript
// lib/hooks/general/useProducts.ts
import { useQuery } from "@tanstack/react-query";
import { useCRUD } from "../common/useCRUD";
import { ProductsService } from "@/lib/services/general/products.service";

// Query keys
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  detail: (id: number) => [...productKeys.all, "detail", id],
};

// Fetch hook
export const useProducts = () => {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: ProductsService.list,
  });
};

// CRUD hook
export const useProductCRUD = () => {
  return useCRUD({
    entity: "products", // Make sure this is in ENTITY_QUERY_MAP
    createFn: ProductsService.create,
    updateFn: ProductsService.update,
    deleteFn: ProductsService.remove,
    messages: {
      create: "Product created successfully",
      update: "Product updated successfully",
      delete: "Product deleted successfully",
    },
  });
};
```

### 3. Adding New Entity to Mapping

**Edit `client/src/lib/hooks/common/useGlobalRefetch.ts`:**

```typescript
export const ENTITY_QUERY_MAP = {
  // ... existing entities
  products: [["products"]] as QueryKey[],
  orders: [["orders"]] as QueryKey[],
};
```

### 4. Using Refetch Listener for Real-time

```typescript
import { refetchListener } from "@/lib/utils/refetchListener";

// In a WebSocket or real-time event handler:
refetchListener.invalidateEntity("employees");

// Get all subscribed entities
const entities = refetchListener.getSubscribedEntities();
console.log("Subscribed entities:", entities);
```

## 📋 Common Patterns

### Pattern 1: Simple Mutation with Invalidation

```typescript
const { invalidateEntity } = useGlobalRefetch();

const mutation = useMutation({
  mutationFn: (data) => MyService.create(data),
  onSuccess: () => {
    invalidateEntity("myEntity");
  },
});
```

### Pattern 2: Multiple Invalidations

```typescript
const { invalidateEntity, invalidateByPattern } = useGlobalRefetch();

const mutation = useMutation({
  mutationFn: (data) => MyService.create(data),
  onSuccess: () => {
    // Specific entity
    invalidateEntity("employees");
    // Pattern-based (e.g., all school queries)
    invalidateByPattern("school");
  },
});
```

### Pattern 3: Custom Success Handler

```typescript
const { invalidateEntity } = useGlobalRefetch();

const mutation = useMutation({
  mutationFn: (data) => MyService.create(data),
  onSuccess: (data, variables) => {
    // Custom logic
    console.log("Created:", data);

    // Then invalidate
    invalidateEntity("employees");

    // Show custom toast
    toast({ title: "Success", description: "Custom message" });
  },
});
```

## 🔍 Available Entity Types

```typescript
"employees"; // Employee queries
"users"; // User queries
"classes"; // Class queries (school/college)
"students"; // Student queries (school/college)
"payrolls"; // Payroll queries
"transport"; // Transport queries
"branches"; // Branch queries
"academicYears"; // Academic year queries
"subjects"; // Subject queries
"courses"; // Course queries (college)
"exams"; // Exam queries
"attendance"; // Attendance queries
"marks"; // Marks queries
"fees"; // Fees queries
"income"; // Income queries
"expenditure"; // Expenditure queries
"reservations"; // Reservation queries
"admissions"; // Admission queries
"enrollments"; // Enrollment queries
```

## ⚠️ Important Notes

1. **Always use the singleton QueryClient** - Never create new instances
2. **Add entity to ENTITY_QUERY_MAP** before using with `useCRUD`
3. **Test invalidation** - Ensure queries actually refresh
4. **Use React Query DevTools** - Monitor query cache

## 🐛 Troubleshooting

### Query doesn't refresh after mutation

- Check if entity is in `ENTITY_QUERY_MAP`
- Verify `invalidateEntity()` is called in `onSuccess`
- Check React Query DevTools for stale queries

### Duplicate queries

- Ensure single QueryClient instance (check ProductionApp.tsx)
- Verify query key factories are consistent

### Type errors

- Make sure entity type is added to `EntityType` union in `useGlobalRefetch.ts`
- Check TypeScript configuration

## 📚 Related Files

- `lib/query.ts` - QueryClient singleton
- `lib/hooks/common/useGlobalRefetch.ts` - Global invalidation hook
- `lib/hooks/common/useCRUD.ts` - Reusable CRUD hook
- `lib/utils/refetchListener.ts` - Refetch listener utility
- `components/shared/ProductionApp.tsx` - QueryClientProvider setup
