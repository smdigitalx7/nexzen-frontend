import { DomainEvent } from './EventBus';
import { UserEntity } from '../../domain/entities/User';

export class UserCreatedEvent implements DomainEvent {
  eventType = 'UserCreated';
  occurredOn: Date;
  
  constructor(
    public aggregateId: string,
    public data: {
      userId: number;
      fullName: string;
      email: string;
      role: string;
    }
  ) {
    this.occurredOn = new Date();
  }
  
  static fromUser(user: UserEntity): UserCreatedEvent {
    return new UserCreatedEvent(
      user.id.getValue().toString(),
      {
        userId: user.id.getValue(),
        fullName: user.fullName,
        email: user.email.getValue(),
        role: user.role,
      }
    );
  }
}

export class UserUpdatedEvent implements DomainEvent {
  eventType = 'UserUpdated';
  occurredOn: Date;
  
  constructor(
    public aggregateId: string,
    public data: {
      userId: number;
      fullName: string;
      email: string;
      role: string;
      isActive: boolean;
    }
  ) {
    this.occurredOn = new Date();
  }
  
  static fromUser(user: UserEntity): UserUpdatedEvent {
    return new UserUpdatedEvent(
      user.id.getValue().toString(),
      {
        userId: user.id.getValue(),
        fullName: user.fullName,
        email: user.email.getValue(),
        role: user.role,
        isActive: user.isActive,
      }
    );
  }
}

export class UserStatusChangedEvent implements DomainEvent {
  eventType = 'UserStatusChanged';
  occurredOn: Date;
  
  constructor(
    public aggregateId: string,
    public data: {
      userId: number;
      isActive: boolean;
      fullName: string;
      email: string;
    }
  ) {
    this.occurredOn = new Date();
  }
  
  static fromUser(user: UserEntity): UserStatusChangedEvent {
    return new UserStatusChangedEvent(
      user.id.getValue().toString(),
      {
        userId: user.id.getValue(),
        isActive: user.isActive,
        fullName: user.fullName,
        email: user.email.getValue(),
      }
    );
  }
}

export class UserDeletedEvent implements DomainEvent {
  eventType = 'UserDeleted';
  occurredOn: Date;
  
  constructor(
    public aggregateId: string,
    public data: {
      userId: number;
      fullName: string;
      email: string;
    }
  ) {
    this.occurredOn = new Date();
  }
  
  static fromUser(user: UserEntity): UserDeletedEvent {
    return new UserDeletedEvent(
      user.id.getValue().toString(),
      {
        userId: user.id.getValue(),
        fullName: user.fullName,
        email: user.email.getValue(),
      }
    );
  }
}
