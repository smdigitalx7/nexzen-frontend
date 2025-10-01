export interface DomainEvent {
  eventType: string;
  aggregateId: string;
  occurredOn: Date;
  data: any;
}

export interface EventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

export class EventBus {
  private static instance: EventBus;
  private handlers: Map<string, EventHandler<any>[]> = new Map();
  
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }
  
  subscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }
  
  unsubscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
  
  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || [];
    
    const promises = handlers.map(async (handler) => {
      try {
        await handler.handle(event);
      } catch (error) {
        console.error(`Error handling event ${event.eventType}:`, error);
        // In a real application, you might want to implement retry logic or dead letter queue
      }
    });
    
    await Promise.allSettled(promises);
  }
  
  clear(): void {
    this.handlers.clear();
  }
}
