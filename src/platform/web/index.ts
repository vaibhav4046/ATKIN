/**
 * ATKIN Platform - Web Environment Capabilities
 */

export function getWebCapabilities() {
  return {
    hasWebCrypto: typeof window !== 'undefined' && Boolean(window.crypto?.subtle),
    hasIndexedDB: typeof window !== 'undefined' && Boolean(window.indexedDB),
    hasSpeechRecognition: typeof window !== 'undefined' && Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition),
    hasLocalStorage: typeof window !== 'undefined' && Boolean(window.localStorage)
  };
}
