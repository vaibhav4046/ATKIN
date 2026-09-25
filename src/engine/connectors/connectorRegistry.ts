import type { ConnectorTruthTableEntry } from '../../types/index.ts';

export class ConnectorRegistry {
  private static entries: ConnectorTruthTableEntry[] = [
    {
      providerId: 'conn-local-file-sync',
      name: 'Local Directory Watcher & File Drop',
      status: 'implemented_and_tested',
      readSupported: true,
      writeSupported: true,
      requiredScopes: ['file_system:read', 'file_system:write'],
      offlineFallback: 'Native OS file picker / HTML5 drag-and-drop buffer ingestion',
      notes: '100% sovereign and offline. Directly reads and encrypts PDF, EML, TXT, DOCX files into local vault.'
    },
    {
      providerId: 'conn-google-gmail',
      name: 'Google Workspace: Gmail Import',
      status: 'implemented_needs_credentials',
      readSupported: true,
      writeSupported: false,
      requiredScopes: ['https://www.googleapis.com/auth/gmail.readonly'],
      offlineFallback: 'Export email threads as .eml or Google Takeout .mbox files and drop into matter.',
      notes: 'Client-side OAuth 2.0 PKCE flow. Requires Google Cloud Client ID. Tokens stored in AES-GCM encrypted vault only.'
    },
    {
      providerId: 'conn-google-drive',
      name: 'Google Drive Document Sync',
      status: 'implemented_needs_credentials',
      readSupported: true,
      writeSupported: false,
      requiredScopes: ['https://www.googleapis.com/auth/drive.readonly'],
      offlineFallback: 'Download PDFs/Docs locally and import via local file drop.',
      notes: 'Direct client-to-Google API calls only in connected_imports mode. All egress logged in Network Broker.'
    },
    {
      providerId: 'conn-microsoft-graph',
      name: 'Microsoft 365 (Exchange Online & OneDrive)',
      status: 'implemented_needs_credentials',
      readSupported: true,
      writeSupported: false,
      requiredScopes: ['Mail.Read', 'Files.Read.All'],
      offlineFallback: 'Export Outlook .msg / .eml files and drop directly into matter.',
      notes: 'Azure Entra ID application registration required. All fetched matter files immediately encrypted in local vault.'
    }
  ];

  public static getTruthTable(): ConnectorTruthTableEntry[] {
    return this.entries;
  }

  public static getConnector(providerId: string): ConnectorTruthTableEntry | undefined {
    return this.entries.find(e => e.providerId === providerId);
  }
}
