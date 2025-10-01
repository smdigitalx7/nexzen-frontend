// Domain Layer Exports
export * from './domain/entities/User';
export * from './domain/entities/Employee';
export * from './domain/entities/Student';
export * from './domain/entities/Branch';

export * from './domain/repositories/UserRepository';
export * from './domain/repositories/EmployeeRepository';
export * from './domain/repositories/StudentRepository';
export * from './domain/repositories/BranchRepository';

// Domain Services - Export specific types to avoid conflicts
export { UserDomainService } from './domain/services/UserDomainService';
export { EmployeeDomainService } from './domain/services/EmployeeDomainService';
export { StudentDomainService } from './domain/services/StudentDomainService';


export * from './application/use-cases/UserUseCases';
export * from './application/use-cases/EmployeeUseCases';
export * from './application/use-cases/StudentUseCases';

export * from './application/errors/ApplicationError';

export * from './application/events/EventBus';
export * from './application/events/UserEvents';

// Infrastructure Layer Exports
export * from './infrastructure/api/ApiClient';

export * from './infrastructure/repositories/UserApiRepository';
export * from './infrastructure/repositories/EmployeeApiRepository';
export * from './infrastructure/repositories/StudentApiRepository';

export * from './infrastructure/di/Container';
export * from './infrastructure/di/ServiceLocator';

// Legacy Compatibility Exports
export * from './infrastructure/adapters/HookAdapter';
export * from './infrastructure/migration/MigrationStrategy';
