import { queryClient } from "@/core/query";
import type { QueryKey } from "@tanstack/react-query";

/**
 * Refetch Listener
 * A class-based utility for managing global query invalidation
 * Useful for real-time updates, WebSocket integration, or cross-module synchronization
 */
class RefetchListener {
  private subscriptions: Map<string, Set<string>> = new Map();

  /**
   * Subscribe an entity to listen for invalidation events
   * @param entity - The entity name (e.g., 'employees', 'students')
   * @param queryKey - JSON stringified query key array
   */
  subscribe(entity: string, queryKey: string) {
    if (!this.subscriptions.has(entity)) {
      this.subscriptions.set(entity, new Set());
    }
    this.subscriptions.get(entity)!.add(queryKey);
  }

  /**
   * Unsubscribe an entity from invalidation events
   */
  unsubscribe(entity: string, queryKey: string) {
    const entitySubs = this.subscriptions.get(entity);
    if (entitySubs) {
      entitySubs.delete(queryKey);
      if (entitySubs.size === 0) {
        this.subscriptions.delete(entity);
      }
    }
  }

  /**
   * Invalidate all queries for a specific entity
   * @param entity - The entity name
   */
  invalidateEntity(entity: string) {
    const keys = this.subscriptions.get(entity);
    if (keys) {
      keys.forEach((key) => {
        try {
          const queryKey = JSON.parse(key) as QueryKey;
          void queryClient.invalidateQueries({ queryKey });
        } catch (error) {
          console.error(
            `Failed to parse query key for entity ${entity}:`,
            key,
            error
          );
        }
      });
    }
  }

  /**
   * Invalidate all queries for all subscribed entities
   */
  invalidateAll() {
    this.subscriptions.forEach((keys, entity) => {
      this.invalidateEntity(entity);
    });
  }

  /**
   * Get all subscribed entities
   */
  getSubscribedEntities(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Get subscription count for an entity
   */
  getSubscriptionCount(entity: string): number {
    return this.subscriptions.get(entity)?.size || 0;
  }

  /**
   * Clear all subscriptions
   */
  clear() {
    this.subscriptions.clear();
  }

  /**
   * Get total subscription count
   */
  getTotalSubscriptions(): number {
    let total = 0;
    this.subscriptions.forEach((keys) => {
      total += keys.size;
    });
    return total;
  }
}

// Export singleton instance
export const refetchListener = new RefetchListener();

