import { describe, it, expect } from 'vitest';
import { DevicePairingProtocol, type RemoteInferenceRequest } from '../engine/protocol/devicePairingProtocol.ts';
import { sha256Hex } from '../engine/protocol/auditLedger.ts';
import type { Span } from '../types/index.ts';
import type { DocumentRecord } from '../engine/protocol/citationGate.ts';

describe('PairingRemoteInference — Sovereign Desktop/Mobile Gateway', () => {
  const protocol = new DevicePairingProtocol();

  const matterId = 'matter-alder-peak';
  const spanText = 'Clause 3.2: Notice of termination without cause shall be 37 calendar days in writing.';
  const testSpans: Span[] = [
    {
      id: 'sp-notice-37',
      documentId: 'doc-msa-01',
      startOffset: 0,
      endOffset: spanText.length,
      exactText: spanText,
      checksum: sha256Hex(spanText)
    }
  ];

  const testDocuments = new Map<string, DocumentRecord>([
    [
      'doc-msa-01',
      {
        id: 'doc-msa-01',
        matterId,
        currentVersionId: 'v1',
        sha256: sha256Hex(spanText),
        content: spanText
      }
    ]
  ]);

  it('generates cryptographic Ed25519 public key and SHA-256 fingerprint', () => {
    const host = protocol.getHostIdentity();
    expect(host.publicKeyHex).toMatch(/^[a-f0-9]{64}$/);
    expect(host.fingerprint).toContain('SHA256:');
  });

  it('rejects pairing when 6-digit SAS code does not match', () => {
    const session = protocol.initiatePairingSession('desktop-host-1');
    expect(session.sasCode).toMatch(/^\d{6}$/);

    const connectResult = protocol.connectPeer({
      peerDeviceId: 'dev-pixel-9-pro',
      peerDeviceName: 'Solicitor Pixel 9 Pro',
      platform: 'android_mobile',
      peerPublicKey: 'abc123peerkey',
      submittedSasCode: '000000' // wrong code
    });

    expect(connectResult.success).toBe(false);
    expect(connectResult.error).toContain('Short Authentication String (SAS) mismatch');
  });

  it('successfully pairs mobile companion when 6-digit SAS code matches', () => {
    const session = protocol.initiatePairingSession('desktop-host-1');
    const connectResult = protocol.connectPeer({
      peerDeviceId: 'dev-pixel-9-pro',
      peerDeviceName: 'Solicitor Pixel 9 Pro',
      platform: 'android_mobile',
      peerPublicKey: 'aabbcc112233peerkey',
      submittedSasCode: session.sasCode
    });

    expect(connectResult.success).toBe(true);
    expect(connectResult.sessionToken).toBeDefined();
    expect(connectResult.peerFingerprint).toContain('SHA256:');

    const peers = protocol.getTrustedPeers();
    expect(peers.length).toBe(1);
    expect(peers[0].deviceId).toBe('dev-pixel-9-pro');
    expect(peers[0].trustState).toBe('trusted');
  });

  it('executes authenticated remote inference from Android companion to desktop engine', async () => {
    const peer = protocol.getTrustedPeers()[0];
    const request: RemoteInferenceRequest = {
      clientDeviceId: peer.deviceId,
      sessionToken: peer.sessionToken!,
      matterId,
      query: 'What is the contractual termination notice period?'
    };

    const response = await protocol.executeRemoteInference(request, {
      spans: testSpans,
      documents: testDocuments
    });

    expect(response.executionLocation).toBe('remote_desktop');
    expect(response.displayBanner).toBe('Using desktop (NVIDIA RTX 3050)');
    expect(response.irac.conclusion).toContain('37 calendar days');
    expect(response.allCitationsVerified).toBe(true);
    expect(response.citations[0].verified).toBe(true);
  });

  it('immediately blocks remote inference upon device revocation', async () => {
    const peer = protocol.getTrustedPeers()[0];
    const revoked = protocol.revokePeer(peer.deviceId);
    expect(revoked).toBe(true);

    const request: RemoteInferenceRequest = {
      clientDeviceId: peer.deviceId,
      sessionToken: 'invalid-or-revoked-token',
      matterId,
      query: 'What is the notice period?'
    };

    await expect(
      protocol.executeRemoteInference(request, {
        spans: testSpans,
        documents: testDocuments
      })
    ).rejects.toThrow('Unauthorized remote inference request');
  });
});
