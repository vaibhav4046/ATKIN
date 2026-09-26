/**
 * ATKIN Platform - Mobile Companion Runtime
 * Authenticated mutual-TLS / HMAC cross-device pairing protocol (Section 98)
 */

export { DevicePairingProtocol, type TrustedPeer, type RemoteInferenceResponse } from '../../engine/protocol/devicePairingProtocol.ts';

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
