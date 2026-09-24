/**
 * Sovereign Vault Cryptographic Engine
 * Standard-compliant PBKDF2 (100,000 rounds, SHA-256) + AES-GCM-256
 * Operates cross-platform in browser WebCrypto and Node.js runtime.
 */

export interface EncryptedPayload {
  ivBase64: string;
  cipherTextBase64: string;
}

export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function generateSalt(length = 16): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bufferToBase64(bytes);
}

export async function deriveKey(passphrase: string, saltBase64: string, iterations = 100000): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passphraseBytes = encoder.encode(passphrase);
  const saltBytes = base64ToBuffer(saltBase64);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    passphraseBytes,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes.buffer as ArrayBuffer,
      iterations,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptText(plaintext: string, key: CryptoKey): Promise<EncryptedPayload> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);

  const cipherBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv.buffer as ArrayBuffer
    },
    key,
    data.buffer as ArrayBuffer
  );

  return {
    ivBase64: bufferToBase64(iv),
    cipherTextBase64: bufferToBase64(cipherBuffer)
  };
}

export async function decryptText(payload: EncryptedPayload, key: CryptoKey): Promise<string> {
  const iv = base64ToBuffer(payload.ivBase64);
  const cipherBuffer = base64ToBuffer(payload.cipherTextBase64);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv.buffer as ArrayBuffer
    },
    key,
    cipherBuffer.buffer as ArrayBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

export const CryptoService = {
  bufferToBase64,
  base64ToBuffer,
  generateSalt,
  deriveKeyFromPassphrase: deriveKey,
  encrypt: async (plaintext: string, key: CryptoKey) => {
    const res = await encryptText(plaintext, key);
    return {
      ivBase64: res.ivBase64,
      cipherTextBase64: res.cipherTextBase64,
      authTagBase64: ''
    };
  },
  decrypt: async (payload: { ivBase64: string; cipherTextBase64: string; authTagBase64?: string }, key: CryptoKey) => {
    return decryptText({ ivBase64: payload.ivBase64, cipherTextBase64: payload.cipherTextBase64 }, key);
  }
};

