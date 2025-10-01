# NexGen Core Architecture

This directory contains the core business logic and infrastructure for the NexGen ERP system, following Clean Architecture principles.

## Structure

```
core/
├── domain/                    # Domain Layer - Core business logic
│   ├── entities/             # Domain entities and value objects
│   ├── repositories/         # Repository interfaces
│   └── services/            # Domain services
├── application/              # Application Layer - Use cases and DTOs
│   ├── dto/                 # Data Transfer Objects
│   ├── use-cases/           # Business use cases
│   ├── errors/              # Application errors
│   └── events/              # Domain events
└── infrastructure/          # Infrastructure Layer - External concerns
    ├── api/                 # API client
    ├── repositories/        # Repository implementations
    └── di/                  # Dependency injection
```

## Domain Layer

The domain layer contains the core business logic and rules of the application.

### Entities
- **User**: Represents system users with roles and permissions
- **Employee**: Represents institute employees
- **Student**: Represents enrolled students
- **Branch**: Represents institute branches

### Value Objects
- **UserId, EmployeeId, StudentId, BranchId**: Strongly typed identifiers
- **Email**: Validated email addresses
- **Address**: Structured address information

### Domain Services
- **UserDomainService**: Business logic for user operations
- **EmployeeDomainService**: Business logic for employee operations
- **StudentDomainService**: Business logic for student operations

## Application Layer

The application layer orchestrates the domain layer and handles use cases.

### Use Cases
- **UserUseCases**: User management operations
- **EmployeeUseCases**: Employee management operations
- **StudentUseCases**: Student management operations

### DTOs
- Request/Response objects for API communication
- Type-safe data transfer between layers

### Events
- Domain events for decoupled communication
- Event handlers for side effects

## Infrastructure Layer

The infrastructure layer handles external concerns like API communication and data persistence.

### API Client
- Centralized HTTP client with error handling
- Authentication token management
- Request/response transformation

### Repositories
- Implementation of domain repository interfaces
- API-based data access
- Entity mapping

### Dependency Injection
- Service container for dependency management
- Service locator for easy access
- Configuration management

## Usage

### Initialization

```typescript
import { ServiceLocator } from '@/core';

// Initialize the service locator
ServiceLocator.initialize({
  apiBaseUrl: 'https://api.nexgen.com',
  authToken: 'your-token'
});
```

### Using Use Cases

```typescript
import { ServiceLocator } from '@/core';

// Get use cases
const userUseCases = ServiceLocator.getUserUseCases();
const employeeUseCases = ServiceLocator.getEmployeeUseCases();
const studentUseCases = ServiceLocator.getStudentUseCases();

// Use the use cases
const users = await userUseCases.getAllUsers();
const user = await userUseCases.createUser({
  fullName: 'John Doe',
  email: 'john@example.com',
  role: 'academic',
  password: 'password123',
  confirmPassword: 'password123'
});
```

### Error Handling

```typescript
import { ApplicationError, ValidationError, NotFoundError } from '@/core';

try {
  await userUseCases.createUser(userData);
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors
    console.error('Validation failed:', error.message);
  } else if (error instanceof NotFoundError) {
    // Handle not found errors
    console.error('Resource not found:', error.message);
  } else if (error instanceof ApplicationError) {
    // Handle other application errors
    console.error('Application error:', error.message);
  } else {
    // Handle unexpected errors
    console.error('Unexpected error:', error);
  }
}
```

### Event Handling

```typescript
import { EventBus, UserCreatedEvent } from '@/core';

const eventBus = EventBus.getInstance();

// Subscribe to events
eventBus.subscribe('UserCreated', {
  async handle(event: UserCreatedEvent) {
    console.log('User created:', event.data);
    // Send welcome email, create audit log, etc.
  }
});

// Publish events (usually done by domain services)
eventBus.publish(UserCreatedEvent.fromUser(newUser));
```

## Benefits

1. **Separation of Concerns**: Clear boundaries between business logic, application logic, and infrastructure
2. **Testability**: Easy to unit test business logic in isolation
3. **Maintainability**: Changes to one layer don't affect others
4. **Flexibility**: Easy to swap implementations (e.g., API to database)
5. **Type Safety**: Full TypeScript support with compile-time checks
6. **Error Handling**: Centralized error management with specific error types
7. **Event-Driven**: Decoupled communication through domain events

## Testing

The clean architecture makes testing straightforward:

```typescript
// Unit test domain services
const mockUserRepository = {
  findByEmail: jest.fn(),
  save: jest.fn()
};

const userDomainService = new UserDomainService(mockUserRepository);
// Test business logic in isolation

// Integration test use cases
const userUseCases = new UserUseCases(mockUserRepository, userDomainService);
// Test complete use case flows

// Mock infrastructure for testing
const mockApiClient = {
  get: jest.fn(),
  post: jest.fn()
};
```

This architecture provides a solid foundation for building maintainable, testable, and scalable applications.
