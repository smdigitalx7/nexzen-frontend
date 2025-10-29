# Complete Project Architecture Analysis

## 1. Frontend Framework & State Management

### Technologies Used

- **React 18.3.1** with TypeScript
- **TanStack Query (React Query) 5.89.0** - Server state management
- **Zustand 5.0.8** - Client state management (auth, navigation, cache, UI)
- **Wouter 3.3.5** - Routing
- **Vite 5.4.19** - Build tool

### State Management Breakdown

#### Zustand Stores (`client/src/store/`)

- `authStore.ts` - Authentication, user, tokens, branches, academic years
- `navigationStore.ts` - Navigation history and preferences
- `cacheStore.ts` - Application-level caching with TTL
- `uiStore.ts` - UI state (toasts, modals, loading, theme)

#### React Query Configuration

- **Global Setup**: `client/src/lib/query.ts`
- **Provider Location**: `client/src/components/shared/ProductionApp.tsx` (line 158)
- **Configuration**:
  ```typescript
  {
    staleTime: 30_000,      // 30 seconds
    refetchOnWindowFocus: false,
    retry: 2,
    mutations: { retry: 0 }
  }
  ```

## 2. API Calls & CRUD Operations

### API Layer Architecture

**Location**: `client/src/lib/api.ts`

- Uses **fetch API** (not Axios)
- Centralized `Api` utility with methods: `get`, `post`, `put`, `patch`, `delete`
- Built-in features:
  - Automatic token injection
  - Request caching with TTL
  - Request deduplication
  - Automatic token refresh on 401/403
  - Timeout handling (default 30s)
  - Error handling

### Service Layer Structure

**Location**: `client/src/lib/services/`

```
services/
├── general/      (20 service files)
│   ├── employees.service.ts
│   ├── users.service.ts
│   ├── payroll.service.ts
│   ├── auth.service.ts
│   └── ...
├── school/       (22 service files)
│   ├── classes.service.ts
│   ├── students.service.ts
│   ├── attendance.service.ts
│   └── ...
└── college/      (21 service files)
    ├── courses.service.ts
    ├── enrollments.service.ts
    └── ...
```

**Pattern Example**:

```typescript
// Service Layer (employees.service.ts)
export const EmployeesService = {
  listByBranch() {
    return Api.get<EmployeeRead[]>("/employees/branch");
  },
  create(payload: EmployeeCreate) {
    return Api.post<EmployeeRead>("/employees", payload);
  },
  update(id: number, payload: EmployeeUpdate) {
    return Api.put<EmployeeRead>(`/employees/${id}`, payload);
  },
};
```

## 3. React Query Setup

### QueryClient Configuration

**File**: `client/src/lib/query.ts`

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 2,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

### Provider Hierarchy

```
ProductionApp (ErrorBoundary wrapper)
  └── QueryClientProvider (line 158)
      └── TooltipProvider
          └── Suspense + App Components
```

**⚠️ Issue Found**:

- `queryClient` is defined in `lib/query.ts` but NOT used
- `ProductionApp.tsx` creates its own QueryClient instance on line 123
- Should use the singleton from `lib/query.ts`

## 4. Data Refresh After Mutations

### Current Pattern: Manual `invalidateQueries`

**Example from `useEmployees.ts`**:

```typescript
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutationWithSuccessToast(
    {
      mutationFn: (data: EmployeeCreate) => EmployeesService.create(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
        queryClient.invalidateQueries({ queryKey: employeeKeys.byBranch() });
        queryClient.invalidateQueries({ queryKey: employeeKeys.dashboard() });
        queryClient.invalidateQueries({ queryKey: employeeKeys.recent() });
      },
    },
    "Employee created successfully"
  );
};
```

### Observations

- ✅ **Uses**: `invalidateQueries` in `onSuccess` callbacks
- ✅ **Pattern**: Manual invalidation per module
- ❌ **Issue**: No global refetch strategy
- ❌ **Issue**: Each mutation manually lists queries to invalidate
- ❌ **Issue**: Pattern repeated 60+ times across codebase
- ❌ **Issue**: No centralized invalidation logic

## 5. Hook & Service Patterns

### Hook Structure (`client/src/lib/hooks/`)

```
hooks/
├── common/                  (9 hooks)
│   ├── use-mutation-with-toast.ts  ⭐ Reusable toast wrapper
│   ├── useQueryOptimization.ts
│   ├── useSearchFilters.ts
│   └── ...
├── general/                 (18 hooks)
│   ├── useEmployees.ts
│   ├── useUsers.ts
│   ├── usePayrollManagement.ts
│   ├── useTransport.ts
│   └── ...
├── school/                  (22 hooks)
│   ├── use-school-classes.ts
│   ├── use-school-students.ts
│   ├── use-school-attendance.ts
│   └── ...
└── college/                 (24 hooks)
    ├── use-college-courses.ts
    ├── use-college-students.ts
    ├── use-college-exams.ts
    └── ...
```

### Common Pattern Across Hooks

```typescript
// 1. Define query keys
export const entityKeys = {
  all: ["entity"] as const,
  lists: () => [...entityKeys.all, "list"],
  detail: (id: number) => [...entityKeys.all, "detail", id],
};

// 2. Data fetching hooks
export const useEntities = () => {
  return useQuery({
    queryKey: entityKeys.lists(),
    queryFn: () => EntityService.list(),
  });
};

// 3. Mutation hooks (create, update, delete)
export const useCreateEntity = () => {
  const queryClient = useQueryClient();
  return useMutationWithSuccessToast(
    {
      mutationFn: (data) => EntityService.create(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: entityKeys.lists() });
        // ... more invalidations
      },
    },
    "Success message"
  );
};
```

## 6. Repeated Patterns (Can Be Refactored)

### Pattern 1: Query Invalidation (Repeated 60+ times)

```typescript
// CURRENT (in every hook)
const queryClient = useQueryClient();
return useMutation({
  mutationFn: (data) => Service.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["entity"] });
  },
});
```

### Pattern 2: Mutation with Toast (Already Abstracted ✅)

Already using: `useMutationWithSuccessToast`

**File**: `client/src/lib/hooks/common/use-mutation-with-toast.ts`

### Pattern 3: Service Layer Methods (Repeated)

Every service has: `list()`, `getById(id)`, `create(payload)`, `update(id, payload)`, `remove(id)`

## 7. Suggested Improvements

### A. Create Global Refetch Registry

**File**: `client/src/lib/hooks/common/useGlobalRefetch.ts`

```typescript
import { queryClient } from "@/lib/query";
import type { QueryKey } from "@tanstack/react-query";

type EntityType =
  | "employees"
  | "users"
  | "classes"
  | "students"
  | "payrolls"
  | "employees";

interface RefetchMapping {
  entity: EntityType;
  queryKeys: string[];
}

// Centralized mapping of entities to their query keys
const REFETCH_MAP: RefetchMapping[] = [
  {
    entity: "employees",
    queryKeys: ["employees"],
  },
  {
    entity: "users",
    queryKeys: ["users"],
  },
  {
    entity: "classes",
    queryKeys: ["school", "classes"],
  },
  // ... more mappings
];

export function useGlobalInvalidate(entity: EntityType) {
  const mapping = REFETCH_MAP.find((m) => m.entity === entity);

  if (mapping) {
    mapping.queryKeys.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });
  }
}

// Usage in hooks:
export const useCreateEmployee = () => {
  return useMutationWithSuccessToast(
    {
      mutationFn: (data) => EmployeesService.create(data),
      onSuccess: () => {
        useGlobalInvalidate("employees");
      },
    },
    "Employee created successfully"
  );
};
```

### B. Create Reusable CRUD Hook

**File**: `client/src/lib/hooks/common/useCRUD.ts`

```typescript
import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

interface UseCRUDOptions<TData, TVariables> {
  entityName: string;
  queryKeys: (string | number)[][];
  createFn: (data: TVariables) => Promise<TData>;
  updateFn: (id: number, data: Partial<TVariables>) => Promise<TData>;
  deleteFn: (id: number) => Promise<void>;
  successMessage?: {
    create?: string;
    update?: string;
    delete?: string;
  };
}

export function useCRUD<TData, TVariables>({
  entityName,
  queryKeys,
  createFn,
  updateFn,
  deleteFn,
  successMessage = {},
}: UseCRUDOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryKeys.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  };

  const create = useMutation({
    mutationFn: createFn,
    onSuccess: () => {
      invalidateAll();
    },
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TVariables> }) =>
      updateFn(id, data),
    onSuccess: () => {
      invalidateAll();
    },
  });

  const remove = useMutation({
    mutationFn: deleteFn,
    onSuccess: () => {
      invalidateAll();
    },
  });

  return {
    create,
    update,
    remove,
  };
}

// Usage:
const { create, update, remove } = useCRUD({
  entityName: "employees",
  queryKeys: [["employees"]],
  createFn: EmployeesService.create,
  updateFn: EmployeesService.update,
  deleteFn: EmployeesService.remove,
});
```

### C. Fix QueryClient Singleton

**Problem**: Two QueryClient instances exist

**Solution**: Use singleton from `lib/query.ts`

```typescript
// lib/query.ts
export const queryClient = new QueryClient({...});

// ProductionApp.tsx (fix this)
import { queryClient } from '@/lib/query';

// Remove line 123-138 and use the imported one
<QueryClientProvider client={queryClient}>
```

### D. Add Centralized Refetch Listener

**File**: `client/src/lib/utils/refetchListener.ts`

```typescript
import { queryClient } from "@/lib/query";

class RefetchListener {
  private subscriptions: Map<string, Set<string>> = new Map();

  subscribe(entity: string, queryKey: string) {
    if (!this.subscriptions.has(entity)) {
      this.subscriptions.set(entity, new Set());
    }
    this.subscriptions.get(entity)!.add(queryKey);
  }

  invalidateEntity(entity: string) {
    const keys = this.subscriptions.get(entity);
    if (keys) {
      keys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: JSON.parse(key) });
      });
    }
  }

  invalidateAll(entity: string) {
    const keys = this.subscriptions.get(entity);
    if (keys) {
      keys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: JSON.parse(key) });
      });
    }
  }
}

export const refetchListener = new RefetchListener();
```

## 8. File Locations Summary

### Hooks Directory

```
client/src/lib/hooks/
├── common/          - Shared hooks (9 files)
├── general/         - General modules (18 hooks)
├── school/          - School modules (22 hooks)
└── college/         - College modules (24 hooks)
```

**Total**: ~73 hook files

### Services Directory

```
client/src/lib/services/
├── general/         - 20 service files
├── school/          - 22 service files
└── college/         - 21 service files
```

**Total**: ~63 service files

### Types Directory

```
client/src/lib/types/
├── general/         - 16 type files
├── school/          - 25 type files
└── college/         - 27 type files
```

**Total**: ~68 type files

## 9. Key Findings & Recommendations

### ✅ What's Working Well

1. Clear separation of concerns (hooks → services → API)
2. Service layer abstraction works well
3. Query key factory pattern is consistent
4. Toast wrapper exists and reduces boilerplate
5. Zustand stores are well-structured
6. Centralized API layer with good features

### ⚠️ Issues to Address

1. **QueryClient Duplication**: Two instances exist
2. **Manual Invalidation**: 60+ mutations manually list queries to invalidate
3. **No Global Refetch**: Cannot invalidate across modules automatically
4. **Repetitive CRUD Patterns**: Can be abstracted further
5. **No Entity-Level Invalidation**: Each hook manages its own cache

### 🎯 Recommendations Priority

**High Priority**:

1. Fix QueryClient singleton issue
2. Create `useGlobalRefetch` hook
3. Create `useCRUD` reusable hook

**Medium Priority**: 4. Add `refetchListener` utility 5. Document query key patterns 6. Add invalidation mapping registry

**Low Priority**: 7. Consider optimistic updates 8. Add query key validation 9. Add mutation queue handling

## 10. Implementation Steps

### Step 1: Fix QueryClient (1 file)

Edit `client/src/components/shared/ProductionApp.tsx`:

```typescript
import { queryClient } from "@/lib/query";

// Remove lines 123-138 (local queryClient creation)
// Use imported singleton
```

### Step 2: Create Global Refetch Hook (New file)

Create `client/src/lib/hooks/common/useGlobalRefetch.ts`

### Step 3: Create Reusable CRUD Hook (New file)

Create `client/src/lib/hooks/common/useCRUD.ts`

### Step 4: Implement in One Module (Test)

Refactor `useEmployees.ts` to use new patterns

### Step 5: Rollout (Gradual)

Replace other hooks gradually

## 11. Code Examples

### Before (Current Pattern)

```typescript
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutationWithSuccessToast(
    {
      mutationFn: (data: EmployeeCreate) => EmployeesService.create(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
        queryClient.invalidateQueries({ queryKey: employeeKeys.byBranch() });
        queryClient.invalidateQueries({ queryKey: employeeKeys.dashboard() });
        queryClient.invalidateQueries({ queryKey: employeeKeys.recent() });
      },
    },
    "Employee created successfully"
  );
};
```

### After (With Global Refetch)

```typescript
export const useCreateEmployee = () => {
  const { invalidateEntity } = useGlobalRefetch();

  return useMutationWithSuccessToast(
    {
      mutationFn: (data: EmployeeCreate) => EmployeesService.create(data),
      onSuccess: () => invalidateEntity("employees"),
    },
    "Employee created successfully"
  );
};
```

## Summary

**Your Project Uses**:

- ✅ React 18 + TypeScript
- ✅ TanStack Query for server state
- ✅ Zustand for client state
- ✅ Fetch API (not Axios) via centralized `Api` utility
- ✅ Service layer for CRUD operations
- ✅ **NEW:** Centralized query invalidation system
- ✅ **NEW:** Reusable CRUD hook
- ✅ **NEW:** Single QueryClient instance

**✅ Recently Completed Refactoring** (See `REFACTORING_SUMMARY.md`):

1. ✅ Fixed QueryClient duplication issue
2. ✅ Created `useGlobalRefetch` hook for centralized invalidation
3. ✅ Created `useCRUD` hook for reusable CRUD operations
4. ✅ Updated `useEmployees` to use new invalidation system
5. ✅ Created `refetchListener` utility for future real-time support

**Where Mutations Are**:

- `client/src/lib/hooks/{general|school|college}/use-*.ts`
- Look for `useMutation` calls
- `onSuccess` callbacks contain invalidation logic

**New Helper Files**:

1. ✅ `lib/hooks/common/useGlobalRefetch.ts` - Created
2. ✅ `lib/hooks/common/useCRUD.ts` - Created
3. ✅ `lib/utils/refetchListener.ts` - Created
