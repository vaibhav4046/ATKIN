/**
 * ATKIN Runtime Event Bus
 * Section 79: Typed Domain Event Bus
 *
 * Implements a lightweight, synchronous/asynchronous pub-sub bus
 * with an append-only event log for auditing and reactive UI updates.
 */

import type { DomainEvent, DomainEventType } from '../../domain/events/domainEvents.ts';

export type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => void | Promise<void>;

export class EventBus {
  private static instance: EventBus | null = null;
  private listeners: Map<DomainEventType | '*', Set<EventHandler<any>>> = new Map();
  private eventHistory: DomainEvent[] = [];
  private maxHistory: number = 1000;

  constructor() {
    this.listeners.set('*', new Set());
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public static resetInstance(): void {
    if (EventBus.instance) {
      EventBus.instance.clear();
      EventBus.instance = null;
    }
  }

  public on<T extends DomainEvent>(eventType: DomainEventType | '*', handler: EventHandler<T>): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    const handlers = this.listeners.get(eventType)!;
    handlers.add(handler);

    // Return unbind function
    return () => {
      handlers.delete(handler);
    };
  }

  public async emit(event: DomainEvent): Promise<void> {
    // Append to internal event ledger
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory.shift();
    }

    // Call specific type listeners
    const specific = this.listeners.get(event.type);
    if (specific && specific.size > 0) {
      for (const handler of Array.from(specific)) {
        try {
          await handler(event);
        } catch (err) {
          console.error(`[EventBus] Handler error on ${event.type}:`, err);
        }
      }
    }

    // Call wildcard listeners
    const wildcard = this.listeners.get('*');
    if (wildcard && wildcard.size > 0) {
      for (const handler of Array.from(wildcard)) {
        try {
          await handler(event);
        } catch (err) {
          console.error(`[EventBus] Wildcard handler error on ${event.type}:`, err);
        }
      }
    }
  }

  public getHistory(filter?: { matterId?: string; type?: DomainEventType }): DomainEvent[] {
    let result = this.eventHistory;
    if (filter?.matterId) {
      result = result.filter(e => e.matterId === filter.matterId);
    }
    if (filter?.type) {
      result = result.filter(e => e.type === filter.type);
    }
    return [...result];
  }

  public clear(): void {
    this.listeners.clear();
    this.listeners.set('*', new Set());
    this.eventHistory = [];
  }
}

export const eventBus = EventBus.getInstance();
