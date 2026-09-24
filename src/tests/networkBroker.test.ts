import { describe, it, expect, beforeEach } from 'vitest';
import { NetworkBroker } from '../engine/network/networkBroker.ts';

describe('Sovereign Network Broker & Egress Audit Logging', () => {
  let broker: NetworkBroker;

  beforeEach(() => {
    broker = new NetworkBroker('offline');
  });

  it('strictly blocks all external network egress in offline mode', async () => {
    expect(broker.getCurrentMode()).toBe('offline');

    await expect(broker.brokeredFetch('https://api.openai.com/v1/chat/completions', {
      purpose: 'Attempted external LLM fallback',
      destinationProvider: 'OpenAI Cloud'
    })).rejects.toThrow(/blocked by Sovereign Mode/);

    const log = broker.getAuditLog();
    expect(log.length).toBe(1);
    expect(log[0].status).toBe('blocked');
    expect(log[0].modeAtCall).toBe('offline');
  });

  it('allows whitelisted legal research domains in public_research mode', async () => {
    broker.setMode('public_research');
    expect(broker.getCurrentMode()).toBe('public_research');

    // legislation.gov.uk is whitelisted
    const legAllowed = broker.isEgressAllowed('https://www.legislation.gov.uk/ukpga/2015/15/section/9/data.json');
    expect(legAllowed.allowed).toBe(true);

    // Non-whitelisted commercial analytics host is blocked
    const trackerAllowed = broker.isEgressAllowed('https://analytics.google.com/collect');
    expect(trackerAllowed.allowed).toBe(false);
    expect(trackerAllowed.reason).toContain('not in public research whitelist');
  });

  it('maintains an immutable local audit trail of all egress attempts', async () => {
    broker.setMode('offline');

    try {
      await broker.brokeredFetch('https://untrusted-tracking.com/beacon', {
        purpose: 'Telemetry ping',
        destinationProvider: 'Untrusted Tracker'
      });
    } catch {
      // Expected block
    }

    const entries = broker.getAuditLog();
    expect(entries.length).toBe(1);
    expect(entries[0].destinationUrl).toBe('https://untrusted-tracking.com/beacon');
    expect(entries[0].destinationProvider).toBe('Untrusted Tracker');
    expect(entries[0].status).toBe('blocked');
  });
});
