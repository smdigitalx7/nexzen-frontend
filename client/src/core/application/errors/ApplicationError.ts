export class ApplicationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(resource: string, id: string | number) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND', 404);
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message: string = 'Access forbidden') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class ConflictError extends ApplicationError {
  constructor(message: string, details?: any) {
    super(message, 'CONFLICT', 409, details);
  }
}

export class BusinessRuleError extends ApplicationError {
  constructor(message: string, details?: any) {
    super(message, 'BUSINESS_RULE_VIOLATION', 422, details);
  }
}

export class InfrastructureError extends ApplicationError {
  constructor(message: string, details?: any) {
    super(message, 'INFRASTRUCTURE_ERROR', 500, details);
  }
}
