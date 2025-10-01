# Clean Architecture Migration Strategy

This directory contains the infrastructure for gradually migrating from the existing codebase to clean architecture while maintaining full backward compatibility.

## 🎯 Migration Goals

1. **Zero Breaking Changes**: Existing code continues to work unchanged
2. **Gradual Migration**: Move features one by one to clean architecture
3. **Backward Compatibility**: Legacy APIs remain functional
4. **Performance**: No performance degradation during migration
5. **Testing**: All existing tests continue to pass

## 🏗️ Architecture Overview

```
infrastructure/
├── adapters/              # Bridge between old and new systems
│   └── HookAdapter.ts             # Smart hook selection
├── repositories/          # Repository implementations
│   ├── UserApiRepository.ts      # Clean architecture user repository
│   ├── EmployeeApiRepository.ts  # Clean architecture employee repository
│   └── StudentApiRepository.ts   # Clean architecture student repository
├── di/                   # Dependency injection
│   ├── Container.ts              # Service container
│   └── ServiceLocator.ts         # Service locator
├── migration/            # Migration strategy
│   └── MigrationStrategy.ts       # Controls migration phases
└── api/                  # API client
    └── ApiClient.ts              # HTTP client implementation
```

## 🔄 Migration Phases

### Phase 1: Legacy Only (Current)
- All existing code works as before
- Clean architecture is available but not used
- No changes to existing components

### Phase 2: Hybrid (Recommended)
- Gradually enable clean architecture for specific features
- Legacy fallback for unsupported features
- A/B testing capabilities

### Phase 3: Clean Architecture
- Full clean architecture implementation
- Legacy code can be removed
- Maximum performance and maintainability

## 🚀 Usage

### Automatic Initialization
The clean architecture is automatically initialized when imported:

```typescript
// This automatically initializes clean architecture
import '@/core';
```

### Smart Hooks
Use smart hooks that automatically choose the right implementation:

```typescript
import { useSmartUsers, useSmartCreateUser } from '@/core/infrastructure/adapters/HookAdapter';

// This will use clean architecture if enabled, legacy otherwise
const { data: users, isLoading } = useSmartUsers();
const createUserMutation = useSmartCreateUser();
```

### Manual Control
Control migration phases manually:

```typescript
import { MigrationStrategy } from '@/core/infrastructure/migration/MigrationStrategy';

// Enable clean architecture for users
MigrationStrategy.setPhase(MigrationPhase.HYBRID);
MigrationStrategy.updateConfig({
  enableCleanArchitecture: true,
  enableLegacyFallback: true
});
```

### Direct Clean Architecture Access
Access clean architecture directly when needed:

```typescript
import { ServiceLocator } from '@/core';

const userUseCases = ServiceLocator.getUserUseCases();
const users = await userUseCases.getAllUsers();
```

## 🔧 Configuration

### Environment Variables
```bash
# Enable clean architecture (default: true)
VITE_ENABLE_CLEAN_ARCHITECTURE=true

# Enable legacy fallback (default: true)
VITE_ENABLE_LEGACY_FALLBACK=true

# Log migration steps (default: true)
VITE_LOG_MIGRATION_STEPS=true
```

### Runtime Configuration
```typescript
import { MigrationStrategy } from '@/core/infrastructure/migration/MigrationStrategy';

MigrationStrategy.updateConfig({
  currentPhase: MigrationPhase.HYBRID,
  enableCleanArchitecture: true,
  enableLegacyFallback: true,
  logMigrationSteps: true
});
```

## 🧪 Testing Strategy

### Existing Tests
All existing tests continue to work without modification:

```typescript
// This still works exactly as before
import { useUsers } from '@/lib/hooks/useUsers';
```

### New Tests
Test clean architecture components:

```typescript
import { ServiceLocator } from '@/core';

test('should create user with clean architecture', async () => {
  const userUseCases = ServiceLocator.getUserUseCases();
  const result = await userUseCases.createUser(userData);
  expect(result).toBeDefined();
});
```

### Migration Tests
Test migration between phases:

```typescript
import { MigrationStrategy } from '@/core/infrastructure/migration/MigrationStrategy';

test('should fallback to legacy when clean architecture fails', () => {
  MigrationStrategy.setPhase(MigrationPhase.HYBRID);
  // Test fallback behavior
});
```

## 📊 Monitoring

### Migration Logs
Enable logging to monitor migration progress:

```typescript
MigrationStrategy.updateConfig({
  logMigrationSteps: true
});
```

### Performance Monitoring
Monitor performance during migration:

```typescript
// Track which implementation is being used
console.log('Using implementation:', MigrationStrategy.getCurrentPhase());
```

## 🔄 Rollback Strategy

If issues arise, you can easily rollback:

```typescript
// Rollback to legacy only
MigrationStrategy.setPhase(MigrationPhase.LEGACY_ONLY);

// Or disable clean architecture entirely
MigrationStrategy.updateConfig({
  enableCleanArchitecture: false
});
```

## 🎯 Benefits

1. **Risk Mitigation**: Gradual migration reduces risk
2. **Zero Downtime**: No breaking changes during migration
3. **Performance**: Clean architecture provides better performance
4. **Maintainability**: Cleaner code structure
5. **Testing**: Easier to test business logic
6. **Flexibility**: Can rollback at any time

## 🚨 Important Notes

1. **Don't modify existing components** during Phase 1
2. **Test thoroughly** when enabling clean architecture
3. **Monitor performance** during migration
4. **Keep legacy code** until migration is complete
5. **Document changes** for team members

This migration strategy ensures a smooth transition to clean architecture while maintaining full backward compatibility and allowing for gradual adoption.
