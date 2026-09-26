import { describe, it, expect, beforeEach } from 'vitest';
import { DevicePairingEngine } from '../engine/sync/devicePairing.ts';

describe('ATKIN Sovereign Device Pairing Protocol', () => {
  let pairingEngine: DevicePairingEngine;

  beforeEach(() => {
    pairingEngine = new DevicePairingEngine();
  });

  it('initializes with trusted primary Windows host', () => {
    const devices = pairingEngine.getPairedDevices();
    expect(devices.length).toBe(1);
    expect(devices[0].deviceId).toBe('dev-win-primary');
    expect(devices[0].trustState).toBe('trusted');
    expect(devices[0].platform).toBe('windows_desktop');
  });

  it('generates a 6-digit numeric SAS pairing session with 5-minute expiry', () => {
    const session = pairingEngine.createPairingSession('192.168.1.100', 9000);
    expect(session.sessionId).toMatch(/^pair-/);
    expect(session.pairingCode).toMatch(/^\d{3}\s\d{3}$/);
    expect(session.qrPayload).toContain('atkin://pair?data=');
    expect(new Date(session.expiresAt).getTime()).toBeGreaterThan(new Date(session.createdAt).getTime());
  });

  it('completes pairing when companion submits matching SAS code', () => {
    const session = pairingEngine.createPairingSession();
    const result = pairingEngine.completePairing({
      deviceName: 'Lawyer Pixel 9 Pro',
      platform: 'android_mobile',
      remoteFingerprint: 'SHA256:abcd...1234',
      submittedCode: session.pairingCode
    });

    expect(result.success).toBe(true);
    expect(result.device).toBeDefined();
    expect(result.device?.deviceName).toBe('Lawyer Pixel 9 Pro');

    const devices = pairingEngine.getPairedDevices();
    expect(devices.length).toBe(2);
    expect(devices.some(d => d.deviceName === 'Lawyer Pixel 9 Pro')).toBe(true);
  });

  it('rejects pairing when verification code is incorrect', () => {
    pairingEngine.createPairingSession();
    const result = pairingEngine.completePairing({
      deviceName: 'Untrusted Device',
      platform: 'android_mobile',
      remoteFingerprint: 'SHA256:0000...0000',
      submittedCode: '999 999' // wrong OTP
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('mismatch');
  });

  it('revokes companion device access while protecting primary host', () => {
    const session = pairingEngine.createPairingSession();
    const { device } = pairingEngine.completePairing({
      deviceName: 'Temporary Tablet',
      platform: 'android_mobile',
      remoteFingerprint: 'SHA256:temp...9999',
      submittedCode: session.pairingCode
    });

    expect(device).toBeDefined();
    const revoked = pairingEngine.revokeDevice(device!.deviceId);
    expect(revoked).toBe(true);

    const devices = pairingEngine.getPairedDevices();
    const tablet = devices.find(d => d.deviceId === device!.deviceId);
    expect(tablet?.trustState).toBe('revoked');

    // Primary host cannot be revoked
    const revokedPrimary = pairingEngine.revokeDevice('dev-win-primary');
    expect(revokedPrimary).toBe(false);
  });
});
