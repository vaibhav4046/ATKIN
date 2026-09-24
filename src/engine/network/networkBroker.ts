import type { NetworkMode, NetworkAuditEntry } from '../../types/index.ts';
import { computeSHA256 } from '../parser.ts';

export class NetworkBroker {
  private mode: NetworkMode = 'offline';
  private auditLog: NetworkAuditEntry[] = [];
  private pendingApprovals: Map<string, { query: string; provider: string; resolve: (approved: boolean) => void }> = new Map();

  constructor(initialMode: NetworkMode = 'offline') {
    this.mode = initialMode;
  }

  public getMode(): NetworkMode {
    return this.mode;
  }

  public getCurrentMode(): NetworkMode {
    return this.mode;
  }

  public setMode(newMode: NetworkMode): void {
    this.mode = newMode;
  }

  public isEgressAllowed(destinationUrl: string): { allowed: boolean; reason?: string } {
    if (this.mode === 'offline') {
      return {
        allowed: false,
        reason: 'BLOCKED_BY_OFFLINE_POLICY: Application is operating in Sovereign Offline Mode. External traffic prohibited.'
      };
    }

    if (this.mode === 'public_research') {
      const allowedResearchProviders = [
        'legislation.gov.uk',
        'caselaw.nationalarchives.gov.uk',
        'justice.gov.uk',
        'courtlistener.com',
        'eur-lex.europa.eu',
        'indiacode.nic.in'
      ];

      const isAllowedHost = allowedResearchProviders.some(host => destinationUrl.includes(host));
      if (!isAllowedHost) {
        return {
          allowed: false,
          reason: `UNAUTHORIZED_RESEARCH_HOST: Destination ${destinationUrl} is not in public research whitelist.`
        };
      }
    }

    return { allowed: true };
  }

  public async brokeredFetch(
    url: string,
    options: {
      purpose: string;
      destinationProvider: string;
      body?: string;
    }
  ): Promise<any> {
    const access = await this.requestOutboundAccess(
      url,
      options.destinationProvider,
      options.purpose,
      options.body || '',
      false
    );

    if (!access.allowed) {
      throw new Error(`Outbound network call blocked by Sovereign Mode: ${access.reason}`);
    }

    // In connected or permitted research mode, execute fetch
    return fetch(url, { method: 'POST', body: options.body });
  }

  public getAuditLog(): NetworkAuditEntry[] {
    return [...this.auditLog];
  }

  public clearAuditLog(): void {
    this.auditLog = [];
  }

  public async requestOutboundAccess(
    destinationUrl: string,
    destinationProvider: string,
    purpose: string,
    payloadText: string,
    requireUserApproval = true
  ): Promise<{ allowed: boolean; reason?: string }> {
    const requestHash = await computeSHA256(payloadText);
    const modeAtCall = this.mode;

    // 1. In offline mode, ALL external network requests are strictly blocked
    if (this.mode === 'offline') {
      const entry: NetworkAuditEntry = {
        id: `net-audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        destinationUrl,
        destinationProvider,
        purpose,
        approvedByUser: false,
        requestHash,
        bytesSent: 0,
        bytesReceived: 0,
        status: 'blocked',
        modeAtCall
      };
      this.auditLog.unshift(entry);
      return {
        allowed: false,
        reason: 'BLOCKED_BY_OFFLINE_POLICY: Application is operating in Sovereign Offline Mode. External traffic prohibited.'
      };
    }

    // 2. In public research mode, check destination
    if (this.mode === 'public_research') {
      const allowedResearchProviders = [
        'legislation.gov.uk',
        'caselaw.nationalarchives.gov.uk',
        'justice.gov.uk',
        'courtlistener.com',
        'eur-lex.europa.eu',
        'indiacode.nic.in'
      ];

      const isAllowedHost = allowedResearchProviders.some(host => destinationUrl.includes(host));
      if (!isAllowedHost) {
        const entry: NetworkAuditEntry = {
          id: `net-audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          destinationUrl,
          destinationProvider,
          purpose,
          approvedByUser: false,
          requestHash,
          bytesSent: 0,
          bytesReceived: 0,
          status: 'blocked',
          modeAtCall
        };
        this.auditLog.unshift(entry);
        return {
          allowed: false,
          reason: `UNAUTHORIZED_RESEARCH_HOST: Destination ${destinationUrl} is not on the verified legal provider allowlist.`
        };
      }
    }

    // Record allowed audit entry
    const entry: NetworkAuditEntry = {
      id: `net-audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      destinationUrl,
      destinationProvider,
      purpose,
      approvedByUser: requireUserApproval,
      requestHash,
      bytesSent: payloadText.length,
      bytesReceived: 0,
      status: 'allowed',
      modeAtCall
    };
    this.auditLog.unshift(entry);

    return { allowed: true };
  }
}

export const networkBroker = new NetworkBroker();
