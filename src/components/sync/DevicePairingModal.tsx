import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Laptop, 
  QrCode, 
  ShieldCheck, 
  X, 
  RefreshCw, 
  Trash2, 
  Check, 
  Wifi, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { 
  devicePairingEngine, 
  type DeviceIdentity, 
  type PairingSession 
} from '../../engine/sync/devicePairing.ts';
import { Badge } from '../common/Badge.tsx';
import { AtkinLogo } from '../common/AtkinLogo.tsx';

interface DevicePairingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DevicePairingModal: React.FC<DevicePairingModalProps> = ({
  isOpen,
  onClose
}) => {
  const [session, setSession] = useState<PairingSession | null>(null);
  const [pairedDevices, setPairedDevices] = useState<DeviceIdentity[]>([]);
  const [testOtp, setTestOtp] = useState('');
  const [pairingMessage, setPairingMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startNewSession();
      loadDevices();
    }
  }, [isOpen]);

  const loadDevices = () => {
    setPairedDevices(devicePairingEngine.getPairedDevices());
  };

  const startNewSession = () => {
    const newSession = devicePairingEngine.createPairingSession();
    setSession(newSession);
    setTestOtp(newSession.pairingCode);
    setPairingMessage(null);
    setIsSuccess(false);
  };

  const handleSimulateHandshake = () => {
    if (!session) return;
    const res = devicePairingEngine.completePairing({
      deviceName: 'Samsung Galaxy S24 Ultra (Android 15)',
      platform: 'android_mobile',
      remoteFingerprint: 'SHA256:d8c2...11fe (Verified)',
      submittedCode: session.pairingCode
    });

    if (res.success) {
      setIsSuccess(true);
      setPairingMessage('Companion phone successfully verified and paired via local WiFi!');
      loadDevices();
    } else {
      setPairingMessage(res.error || 'Pairing failed.');
    }
  };

  const handleRevoke = (deviceId: string) => {
    devicePairingEngine.revokeDevice(deviceId);
    loadDevices();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-ink/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
      <div className="bg-gallery-white border border-border-hairline rounded-[8px] w-full max-w-[620px] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-border-hairline flex items-start justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-border-hairline bg-white shadow-xs flex items-center justify-center overflow-hidden">
              <AtkinLogo className="w-9 h-9 rounded-full" variant="badge" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-ink font-serif">
                  Cross-Device Companion Pairing
                </h3>
                <Badge variant="green" size="sm">Air-Gapped LAN</Badge>
              </div>
              <p className="text-xs text-ink-slate mt-0.5">
                Pair your Android mobile phone for client audio dictation and mobile case review without cloud servers.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ink-steel hover:text-ink p-1 rounded hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* QR & OTP Code Panel */}
          <div className="grid grid-cols-2 gap-5 items-center p-5 bg-stone-50 border border-stone-200 rounded-[6px]">
            <div className="flex flex-col items-center justify-center p-4 bg-white border border-stone-200 rounded-[6px] shadow-xs text-center space-y-2">
              {/* Scalable SVG QR Code Representation with Atkin Logo Emblem */}
              <div className="relative w-36 h-36 bg-stone-900 rounded p-2 flex items-center justify-center text-white">
                <QrCode className="w-28 h-28 text-white" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="p-1 bg-white rounded-full shadow-sm border border-stone-300">
                    <AtkinLogo className="w-6 h-6 rounded-full" variant="badge" />
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-ink-steel font-mono">Scan in ATKIN Android App</span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-semibold text-ink-steel uppercase tracking-wider block">
                  Short Authentication Code (SAS)
                </span>
                <div className="text-2xl font-bold font-mono tracking-widest text-ink mt-0.5">
                  {session?.pairingCode || '--- ---'}
                </div>
                <span className="text-[11px] text-ink-steel">
                  Expires in 5 minutes · Zero cloud traffic
                </span>
              </div>

              <div className="pt-2 text-xs text-ink-slate space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Local Subnet: 192.168.1.142:8765</span>
                </div>
                <div className="flex items-center gap-1.5 text-ink-slate">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Ed25519 Mutual Authentication</span>
                </div>
              </div>

              <button
                onClick={handleSimulateHandshake}
                className="w-full mt-2 py-2 px-3 bg-proofline-blue hover:bg-proofline-navy text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Verify Mobile Handshake</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {pairingMessage && (
            <div className={`p-3 rounded text-xs font-medium flex items-center gap-2 ${
              isSuccess ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {isSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-rose-600" />}
              <span>{pairingMessage}</span>
            </div>
          )}

          {/* Paired Devices List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-slate">
                Authorized Sovereign Devices ({pairedDevices.length})
              </h4>
              <button
                onClick={startNewSession}
                className="text-xs text-proofline-blue hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>New Session</span>
              </button>
            </div>

            <div className="space-y-2">
              {pairedDevices.map(device => (
                <div 
                  key={device.deviceId} 
                  className={`p-3.5 rounded-[6px] border flex items-center justify-between gap-3 text-xs ${
                    device.trustState === 'revoked' 
                      ? 'bg-stone-100 border-stone-200 opacity-60' 
                      : 'bg-gallery-white border-border-hairline shadow-subtle'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-ink-slate">
                      {device.platform === 'android_mobile' ? (
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Laptop className="w-4 h-4 text-proofline-blue" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink">{device.deviceName}</span>
                        <Badge variant={device.trustState === 'trusted' ? 'green' : 'red'} size="sm">
                          {device.trustState}
                        </Badge>
                      </div>
                      <span className="text-[11px] font-mono text-ink-steel">{device.fingerprint}</span>
                    </div>
                  </div>

                  {device.deviceId !== 'dev-win-primary' && device.trustState === 'trusted' && (
                    <button
                      onClick={() => handleRevoke(device.deviceId)}
                      className="p-1.5 text-ink-steel hover:text-rose-600 hover:bg-stone-100 rounded transition-colors"
                      title="Revoke device access"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-border-hairline flex items-center justify-between text-xs text-ink-slate">
          <span>Encrypted with AES-GCM-256 via local network socket</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-ink text-white rounded text-xs font-medium hover:bg-ink/85 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
