import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from '../runtime/events/eventBus.ts';
import type { MatterCreatedEvent, SourceImportedEvent, ActionApprovedEvent } from '../domain/events/domainEvents.ts';

describe('ATKIN EventBus & Typed Domain Events (Section 79)', () => {
  let bus: EventBus;

  beforeEach(() => {
    EventBus.resetInstance();
    bus = EventBus.getInstance();
  });

  it('subscribes to specific domain events and receives typed payloads', async () => {
    let receivedEvent: MatterCreatedEvent | null = null;

    const unsubscribe = bus.on<MatterCreatedEvent>('MatterCreated', (event) => {
      receivedEvent = event;
    });

    const mockEvent: MatterCreatedEvent = {
      id: 'evt-matter-001',
      type: 'MatterCreated',
      matterId: 'matter-alder-peak',
      workspaceId: 'demo',
      timestamp: new Date().toISOString(),
      actor: { type: 'lawyer', id: 'usr-sarah-stone' },
      payload: {
        matterId: 'matter-alder-peak',
        title: 'Alder Peak Systems Ltd v Highfield Logistics Group Ltd',
        client: 'Highfield Logistics Group Ltd',
        jurisdiction: 'England and Wales',
        memoryMode: 'STRICT_MATTER_ONLY'
      }
    };

    await bus.emit(mockEvent);

    expect(receivedEvent).toBeDefined();
    const event = receivedEvent as unknown as MatterCreatedEvent;
    expect(event.payload.title).toContain('Alder Peak');
    expect(event.payload.memoryMode).toBe('STRICT_MATTER_ONLY');

    // Test unsubscribe
    unsubscribe();
    receivedEvent = null;
    await bus.emit(mockEvent);
    expect(receivedEvent).toBeNull();
  });

  it('maintains an append-only event ledger for auditability', async () => {
    const event1: SourceImportedEvent = {
      id: 'evt-src-001',
      type: 'SourceImported',
      matterId: 'matter-alder-peak',
      workspaceId: 'demo',
      timestamp: new Date().toISOString(),
      actor: { type: 'system', id: 'ingestion-worker' },
      payload: {
        sourceId: 'doc-msa-001',
        filename: 'Alder_Peak_Master_Services_Agreement_2026.txt',
        sha256: '7c6f05e49c71a396225b68904e2865913bc5486faec4811a0da115ec6287c699',
        byteLength: 2693,
        spanCount: 14
      }
    };

    const event2: ActionApprovedEvent = {
      id: 'evt-act-002',
      type: 'ActionApproved',
      matterId: 'matter-alder-peak',
      workspaceId: 'demo',
      timestamp: new Date().toISOString(),
      actor: { type: 'lawyer', id: 'usr-sarah-stone' },
      payload: {
        requestId: 'req-send-advice',
        actionType: 'email_draft_advice',
        approverId: 'usr-sarah-stone',
        permissionTier: 'WRITE_EXTERNAL'
      }
    };

    await bus.emit(event1);
    await bus.emit(event2);

    const history = bus.getHistory();
    expect(history.length).toBe(2);
    expect(history[0].type).toBe('SourceImported');
    expect(history[1].type).toBe('ActionApproved');

    // Filter by matterId
    const matterHistory = bus.getHistory({ matterId: 'matter-alder-peak' });
    expect(matterHistory.length).toBe(2);

    // Filter by type
    const actionHistory = bus.getHistory({ type: 'ActionApproved' });
    expect(actionHistory.length).toBe(1);
    expect(actionHistory[0].id).toBe('evt-act-002');
  });

  it('notifies wildcard listeners on any domain event', async () => {
    const received: string[] = [];

    bus.on('*', (event) => {
      received.push(event.type);
    });

    await bus.emit({
      id: 'evt-1',
      type: 'DevicePaired',
      workspaceId: 'personal',
      timestamp: new Date().toISOString(),
      actor: { type: 'user', id: 'u1' },
      payload: {
        deviceId: 'dev-mobile-companion',
        deviceName: 'Pixel 9 Pro',
        deviceRole: 'mobile_companion',
        fingerprint: 'sha256-mock-fp'
      }
    });

    expect(received).toEqual(['DevicePaired']);
  });
});
